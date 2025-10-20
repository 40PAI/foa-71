import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaskFinancialAnalytics {
  total_planned_cost: number;
  total_real_expenses: number;
  budget_deviation: number;
  budget_deviation_percentage: number;
  total_planned_days: number;
  total_real_days: number;
  time_deviation: number;
  time_efficiency_percentage: number;
  tasks_on_budget: number;
  tasks_over_budget: number;
  tasks_on_time: number;
  tasks_delayed: number;
  material_planned: number;
  material_real: number;
  labor_planned: number;
  labor_real: number;
  efficiency_score: number;
}

export interface TopDeviationTask {
  task_id: number;
  descricao: string;
  responsavel: string;
  custo_planejado: number;
  gasto_real: number;
  desvio_orcamentario: number;
  desvio_percentual: number;
  tempo_previsto: number;
  tempo_real: number;
  desvio_temporal: number;
  status: string;
}

export function useTaskFinancialAnalytics(projectId: number | null) {
  return useQuery<TaskFinancialAnalytics>({
    queryKey: ["task-financial-analytics", projectId],
    queryFn: async () => {
      if (!projectId) {
        return {
          total_planned_cost: 0,
          total_real_expenses: 0,
          budget_deviation: 0,
          budget_deviation_percentage: 0,
          total_planned_days: 0,
          total_real_days: 0,
          time_deviation: 0,
          time_efficiency_percentage: 100,
          tasks_on_budget: 0,
          tasks_over_budget: 0,
          tasks_on_time: 0,
          tasks_delayed: 0,
          material_planned: 0,
          material_real: 0,
          labor_planned: 0,
          labor_real: 0,
          efficiency_score: 100,
        };
      }

      const { data, error } = await supabase.rpc("get_task_financial_analytics", {
        project_id: projectId,
      });

      if (error) throw error;
      return data?.[0] || {
        total_planned_cost: 0,
        total_real_expenses: 0,
        budget_deviation: 0,
        budget_deviation_percentage: 0,
        total_planned_days: 0,
        total_real_days: 0,
        time_deviation: 0,
        time_efficiency_percentage: 100,
        tasks_on_budget: 0,
        tasks_over_budget: 0,
        tasks_on_time: 0,
        tasks_delayed: 0,
        material_planned: 0,
        material_real: 0,
        labor_planned: 0,
        labor_real: 0,
        efficiency_score: 100,
      };
    },
    enabled: !!projectId,
  });
}

export function useTopDeviationTasks(projectId: number | null, limitCount: number = 10) {
  return useQuery<TopDeviationTask[]>({
    queryKey: ["top-deviation-tasks", projectId, limitCount],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase.rpc("get_top_deviation_tasks", {
        project_id: projectId,
        limit_count: limitCount,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}
