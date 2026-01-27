import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Building2, ChevronDown, Search, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

export function MobileProjectSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: projects = [], isLoading } = useProjects();
  const { selectedProjectId, setSelectedProjectId } = useProjectContext();

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const filteredProjects = projects.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.cliente?.toLowerCase().includes(search.toLowerCase())
  );

  const activeProjects = filteredProjects.filter(p => p.status === "Em Andamento");
  const otherProjects = filteredProjects.filter(p => p.status !== "Em Andamento");

  const handleSelect = (projectId: number | null) => {
    setSelectedProjectId(projectId);
    setOpen(false);
    setSearch("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Andamento": return "bg-blue-500";
      case "Concluído": return "bg-green-500";
      case "Pausado": return "bg-yellow-500";
      case "Cancelado": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 gap-1 max-w-[180px] justify-start"
        >
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-xs font-medium">
            {selectedProject?.nome || "Selecionar..."}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left">Selecionar Projeto</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Clear selection button */}
        {selectedProjectId && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-4 justify-center gap-2"
            onClick={() => handleSelect(null)}
          >
            <X className="h-4 w-4" />
            Limpar seleção (Ver todos)
          </Button>
        )}

        {/* Projects List */}
        <div className="overflow-y-auto flex-1 -mx-4 px-4 space-y-4" style={{ maxHeight: 'calc(80vh - 180px)' }}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Active Projects */}
              {activeProjects.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Em Andamento ({activeProjects.length})
                  </h3>
                  <div className="space-y-2">
                    {activeProjects.map((project) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        isSelected={project.id === selectedProjectId}
                        onSelect={() => handleSelect(project.id!)}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Projects */}
              {otherProjects.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Outros ({otherProjects.length})
                  </h3>
                  <div className="space-y-2">
                    {otherProjects.map((project) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        isSelected={project.id === selectedProjectId}
                        onSelect={() => handleSelect(project.id!)}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredProjects.length === 0 && (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {search ? "Nenhum projeto encontrado" : "Nenhum projeto disponível"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ProjectItemProps {
  project: any;
  isSelected: boolean;
  onSelect: () => void;
  getStatusColor: (status: string) => string;
}

function ProjectItem({ project, isSelected, onSelect, getStatusColor }: ProjectItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-3 rounded-lg border text-left transition-all active:scale-[0.98]",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-2 h-2 rounded-full mt-2 shrink-0",
          getStatusColor(project.status)
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{project.nome}</span>
            {isSelected && (
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{project.cliente}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {project.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(project.orcamento || 0)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
