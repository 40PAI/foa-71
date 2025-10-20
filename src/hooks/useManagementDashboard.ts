import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectPerformance {
  projeto_id: number;
  projeto_nome: string;
  avanco_fisico: number;
  avanco_financeiro: number;
  avanco_temporal: number;
  status_alerta: 'verde' | 'amarelo' | 'vermelho';
  produtividade_score: number;
  kpis: {
    ppc: number;
    lead_time: number;
    absentismo: number;
    requisicoes_pendentes: number;
    gasto_vs_orcamento: number;
  };
}

interface ManagementDashboard {
  performance_heatmap: ProjectPerformance[];
  productivity_ranking: Array<{
    projeto_id: number;
    projeto_nome: string;
    produtividade_percentual: number;
    ranking_position: number;
    tendencia: 'up' | 'down' | 'stable';
  }>;
  consolidated_kpis: {
    total_projetos: number;
    projetos_no_prazo: number;
    projetos_atrasados: number;
    media_avanco_fisico: number;
    media_avanco_financeiro: number;
    total_requisicoes_pendentes: number;
    absentismo_medio: number;
    ppc_medio_geral: number;
  };
  alerts: Array<{
    projeto_id: number;
    projeto_nome: string;
    tipo_alerta: 'prazo' | 'orcamento' | 'qualidade' | 'recursos';
    severidade: 'baixa' | 'media' | 'alta';
    mensagem: string;
    data_alerta: string;
  }>;
}

export function useManagementDashboard() {
  return useQuery({
    queryKey: ["management-dashboard"],
    queryFn: async (): Promise<ManagementDashboard> => {
      const { data, error } = await supabase
        .rpc('get_management_dashboard');
      
      if (error) {
        console.error('Management dashboard error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          performance_heatmap: [],
          productivity_ranking: [],
          consolidated_kpis: {
            total_projetos: 0,
            projetos_no_prazo: 0,
            projetos_atrasados: 0,
            media_avanco_fisico: 0,
            media_avanco_financeiro: 0,
            total_requisicoes_pendentes: 0,
            absentismo_medio: 0,
            ppc_medio_geral: 0,
          },
          alerts: [],
        };
      }

      const result = data[0];
      
      // Transformar performance heatmap
      const performanceHeatmap: ProjectPerformance[] = Array.isArray(result.performance_heatmap)
        ? (result.performance_heatmap as any[]).map(projeto => {
            // Determinar status de alerta baseado nos dados reais
            let statusAlerta: 'verde' | 'amarelo' | 'vermelho' = 'verde';
            if (projeto.avanco_fisico < 70 || projeto.desvio_orcamento > 10) {
              statusAlerta = 'vermelho';
            } else if (projeto.avanco_fisico < 85 || projeto.desvio_orcamento > 5) {
              statusAlerta = 'amarelo';
            }

            const produtividadeScore = Math.round(
              (projeto.avanco_fisico + projeto.avanco_financeiro + projeto.avanco_temporal) / 3
            );

            return {
              projeto_id: projeto.projeto_id,
              projeto_nome: projeto.projeto_nome,
              avanco_fisico: projeto.avanco_fisico,
              avanco_financeiro: projeto.avanco_financeiro,
              avanco_temporal: projeto.avanco_temporal,
              status_alerta: statusAlerta,
              produtividade_score: produtividadeScore,
              kpis: {
                ppc: 85, // Valor padrão, pode ser calculado separadamente
                lead_time: 7, // Valor padrão
                absentismo: 5, // Valor padrão
                requisicoes_pendentes: 3, // Valor padrão
                gasto_vs_orcamento: Math.abs(projeto.desvio_orcamento || 0),
              },
            };
          })
        : [];

      // Transformar ranking de produtividade
      const productivityRanking = Array.isArray(result.productivity_ranking)
        ? (result.productivity_ranking as any[]).map((item, index) => ({
            projeto_id: index + 1, // Fallback se não tiver ID
            projeto_nome: item.projeto_nome || 'Projeto Desconhecido',
            produtividade_percentual: item.produtividade_score || 0,
            ranking_position: index + 1,
            tendencia: item.eficiencia_financeira > 100 ? 'up' as const : 
                      item.eficiencia_financeira < 90 ? 'down' as const : 'stable' as const,
          }))
        : [];

      // Transformar KPIs consolidados
      const kpisData = result.consolidated_kpis as any || {};
      const consolidatedKPIs = {
        total_projetos: kpisData.total_projetos || 0,
        projetos_no_prazo: performanceHeatmap.filter(p => p.status_alerta === 'verde').length,
        projetos_atrasados: kpisData.projetos_atrasados || 0,
        media_avanco_fisico: kpisData.media_avanco_fisico || 0,
        media_avanco_financeiro: 0, // Calcular baseado nos dados
        total_requisicoes_pendentes: 0, // Seria necessário buscar separadamente
        absentismo_medio: 0, // Seria necessário buscar separadamente
        ppc_medio_geral: 85, // Valor padrão
      };

      // Transformar alertas
      const alerts = Array.isArray(result.alerts)
        ? (result.alerts as any[]).map(alert => ({
            projeto_id: 1, // Fallback
            projeto_nome: alert.projeto || 'Projeto Desconhecido',
            tipo_alerta: alert.tipo === 'Orçamento Excedido' ? 'orcamento' as const : 'prazo' as const,
            severidade: alert.severidade === 'alta' ? 'alta' as const : 
                       alert.severidade === 'media' ? 'media' as const : 'baixa' as const,
            mensagem: alert.descricao || 'Alerta automático',
            data_alerta: new Date().toISOString().split('T')[0],
          }))
        : [];

      return {
        performance_heatmap: performanceHeatmap,
        productivity_ranking: productivityRanking,
        consolidated_kpis: consolidatedKPIs,
        alerts: alerts,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}