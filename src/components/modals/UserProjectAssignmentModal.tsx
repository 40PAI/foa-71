import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useUserProjectAccessByUser, useBulkAssignProjects } from "@/hooks/useUserProjectAccess";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Building2, User } from "lucide-react";

interface UserProjectAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    nome: string;
    email: string;
    cargo: string;
  } | null;
}

export function UserProjectAssignmentModal({
  open,
  onOpenChange,
  user,
}: UserProjectAssignmentModalProps) {
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: userAccess = [], isLoading: loadingAccess } = useUserProjectAccessByUser(user?.id);
  const bulkAssign = useBulkAssignProjects();
  
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  
  // Use ref to track if we've already initialized from userAccess
  const hasInitialized = useRef(false);
  const prevUserId = useRef<string | undefined>();

  // Reset initialization flag when user changes or modal closes
  useEffect(() => {
    if (!open || user?.id !== prevUserId.current) {
      hasInitialized.current = false;
      prevUserId.current = user?.id;
    }
  }, [open, user?.id]);

  // Initialize selection once when userAccess loads
  useEffect(() => {
    if (!loadingAccess && !hasInitialized.current && open) {
      setSelectedProjects(userAccess.map(a => a.projeto_id));
      hasInitialized.current = true;
    }
  }, [loadingAccess, userAccess, open]);

  const handleToggleProject = (projectId: number) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    await bulkAssign.mutateAsync({
      userId: user.id,
      projetoIds: selectedProjects,
    });
    
    onOpenChange(false);
  };

  const handleSelectAll = () => {
    setSelectedProjects(projects.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedProjects([]);
  };

  if (!user) return null;

  const isLoading = loadingProjects || loadingAccess;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Atribuir Projetos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user.nome}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {user.cargo === "encarregado_obra" ? "Encarregado de Obra" : user.cargo}
            </Badge>
          </div>

          {/* Selection actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={isLoading}
            >
              Selecionar Todos
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeselectAll}
              disabled={isLoading}
            >
              Limpar Seleção
            </Button>
            <span className="ml-auto text-sm text-muted-foreground">
              {selectedProjects.length} de {projects.length} selecionados
            </span>
          </div>

          {/* Project list */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProjects.includes(project.id)
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleToggleProject(project.id)}
                  >
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => handleToggleProject(project.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.nome}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {project.zona_bairro || project.cliente || "Sem detalhes"}
                      </p>
                    </div>
                    <Badge 
                      variant={project.status === "Em Andamento" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {project.status}
                    </Badge>
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum projeto disponível
                  </p>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={bulkAssign.isPending}
              className="flex-1"
            >
              {bulkAssign.isPending ? "Guardando..." : "Guardar Atribuições"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
