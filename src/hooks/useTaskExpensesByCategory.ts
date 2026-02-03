import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaskExpenseDetail {
  tarefa_id: number;
  nome_tarefa: string;
  etapa_nome: string;
  custo_material: number;
  custo_mao_obra: number;
  custo_patrimonio: number;
  custo_indireto: number;
  data_inicio: string;
  data_fim_prevista: string;
  relevantCost?: number;
}

/**
 * Hook to fetch detailed task expenses by category for a project
 * This shows the breakdown of costs from tasks
 * FIXED: Uses tarefas_lean table with correct field mappings
 */
export function useTaskExpensesByCategory(projectId: number | null, category: string) {
  return useQuery<TaskExpenseDetail[]>({
    queryKey: ['task-expenses-by-category', projectId, category],
    queryFn: async (): Promise<TaskExpenseDetail[]> => {
      if (!projectId) return [];

      // FIXED: Query tarefas_lean instead of tarefas, use id_projeto instead of projeto_id
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('tarefas_lean' as any)
        .select('*')
        .eq('id_projeto', projectId);
      
      if (fallbackError) {
        console.error('Error fetching task expenses:', fallbackError);
        return [];
      }
      
      // Filter and map manually - only include tasks with progress >= 1%
      const filtered: TaskExpenseDetail[] = (fallbackData || [])
        .filter((task: any) => (Number(task.percentual_conclusao) || 0) >= 1)
        .map((task: any) => {
          let relevantCost = 0;
          
          switch (category) {
            case 'material':
              relevantCost = Number(task.custo_material) || 0;
              break;
            case 'mao_obra':
              relevantCost = Number(task.custo_mao_obra) || 0;
              break;
            case 'patrimonio':
              relevantCost = Number(task.custo_patrimonio) || 0;
              break;
            case 'indireto':
              relevantCost = Number(task.custo_indireto) || 0;
              break;
          }

          return {
            tarefa_id: task.id,
            nome_tarefa: task.descricao || task.nome_tarefa || 'Tarefa sem nome', // FIXED: use descricao field
            etapa_nome: 'N/A',
            custo_material: Number(task.custo_material) || 0,
            custo_mao_obra: Number(task.custo_mao_obra) || 0,
            custo_patrimonio: Number(task.custo_patrimonio) || 0,
            custo_indireto: Number(task.custo_indireto) || 0,
            data_inicio: task.data_inicio || task.prazo,
            data_fim_prevista: task.data_fim_prevista || task.prazo,
            relevantCost,
          };
        })
        .filter((task: TaskExpenseDetail) => (task.relevantCost || 0) > 0);

      return filtered;
    },
    enabled: !!projectId && !!category,
    staleTime: 30000, // 30 seconds
  });
}
