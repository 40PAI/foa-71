import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaskFinancialByStage {
  etapa_id: number;
  etapa_nome: string;
  subtotal_material: number;
  subtotal_mao_obra: number;
  total: number;
  quantidade_tarefas: number;
}

interface TaskFinancialTotal {
  subtotal_material: number;
  subtotal_mao_obra: number;
  total: number;
}

interface TaskFinancialSummaryResult {
  stages: TaskFinancialByStage[];
  totals: TaskFinancialTotal;
}

export function useTaskFinancialSummary(projectId: number | null) {
  return useQuery<TaskFinancialSummaryResult>({
    queryKey: ["task-financial-summary", projectId],
    queryFn: async () => {
      if (!projectId) {
        return { stages: [], totals: { subtotal_material: 0, subtotal_mao_obra: 0, total: 0 } };
      }

      const { data: tasks, error } = await supabase
        .from("tarefas_lean")
        .select(`
          id_etapa,
          custo_material,
          custo_mao_obra,
          etapas_projeto!inner(
            id,
            nome_etapa
          )
        `)
        .eq("id_projeto", projectId);
      
      if (error) throw error;
      
      // Agrupar por etapa
      const byStage = (tasks || []).reduce((acc, task) => {
        const etapaId = task.id_etapa;
        if (!etapaId) return acc;
        
        if (!acc[etapaId]) {
          acc[etapaId] = {
            etapa_id: etapaId,
            etapa_nome: (task.etapas_projeto as any).nome_etapa,
            subtotal_material: 0,
            subtotal_mao_obra: 0,
            total: 0,
            quantidade_tarefas: 0,
          };
        }
        
        const material = Number(task.custo_material) || 0;
        const maoObra = Number(task.custo_mao_obra) || 0;
        
        acc[etapaId].subtotal_material += material;
        acc[etapaId].subtotal_mao_obra += maoObra;
        acc[etapaId].total += (material + maoObra);
        acc[etapaId].quantidade_tarefas += 1;
        
        return acc;
      }, {} as Record<number, TaskFinancialByStage>);
      
      const stages: TaskFinancialByStage[] = Object.values(byStage);
      
      // Calcular totais gerais
      const totals: TaskFinancialTotal = {
        subtotal_material: stages.reduce((sum, s) => sum + s.subtotal_material, 0),
        subtotal_mao_obra: stages.reduce((sum, s) => sum + s.subtotal_mao_obra, 0),
        total: stages.reduce((sum, s) => sum + s.total, 0),
      };
      
      return { stages, totals };
    },
    enabled: !!projectId,
  });
}
