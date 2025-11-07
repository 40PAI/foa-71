import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CategoryExpenseData {
  fromTasks: number;
  manual: number;
  total: number;
}

export interface IntegratedCategoryExpenses {
  material: CategoryExpenseData;
  mao_obra: CategoryExpenseData;
  patrimonio: CategoryExpenseData;
  indireto: CategoryExpenseData;
}

/**
 * Hook to fetch integrated expenses from both tasks and manual entries
 * Combines task-based costs with manual expense records by category
 */
export function useCategoryIntegratedExpenses(projectId: number | null) {
  return useQuery<IntegratedCategoryExpenses>({
    queryKey: ['category-integrated-expenses', projectId],
    queryFn: async () => {
      if (!projectId) {
        return {
          material: { fromTasks: 0, manual: 0, total: 0 },
          mao_obra: { fromTasks: 0, manual: 0, total: 0 },
          patrimonio: { fromTasks: 0, manual: 0, total: 0 },
          indireto: { fromTasks: 0, manual: 0, total: 0 },
        };
      }

      // Fetch integrated financial progress from tasks
      const { data: integrated, error: integratedError } = await supabase
        .rpc('calculate_integrated_financial_progress', { 
          project_id: projectId 
        });

      if (integratedError) {
        console.error('Error fetching integrated financial progress:', integratedError);
      }

      // Fetch manual expenses from gastos_detalhados
      const { data: manualExpenses, error: manualError } = await supabase
        .from('gastos_detalhados')
        .select('categoria_gasto, valor')
        .eq('projeto_id', projectId);

      if (manualError) {
        console.error('Error fetching manual expenses:', manualError);
      }

      // Calculate manual totals by category
      const manualByCategory = {
        material: 0,
        mao_obra: 0,
        patrimonio: 0,
        indireto: 0,
      };

      manualExpenses?.forEach((expense) => {
        const category = expense.categoria_gasto as keyof typeof manualByCategory;
        if (category in manualByCategory) {
          manualByCategory[category] += Number(expense.valor) || 0;
        }
      });

      // Combine both sources (RPC returns array, get first element)
      const integratedData = integrated?.[0];
      const material_from_tasks = Number(integratedData?.material_expenses) || 0;
      const labor_from_tasks = Number(integratedData?.payroll_expenses) || 0;
      const equipment_from_tasks = Number(integratedData?.patrimony_expenses) || 0;
      const indirect_from_tasks = Number(integratedData?.indirect_expenses) || 0;

      return {
        material: {
          fromTasks: material_from_tasks,
          manual: manualByCategory.material,
          total: material_from_tasks + manualByCategory.material,
        },
        mao_obra: {
          fromTasks: labor_from_tasks,
          manual: manualByCategory.mao_obra,
          total: labor_from_tasks + manualByCategory.mao_obra,
        },
        patrimonio: {
          fromTasks: equipment_from_tasks,
          manual: manualByCategory.patrimonio,
          total: equipment_from_tasks + manualByCategory.patrimonio,
        },
        indireto: {
          fromTasks: indirect_from_tasks,
          manual: manualByCategory.indireto,
          total: indirect_from_tasks + manualByCategory.indireto,
        },
      };
    },
    enabled: !!projectId,
    staleTime: 30000, // 30 seconds
  });
}
