import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface ResumoFOA {
  projeto_id: number;
  projeto_nome: string;
  fof_financiamento: number;
  amortizacao: number;
  custos_suportados: number;
  divida_foa_com_fof: number;
}

export function useResumoFOA(projectId?: number) {
  const queryClient = useQueryClient();

  // Realtime subscription para invalidar quando houver mudanças
  useEffect(() => {
    const channel = supabase
      .channel('resumo-foa-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movimentos_financeiros' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["resumo-foa"] });
          queryClient.invalidateQueries({ queryKey: ["resumo-foa-geral"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reembolsos_foa_fof' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["resumo-foa"] });
          queryClient.invalidateQueries({ queryKey: ["resumo-foa-geral"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["resumo-foa", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calcular_resumo_foa', { 
          p_projeto_id: projectId !== undefined ? projectId : null 
        });

      if (error) {
        console.error('Erro ao calcular resumo FOA:', error);
        throw error;
      }
      
      console.log('Resumo FOA data:', data);
      return data as ResumoFOA[];
    },
    staleTime: 30000, // 30 segundos
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

      if (error) {
        console.error('Erro ao calcular resumo FOA geral:', error);
        throw error;
      }

      console.log('Resumo FOA geral raw data:', data);

      // Se não houver dados, retornar zeros
      if (!data || data.length === 0) {
        console.log('Nenhum dado FOA encontrado');
        return {
          fof_financiamento: 0,
          amortizacao: 0,
          custos_suportados: 0,
          divida_foa_com_fof: 0,
        };
      }

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

      console.log('Resumo FOA geral totais:', totais);
      return totais;
    },
    staleTime: 30000, // 30 segundos
  });
}
