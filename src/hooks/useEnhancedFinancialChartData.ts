import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSaldosCentrosCusto } from "./useCentrosCusto";
import { useContasFornecedores, useKPIsContasFornecedores } from "./useContasFornecedores";
import { useTaskFinancialAnalytics, useTopDeviationTasks } from "./useTaskFinancialAnalytics";
import { useTaskFinancialSummary } from "./useTaskFinancialSummary";

interface EnhancedFinancialData {
  // Centros de Custo
  centrosCusto: {
    topCentros: Array<{
      codigo: string;
      nome: string;
      orcamento: number;
      gasto: number;
      utilizacao: number;
      status: 'normal' | 'atencao' | 'critico';
    }>;
    totalCentros: number;
    centrosEmAlerta: number;
    orcamentoTotal: number;
  };
  
  // Etapas
  etapas: {
    distribuicao: Array<{
      nome: string;
      valor: number;
      percentual: number;
    }>;
    etapaMaisCustosa: { nome: string; valor: number } | null;
    totalEtapas: number;
  };
  
  // Requisições
  requisicoes: {
    total: number;
    porStatus: Array<{ status: string; quantidade: number; valor: number }>;
    valorTotal: number;
    valorMedio: number;
    taxaAprovacao: number;
  };
  
  // Fornecedores
  fornecedores: {
    totalCredito: number;
    totalDebito: number;
    saldoLiquido: number;
    topCredores: Array<{ nome: string; saldo: number }>;
    topDevedores: Array<{ nome: string; saldo: number }>;
  };
  
  // Tarefas
  tarefas: {
    topPorCusto: Array<{
      descricao: string;
      custo: number;
      desvio: number;
    }>;
    tarefasNoOrcamento: number;
    tarefasAcimaOrcamento: number;
    eficienciaFinanceira: number;
  };
}

