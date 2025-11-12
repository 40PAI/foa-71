import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DRELinhaConsolidada {
  numero: number;
  centro_custo_id: string;
  centro_nome: string;
  projeto_nome: string;
  receita_cliente: number;
  fof_entrada: number;
  fof_saida: number;
  foa_entrada: number;
  foa_saida: number;
  custos_totais: number;
  resultado: number;
}

export function useDREConsolidado() {
  return useQuery({
    queryKey: ["dre-consolidado"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calcular_dre_consolidado");

      if (error) throw error;
      return (data || []) as DRELinhaConsolidada[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
