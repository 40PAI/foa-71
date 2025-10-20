
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Definir tipos para a tabela etapas_projeto
interface ProjectStageDB {
  id: number;
  projeto_id: number;
  numero_etapa: number;
  nome_etapa: string;
  tipo_etapa: string;
  responsavel_etapa: string;
  data_inicio_etapa: string | null;
  data_fim_prevista_etapa: string | null;
  status_etapa: string;
  observacoes: string | null;
  orcamento_etapa: number;
  gasto_etapa: number;
  tempo_previsto_dias: number;
  tempo_real_dias: number;
  created_at: string;
  updated_at: string;
}

// Usar any temporariamente para contornar problemas de tipos
const supabaseAny = supabase as any;

export function useProjectStages(projectId?: number) {
  return useQuery({
    queryKey: ["project-stages", projectId],
    queryFn: async () => {
      console.log("Buscando etapas do projeto:", projectId);
      
      if (!projectId) {
        console.log("ProjectId não fornecido");
        return [];
      }
      
      const { data, error } = await supabaseAny
        .from("etapas_projeto")
        .select("*")
        .eq("projeto_id", projectId)
        .order("numero_etapa");
      
      if (error) {
        console.error("Erro ao buscar etapas:", error);
        throw error;
      }
      
      console.log("Etapas encontradas:", data);
      return (data || []) as ProjectStageDB[];
    },
    enabled: !!projectId,
  });
}

export function useCreateProjectStages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, stages }: { 
      projectId: number; 
      stages: Omit<ProjectStageDB, 'id' | 'created_at' | 'updated_at'>[] 
    }) => {
      console.log("Criando etapas para projeto:", projectId, stages);
      
      if (!projectId || !stages?.length) {
        throw new Error("ProjectId e stages são obrigatórios");
      }
      
      // Primeiro, deletar etapas existentes para este projeto
      const { error: deleteError } = await supabaseAny
        .from("etapas_projeto")
        .delete()
        .eq("projeto_id", projectId);
      
      if (deleteError) {
        console.error("Erro ao deletar etapas existentes:", deleteError);
        throw deleteError;
      }
      
      // Então, inserir as novas etapas
      const { data, error } = await supabaseAny
        .from("etapas_projeto")
        .insert(stages.map(stage => ({ ...stage, projeto_id: projectId })))
        .select();
      
      if (error) {
        console.error("Erro ao criar etapas:", error);
        throw error;
      }
      
      console.log("Etapas criadas com sucesso:", data);
      return (data || []) as ProjectStageDB[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-stages", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProjectStages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, stages }: { 
      projectId: number; 
      stages: Omit<ProjectStageDB, 'id' | 'created_at' | 'updated_at'>[] 
    }) => {
      console.log("Atualizando etapas para projeto:", projectId, stages);
      
      if (!projectId || !stages?.length) {
        throw new Error("ProjectId e stages são obrigatórios");
      }
      
      // Primeiro, deletar etapas existentes para este projeto
      const { error: deleteError } = await supabaseAny
        .from("etapas_projeto")
        .delete()
        .eq("projeto_id", projectId);
      
      if (deleteError) {
        console.error("Erro ao deletar etapas existentes:", deleteError);
        throw deleteError;
      }
      
      // Então, inserir as novas etapas
      const { data, error } = await supabaseAny
        .from("etapas_projeto")
        .insert(stages.map(stage => ({ ...stage, projeto_id: projectId })))
        .select();
      
      if (error) {
        console.error("Erro ao atualizar etapas:", error);
        throw error;
      }
      
      console.log("Etapas atualizadas com sucesso:", data);
      return (data || []) as ProjectStageDB[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-stages", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
