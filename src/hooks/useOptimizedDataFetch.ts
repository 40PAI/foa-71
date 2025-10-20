import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useProjectContext } from "@/contexts/ProjectContext";

// Generic optimized query hook
export function useOptimizedDataFetch<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError> & {
    projectSpecific?: boolean;
    staleTimeMinutes?: number;
  }
) {
  const { selectedProjectId } = useProjectContext();
  const { projectSpecific = false, staleTimeMinutes = 5, ...queryOptions } = options;

  return useQuery({
    ...queryOptions,
    staleTime: staleTimeMinutes * 60 * 1000,
    gcTime: (staleTimeMinutes * 2) * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: projectSpecific 
      ? !!selectedProjectId && (queryOptions.enabled !== false) 
      : (queryOptions.enabled !== false),
    queryKey: projectSpecific && selectedProjectId 
      ? [...(queryOptions.queryKey || []), selectedProjectId]
      : queryOptions.queryKey,
  });
}

// Generic optimized mutation hook with automatic cache invalidation
export function useOptimizedMutation<TData = unknown, TError = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    invalidateQueries?: string[][];
    projectSpecific?: boolean;
  }
) {
  const queryClient = useQueryClient();
  const { selectedProjectId } = useProjectContext();
  const { invalidateQueries = [], projectSpecific = false, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onSuccess: (data, variables) => {
      // Invalidate specified queries
      invalidateQueries.forEach(queryKey => {
        const finalQueryKey = projectSpecific && selectedProjectId 
          ? [...queryKey, selectedProjectId]
          : queryKey;
        queryClient.invalidateQueries({ queryKey: finalQueryKey });
      });
      
      mutationOptions.onSuccess?.(data, variables);
    },
    onError: mutationOptions.onError,
  });
}