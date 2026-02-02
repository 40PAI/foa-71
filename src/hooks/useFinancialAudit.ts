import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for financial audit data
export interface FinancialDiscrepancy {
  categoria: string;
  gasto_manual: number;
  gasto_calculado: number;
  discrepancia: number;
  percentual_discrepancia: number;
  fontes: string[];
  status: 'ok' | 'atencao' | 'critico';
}

export interface FinancialAuditSummary {
  total_manual: number;
  total_calculado: number;
  discrepancia_total: number;
  data_calculo: string;
}

export interface FinancialAuditData {
  discrepancies: FinancialDiscrepancy[];
  summary: FinancialAuditSummary;
  isConsistent: boolean;
}

/**
 * Hook para auditoria financeira completa
 * Agrega dados de movimentos_financeiros, requisicoes e gastos_detalhados
 * Compara com dados manuais da tabela financas
 */
export function useFinancialAudit(projectId: number | null) {
  return useQuery({
    queryKey: ["financial-audit", projectId],
    queryFn: async (): Promise<FinancialAuditData> => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      // Chamar a função RPC corrigida
      const { data, error } = await supabase.rpc("detect_financial_discrepancies", {
        p_project_id: projectId,
      });

      if (error) {
        console.error("Erro ao detectar discrepâncias financeiras:", error);
        throw error;
      }

      // Processar os dados retornados
      const discrepancies: FinancialDiscrepancy[] = (data || []).map((row: any) => {
        const percentualAbs = Math.abs(row.percentual_discrepancia || 0);
        let status: 'ok' | 'atencao' | 'critico' = 'ok';
        
        if (percentualAbs > 10) {
          status = 'critico';
        } else if (percentualAbs > 5) {
          status = 'atencao';
        }

        return {
          categoria: row.categoria,
          gasto_manual: Number(row.gasto_manual) || 0,
          gasto_calculado: Number(row.gasto_calculado) || 0,
          discrepancia: Number(row.discrepancia) || 0,
          percentual_discrepancia: Number(row.percentual_discrepancia) || 0,
          fontes: row.fontes || [],
          status,
        };
      });

      // Calcular resumo
      const total_manual = discrepancies.reduce((sum, d) => sum + d.gasto_manual, 0);
      const total_calculado = discrepancies.reduce((sum, d) => sum + d.gasto_calculado, 0);
      const discrepancia_total = total_calculado - total_manual;

      const summary: FinancialAuditSummary = {
        total_manual,
        total_calculado,
        discrepancia_total,
        data_calculo: new Date().toISOString(),
      };

      // Verificar se os dados são consistentes (tolerância de 5%)
      const isConsistent = discrepancies.every(d => d.status === 'ok');

      return {
        discrepancies,
        summary,
        isConsistent,
      };
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos em cache
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obter breakdown detalhado de gastos por categoria
 * Usa a função RPC get_detailed_expense_breakdown
 */
export function useDetailedExpenseBreakdownV2(projectId: number | null) {
  return useQuery({
    queryKey: ["detailed-expense-breakdown-v2", projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const { data, error } = await supabase.rpc("get_detailed_expense_breakdown", {
        p_project_id: projectId,
      });

      if (error) {
        console.error("Erro ao buscar breakdown de despesas:", error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        categoria: row.categoria,
        valor_calculado: Number(row.valor_calculado) || 0,
        valor_manual: Number(row.valor_manual) || 0,
        discrepancia: Number(row.discrepancia) || 0,
        percentual_orcamento: Number(row.percentual_orcamento) || 0,
      }));
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obter progresso financeiro integrado
 * Usa a função RPC calculate_integrated_financial_progress
 */
export function useIntegratedFinancialProgressV2(projectId: number | null) {
  return useQuery({
    queryKey: ["integrated-financial-progress-v2", projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const { data, error } = await supabase.rpc("calculate_integrated_financial_progress", {
        project_id: projectId,
      });

      if (error) {
        console.error("Erro ao calcular progresso financeiro:", error);
        throw error;
      }

      const result = data?.[0];
      if (!result) {
        return null;
      }

      return {
        total_budget: Number(result.total_budget) || 0,
        material_expenses: Number(result.material_expenses) || 0,
        payroll_expenses: Number(result.payroll_expenses) || 0,
        patrimony_expenses: Number(result.patrimony_expenses) || 0,
        indirect_expenses: Number(result.indirect_expenses) || 0,
        total_expenses: Number(result.total_expenses) || 0,
        financial_progress: Number(result.financial_progress) || 0,
        task_material_cost: Number(result.task_material_cost) || 0,
        task_labor_cost: Number(result.task_labor_cost) || 0,
        task_real_expenses: Number(result.task_real_expenses) || 0,
      };
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
