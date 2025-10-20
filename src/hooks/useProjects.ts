
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Project = Tables<"projetos">;
type ProjectInsert = TablesInsert<"projetos">;
type ProjectUpdate = TablesUpdate<"projetos">;

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar projetos:", error);
        throw error;
      }
      
      return data;
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar projeto:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: Omit<ProjectInsert, 'id'>) => {
      // Validar dados obrigatórios
      if (!project.nome || !project.cliente || !project.encarregado) {
        throw new Error("Nome, cliente e encarregado são obrigatórios");
      }
      
      if (!project.data_inicio || !project.data_fim_prevista) {
        throw new Error("Datas de início e fim são obrigatórias");
      }
      
      if (!project.provincia || !project.municipio) {
        throw new Error("Província e município são obrigatórios");
      }
      
      // Garantir valores padrão
      const projectData = {
        ...project,
        orcamento: project.orcamento || 0,
        limite_aprovacao: project.limite_aprovacao || 3000000,
        avanco_fisico: project.avanco_fisico || 0,
        avanco_financeiro: project.avanco_financeiro || 0,
        avanco_tempo: project.avanco_tempo || 0,
        gasto: project.gasto || 0,
        numero_etapas: project.numero_etapas || 1,
        status: project.status || "Em Andamento",
        tipo_projeto: project.tipo_projeto || "Residencial",
      };
      
      const { data, error } = await supabase
        .from("projetos")
        .insert(projectData)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao criar projeto:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["patrimony"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Erro na mutação de criação:", error);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate & { id: number }) => {
      // Validar ID
      if (!id) {
        throw new Error("ID do projeto é obrigatório para atualização");
      }
      
      const { data, error } = await supabase
        .from("projetos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao atualizar projeto:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all related queries to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-details", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-metrics", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-chart-data", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-stages", data.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["patrimony"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Erro na mutação de atualização:", error);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        // Usar a função segura do Supabase que gerencia triggers
        const { data, error } = await supabase
          .rpc('delete_project_safely', { project_id: id });
      
        if (error) {
          console.error("Erro ao eliminar projeto:", error);
          throw new Error(error.message || "Erro ao eliminar projeto. Tente novamente.");
        }
        
        // Verificar o resultado da função
        const result = data as { success: boolean; message: string; project_id?: number } | null;
        
        if (result && !result.success) {
          console.error("Erro retornado pela função:", result);
          throw new Error(result.message || "Erro ao eliminar projeto.");
        }
        
        return { id };
      } catch (error: any) {
        console.error("Erro ao eliminar projeto:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
