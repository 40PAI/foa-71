import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DRELinhaConsolidada {
  numero: number;
  centro_custo_id: string;
  centro_nome: string;
  projeto_nome: string;
  receita_cliente: number;
  fof_financiamento: number;
  foa_auto: number;
  custos_totais: number;
  resultado: number;
}

export function useDREConsolidado(mes: number, ano: number) {
  return useQuery({
    queryKey: ["dre-consolidado", mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calcular_dre_consolidado", {
        p_mes: mes,
        p_ano: ano,
      });

      if (error) throw error;
      return (data || []) as DRELinhaConsolidada[];
    },
    enabled: mes > 0 && ano > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
