
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ProjectSelector } from "@/components/ProjectSelector";
import { UserMenu } from "@/components/UserMenu";
import { useProjectContextSafe } from "@/contexts/ProjectContext";
import { useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const { state } = useSidebar();
  
  // Use safe version that doesn't throw if context is not available
  const projectContext = useProjectContextSafe();
  const selectedProjectId = projectContext?.selectedProjectId ?? null;
  const setSelectedProjectId = projectContext?.setSelectedProjectId ?? null;
  
  const isCollapsed = state === "collapsed";
  
  // Show project selector only on pages that need project context
  const pagesWithProjectSelector = ['/financas', '/compras', '/seguranca', '/tarefas', '/graficos'];
  const showProjectSelector = pagesWithProjectSelector.some(page => location.pathname.includes(page));

  return (
    <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 lg:px-6">
      <SidebarTrigger className="h-8 w-8 p-0 hover:bg-muted" />
      
      <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-semibold truncate">FOA SmartSite</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {showProjectSelector && setSelectedProjectId && (
            <div className="w-32 sm:w-48 lg:w-64">
              <ProjectSelector
                value={selectedProjectId?.toString()}
                onValueChange={(value) => setSelectedProjectId(value ? parseInt(value) : null)}
                placeholder="Selecionar projeto..."
              />
            </div>
          )}
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
