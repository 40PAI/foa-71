import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface IntegratedDashboardData {
  categoria: string;
  valor_orcamentado: number;
  valor_gasto: number;
  valor_pendente: number;
  percentual_execucao: number;
  status_alerta: string;
  limite_excedido: boolean;
}

export function useIntegratedDashboard(projectId?: number) {
  return useQuery({
    queryKey: ["integrated-dashboard", projectId],
    queryFn: async (): Promise<IntegratedDashboardData[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .rpc('get_integrated_dashboard_data', { project_id: projectId });
      
      if (error) {
        console.error('Integrated dashboard error:', error);
        // Return mock data on error to prevent crashes
        return [
          {
            categoria: "Materiais",
            valor_orcamentado: 0,
            valor_gasto: 0,
            valor_pendente: 0,
            percentual_execucao: 0,
            status_alerta: "Normal",
            limite_excedido: false,
          }
        ];
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  });
}