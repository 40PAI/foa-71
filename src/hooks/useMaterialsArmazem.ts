
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type MaterialArmazem = Tables<"materiais_armazem">;
type MaterialArmazemInsert = TablesInsert<"materiais_armazem">;
type MaterialArmazemUpdate = TablesUpdate<"materiais_armazem">;

export function useMaterialsArmazem() {
  return useQuery({
    queryKey: ["materials-armazem"],
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_armazem")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useMaterialArmazemByProject(projectId?: number) {
  return useQuery({
    queryKey: ["materials-armazem", "project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_armazem")
        .select("*")
        .eq("projeto_alocado_id", projectId)
        .order("nome_material");
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useCreateMaterialArmazem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (material: MaterialArmazemInsert) => {
      const { data, error } = await supabase
        .from("materiais_armazem")
        .insert(material)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
    },
  });
}

export function useUpdateMaterialArmazem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: MaterialArmazemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("materiais_armazem")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
    },
  });
}
