import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WarehouseAnalytics {
  weekly_consumption: Array<{
    semana: string;
    projeto: string;
    consumo_total: number;
    materiais_consumidos: number;
  }>;
  stock_flow: Array<{
    semana: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  critical_stock: Array<{
    codigo_interno: string;
    nome_material: string;
    quantidade_stock: number;
    status_criticidade: 'crítico' | 'baixo' | 'normal';
  }>;
  consumption_by_project: Array<{
    projeto_id: number;
    projeto_nome: string;
    total_consumido: number;
    materiais_diferentes: number;
  }>;
}

export function useWarehouseAnalytics(projectId?: number) {
  return useQuery({
    queryKey: ["warehouse-analytics", projectId],
    queryFn: async (): Promise<WarehouseAnalytics> => {
      if (!projectId) {
        return {
          weekly_consumption: [],
          stock_flow: [],
          critical_stock: [],
          consumption_by_project: [],
        };
      }

      const { data, error } = await supabase
        .rpc('get_warehouse_analytics', { project_id: projectId });
      
      if (error) {
        console.error('Warehouse analytics error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          weekly_consumption: [],
          stock_flow: [],
          critical_stock: [],
          consumption_by_project: [],
        };
      }

      const result = data[0];
      
      return {
        weekly_consumption: Array.isArray(result.weekly_consumption) ? result.weekly_consumption as any[] : [],
        stock_flow: Array.isArray(result.stock_flow) ? result.stock_flow as any[] : [],
        critical_stock: Array.isArray(result.critical_stock) ? result.critical_stock as any[] : [],
        consumption_by_project: Array.isArray(result.consumption_by_project) ? result.consumption_by_project as any[] : [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  });
}