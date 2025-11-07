import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DREEvolucao {
  mes: number;
  ano: number;
  periodo: string;
  receita_cliente: number;
  fof_financiamento: number;
  foa_auto: number;
  custos_totais: number;
  resultado: number;
}

export function useDREEvolucaoMensal(projectId: number) {
  return useQuery({
    queryKey: ["dre-evolucao-mensal", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase.rpc("calcular_dre_evolucao_mensal", {
        p_projeto_id: projectId,
      });

      if (error) throw error;
      return data as DREEvolucao[];
    },
    enabled: !!projectId && projectId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
