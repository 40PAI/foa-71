/**
 * Query Cache Persistence Utilities
 * Implements manual localStorage persistence for TanStack Query cache
 * to maintain data between page reloads without PersistQueryClientProvider conflicts
 */

import type { QueryClient } from "@tanstack/react-query";

const CACHE_KEY = "FOA_QUERY_CACHE";
const CACHE_VERSION = "v4"; // Incremented to clear cache with invalid column names
const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

interface CachedData {
  version: string;
  timestamp: number;
  queries: Record<string, unknown>;
}

/**
 * Save query cache to localStorage
 */
export function saveQueryCache(queryClient: QueryClient) {
  try {
    const queryCache = queryClient.getQueryCache();
    const queries: Record<string, unknown> = {};

    queryCache.getAll().forEach((query) => {
      // Only persist successful queries
      if (query.state.status === "success" && query.state.data) {
        const key = JSON.stringify(query.queryKey);
        queries[key] = query.state.data;
      }
    });

    const cachedData: CachedData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      queries,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
  } catch (error) {
    console.warn("Failed to save query cache:", error);
  }
}

/**
 * Load query cache from localStorage (SYNCHRONOUSLY for instant restore)
 */
export function loadQueryCache(queryClient: QueryClient) {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return;

    const cachedData: CachedData = JSON.parse(cached);

    // Check version and age
    if (
      cachedData.version !== CACHE_VERSION ||
      Date.now() - cachedData.timestamp > MAX_AGE
    ) {
      console.log("⚠️ Cache expired or version mismatch - clearing cache");
      localStorage.removeItem(CACHE_KEY);
      return;
    }

    // Restore queries to cache SYNCHRONOUSLY (no async/await)
    let restoredCount = 0;
    Object.entries(cachedData.queries).forEach(([key, data]) => {
      try {
        const queryKey = JSON.parse(key);
        
        // Validate data structure before restoring
        if (data && typeof data === 'object') {
          // Use setQueryData synchronously to populate cache immediately
          queryClient.setQueryData(queryKey, data);
          restoredCount++;
        }
      } catch (error) {
        console.warn("Failed to restore query:", key, error);
      }
    });

    if (restoredCount > 0) {
      console.log(`✅ Query cache restored INSTANTLY: ${restoredCount} queries from localStorage`);
    }
  } catch (error) {
    console.warn("Failed to load query cache:", error);
    localStorage.removeItem(CACHE_KEY);
  }
}

/**
 * Setup automatic cache persistence
 * Saves cache on visibility change and beforeunload
 */
export function setupCachePersistence(queryClient: QueryClient) {
  // Save on visibility change (tab hidden)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      saveQueryCache(queryClient);
    }
  };

  // Save before page unload
  const handleBeforeUnload = () => {
    saveQueryCache(queryClient);
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("beforeunload", handleBeforeUnload);

  // Load cache on setup
  loadQueryCache(queryClient);

  // Return cleanup function
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}

/**
 * Clear persisted cache
 */
export function clearQueryCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log("✅ Query cache cleared");
  } catch (error) {
    console.warn("Failed to clear query cache:", error);
  }
}
