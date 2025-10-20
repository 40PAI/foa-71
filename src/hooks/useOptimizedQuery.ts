
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useProjectContext } from "@/contexts/ProjectContext";

// Optimized query hook with better caching and performance
export function useOptimizedQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError> & {
    projectSpecific?: boolean;
  }
) {
  const { selectedProjectId } = useProjectContext();

  return useQuery({
    ...options,
    // Better cache configuration (v5 syntax)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Only enable if we have a project ID for project-specific queries
    enabled: options.projectSpecific ? !!selectedProjectId && (options.enabled !== false) : (options.enabled !== false),
    // Add project ID to query key for project-specific queries
    queryKey: options.projectSpecific && selectedProjectId 
      ? [...(options.queryKey || []), selectedProjectId]
      : options.queryKey,
  });
}
