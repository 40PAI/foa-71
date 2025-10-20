
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeProjectMetrics } from "./useRealtimeProjectMetrics";

export function useProjectMetrics(projectId: number) {
  // Enable real-time updates for this project
  useRealtimeProjectMetrics(projectId);

  return useQuery({
    queryKey: ["project-metrics", projectId],
    queryFn: async () => {
      // Get project data
      const { data: project } = await supabase
        .from("projetos")
        .select("*")
        .eq("id", projectId)
        .single();

      if (!project) return null;

      // Calculate physical progress (% Físico)
      const { data: tasks } = await supabase
        .from("tarefas_lean")
        .select("*")
        .eq("id_projeto", projectId);

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === "Concluído").length || 0;
      const physicalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate financial progress (% Financeiro)
      const { data: finances } = await supabase
        .from("financas")
        .select("*")
        .eq("id_projeto", projectId);

      const totalBudget = project.orcamento || 0;
      const totalSpent = finances?.reduce((acc, finance) => acc + finance.gasto, 0) || 0;
      const financialProgress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

      // Calculate time progress (% Tempo)
      const startDate = new Date(project.data_inicio);
      const endDate = new Date(project.data_fim_prevista);
      const currentDate = new Date();

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const timeProgress = totalDays > 0 ? Math.max(0, Math.min(100, Math.round((daysPassed / totalDays) * 100))) : 0;

      return {
        physicalProgress,
        financialProgress,
        timeProgress,
        totalTasks,
        completedTasks,
        totalBudget,
        totalSpent,
        totalDays,
        daysPassed
      };
    },
    enabled: !!projectId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
