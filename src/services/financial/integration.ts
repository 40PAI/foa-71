/**
 * Financial Integration Service
 * Handles integration between different financial data sources
 */

import type { 
  IntegratedFinancialData,
  FinancialBreakdown,
  DetailedExpense 
} from "@/types/finance";
import { calculateFinancialProgress } from "./calculations";

/**
 * Merge manual financial data with calculated data
 */
export function mergeFinancialData(
  calculatedData: IntegratedFinancialData,
  manualData: FinancialBreakdown[]
): FinancialBreakdown[] {
  const categoryMap: Record<string, number> = {
    "Materiais": calculatedData.material_expenses,
    "Mão de Obra": calculatedData.payroll_expenses,
    "Patrimônio": calculatedData.patrimony_expenses,
    "Custos Indiretos": calculatedData.indirect_expenses
  };

  return manualData.map(manual => {
    const calculated = categoryMap[manual.categoria] || 0;
    const discrepancy = calculated - manual.valor_manual;

    return {
      ...manual,
      valor_calculado: calculated,
      discrepancia: discrepancy,
      percentual_orcamento: calculatedData.total_budget > 0
        ? (calculated / calculatedData.total_budget) * 100
        : 0
    };
  });
}

/**
 * Reconcile detailed expenses with aggregated data
 */
export function reconcileExpenses(
  detailedExpenses: DetailedExpense[],
  aggregatedTotal: number
): {
  reconciled: boolean;
  difference: number;
  detailedTotal: number;
  missingExpenses: number;
} {
  const detailedTotal = detailedExpenses.reduce(
    (sum, expense) => sum + expense.valor,
    0
  );

  const difference = Math.abs(aggregatedTotal - detailedTotal);
  const reconciled = difference < 100; // Tolerance of 100 units

  return {
    reconciled,
    difference,
    detailedTotal,
    missingExpenses: aggregatedTotal - detailedTotal
  };
}

/**
 * Map categoria_principal to financas category
 */
export function mapCategoriaToFinancas(
  categoriaPrincipal: string
): string {
  const categoryMap: Record<string, string> = {
    "Material": "Materiais de Construção",
    "Mão de Obra": "Mão de Obra",
    "Património": "Equipamentos",
    "Custos Indiretos": "Custos Indiretos"
  };

  return categoryMap[categoriaPrincipal] || "Outros";
}

/**
 * Validate financial data consistency
 */
export function validateFinancialConsistency(
  data: IntegratedFinancialData
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if total expenses match sum of categories
  const calculatedTotal = 
    data.material_expenses +
    data.payroll_expenses +
    data.patrimony_expenses +
    data.indirect_expenses;

  const difference = Math.abs(calculatedTotal - data.total_expenses);
  
  if (difference > 1000) {
    errors.push(
      `Inconsistência: Total de gastos (${data.total_expenses}) não corresponde à soma das categorias (${calculatedTotal})`
    );
  } else if (difference > 100) {
    warnings.push(
      `Pequena diferença detectada entre total e soma das categorias: ${difference}`
    );
  }

  // Check if financial progress makes sense
  if (data.financial_progress < 0) {
    errors.push("Progresso financeiro não pode ser negativo");
  }

  if (data.financial_progress > 150) {
    warnings.push(
      `Progresso financeiro muito alto (${data.financial_progress}%) - possível estouro de orçamento`
    );
  }

  // Check for zero budget with expenses
  if (data.total_budget === 0 && data.total_expenses > 0) {
    errors.push("Orçamento não pode ser zero se há gastos registrados");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate financial summary
 */
export function generateFinancialSummary(
  data: IntegratedFinancialData
): {
  budget: number;
  spent: number;
  remaining: number;
  progress: number;
  utilizationRate: number;
  isOverBudget: boolean;
} {
  const remaining = Math.max(0, data.total_budget - data.total_expenses);
  const utilizationRate = data.total_budget > 0
    ? (data.total_expenses / data.total_budget) * 100
    : 0;

  return {
    budget: data.total_budget,
    spent: data.total_expenses,
    remaining,
    progress: data.financial_progress,
    utilizationRate,
    isOverBudget: data.total_expenses > data.total_budget
  };
}
