
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Finance = Tables<"financas">;
type FinanceInsert = TablesInsert<"financas">;
type FinanceUpdate = TablesUpdate<"financas">;

export function useFinances() {
  return useQuery({
    queryKey: ["finances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financas")
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

export function useFinancesByProject(projectId: number) {
  return useQuery({
    queryKey: ["finances", "project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financas")
        .select("*")
        .eq("id_projeto", projectId)
        .order("categoria");
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useCreateFinance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (finance: FinanceInsert) => {
      const { data, error } = await supabase
        .from("financas")
        .insert(finance)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });
}

export function useUpdateFinance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: FinanceUpdate & { id: number }) => {
      const { data, error } = await supabase
        .from("financas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });
}
