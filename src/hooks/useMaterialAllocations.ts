import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaterialAllocationWithDetails {
  id: string;
  material_id: string;
  projeto_id: number;
  quantidade_alocada: number;
  quantidade_consumida: number;
  quantidade_devolvida: number;
  quantidade_pendente: number;
  status: string;
  etapa_id: number | null;
  movimentacao_saida_id: string | null;
  created_at: string;
  updated_at: string;
  // Enriched fields
  material_nome?: string;
  material_codigo?: string;
  material_unidade?: string;
  projeto_nome?: string;
  etapa_nome?: string;
}

export function useMaterialAllocations(projectId?: number) {
  return useQuery({
    queryKey: ["material-allocations", projectId],
    queryFn: async (): Promise<MaterialAllocationWithDetails[]> => {
      let query = supabase
        .from("materiais_alocados")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }

      const { data: allocations, error } = await query;

      if (error) throw error;

      if (!allocations || allocations.length === 0) {
        return [];
      }

      // Fetch material info
      const materialIds = [...new Set(allocations.map((a) => a.material_id))];
      const { data: materials } = await supabase
        .from("materiais_armazem")
        .select("id, nome_material, codigo_interno, unidade_medida")
        .in("id", materialIds);

      const materialsMap: Record<string, { nome: string; codigo: string; unidade: string }> = {};
      materials?.forEach((m) => {
        materialsMap[m.id] = {
          nome: m.nome_material,
          codigo: m.codigo_interno,
          unidade: m.unidade_medida,
        };
      });

      // Fetch project info
      const projectIds = [...new Set(allocations.map((a) => a.projeto_id))];
      const { data: projects } = await supabase
        .from("projetos")
        .select("id, nome")
        .in("id", projectIds);

      const projectsMap: Record<number, string> = {};
      projects?.forEach((p) => {
        projectsMap[p.id] = p.nome;
      });

      // Fetch etapas
      const etapaIds = allocations.map((a) => a.etapa_id).filter(Boolean) as number[];
      let etapasMap: Record<number, string> = {};
      if (etapaIds.length > 0) {
        const { data: etapas } = await supabase
          .from("etapas_projeto")
          .select("id, nome_etapa")
          .in("id", etapaIds);

        etapas?.forEach((e) => {
          etapasMap[e.id] = e.nome_etapa;
        });
      }

      return allocations.map((a) => ({
        ...a,
        quantidade_pendente: a.quantidade_alocada - a.quantidade_consumida - a.quantidade_devolvida,
        material_nome: materialsMap[a.material_id]?.nome,
        material_codigo: materialsMap[a.material_id]?.codigo,
        material_unidade: materialsMap[a.material_id]?.unidade,
        projeto_nome: projectsMap[a.projeto_id],
        etapa_nome: a.etapa_id ? etapasMap[a.etapa_id] : undefined,
      }));
    },
    staleTime: 30000,
    placeholderData: (prev) => prev,
  });
}

export function useUpdateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      quantidade_consumida,
      quantidade_devolvida,
    }: {
      id: string;
      quantidade_consumida?: number;
      quantidade_devolvida?: number;
    }) => {
      const updates: Record<string, number> = {};
      if (quantidade_consumida !== undefined) updates.quantidade_consumida = quantidade_consumida;
      if (quantidade_devolvida !== undefined) updates.quantidade_devolvida = quantidade_devolvida;

      const { data, error } = await supabase
        .from("materiais_alocados")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["material-history"] });
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
    },
  });
}
