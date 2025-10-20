
import { useQuery } from "@tanstack/react-query";
import { useProjects, useProject } from "./useProjects";
import { useFinancesByProject } from "./useFinances";
import { usePatrimonyByProject } from "./usePatrimony";
import { useEmployeesByProject } from "./useEmployeesByProject";
import { useDashboardKpis, useDashboardKpisByProject } from "./useDashboardKpis";
import { useTasks } from "./useTasks";
import { useRealtimeProjectMetrics } from "./useRealtimeProjectMetrics";

// Helper function to calculate temporal progress on the frontend
function calculateTemporalProgress(project: any): number {
  if (!project?.data_inicio || !project?.data_fim_prevista) return 0;
  
  const startDate = new Date(project.data_inicio);
  const endDate = new Date(project.data_fim_prevista);
  const currentDate = new Date();
  
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysPassed = Math.max(0, Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  return Math.max(0, Math.min(100, Math.round((daysPassed / totalDays) * 100)));
}

export function useProjectDetails(projectId?: number) {
  // Enable real-time updates for this project
  useRealtimeProjectMetrics(projectId);

  const { data: project } = useProject(projectId!);
  const { data: finances } = useFinancesByProject(projectId!);
  const { data: patrimony } = usePatrimonyByProject(projectId);
  const { data: employees } = useEmployeesByProject(projectId);
  const { data: kpis } = useDashboardKpisByProject(projectId);
  const { data: allTasks } = useTasks(projectId);

  // Use tasks directly since they're already filtered by projectId
  const tasks = allTasks || [];

  return useQuery({
    queryKey: ["project-details", projectId],
    queryFn: () => {
      if (!project) return null;

      // Calculate totals
      const totalFinances = finances?.reduce((acc, f) => ({
        orcamentado: acc.orcamentado + f.orcamentado,
        gasto: acc.gasto + f.gasto
      }), { orcamentado: 0, gasto: 0 }) || { orcamentado: 0, gasto: 0 };

      const totalEmployees = employees?.length || 0;
      const totalPatrimony = patrimony?.length || 0;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === "Concluído").length;

      // Calculate frontend temporal progress as fallback
      const frontendTemporalProgress = calculateTemporalProgress(project);
      
      // Use database value if available, otherwise use frontend calculation
      const temporalProgress = project.avanco_tempo || frontendTemporalProgress;

      console.log(`Progresso temporal para projeto ${projectId}:`, {
        database: project.avanco_tempo,
        frontend: frontendTemporalProgress,
        final: temporalProgress,
        dates: {
          inicio: project.data_inicio,
          fim: project.data_fim_prevista
        }
      });

      return {
        project: {
          ...project,
          avanco_tempo: temporalProgress // Ensure we always have a temporal progress value
        },
        finances: finances || [],
        patrimony: patrimony || [],
        employees: employees || [],
        tasks,
        kpis: kpis?.[0], // Get the most recent KPI entry
        summary: {
          totalFinances,
          totalEmployees,
          totalPatrimony,
          totalTasks,
          completedTasks,
          taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        }
      };
    },
    enabled: !!projectId && !!project,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
