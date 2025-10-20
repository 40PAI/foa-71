
import { useQuery } from "@tanstack/react-query";
import { useProject } from "./useProjects";
import { useFinancesByProject } from "./useFinances";
import { usePatrimonyByProject } from "./usePatrimony";
import { useEmployeesByProject } from "./useEmployees";
import { useDashboardKpisByProject } from "./useDashboardKpis";
import { useTasks } from "./useTasks";
import { useOptimizedQuery } from "./useOptimizedQuery";
import { useMemo } from "react";

export function useOptimizedProjectDetails(projectId?: number) {
  const { data: project } = useProject(projectId!);
  const { data: finances } = useFinancesByProject(projectId!);
  const { data: patrimony } = usePatrimonyByProject(projectId);
  const { data: employees } = useEmployeesByProject(projectId);
  const { data: kpis } = useDashboardKpisByProject(projectId);
  const { data: allTasks } = useTasks(projectId);

  // Memoize expensive calculations
  const memoizedData = useMemo(() => {
    if (!project) return null;

    const tasks = allTasks || [];

    // Calculate totals efficiently
    const totalFinances = finances?.reduce((acc, f) => ({
      orcamentado: acc.orcamentado + f.orcamentado,
      gasto: acc.gasto + f.gasto
    }), { orcamentado: 0, gasto: 0 }) || { orcamentado: 0, gasto: 0 };

    const totalEmployees = employees?.length || 0;
    const totalPatrimony = patrimony?.length || 0;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Concluído").length;

    return {
      project,
      finances: finances || [],
      patrimony: patrimony || [],
      employees: employees || [],
      tasks,
      kpis: kpis?.[0],
      summary: {
        totalFinances,
        totalEmployees,
        totalPatrimony,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      }
    };
  }, [project, finances, patrimony, employees, allTasks, kpis]);

  return useOptimizedQuery({
    queryKey: ["optimized-project-details", projectId],
    queryFn: () => memoizedData,
    projectSpecific: true,
    enabled: !!projectId && !!project,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
