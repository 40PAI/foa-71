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
      const timer = setTimeout(() => {
        console.log("🚀 Background prefetch started...");
        
        // Safe prefetch with error handling to prevent cascading failures
        const safePrefetch = (fn: () => void, name: string) => {
          try { fn(); } 
          catch (e) { console.warn(`Prefetch ${name} failed:`, e); }
        };
        
        safePrefetch(prefetch.prefetchDashboard, 'dashboard');
        safePrefetch(prefetch.prefetchProjetos, 'projetos');
        
        if (selectedProjectId) {
          safePrefetch(prefetch.prefetchFinancas, 'financas');
          safePrefetch(prefetch.prefetchCentrosCusto, 'centros-custo');
          safePrefetch(prefetch.prefetchCompras, 'compras');
          safePrefetch(prefetch.prefetchArmazem, 'armazem');
          safePrefetch(prefetch.prefetchRH, 'rh');
          safePrefetch(prefetch.prefetchSeguranca, 'seguranca');
          safePrefetch(prefetch.prefetchTarefas, 'tarefas');
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