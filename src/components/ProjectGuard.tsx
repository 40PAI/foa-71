import { ReactNode } from "react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

interface ProjectGuardProps {
  children: ReactNode;
  message?: string;
}

export function ProjectGuard({ children, message = "Selecione um projeto para continuar" }: ProjectGuardProps) {
  const { selectedProjectId } = useProjectContext();

  if (!selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nenhum Projeto Selecionado</h2>
          <p className="text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}