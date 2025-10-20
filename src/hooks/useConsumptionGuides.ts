import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useConsumptionGuides(projectId?: number) {
  return useQuery({
    queryKey: ["consumption-guides", projectId],
    queryFn: async () => {
      let query = supabase
        .from("guias_consumo")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }

      const { data: guides, error } = await query;
      if (error) throw error;
      
      // Buscar dados relacionados separadamente
      const enrichedGuides = await Promise.all(
        (guides || []).map(async (guide) => {
          const [projetoRes, itensRes] = await Promise.all([
            guide.projeto_id 
              ? supabase.from("projetos").select("nome").eq("id", guide.projeto_id).single()
              : null,
            supabase.from("guias_consumo_itens").select("*").eq("guia_id", guide.id)
          ]);

          // Buscar materiais dos itens
          const itensWithMaterials = await Promise.all(
            (itensRes?.data || []).map(async (item) => {
              const materialRes = await supabase
                .from("materiais_armazem")
                .select("nome_material, codigo_interno, unidade_medida")
                .eq("id", item.material_id)
                .single();

              return {
                ...item,
                material: materialRes?.data,
              };
            })
          );

          return {
            ...guide,
            projeto: projetoRes?.data,
            itens: itensWithMaterials,
          };
        })
      );

      return enrichedGuides;
    },
    enabled: true,
  });
}

export function useCreateConsumptionGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      numeroGuia: string;
      projetoId: number;
      etapaId?: number;
      dataConsumo: string;
      responsavel: string;
      tarefaRelacionada?: string;
      frenteServico?: string;
      observacoes?: string;
      itens: Array<{
        materialId: string;
        quantidadeConsumida: number;
        observacoes?: string;
      }>;
    }) => {
      // Create the guide
      const { data: guide, error: guideError } = await supabase
        .from("guias_consumo")
        .insert({
          numero_guia: params.numeroGuia,
          projeto_id: params.projetoId,
          etapa_id: params.etapaId,
          data_consumo: params.dataConsumo,
          responsavel: params.responsavel,
          tarefa_relacionada: params.tarefaRelacionada,
          frente_servico: params.frenteServico,
          observacoes: params.observacoes,
        })
        .select()
        .single();

      if (guideError) throw guideError;

      // Add items to the guide
      const { error: itemsError } = await supabase
        .from("guias_consumo_itens")
        .insert(
          params.itens.map(item => ({
            guia_id: guide.id,
            material_id: item.materialId,
            quantidade_consumida: item.quantidadeConsumida,
            observacoes: item.observacoes,
          }))
        );

      if (itemsError) throw itemsError;

      return guide;
    },
    onSuccess: () => {
      toast.success("Guia de consumo criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["consumption-guides"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useProcessConsumptionGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guideId: string) => {
      const { data, error } = await supabase.rpc("process_consumption_guide", {
        p_guia_id: guideId,
      });

      if (error) throw error;
      
      if (!(data as any).success) {
        throw new Error((data as any).message);
      }

      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["consumption-guides"] });
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}