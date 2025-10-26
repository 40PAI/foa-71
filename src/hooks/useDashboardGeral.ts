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

export function useDashboardGeral() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-geral", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .rpc('get_dashboard_geral_data', {
          user_id_param: user.id
        });

      if (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        throw error;
      }

      return data as unknown as DashboardGeralData;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
