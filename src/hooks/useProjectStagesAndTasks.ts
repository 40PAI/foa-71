import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProjectStages(projectId?: number) {
  return useQuery({
    queryKey: ["project-stages", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("etapas_projeto")
        .select("id, nome_etapa, numero_etapa, tipo_etapa")
        .eq("projeto_id", projectId)
        .order("numero_etapa");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}

export function useProjectTasks(projectId?: number, etapaId?: number) {
  return useQuery({
    queryKey: ["project-tasks", projectId, etapaId],
    queryFn: async () => {
      if (!projectId) return [];
      
      let query = supabase
        .from("tarefas_lean")
        .select("id, descricao, responsavel, tipo, status")
        .eq("id_projeto", projectId)
        .order("id");
      
      if (etapaId) {
        query = query.eq("id_etapa", etapaId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}
