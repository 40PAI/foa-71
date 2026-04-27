import { ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppProvider } from "./AppContext";
import { NotificationProvider } from "./NotificationContext";
import { ThemeProvider } from "./ThemeContext";
import { LoadingProvider } from "./LoadingContext";
import { AuthProvider } from "./AuthContext";
import { ProjectProvider } from "./ProjectContext";
import { usePrefetchPage, preloadAllCriticalChunks } from "@/hooks/usePrefetchPage";
import { useAuth } from "./AuthContext";
import { useProjectContextSafe } from "./ProjectContext";

interface AllProvidersProps {
  children: ReactNode;
}

// Background prefetch component - muito mais agressivo
function BackgroundPrefetch() {
  const prefetch = usePrefetchPage();
  const { user } = useAuth();
  const selectedProjectId = useProjectContextSafe()?.selectedProjectId;

  useEffect(() => {
    if (user) {
      // IMEDIATAMENTE preload de todos os chunks JS críticos
      preloadAllCriticalChunks();

      // Prefetch dados após apenas 100ms (muito mais rápido)
      const timer = setTimeout(() => {
        console.log("🚀 Background prefetch: carregando dados...");
        prefetch.prefetchDashboard();
        prefetch.prefetchProjetos();
        prefetch.prefetchArmazem();
        prefetch.prefetchRH();
        
        if (selectedProjectId) {
          prefetch.prefetchFinancas();
          prefetch.prefetchCentrosCusto();
          prefetch.prefetchCompras();
          prefetch.prefetchSeguranca();
          prefetch.prefetchTarefas();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, selectedProjectId, prefetch]);

  return null;
}

export function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider>
      <AppProvider>
        <LoadingProvider>
          <NotificationProvider>
            <AuthProvider>
              <ProjectProvider>
                <BackgroundPrefetch />
                {children}
              </ProjectProvider>
            </AuthProvider>
          </NotificationProvider>
        </LoadingProvider>
      </AppProvider>
    </ThemeProvider>
  );
}