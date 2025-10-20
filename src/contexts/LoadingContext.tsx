import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  withLoading: <T>(key: string, promise: Promise<T>) => Promise<T>;
  hasAnyLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const isLoading = useCallback((key = 'global') => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const withLoading = useCallback(async <T,>(key: string, promise: Promise<T>): Promise<T> => {
    startLoading(key);
    try {
      return await promise;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  const hasAnyLoading = Object.values(loadingStates).some(Boolean);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setLoading,
      startLoading,
      stopLoading,
      withLoading,
      hasAnyLoading,
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}