
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Epi = Tables<"epis">;
type EpiInsert = TablesInsert<"epis">;
type EpiUpdate = TablesUpdate<"epis">;

export function useEpis() {
  return useQuery({
    queryKey: ["epis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("epis")
        .select("*")
        .order("descricao");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEpi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (epi: EpiInsert) => {
      const { data, error } = await supabase
        .from("epis")
        .insert(epi)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epis"] });
    },
  });
}

export function useUpdateEpi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: EpiUpdate & { id: number }) => {
      const { data, error } = await supabase
        .from("epis")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epis"] });
    },
  });
}
