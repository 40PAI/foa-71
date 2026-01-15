import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectsKPISection } from "@/components/projects/ProjectsKPISection";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { ProjectKPICards } from "@/components/projects/ProjectKPICards";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectImportModal } from "@/components/modals/ProjectImportModal";
import { DeleteProjectDialog } from "@/components/modals/DeleteProjectDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MobileProjectsList } from "@/components/projects/MobileProjectsList";
import { MobileTabsScroll } from "@/components/mobile/MobileTabsScroll";
import { MobileKPIGrid } from "@/components/mobile/MobileKPIGrid";
import { useProjects, useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useDashboardKpis } from "@/hooks/useDashboardKpis";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { ProjectStatus } from "@/types/project";

export function RefactoredProjetosPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const deleteProjectMutation = useDeleteProject();
  const updateProject = useUpdateProject();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"todos" | ProjectStatus>("todos");

  // Contagens para tabs
  const counts = useMemo(() => {
    if (!projects) return { todos: 0, andamento: 0, atrasado: 0, pausado: 0, concluido: 0, cancelado: 0 };
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const atrasados = projects.filter(p => {
      if (p.status === 'Concluído' || p.status === 'Cancelado') return false;
      const dataFim = new Date(p.data_fim_prevista);
      dataFim.setHours(0, 0, 0, 0);
      return dataFim < hoje;
    }).length;

    return {
      todos: projects.length,
      andamento: projects.filter(p => p.status === "Em Andamento").length,
      atrasado: atrasados,
      pausado: projects.filter(p => p.status === "Pausado").length,
      concluido: projects.filter(p => p.status === "Concluído").length,
      cancelado: projects.filter(p => p.status === "Cancelado").length,
    };
  }, [projects]);

  // Filtrar projetos baseado no status selecionado
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (statusFilter === "todos") return projects;
    
    if (statusFilter === "Atrasado") {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return projects.filter(p => {
        if (p.status === 'Concluído' || p.status === 'Cancelado') return false;
        const dataFim = new Date(p.data_fim_prevista);
        dataFim.setHours(0, 0, 0, 0);
        return dataFim < hoje;
      });
    }
    
    return projects.filter(p => p.status === statusFilter);
  }, [projects, statusFilter]);

  // KPIs para mobile
  const mobileKPIs = useMemo(() => {
    if (!projects) return [];
    const totalOrcamento = projects.reduce((acc, p) => acc + (p.orcamento || 0), 0);
    const mediaFisico = projects.length > 0 
      ? projects.reduce((acc, p) => acc + (p.avanco_fisico || 0), 0) / projects.length 
      : 0;

    return [
      { label: "Em Andamento", value: counts.andamento, icon: Building2, color: "info" as const },
      { label: "Atrasados", value: counts.atrasado, icon: AlertTriangle, color: counts.atrasado > 0 ? "danger" as const : "success" as const },
      { label: "Progresso Médio", value: `${mediaFisico.toFixed(0)}%`, icon: Clock, color: "default" as const },
      { label: "Orçamento Total", value: formatCurrency(totalOrcamento), icon: CheckCircle, color: "success" as const },
    ];
  }, [projects, counts]);

  // Tabs para mobile
  const mobileTabs = [
    { value: "todos", label: "Todos", count: counts.todos },
    { value: "Em Andamento", label: "Activos", count: counts.andamento },
    { value: "Atrasado", label: "Atrasados", count: counts.atrasado },
    { value: "Pausado", label: "Pausados", count: counts.pausado },
    { value: "Concluído", label: "Concluídos", count: counts.concluido },
    { value: "Cancelado", label: "Cancelados", count: counts.cancelado },
  ];

  const openDeleteDialog = (id: number, nome: string) => {
    setProjectToDelete({ id, nome });
    setDeleteDialogOpen(true);
  };

  const handleComplete = async (id: number, nome: string) => {
    try {
      await updateProject.mutateAsync({ id, status: "Concluído" as any });
      toast({ title: "Sucesso", description: `Obra "${nome}" marcada como concluída.` });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao concluir obra.", variant: "destructive" });
    }
  };

  const handleCancel = async (id: number, nome: string) => {
    try {
      await updateProject.mutateAsync({ id, status: "Cancelado" as any });
      toast({ title: "Sucesso", description: `Obra "${nome}" cancelada.` });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao cancelar obra.", variant: "destructive" });
    }
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

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <div className="w-full space-y-3 px-3 py-3">
        {/* Header Mobile */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Projetos</h1>
          <div className="flex gap-1">
            <ProjectImportModal />
            <ProjectModal />
          </div>
        </div>

        {/* KPIs Mobile */}
        <MobileKPIGrid items={mobileKPIs} columns={2} />

        {/* Tabs Mobile com scroll horizontal */}
        <MobileTabsScroll
          tabs={mobileTabs}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as any)}
        />

        {/* Lista de Projetos Mobile */}
        <MobileProjectsList
          projects={filteredProjects}
          kpis={kpis}
          onDelete={openDeleteDialog}
          onComplete={handleComplete}
          onCancel={handleCancel}
          isUpdating={updateProject.isPending}
        />

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

  // DESKTOP LAYOUT
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
      
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="todos">Todos ({counts.todos})</TabsTrigger>
          <TabsTrigger value="Em Andamento">Em Andamento ({counts.andamento})</TabsTrigger>
          <TabsTrigger value="Atrasado">Atrasados ({counts.atrasado})</TabsTrigger>
          <TabsTrigger value="Pausado">Pausados ({counts.pausado})</TabsTrigger>
          <TabsTrigger value="Concluído">Concluídos ({counts.concluido})</TabsTrigger>
          <TabsTrigger value="Cancelado">Cancelados ({counts.cancelado})</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <ProjectsTable 
        projects={filteredProjects}
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