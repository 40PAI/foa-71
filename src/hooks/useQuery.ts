/**
 * Consolidated Query System - Single source of truth for all data fetching
 * Replaces: useOptimizedQuery, useOptimizedDataFetch, useOptimizedHooks
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useCallback } from "react";

// ============= CACHE CONFIGURATION =============
const CACHE_CONFIG = {
  // Standard queries: 5 min stale, 10 min garbage collection
  standard: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  // Financial data: 2 min stale (more dynamic)
  financial: {
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  },
  // Real-time data: 30 sec stale
  realtime: {
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  },
  // Static data: 15 min stale
  static: {
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },
} as const;

// ============= BASE QUERY HOOK =============
interface BaseQueryOptions<TData = unknown, TError = unknown> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  projectSpecific?: boolean;
  cacheProfile?: keyof typeof CACHE_CONFIG;
}

/**
 * Optimized query hook with consistent caching and project context
 */
export function useOptimizedQuery<TData = unknown, TError = unknown>(
  options: BaseQueryOptions<TData, TError>
) {
  const { selectedProjectId } = useProjectContext();
  const { projectSpecific = false, cacheProfile = 'standard', ...queryOptions } = options;

  const cacheConfig = CACHE_CONFIG[cacheProfile];

  return useQuery({
    ...queryOptions,
    ...cacheConfig,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Enable only if we have a project ID for project-specific queries
    enabled: projectSpecific 
      ? !!selectedProjectId && (queryOptions.enabled !== false) 
      : (queryOptions.enabled !== false),
    // Add project ID to query key for project-specific queries
    queryKey: projectSpecific && selectedProjectId 
      ? [...options.queryKey, selectedProjectId]
      : options.queryKey,
  });
}

// ============= MUTATION HOOK =============
interface BaseMutationOptions<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown> 
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: unknown[][];
  projectSpecific?: boolean;
}

/**
 * Optimized mutation with automatic cache invalidation
 */
export function useOptimizedMutation<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown>(
  options: BaseMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  const { selectedProjectId } = useProjectContext();
  const { invalidateKeys = [], projectSpecific = false, onSuccess, ...mutationOptions } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    mutationFn: options.mutationFn,
    onSuccess: (data, variables, context, ...rest) => {
      // Invalidate specified queries
      invalidateKeys.forEach(queryKey => {
        const finalQueryKey = projectSpecific && selectedProjectId 
          ? [...queryKey, selectedProjectId]
          : queryKey;
        queryClient.invalidateQueries({ queryKey: finalQueryKey });
      });
      
      if (onSuccess) {
        (onSuccess as any)(data, variables, context, ...rest);
      }
    },
  });
}

// ============= SMART CACHE INVALIDATION =============
export function useSmartInvalidation() {
  const queryClient = useQueryClient();
  const { selectedProjectId } = useProjectContext();

  const invalidateProject = useCallback((projectId?: number) => {
    const id = projectId || selectedProjectId;
    if (!id) return;

    const projectQueries = [
      ['projects'],
      ['project-details', id],
      ['project-metrics', id],
    ];

    projectQueries.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, selectedProjectId]);

  const invalidateFinancial = useCallback((projectId?: number) => {
    const id = projectId || selectedProjectId;
    if (!id) return;

    const financialQueries = [
      ['finances', id],
      ['financial-overview', id],
      ['purchase-breakdown-optimized', id],
      ['integrated-finances', id],
      ['financial-discrepancies', id],
    ];

    financialQueries.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, selectedProjectId]);

  const invalidateTasks = useCallback((projectId?: number) => {
    const id = projectId || selectedProjectId;
    if (!id) return;

    queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    queryClient.invalidateQueries({ queryKey: ['weekly-tasks', id] });
  }, [queryClient, selectedProjectId]);

  const invalidateHR = useCallback((projectId?: number) => {
    const id = projectId || selectedProjectId;
    if (!id) return;

    const hrQueries = [
      ['employees', id],
      ['employee-allocations', id],
      ['daily-tracking', id],
    ];

    hrQueries.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, selectedProjectId]);

  const invalidateWarehouse = useCallback((projectId?: number) => {
    const id = projectId || selectedProjectId;
    
    const warehouseQueries = [
      ['materials'],
      ['materials-armazem'],
      ['warehouse-analytics', id],
    ];

    warehouseQueries.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, selectedProjectId]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    invalidateProject,
    invalidateFinancial,
    invalidateTasks,
    invalidateHR,
    invalidateWarehouse,
    invalidateAll,
  };
}

// ============= PREFETCHING =============
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchProject = useCallback((projectId: number, queryFn: () => Promise<any>) => {
    queryClient.prefetchQuery({
      queryKey: ['project-details', projectId],
      queryFn,
      staleTime: CACHE_CONFIG.standard.staleTime,
    });
  }, [queryClient]);

  return { prefetchProject };
}
