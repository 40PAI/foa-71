import { ReactNode, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppProvider } from "./AppContext";
import { NotificationProvider } from "./NotificationContext";
import { ThemeProvider } from "./ThemeContext";
import { LoadingProvider } from "./LoadingContext";
import { AuthProvider } from "./AuthContext";
import { ProjectProvider } from "./ProjectContext";
import { usePrefetchPage } from "@/hooks/usePrefetchPage";
import { useAuth } from "./AuthContext";
import { useProjectContext } from "./ProjectContext";

interface AllProvidersProps {
  children: ReactNode;
}

// Background prefetch component
function BackgroundPrefetch() {
  const prefetch = usePrefetchPage();
  const { user } = useAuth();
  const { selectedProjectId } = useProjectContext();

  useEffect(() => {
    if (user) {
      // Aggressive background prefetch of all main routes after 1 second
      const timer = setTimeout(() => {
        console.log("🚀 Background prefetch started...");
        prefetch.prefetchDashboard();
        prefetch.prefetchProjetos();
        
        if (selectedProjectId) {
          prefetch.prefetchFinancas();
          prefetch.prefetchCentrosCusto();
          prefetch.prefetchCompras();
          prefetch.prefetchArmazem();
          prefetch.prefetchRH();
          prefetch.prefetchSeguranca();
          prefetch.prefetchTarefas();
        }
      }, 1000);

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