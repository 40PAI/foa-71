import { supabase } from "@/integrations/supabase/client";
import { useOptimizedQuery } from "./useQuery";
import { logger } from "@/lib/logger";

interface PurchaseBreakdownItem {
  categoria: string;
  total_requisicoes: number;
  valor_pendente: number;
  valor_aprovado: number;
  percentual_aprovacao: number;
}

export function useOptimizedPurchaseBreakdown(projectId?: number) {
  return useOptimizedQuery<PurchaseBreakdownItem[]>({
    queryKey: ["purchase-breakdown-optimized"],
    queryFn: async () => {
      if (!projectId) return [];
      
      logger.apiCall('RPC', 'get_purchase_breakdown', { project_id: projectId });
      
      const { data, error } = await supabase
        .rpc('get_purchase_breakdown', { project_id: projectId });
      
      if (error) {
        logger.apiError('RPC', 'get_purchase_breakdown', error);
        return [];
      }
      
      // Converter valores para números para garantir compatibilidade
      const processedData = (data || []).map(item => ({
        categoria: item.categoria,
        total_requisicoes: Number(item.total_requisicoes) || 0,
        valor_pendente: Number(item.valor_pendente) || 0,
        valor_aprovado: Number(item.valor_aprovado) || 0,
        percentual_aprovacao: Number(item.percentual_aprovacao) || 0,
      }));
      
      logger.apiResponse('RPC', 'get_purchase_breakdown', processedData);
      return processedData;
    },
    projectSpecific: true,
    enabled: !!projectId,
    cacheProfile: 'financial', // Use financial cache profile
  });
}
