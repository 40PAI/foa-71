// Centralized exports for all hooks

// ============= CORE QUERY SYSTEM (NEW - Use this!) =============
export {
  useOptimizedQuery,
  useOptimizedMutation,
  useSmartInvalidation,
  usePrefetch,
} from "./useQuery";

// ============= CONTEXT HOOKS (Optimized) =============
export {
  useAppState,
  useProjectState,
  useUserState,
  useOptimizedNotifications,
} from "./useContextHooks";

// ============= PERFORMANCE UTILITIES =============
export {
  useDeepCallback,
  useDeepMemo,
  useDebouncedValue,
  useThrottledValue,
} from "./useMemoizedCallback";

export {
  useOptimizedState,
  useDebouncedCallback,
  useSelector,
  usePerformanceMonitor,
} from "./useOptimizedState";

// ============= FINANCIAL HOOKS (Consolidated) =============
export * from "./financial";
export { useFundingBreakdown, useFundingDonutData } from "./useFundingBreakdown";
export { useResumoFOA, useResumoFOAGeral } from "./useResumoFOA";
export { useDREPorCentro, useSalvarDRE } from "./useDREPorCentro";
export { useNotificacoes, useMarcarComoLida, useVerificarOrcamentos } from "./useNotificacoes";
export { useReembolsosFOA, useCreateReembolso, useUpdateReembolso, useDeleteReembolso, useReembolsosAcumulados } from "./useReembolsosFOA";
export { useContasFornecedores, useKPIsContasFornecedores, useLancamentosFornecedor, useCreateContaFornecedor, useCreateLancamento, useSaldoContaFornecedor } from "./useContasFornecedores";

// ============= DOMAIN-SPECIFIC HOOKS =============
// Projects
export { useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject } from "./useProjects";
export { useProjectDetails } from "./useProjectDetails";
export { useProjectDocuments, useCreateProjectDocument, useDeleteProjectDocument } from "./useProjectDocuments";

// Finances
export { useFinances, useFinancesByProject, useCreateFinance, useUpdateFinance } from "./useFinances";

// Requisitions
export { useRequisitions, useCreateRequisition, useUpdateRequisition, useDeleteRequisition } from "./useRequisitions";

// Employees
export { useEmployees, useEmployeesByProject, useCreateEmployee, useUpdateEmployee } from "./useEmployees";

// Tasks
export { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "./useTasks";

// Materials
export { useMaterials, useMaterial, useCreateMaterial } from "./useMaterials";

// Patrimony
export { usePatrimony, usePatrimonyByProject, useCreatePatrimony, useUpdatePatrimony } from "./usePatrimony";

// Project-specific hooks
export { useProjectWeeks } from "./useProjectWeeks";
export { useStageWeeks } from "./useStageWeeks";
export { useProjectStages } from "./useProjectStages";

// Legacy hooks (maintained for compatibility)
export { useToast } from "./use-toast";
export { useIsMobile } from "./use-mobile";

// Modern toast hook
export { useSonnerToast } from "./use-sonner-toast";