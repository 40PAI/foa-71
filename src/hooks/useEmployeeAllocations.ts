
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type EmployeeAllocation = Tables<"colaboradores_projetos">;
type EmployeeAllocationInsert = TablesInsert<"colaboradores_projetos">;
type EmployeeAllocationUpdate = TablesUpdate<"colaboradores_projetos">;

export function useEmployeeAllocations() {
  const queryClient = useQueryClient();

  const getAllocations = useQuery({
    queryKey: ["employee-allocations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colaboradores_projetos")
        .select(`
          *,
          colaborador:colaboradores!colaboradores_projetos_colaborador_id_fkey(nome, cargo),
          projeto:projetos(nome)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getAllocationsByProject = (projectId: number) => useQuery({
    queryKey: ["employee-allocations", "project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colaboradores_projetos")
        .select(`
          *,
          colaborador:colaboradores!colaboradores_projetos_colaborador_id_fkey(nome, cargo, numero_funcional)
        `)
        .eq("projeto_id", projectId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const create = useMutation({
    mutationFn: async (allocation: EmployeeAllocationInsert) => {
      // Verificar se já existe uma alocação para este colaborador neste projeto
      const { data: existingAllocation, error: checkError } = await supabase
        .from("colaboradores_projetos")
        .select("id")
        .eq("colaborador_id", allocation.colaborador_id)
        .eq("projeto_id", allocation.projeto_id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingAllocation) {
        throw new Error("Este colaborador já está alocado a este projeto");
      }

      // Primeiro, vamos atualizar o colaborador para definir o projeto_id
      const { error: updateError } = await supabase
        .from("colaboradores")
        .update({ projeto_id: allocation.projeto_id })
        .eq("id", allocation.colaborador_id);
      
      if (updateError) throw updateError;

      // Depois, criar a alocação
      const { data, error } = await supabase
        .from("colaboradores_projetos")
        .insert(allocation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-by-project"] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: EmployeeAllocationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("colaboradores_projetos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("colaboradores_projetos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return {
    getAllocations,
    getAllocationsByProject,
    create,
    update,
    remove,
  };
}
