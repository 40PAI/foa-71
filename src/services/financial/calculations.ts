/**
 * Financial Calculations Service
 * Centralizes all financial calculation logic
 */

import type { 
  IntegratedFinancialData, 
  FinancialBreakdown,
  PurchaseBreakdown 
} from "@/types/finance";

/**
 * Calculate financial progress percentage
 */
export function calculateFinancialProgress(
  totalExpenses: number,
  totalBudget: number
): number {
  if (totalBudget === 0) return 0;
  return Math.round((totalExpenses / totalBudget) * 100);
}

/**
 * Calculate category percentage of total budget
 */
export function calculateCategoryPercentage(
  categoryValue: number,
  totalBudget: number
): number {
  if (totalBudget === 0) return 0;
  return (categoryValue / totalBudget) * 100;
}

/**
 * Calculate discrepancy between calculated and manual values
 */
export function calculateDiscrepancy(
  calculatedValue: number,
  manualValue: number
): {
  absolute: number;
  percentage: number;
  isSignificant: boolean;
} {
  const absolute = calculatedValue - manualValue;
  const percentage = manualValue > 0 
    ? Math.abs(absolute / manualValue) * 100 
    : 0;
  
  return {
    absolute,
    percentage,
    isSignificant: Math.abs(absolute) > 1000 || percentage > 5
  };
}

/**
 * Aggregate financial breakdown by category
 */
export function aggregateFinancialBreakdown(
  data: IntegratedFinancialData
): FinancialBreakdown[] {
  const { 
    total_budget,
    material_expenses,
    payroll_expenses,
    patrimony_expenses,
    indirect_expenses 
  } = data;

  return [
    {
      categoria: "Materiais",
      valor_calculado: material_expenses,
      valor_manual: 0,
      discrepancia: 0,
      percentual_orcamento: calculateCategoryPercentage(material_expenses, total_budget)
    },
    {
      categoria: "Mão de Obra",
      valor_calculado: payroll_expenses,
      valor_manual: 0,
      discrepancia: 0,
      percentual_orcamento: calculateCategoryPercentage(payroll_expenses, total_budget)
    },
    {
      categoria: "Patrimônio",
      valor_calculado: patrimony_expenses,
      valor_manual: 0,
      discrepancia: 0,
      percentual_orcamento: calculateCategoryPercentage(patrimony_expenses, total_budget)
    },
    {
      categoria: "Custos Indiretos",
      valor_calculado: indirect_expenses,
      valor_manual: 0,
      discrepancia: 0,
      percentual_orcamento: calculateCategoryPercentage(indirect_expenses, total_budget)
    }
  ];
}

/**
 * Calculate total from purchase breakdown
 */
export function calculatePurchaseTotal(
  breakdown: PurchaseBreakdown[]
): {
  totalValue: number;
  totalApproved: number;
  totalPending: number;
  approvalRate: number;
} {
  const totals = breakdown.reduce(
    (acc, item) => ({
      totalValue: acc.totalValue + item.total_requisicoes,
      totalApproved: acc.totalApproved + item.valor_aprovado,
      totalPending: acc.totalPending + item.valor_pendente
    }),
    { totalValue: 0, totalApproved: 0, totalPending: 0 }
  );

  const approvalRate = totals.totalValue > 0
    ? (totals.totalApproved / totals.totalValue) * 100
    : 0;

  return {
    ...totals,
    approvalRate
  };
}

/**
 * Check if budget limit is exceeded
 */
export function checkBudgetLimit(
  currentSpending: number,
  pendingAmount: number,
  budgetLimit: number
): {
  isExceeded: boolean;
  projectedTotal: number;
  availableAmount: number;
  utilizationRate: number;
} {
  const projectedTotal = currentSpending + pendingAmount;
  const availableAmount = Math.max(0, budgetLimit - projectedTotal);
  const utilizationRate = budgetLimit > 0 
    ? (projectedTotal / budgetLimit) * 100 
    : 0;

  return {
    isExceeded: projectedTotal > budgetLimit,
    projectedTotal,
    availableAmount,
    utilizationRate
  };
}

/**
 * Get financial status based on progress
 */
export function getFinancialStatus(
  financialProgress: number,
  physicalProgress: number
): {
  status: "normal" | "warning" | "critical";
  message: string;
} {
  const deviation = financialProgress - physicalProgress;

  if (Math.abs(deviation) <= 5) {
    return {
      status: "normal",
      message: "Progresso financeiro alinhado com o físico"
    };
  }

  if (deviation > 15) {
    return {
      status: "critical",
      message: "Gastos significativamente acima do progresso físico"
    };
  }

  if (deviation > 5) {
    return {
      status: "warning",
      message: "Gastos moderadamente acima do progresso físico"
    };
  }

  return {
    status: "normal",
    message: "Progresso financeiro dentro dos limites"
  };
}
