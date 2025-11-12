import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResumoFOA {
  projeto_id: number;
  projeto_nome: string;
  fof_financiamento: number;
  amortizacao: number;
  custos_suportados: number;
  divida_foa_com_fof: number;
}

export function useResumoFOA(projectId?: number) {
  return useQuery({
    queryKey: ["resumo-foa", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calcular_resumo_foa', { 
          p_projeto_id: projectId !== undefined ? projectId : null 
        });

      if (error) throw error;
      return data as ResumoFOA[];
    },
  });
}

export function useResumoFOAGeral() {
  return useQuery({
    queryKey: ["resumo-foa-geral"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calcular_resumo_foa', { 
          p_projeto_id: null // null = todos os projetos
        });

      if (error) throw error;

      // Agregar todos os projetos
      const totais = (data as ResumoFOA[]).reduce(
        (acc, curr) => ({
          fof_financiamento: acc.fof_financiamento + Number(curr.fof_financiamento),
          amortizacao: acc.amortizacao + Number(curr.amortizacao),
          custos_suportados: acc.custos_suportados + Number(curr.custos_suportados),
          divida_foa_com_fof: acc.divida_foa_com_fof + Number(curr.divida_foa_com_fof),
        }),
        {
          fof_financiamento: 0,
          amortizacao: 0,
          custos_suportados: 0,
          divida_foa_com_fof: 0,
        }
      );

      return totais;
    },
  });
}
