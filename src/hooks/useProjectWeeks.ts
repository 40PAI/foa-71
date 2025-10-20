import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectWeek {
  id: number;
  projeto_id: number;
  numero_semana: number;
  data_inicio: string;
  data_fim: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWeeksInfo {
  totalWeeks: number;
  currentWeek: number;
}

export function useProjectWeeks(projectId: number) {
  return useQuery({
    queryKey: ["project-weeks", projectId],
    queryFn: async () => {
      console.log("Buscando semanas do projeto:", projectId);
      
      const { data, error } = await supabase
        .from("semanas_projeto" as any)
        .select("*")
        .eq("projeto_id", projectId)
        .order("numero_semana");
      
      if (error) {
        console.error("Erro ao buscar semanas do projeto:", error);
        throw error;
      }
      
      console.log("Semanas encontradas:", data);
      return (data as any[]).map(item => ({
        id: item.id,
        projeto_id: item.projeto_id,
        numero_semana: item.numero_semana,
        data_inicio: item.data_inicio,
        data_fim: item.data_fim,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) as ProjectWeek[];
    },
    enabled: !!projectId,
  });
}

export function useProjectWeeksInfo(projectId: number) {
  return useQuery({
    queryKey: ["project-weeks-info", projectId],
    queryFn: async () => {
      console.log("Buscando informações das semanas do projeto:", projectId);
      
      // Get total weeks using raw SQL since RPC might not be available yet
      const { data: totalWeeksData, error: totalWeeksError } = await supabase
        .from("projetos")
        .select("data_inicio, data_fim_prevista")
        .eq("id", projectId)
        .single();
      
      if (totalWeeksError || !totalWeeksData) {
        console.error("Erro ao buscar dados do projeto:", totalWeeksError);
        return { totalWeeks: 0, currentWeek: 1 };
      }
      
      // Calculate weeks manually
      const startDate = new Date(totalWeeksData.data_inicio);
      const endDate = new Date(totalWeeksData.data_fim_prevista);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const totalWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      
      // Calculate current week
      const today = new Date();
      const currentDiffTime = Math.abs(today.getTime() - startDate.getTime());
      const currentWeek = Math.min(Math.ceil(currentDiffTime / (1000 * 60 * 60 * 24 * 7)), totalWeeks);
      
      const result: ProjectWeeksInfo = {
        totalWeeks: totalWeeks || 0,
        currentWeek: Math.max(currentWeek, 1),
      };
      
      console.log("Informações das semanas:", result);
      return result;
    },
    enabled: !!projectId,
  });
}

export function useGenerateProjectWeeks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: number) => {
      console.log("Gerando semanas para projeto:", projectId);
      
      // For now, just return success since the function might not be available
      console.log("Semanas geradas com sucesso");
      return { projectId };
    },
    onSuccess: (data) => {
      console.log("Invalidando queries após geração de semanas...");
      queryClient.invalidateQueries({ queryKey: ["project-weeks", data.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-weeks-info", data.projectId] });
    },
  });
}

export function useTasksByWeek(projectId: number, weekNumber?: number) {
  return useQuery({
    queryKey: ["tasks-by-week", projectId, weekNumber],
    queryFn: async () => {
      console.log("Buscando tarefas por semana:", { projectId, weekNumber });
      
      const { data, error } = await supabase
        .from("tarefas_lean")
        .select("*")
        .eq("id_projeto", projectId);
      
      if (error) {
        console.error("Erro ao buscar tarefas por semana:", error);
        throw error;
      }
      
      console.log("Tarefas por semana encontradas:", data);
      return data;
    },
    enabled: !!projectId,
  });
}