export function useEnhancedFinancialChartData(projectId: number | null) {
  // Buscar dados existentes
  const { data: centrosCustoData } = useSaldosCentrosCusto(projectId || undefined);
  const { data: fornecedoresData } = useContasFornecedores(projectId || undefined);
  const fornecedoresKPIs = useKPIsContasFornecedores(projectId || undefined);
  const { data: taskAnalytics } = useTaskFinancialAnalytics(projectId);
  const { data: topDeviationTasks } = useTopDeviationTasks(projectId, 5);
  const { data: taskSummary } = useTaskFinancialSummary(projectId);

  return useQuery<EnhancedFinancialData>({
    queryKey: ["enhanced-financial-chart-data", projectId],
    queryFn: async () => {
      if (!projectId) {
        return {
          centrosCusto: { topCentros: [], totalCentros: 0, centrosEmAlerta: 0, orcamentoTotal: 0 },
          etapas: { distribuicao: [], etapaMaisCustosa: null, totalEtapas: 0 },
          requisicoes: { total: 0, porStatus: [], valorTotal: 0, valorMedio: 0, taxaAprovacao: 0 },
          fornecedores: { totalCredito: 0, totalDebito: 0, saldoLiquido: 0, topCredores: [], topDevedores: [] },
          tarefas: { topPorCusto: [], tarefasNoOrcamento: 0, tarefasAcimaOrcamento: 0, eficienciaFinanceira: 100 },
        };
      }

      // 1. Processar Centros de Custo
      const topCentros = (centrosCustoData || []).slice(0, 5).map(cc => ({
        codigo: cc.codigo || '',
        nome: cc.nome || '',
        orcamento: Number(cc.orcamento_mensal) || 0,
        gasto: Number(cc.total_saidas) || 0,
        utilizacao: Number(cc.percentual_utilizado) || 0,
        status: (Number(cc.percentual_utilizado) >= 100 ? 'critico' : 
                 Number(cc.percentual_utilizado) >= 80 ? 'atencao' : 'normal') as 'normal' | 'atencao' | 'critico'
      }));

      const centrosEmAlerta = (centrosCustoData || []).filter(cc => Number(cc.percentual_utilizado) >= 80).length;
      const orcamentoTotal = (centrosCustoData || []).reduce((sum, cc) => sum + (Number(cc.orcamento_mensal) || 0), 0);

      // 2. Processar Etapas
      const etapasDistribuicao = (taskSummary?.stages || []).map(stage => ({
        nome: stage.etapa_nome,
        valor: stage.total,
        percentual: taskSummary.totals.total > 0 ? (stage.total / taskSummary.totals.total) * 100 : 0
      }));

      const etapaMaisCustosa = etapasDistribuicao.length > 0
        ? etapasDistribuicao.reduce((max, stage) => stage.valor > max.valor ? stage : max)
        : null;

      // 3. Processar Requisições
      const { data: requisicoes } = await supabase
        .from("requisicoes")
        .select("status_fluxo, valor")
        .eq("id_projeto", projectId);

      const reqPorStatus = (requisicoes || []).reduce((acc, req) => {
        const status = req.status_fluxo || 'Pendente';
        if (!acc[status]) {
          acc[status] = { status, quantidade: 0, valor: 0 };
        }
        acc[status].quantidade++;
        acc[status].valor += Number(req.valor) || 0;
        return acc;
      }, {} as Record<string, { status: string; quantidade: number; valor: number }>);

      const requisicoesPorStatus = Object.values(reqPorStatus);
      const valorTotalReq = requisicoesPorStatus.reduce((sum, r) => sum + r.valor, 0);
      const totalReq = requisicoesPorStatus.reduce((sum, r) => sum + r.quantidade, 0);
      
      const aprovadas = requisicoesPorStatus
        .filter(r => ['OC Gerada', 'Recepcionado', 'Liquidado'].includes(r.status))
        .reduce((sum, r) => sum + r.quantidade, 0);
      
      const taxaAprovacao = totalReq > 0 ? (aprovadas / totalReq) * 100 : 0;

      // 4. Processar Fornecedores
      const topCredores = (fornecedoresData || [])
        .filter(f => (f.saldo_atual || 0) > 0)
        .sort((a, b) => (b.saldo_atual || 0) - (a.saldo_atual || 0))
        .slice(0, 5)
        .map(f => ({
          nome: f.fornecedor?.nome_empresa || 'Desconhecido',
          saldo: Number(f.saldo_atual) || 0
        }));

      const topDevedores = (fornecedoresData || [])
        .filter(f => (f.saldo_atual || 0) < 0)
        .sort((a, b) => (a.saldo_atual || 0) - (b.saldo_atual || 0))
        .slice(0, 5)
        .map(f => ({
          nome: f.fornecedor?.nome_empresa || 'Desconhecido',
          saldo: Math.abs(Number(f.saldo_atual) || 0)
        }));

      const totalCredito = fornecedoresKPIs.totalCredito || 0;
      const totalDebito = fornecedoresKPIs.totalDebito || 0;
      const saldoLiquido = fornecedoresKPIs.saldoLiquido || 0;

      // 5. Processar Tarefas
      const topPorCusto = (topDeviationTasks || []).slice(0, 5).map(task => ({
        descricao: task.descricao || 'Sem descrição',
        custo: Number(task.gasto_real) || 0,
        desvio: Number(task.desvio_orcamentario) || 0
      }));

      return {
        centrosCusto: {
          topCentros,
          totalCentros: centrosCustoData?.length || 0,
          centrosEmAlerta,
          orcamentoTotal,
        },
        etapas: {
          distribuicao: etapasDistribuicao,
          etapaMaisCustosa,
          totalEtapas: taskSummary?.stages.length || 0,
        },
        requisicoes: {
          total: totalReq,
          porStatus: requisicoesPorStatus,
          valorTotal: valorTotalReq,
          valorMedio: totalReq > 0 ? valorTotalReq / totalReq : 0,
          taxaAprovacao,
        },
        fornecedores: {
          totalCredito: Number(totalCredito) || 0,
          totalDebito: Number(totalDebito) || 0,
          saldoLiquido: Number(saldoLiquido) || 0,
          topCredores,
          topDevedores,
        },
        tarefas: {
          topPorCusto,
          tarefasNoOrcamento: taskAnalytics?.tasks_on_budget || 0,
          tarefasAcimaOrcamento: taskAnalytics?.tasks_over_budget || 0,
          eficienciaFinanceira: taskAnalytics?.efficiency_score || 100,
        },
      };
    },
    enabled: !!projectId,
  });
}
