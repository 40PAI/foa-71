import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DREPeriodo {
  receita_cliente: number;
  fof_financiamento: number;
  foa_auto: number;
  custos_totais: number;
  resultado: number;
  total_entradas: number;
  total_saidas: number;
}

export function useDREPorPeriodo(
  projectId: number,
  dataInicio: string,
  dataFim: string
) {
  return useQuery({
    queryKey: ["dre-periodo", projectId, dataInicio, dataFim],
    queryFn: async () => {
      if (!projectId || !dataInicio || !dataFim) return null;

      const { data, error } = await supabase.rpc("calcular_dre_por_periodo", {
        p_projeto_id: projectId,
        p_data_inicio: dataInicio,
        p_data_fim: dataFim,
      });

      if (error) throw error;
      return data?.[0] as DREPeriodo | null;
    },
    enabled: !!projectId && !!dataInicio && !!dataFim && projectId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
