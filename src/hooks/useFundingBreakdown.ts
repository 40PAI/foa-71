import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FundingBreakdown {
  projeto_id: number;
  projeto_nome: string;
  fonte_financiamento: 'REC_FOA' | 'FOF_FIN' | 'FOA_AUTO';
  fonte_label: string;
  total_movimentos: number;
  total_valor: number;
  percentual_total: number;
}

export function useFundingBreakdown(projectId?: number) {
  return useQuery({
    queryKey: ["funding-breakdown", projectId],
    queryFn: async () => {
      let query = supabase
        .from("vw_funding_breakdown")
        .select("*")
        .order("total_valor", { ascending: false });

      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FundingBreakdown[];
    },
  });
}

// Hook para obter dados formatados para gráfico de donut
export function useFundingDonutData(projectId: number) {
  const { data, isLoading } = useFundingBreakdown(projectId);

  const chartData = data?.map((item) => ({
    name: item.fonte_label,
    value: item.total_valor,
    fill: item.fonte_financiamento === 'REC_FOA' 
      ? 'hsl(var(--chart-1))' 
      : item.fonte_financiamento === 'FOF_FIN'
      ? 'hsl(var(--chart-2))'
      : 'hsl(var(--chart-3))',
  })) || [];

  return { data: chartData, isLoading };
}
