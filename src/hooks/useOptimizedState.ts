import { useMemo, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Optimized state hook with memoization and performance optimizations
export function useOptimizedState<T>(
  initialState: T,
  dependencies: any[] = []
) {
  const stateRef = useRef(initialState);
  
  return useMemo(() => stateRef.current, dependencies);
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: any[] = []
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay, ...dependencies]
  );
}

// Optimized selector hook for derived state
export function useSelector<TState, TSelected>(
  state: TState,
  selector: (state: TState) => TSelected,
  equalityFn?: (a: TSelected, b: TSelected) => boolean
): TSelected {
  const selectedState = useMemo(() => selector(state), [state, selector]);
  const prevSelectedState = useRef(selectedState);

  const isEqual = equalityFn || ((a, b) => a === b);

  if (!isEqual(selectedState, prevSelectedState.current)) {
    prevSelectedState.current = selectedState;
  }

  return prevSelectedState.current;
}

// Smart cache invalidation hook
export function useSmartCacheInvalidation() {
  const queryClient = useQueryClient();

  const invalidateProjectQueries = useCallback((projectId?: number) => {
    const queries = [
      ['projects'],
      ['project-details', projectId],
      ['finances', projectId],
      ['tasks', projectId],
      ['employees', projectId],
      ['materials', projectId],
      ['project-metrics', projectId],
    ];

    queries.forEach(queryKey => {
      if (projectId && queryKey.includes(undefined)) {
        queryClient.invalidateQueries({ queryKey: queryKey.filter(k => k !== undefined) });
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    });
  }, [queryClient]);

  const invalidateUserQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  }, [queryClient]);

  const invalidateFinancialQueries = useCallback((projectId?: number) => {
    const queries = [
      ['finances'],
      ['financial-overview'],
      ['purchase-breakdown'],
      ['integrated-finances'],
    ];

    queries.forEach(queryKey => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [...queryKey, projectId] });
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    });
  }, [queryClient]);

  const invalidateAllQueries = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    invalidateProjectQueries,
    invalidateUserQueries,
    invalidateFinancialQueries,
    invalidateAllQueries,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>(performance.now());

  useEffect(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;
      
      if (duration > 100) { // Log slow operations
        console.warn(`🐌 Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
    };
  });

  const measure = useCallback((operationName: string) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 16) { // 60fps threshold
        console.warn(`⚡ ${name}.${operationName} took ${duration.toFixed(2)}ms`);
      }
    };
  }, [name]);

  return { measure };
}