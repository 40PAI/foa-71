import { MobileProjectCard } from "./MobileProjectCard";
import type { ExtendedProject } from "@/types/project";

interface MobileProjectsListProps {
  projects: ExtendedProject[];
  kpis?: any[];
  onDelete: (id: number, nome: string) => void;
  onComplete?: (id: number, nome: string) => void;
  onCancel?: (id: number, nome: string) => void;
  isUpdating?: boolean;
}

export function MobileProjectsList({ 
  projects, 
  kpis, 
  onDelete,
  onComplete,
  onCancel,
  isUpdating
}: MobileProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground text-sm">
          Nenhum projeto encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const kpi = kpis?.find(k => k.projeto_id === project.id);
        return (
          <MobileProjectCard
            key={project.id}
            project={project}
            kpi={kpi}
            onDelete={onDelete}
            onComplete={onComplete}
            onCancel={onCancel}
            isUpdating={isUpdating}
          />
        );
      })}
    </div>
  );
}
