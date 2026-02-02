
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Requisition = Tables<"requisicoes">;
type RequisitionInsert = TablesInsert<"requisicoes">;
type RequisitionUpdate = TablesUpdate<"requisicoes">;

export function useRequisitions() {
  return useQuery({
    queryKey: ["requisitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requisicoes")
        .select(`
          *,
          material:materiais!fk_requisicoes_material(id, nome, codigo),
          projeto:projetos!fk_requisicoes_projeto(id, nome),
          projeto_destino:projetos!requisicoes_projeto_destino_id_fkey(id, nome, cliente)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar requisições:", error);
        throw error;
      }
      return data || [];
    },
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requisition: RequisitionInsert) => {
      const { data, error } = await supabase
        .from("requisicoes")
        .insert(requisition)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao criar requisição:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
    },
  });
}

export function useUpdateRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: RequisitionUpdate & { id: number }) => {
      const { data, error } = await supabase
        .from("requisicoes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao atualizar requisição:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
    },
  });
}

export function useDeleteRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await supabase
        .from("requisicoes")
        .delete()
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao eliminar requisição:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
    },
  });
}
