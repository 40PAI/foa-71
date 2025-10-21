/**
 * Financial Hooks Barrel Export
 * Consolidates all financial-related hooks
 */

// Base financial hooks
export { 
  useFinances,
  useFinancesByProject,
  useCreateFinance,
  useUpdateFinance 
} from "../useFinances";

// Integrated financial hooks
export {
  useIntegratedFinancialProgress,
  useDetailedExpenseBreakdown,
  useDetailedExpenses,
  useCreateDetailedExpense,
  useApproveExpense
} from "../useIntegratedFinances";

// Financial integration hooks
export {
  usePendingApprovals,
  useFinancialDiscrepancies,
  useApproveRequisition,
  useRealtimeFinancialSync
} from "../useFinancialIntegration";

// Optimized financial hooks
export {
  useOptimizedPendingApprovals,
  useOptimizedFinancialDiscrepancies,
  useOptimizedApproveRequisition,
  useOptimizedRealtimeSync
} from "../useOptimizedFinancialIntegration";

// Purchase breakdown hooks
export { usePurchaseBreakdown } from "../usePurchaseBreakdown";
export { useOptimizedPurchaseBreakdown } from "../useOptimizedPurchaseBreakdown";

// Dashboard hooks
export { useIntegratedDashboard } from "../useIntegratedDashboard";

// Task financial analytics hooks
export { 
  useTaskFinancialAnalytics, 
  useTopDeviationTasks,
  type TaskFinancialAnalytics,
  type TopDeviationTask
} from "../useTaskFinancialAnalytics";

// Task financial summary hooks
export { useTaskFinancialSummary } from "../useTaskFinancialSummary";

// Enhanced financial chart data
export { useEnhancedFinancialChartData } from "../useEnhancedFinancialChartData";

// Re-export types
export type {
  Finance,
  FinancialBreakdown,
  FinancialDiscrepancy,
  IntegratedFinancialData,
  PurchaseBreakdown,
  DetailedExpense,
  FinancialCategory
} from "@/types/finance";
