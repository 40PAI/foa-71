import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Task = Tables<"tarefas_lean">;
type TaskInsert = TablesInsert<"tarefas_lean">;
type TaskUpdate = TablesUpdate<"tarefas_lean">;

export function useTasks(projectId?: number | null) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      let query = supabase
        .from("tarefas_lean")
        .select("*");
      
      // Filter by project if projectId is provided
      if (projectId) {
        query = query.eq("id_projeto", projectId);
      }
      
      const { data, error } = await query.order("prazo");
      
      if (error) {
        console.error("Erro ao buscar tarefas:", error);
        throw error;
      }
      
      return data;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      // Validar dados obrigatórios
      if (!task.descricao || !task.responsavel || !task.prazo || !task.id_projeto || !task.tipo) {
        throw new Error("Descrição, responsável, prazo, tipo e projeto são obrigatórios");
      }
      
      // Verificar se o tipo é válido
      const tiposValidos = ['Residencial', 'Comercial', 'Industrial', 'Infraestrutura', 'Reforma'];
      if (!tiposValidos.includes(task.tipo)) {
        throw new Error(`Tipo de tarefa inválido: ${task.tipo}. Valores válidos: ${tiposValidos.join(', ')}`);
      }
      
      const { data, error } = await supabase
        .from("tarefas_lean")
        .insert(task)
        .select("*")
        .single();
      
      if (error) {
        console.error("Erro ao criar tarefa:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-stages"] });
      queryClient.invalidateQueries({ queryKey: ["project-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      queryClient.invalidateQueries({ queryKey: ["finances-by-project"] });
      queryClient.invalidateQueries({ queryKey: ["integrated-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["task-financial-summary"] });
    },
    onError: (error) => {
      console.error("Erro na mutação de criação de tarefa:", error);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: number }) => {
      // Validar ID
      if (!id) {
        throw new Error("ID da tarefa é obrigatório para atualização");
      }
      
      const { data, error } = await supabase
        .from("tarefas_lean")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();
      
      if (error) {
        console.error("Erro ao atualizar tarefa:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-stages"] });
      queryClient.invalidateQueries({ queryKey: ["project-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      queryClient.invalidateQueries({ queryKey: ["finances-by-project"] });
      queryClient.invalidateQueries({ queryKey: ["integrated-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["task-financial-summary"] });
    },
    onError: (error) => {
      console.error("Erro na mutação de atualização de tarefa:", error);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      // Validar ID
      if (!id) {
        throw new Error("ID da tarefa é obrigatório para deleção");
      }
      
      const { data, error } = await supabase
        .from("tarefas_lean")
        .delete()
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao deletar tarefa:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-stages"] });
      queryClient.invalidateQueries({ queryKey: ["project-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      queryClient.invalidateQueries({ queryKey: ["finances-by-project"] });
      queryClient.invalidateQueries({ queryKey: ["integrated-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["task-financial-summary"] });
    },
    onError: (error) => {
      console.error("Erro na mutação de deleção de tarefa:", error);
    },
  });
}
