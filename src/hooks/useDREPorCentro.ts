import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DRELinha {
  centro_custo_id: string;
  centro_nome: string;
  receita_cliente: number;
  fof_financiamento: number;
  foa_auto: number;
  custos_totais: number;
  resultado: number;
}

export function useDREPorCentro(projectId: number, mes: number, ano: number) {
  return useQuery({
    queryKey: ["dre-por-centro", projectId, mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calcular_dre_mensal", {
        p_projeto_id: projectId,
        p_mes: mes,
        p_ano: ano,
      });

      if (error) throw error;
      return data as DRELinha[];
    },
    enabled: !!projectId && mes > 0 && ano > 0,
  });
}

export function useSalvarDRE() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      mes,
      ano,
      linhas,
    }: {
      projectId: number;
      mes: number;
      ano: number;
      linhas: DRELinha[];
    }) => {
      // Inserir ou atualizar linhas DRE
      const { error } = await supabase.from("dre_linhas").upsert(
        linhas.map((linha) => ({
          projeto_id: projectId,
          centro_custo_id: linha.centro_custo_id,
          mes,
          ano,
          receita_cliente: linha.receita_cliente,
          fof_financiamento: linha.fof_financiamento,
          foa_auto: linha.foa_auto,
          custos_totais: linha.custos_totais,
          resultado: linha.resultado,
        })),
        {
          onConflict: "projeto_id,centro_custo_id,mes,ano",
        }
      );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dre-por-centro", variables.projectId, variables.mes, variables.ano],
      });
      toast.success("DRE salvo com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao salvar DRE:", error);
      toast.error("Erro ao salvar DRE");
    },
  });
}
