
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Patrimony = Tables<"patrimonio">;
type PatrimonyInsert = TablesInsert<"patrimonio">;
type PatrimonyUpdate = TablesUpdate<"patrimonio">;

export function usePatrimony() {
  return useQuery({
    queryKey: ["patrimony"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patrimonio")
        .select(`
          *,
          projeto:projetos(nome)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePatrimonyByProject(projectId?: number) {
  return useQuery({
    queryKey: ["patrimony", "project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patrimonio")
        .select("*")
        .eq("alocado_projeto_id", projectId)
        .order("nome");
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useCreatePatrimony() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patrimony: PatrimonyInsert) => {
      const { data, error } = await supabase
        .from("patrimonio")
        .insert(patrimony)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrimony"] });
    },
  });
}

export function useUpdatePatrimony() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: PatrimonyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("patrimonio")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrimony"] });
    },
  });
}
