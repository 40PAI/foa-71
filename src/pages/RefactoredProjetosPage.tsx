import React, { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectsKPISection } from "@/components/projects/ProjectsKPISection";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { ProjectKPICards } from "@/components/projects/ProjectKPICards";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectImportModal } from "@/components/modals/ProjectImportModal";
import { DeleteProjectDialog } from "@/components/modals/DeleteProjectDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import { useDashboardKpis } from "@/hooks/useDashboardKpis";
import { useToast } from "@/hooks/use-toast";

export function RefactoredProjetosPage() {
  const { toast } = useToast();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const deleteProjectMutation = useDeleteProject();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; nome: string } | null>(null);

  const openDeleteDialog = (id: number, nome: string) => {
    setProjectToDelete({ id, nome });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.id);
      
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      
      toast({
        title: "Sucesso",
        description: `Projeto "${projectToDelete.nome}" eliminado com sucesso`,
      });
    } catch (error: any) {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      
      toast({
        title: "Erro ao Eliminar Projeto",
        description: error.message || "Erro ao eliminar projeto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  if (projectsLoading || kpisLoading) {
    return <LoadingSpinner />;
  }

  if (!projects) {
    return <div>Erro ao carregar projetos</div>;
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4 lg:space-y-6 px-1 sm:px-2 lg:px-3 py-2 sm:py-4 lg:py-6">
      <PageHeader
        title="Gerenciamento de Projetos e Obras"
        action={
          <div className="flex gap-2">
            <ProjectImportModal />
            <ProjectModal />
          </div>
        }
        className="pb-2 sm:pb-4"
      />

      <ProjectsKPISection projects={projects} />
      
      <ProjectsTable 
        projects={projects}
        kpis={kpis}
        onDelete={openDeleteDialog}
        isDeleting={deleteProjectMutation.isPending}
      />

      <ProjectKPICards projects={projects} kpis={kpis} />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={projectToDelete?.nome || ""}
        onConfirm={confirmDelete}
        isDeleting={deleteProjectMutation.isPending}
      />
    </div>
  );
}