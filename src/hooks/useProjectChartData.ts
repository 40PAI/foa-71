import { useQuery } from "@tanstack/react-query";
import { useProjectDetails } from "./useProjectDetails";
import { useFinancesByProject } from "./useFinances";
import { useEmployeesByProject } from "./useEmployeesByProject";
import { usePatrimonyByProject } from "./usePatrimony";
import { useTasks } from "./useTasks";
import { useProjectMetrics } from "./useProjectMetrics";
import { useMaterialArmazemByProject } from "./useMaterialsArmazem";
import { useProjectStages } from "./useProjectStages";
import { useProjectTimelineData } from "./useProjectTimelineData";
import { supabase } from "@/integrations/supabase/client";

export function useProjectChartData(projectId: number) {
  const { data: projectDetails } = useProjectDetails(projectId);
  const { data: finances } = useFinancesByProject(projectId);
  const { data: employees } = useEmployeesByProject(projectId);
  const { data: patrimony } = usePatrimonyByProject(projectId);
  const { data: allTasks } = useTasks(projectId);
  const { data: metrics } = useProjectMetrics(projectId);
  const { data: warehouseMaterials } = useMaterialArmazemByProject(projectId);
  const { data: stages } = useProjectStages(projectId);

  // Preparar dados para o hook de timeline
  const tasks = allTasks?.filter(task => task.id_projeto === projectId) || [];
  const project = projectDetails?.project;
  
  const { 
    sCurveData: timelineSCurveData, 
    burndownData: timelineBurndownData,
    hasEnoughData 
  } = useProjectTimelineData({
    dataInicio: project?.data_inicio,
    dataFimPrevista: project?.data_fim_prevista,
    tasks: tasks.map(t => ({
      id: t.id,
      prazo: t.prazo,
      status: t.status,
      percentual_conclusao: t.percentual_conclusao,
      updated_at: t.updated_at,
    })),
    stages: (stages || []).map(s => ({
      numero_etapa: s.numero_etapa,
      data_inicio_etapa: s.data_inicio_etapa,
      data_fim_prevista_etapa: s.data_fim_prevista_etapa,
      orcamento_etapa: s.orcamento_etapa || 0,
      gasto_etapa: s.gasto_etapa || 0,
      status_etapa: s.status_etapa,
    })),
    orcamentoTotal: project?.orcamento || 0,
    gastoAtual: project?.gasto || 0,
  });

  return useQuery({
    queryKey: ["project-chart-data", projectId],
    queryFn: async () => {
      if (!projectDetails) return null;

      // Buscar dados adicionais para gráficos
      const [incidents, requisitions] = await Promise.all([
        supabase
          .from("incidentes")
          .select("*")
          .eq("id_projeto", projectId)
          .order("data", { ascending: true }),
        supabase
          .from("requisicoes")
          .select("*")
          .eq("id_projeto", projectId)
          .order("data_requisicao", { ascending: true })
      ]);

      const tasks = allTasks?.filter(task => task.id_projeto === projectId) || [];

      // Usar métricas automáticas calculadas
      const physicalProgress = metrics?.physicalProgress || projectDetails.project.avanco_fisico;
      const financialProgress = metrics?.financialProgress || projectDetails.project.avanco_financeiro;
      const timeProgress = metrics?.timeProgress || projectDetails.project.avanco_tempo;

      // Calcular métricas específicas
      const calculatePPC = () => {
        const completedOnTime = tasks.filter(task => 
          task.status === "Concluído" && 
          new Date(task.prazo) >= new Date()
        ).length;
        return tasks.length > 0 ? (completedOnTime / tasks.length) * 100 : 0;
      };

      const calculateLeadTime = () => {
        const completedRequisitions = requisitions.data?.filter(req => 
          req.status_fluxo === "Recepcionado" || req.status_fluxo === "Liquidado"
        ) || [];
        
        if (completedRequisitions.length === 0) return 0;
        
        const totalDays = completedRequisitions.reduce((acc, req) => {
          const start = new Date(req.data_requisicao);
          const end = new Date(req.updated_at!);
          return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        
        return totalDays / completedRequisitions.length;
      };

      const calculateUtilizationRate = () => {
        const inUse = patrimony?.filter(p => p.status === "Em Uso").length || 0;
        const total = patrimony?.length || 0;
        return total > 0 ? (inUse / total) * 100 : 0;
      };

      // Calcular métricas de compras
      const calculatePurchaseMetrics = () => {
        const reqs = requisitions.data || [];
        const total = reqs.length;
        const aprovadas = reqs.filter(r => 
          ['OC Gerada', 'Recepcionado', 'Liquidado'].includes(r.status_fluxo)
        ).length;
        const pendentes = reqs.filter(r => r.status_fluxo === 'Pendente').length;
        const emProcesso = reqs.filter(r => 
          ['Cotações', 'Aprovação Qualidade', 'Aprovação Direção'].includes(r.status_fluxo)
        ).length;
        const valorTotal = reqs.reduce((acc, r) => acc + (r.valor || 0), 0);
        const taxaAprovacao = total > 0 ? (aprovadas / total) * 100 : 0;

        return {
          total,
          aprovadas,
          pendentes,
          emProcesso,
          valorTotal,
          taxaAprovacao
        };
      };

      // Usar dados de S-Curve do hook de timeline (dados reais mensais)
      // Se não tiver dados suficientes, usar fallback com 3 pontos
      const sCurveData = hasEnoughData && timelineSCurveData.length >= 2
        ? timelineSCurveData
        : [
            { periodo: "Início", fisico: 0, financeiro: 0, tempo: 0 },
            { periodo: "Atual", fisico: physicalProgress, financeiro: financialProgress, tempo: timeProgress },
            { periodo: "Meta", fisico: 100, financeiro: 100, tempo: 100 }
          ];

      // Usar dados de burndown do hook de timeline (dados reais mensais)
      // Se não tiver dados suficientes, usar fallback baseado em tarefas
      const burndownData = hasEnoughData && timelineBurndownData.length >= 2
        ? timelineBurndownData.map(point => ({
            tarefa: point.periodo,
            planejado: point.planejado,
            real: point.real,
            status: point.tarefasRestantes > 0 ? 'Em Andamento' : 'Concluído'
          }))
        : tasks.map((task, index) => ({
            tarefa: `Tarefa ${index + 1}`,
            planejado: Math.round(tasks.length - ((index + 1) / tasks.length) * tasks.length),
            real: task.status === 'Concluído' ? 0 : 1,
            status: task.status
          }));

      // Dados financeiros por categoria
      const financeData = finances?.map(finance => ({
        categoria: finance.categoria,
        orcamentado: finance.orcamentado,
        gasto: finance.gasto,
        desvio: finance.gasto - finance.orcamentado
      })) || [];

      // Dados de incidentes por mês
      const incidentData = incidents.data?.reduce((acc, incident) => {
        const month = new Date(incident.data).toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
        const existing = acc.find(item => item.mes === month);
        
        if (existing) {
          existing.total += 1;
          existing[incident.tipo.toLowerCase()] = (existing[incident.tipo.toLowerCase()] || 0) + 1;
        } else {
          acc.push({
            mes: month,
            total: 1,
            [incident.tipo.toLowerCase()]: 1
          });
        }
        
        return acc;
      }, [] as any[]) || [];

      // Processar dados de materiais de armazém do projeto
      const materialsDisponivel = warehouseMaterials?.filter(m => m.status_item === "Disponível").length || 0;
      const materialsEmUso = warehouseMaterials?.filter(m => m.status_item === "Em uso").length || 0;
      const materialsReservado = warehouseMaterials?.filter(m => m.status_item === "Reservado").length || 0;
      const materialsTotal = warehouseMaterials?.length || 0;

      // Agrupar materiais por categoria
      const materialsByCategory = warehouseMaterials?.reduce((acc, material) => {
        const categoria = material.categoria_principal || "Sem Categoria";
        const existing = acc.find(item => item.categoria === categoria);
        
        if (existing) {
          existing.quantidade += 1;
          existing.quantidadeStock += material.quantidade_stock;
        } else {
          acc.push({
            categoria,
            quantidade: 1,
            quantidadeStock: material.quantidade_stock
          });
        }
        
        return acc;
      }, [] as any[]) || [];

      return {
        project: projectDetails.project,
        summary: projectDetails.summary,
        metrics: {
          ...metrics,
          physicalProgress,
          financialProgress,
          timeProgress
        },
        kpis: {
          ppc: calculatePPC(),
          leadTime: calculateLeadTime(),
          utilizationRate: calculateUtilizationRate(),
          purchases: calculatePurchaseMetrics(),
        },
        chartData: {
          sCurve: sCurveData,
          finance: financeData,
          incidents: incidentData,
          burndown: burndownData,
          patrimony: patrimony || [],
          employees: employees || [],
          tasks,
          requisitions: requisitions.data || [],
          warehouseMaterials: {
            total: materialsTotal,
            disponivel: materialsDisponivel,
            emUso: materialsEmUso,
            reservado: materialsReservado,
            byCategory: materialsByCategory,
            materials: warehouseMaterials || []
          }
        },
        hasEnoughTimelineData: hasEnoughData,
        timelineMonths: timelineSCurveData.length,
      };
    },
    enabled: !!projectId && !!projectDetails && !!stages,
  });
}
