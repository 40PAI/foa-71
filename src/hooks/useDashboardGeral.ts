import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardGeralKPIs {
  total_projetos: number;
  projetos_ativos: number;
  orcamento_total: number;
  gasto_total: number;
  saldo_disponivel: number;
  percentual_gasto: number;
}

export interface ProjetoGasto {
  id: number;
  nome: string;
  orcamento: number;
  gasto: number;
  percentual_gasto: number;
  status: string;
}

export interface TarefasResumo {
  total: number;
  concluidas: number;
  em_andamento: number;
  atrasadas: number;
  taxa_conclusao: number;
}

export interface ProjetoTarefas {
  projeto_id: number;
  projeto_nome: string;
  total_tarefas: number;
  concluidas: number;
  percentual: number;
}

export interface RequisicoesResumo {
  total: number;
  pendentes: number;
  aprovacao: number;
  aprovadas: number;
  valor_total: number;
  valor_pendente: number;
  taxa_aprovacao: number;
}

export interface ProjetoLista {
  id: number;
  nome: string;
  cliente: string;
  orcamento: number;
  gasto: number;
  avanco_fisico: number;
  avanco_financeiro: number;
  avanco_tempo: number;
  status: string;
  data_inicio: string;
  data_fim_prevista: string;
  status_financeiro: 'verde' | 'amarelo' | 'vermelho';
}

export interface DashboardGeralData {
  user_role: string;
  visible_project_count: number;
  kpis_gerais: DashboardGeralKPIs;
  top_projetos_gasto: ProjetoGasto[];
  tarefas_resumo: TarefasResumo;
  top_projetos_tarefas: ProjetoTarefas[];
  requisicoes_resumo: RequisicoesResumo;
  projetos_lista: ProjetoLista[];
}

// Função de fallback que carrega dados básicos diretamente
async function loadBasicDashboardData(userId: string): Promise<DashboardGeralData> {
  console.log("🔄 Carregando dados básicos do dashboard como fallback...");
  
  try {
    const { data: projects } = await supabase
      .from('projetos')
      .select('id, nome, orcamento, gasto, status')
      .limit(100);

    const orcamentoTotal = projects?.reduce((sum, p) => sum + (p.orcamento || 0), 0) || 0;
    const gastoTotal = projects?.reduce((sum, p) => sum + (p.gasto || 0), 0) || 0;

    return {
      user_role: 'unknown',
      visible_project_count: projects?.length || 0,
      kpis_gerais: {
        total_projetos: projects?.length || 0,
        projetos_ativos: projects?.filter(p => p.status === 'Em Andamento').length || 0,
        orcamento_total: orcamentoTotal,
        gasto_total: gastoTotal,
        saldo_disponivel: orcamentoTotal - gastoTotal,
        percentual_gasto: orcamentoTotal > 0 ? Math.round((gastoTotal / orcamentoTotal) * 100) : 0,
      },
      top_projetos_gasto: [],
      tarefas_resumo: {
        total: 0,
        concluidas: 0,
        em_andamento: 0,
        atrasadas: 0,
        taxa_conclusao: 0,
      },
      top_projetos_tarefas: [],
      requisicoes_resumo: {
        total: 0,
        pendentes: 0,
        aprovacao: 0,
        aprovadas: 0,
        valor_total: 0,
        valor_pendente: 0,
        taxa_aprovacao: 0,
      },
      projetos_lista: [],
    };
  } catch (err) {
    console.error("❌ Erro ao carregar dados básicos:", err);
    throw err;
  }
}

export function useDashboardGeral() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-geral", user?.id],
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000, // Reduzido para 2 minutos
    gcTime: 15 * 60 * 1000, // Reduzido para 15 minutos
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      try {
        const { data, error } = await supabase
          .rpc('get_dashboard_geral_data', {
            user_id_param: user.id
          });

        if (error) {
          // Tratar 404 (função não existe) graciosamente
          if (error.code === 'PGRST202' || error.message?.includes('Could not find')) {
            console.warn("⚠️ RPC get_dashboard_geral_data não existe, usando fallback...");
            return await loadBasicDashboardData(user.id);
          }
          
          console.error("❌ Erro RPC dashboard:", error);
          
          // Se erro de função SQL, tentar fallback
          if (error.message?.includes('extract') || 
              error.message?.includes('function') ||
              error.message?.includes('type')) {
            console.warn("🔄 Erro de cálculo SQL detectado, usando fallback...");
            return await loadBasicDashboardData(user.id);
          }
          
          throw error;
        }

        // Validar estrutura retornada
        if (!data || typeof data !== 'object') {
          console.error("❌ Dados inválidos retornados:", data);
          return await loadBasicDashboardData(user.id);
        }

        // Se RPC retornou um erro interno
        if ('error' in data && data.error) {
          console.error("❌ Erro interno RPC:", data.error);
          console.warn("🔄 Tentando fallback devido a erro interno...");
          return await loadBasicDashboardData(user.id);
        }

        return data as unknown as DashboardGeralData;
      } catch (err: any) {
        // Fallback para qualquer erro não tratado
        if (err?.code === 'PGRST202' || err?.message?.includes('Could not find')) {
          console.warn("⚠️ RPC não encontrada, usando fallback...");
          return await loadBasicDashboardData(user.id);
        }
        console.error("❌ Erro crítico ao buscar dashboard:", err);
        // Usar fallback em vez de propagar erro
        return await loadBasicDashboardData(user.id);
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });
}
