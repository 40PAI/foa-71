import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePurchaseBreakdown(projectId: number) {
  return useQuery({
    queryKey: ["purchase-breakdown", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_purchase_breakdown', { project_id: projectId });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

// Tabela compras_agregadas removida - usando get_purchase_breakdown function