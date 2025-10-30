import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { ProjectChartsModal } from "@/components/modals/ProjectChartsModal";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectDocumentsModal } from "@/components/modals/ProjectDocumentsModal";
import { UpdateMetricsButton } from "@/components/UpdateMetricsButton";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { calculateProjectTimeline } from "@/lib/helpers";
import { TABLE_CONFIG } from "@/utils/constants";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import type { ExtendedProject } from "@/types/project";

interface ProjectsTableProps {
  projects: ExtendedProject[];
  kpis?: any[];
  onDelete: (id: number, nome: string) => void;
  isDeleting: boolean;
}

export function ProjectsTable({ projects, kpis, onDelete, isDeleting }: ProjectsTableProps) {
  const { toast } = useToast();
  const updateProject = useUpdateProject();

  const handleCompleteProject = async (projectId: number, projectName: string) => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        status: "Concluído" as any,
      });
      
      toast({
        title: "Obra concluída",
        description: `A obra "${projectName}" foi marcada como concluída.`,
      });
    } catch (error) {
      console.error("Erro ao concluir obra:", error);
      toast({
        title: "Erro ao concluir obra",
        description: "Ocorreu um erro ao tentar concluir a obra. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCancelProject = async (projectId: number, projectName: string) => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        status: "Cancelado" as any,
      });
      
      toast({
        title: "Obra cancelada",
        description: `A obra "${projectName}" foi marcada como cancelada.`,
      });
    } catch (error) {
      console.error("Erro ao cancelar obra:", error);
      toast({
        title: "Erro ao cancelar obra",
        description: "Ocorreu um erro ao tentar cancelar a obra. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const renderProjectRow = (projeto: ExtendedProject, index: number) => {
    const kpi = kpis?.find(k => k.projeto_id === projeto.id);
    const diasRestantes = Math.ceil(
      (new Date(projeto.data_fim_prevista).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return (
      <TableRow key={projeto.id}>
        <TableCell>
          <div>
            <div className="font-bold">{projeto.nome}</div>
            <div className="text-sm text-muted-foreground">{projeto.cliente}</div>
            <div className="text-xs text-muted-foreground">
              Prazo: {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-PT')}
              {diasRestantes > 0 
                ? ` (${diasRestantes} dias)` 
                : ` (${Math.abs(diasRestantes)} dias atrasado)`
              }
            </div>
            {projeto.provincia && projeto.municipio && (
              <div className="text-xs text-muted-foreground">
                {projeto.municipio}, {projeto.provincia}
              </div>
            )}
          </div>
        </TableCell>
        
        <TableCell>
          <div className="text-sm">{projeto.encarregado}</div>
        </TableCell>
        
        <TableCell>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Físico</span>
              <span>{formatPercentage(projeto.avanco_fisico || 0)}</span>
            </div>
            <Progress value={projeto.avanco_fisico || 0} className="h-2" />
          </div>
        </TableCell>
        
        <TableCell>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Financeiro</span>
              <span>{formatPercentage(projeto.avanco_financeiro || 0)}</span>
            </div>
            <Progress value={projeto.avanco_financeiro || 0} className="h-2" />
          </div>
        </TableCell>
        
        <TableCell>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Tempo</span>
              <span>{formatPercentage(projeto.avanco_tempo || 0)}</span>
            </div>
            <Progress value={projeto.avanco_tempo || 0} className="h-2" />
          </div>
        </TableCell>
        
        <TableCell>
          <StatusBadge status={projeto.status} />
        </TableCell>
        
        <TableCell>
          {(() => {
            const timeline = calculateProjectTimeline(
              projeto.data_inicio, 
              projeto.data_fim_prevista
            );
            
            return (
              <div className="text-center">
                <div className={`font-semibold ${timeline.isOverdue ? 'text-destructive' : 'text-primary'}`}>
                  {timeline.displayText}
                </div>
                <div className="text-xs text-muted-foreground">
                  {timeline.isOverdue ? 'Em atraso' : 'dias'}
                </div>
              </div>
            );
          })()}
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-1">
            <UpdateMetricsButton projectId={projeto.id!} />
            <ProjectChartsModal 
              projectId={projeto.id!}
              projectName={projeto.nome}
            />
            <ProjectDetailsModal 
              projectId={projeto.id!}
              projectName={projeto.nome}
            />
            <ProjectDocumentsModal 
              projectId={projeto.id!}
              projectName={projeto.nome}
            />
            <ProjectModal 
              project={projeto as any}
              trigger="edit"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleCompleteProject(projeto.id!, projeto.nome)}
              title="Marcar como concluída"
              disabled={updateProject.isPending || projeto.status === "Concluído"}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
            >
              {updateProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleCancelProject(projeto.id!, projeto.nome)}
              title="Cancelar obra"
              disabled={updateProject.isPending || projeto.status === "Cancelado"}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              {updateProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(projeto.id!, projeto.nome)}
              title="Eliminar"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const columns = [
    { header: "Obra / Cliente", accessor: "nome" as keyof ExtendedProject },
    { header: "Encarregado", accessor: "encarregado" as keyof ExtendedProject },
    { header: "Avanço Físico", accessor: "avanco_fisico" as keyof ExtendedProject, className: "w-48" },
    { header: "Avanço Financeiro", accessor: "avanco_financeiro" as keyof ExtendedProject, className: "w-48" },
    { header: "Avanço Tempo", accessor: "avanco_tempo" as keyof ExtendedProject, className: "w-48" },
    { header: "Status", accessor: "status" as keyof ExtendedProject, className: "w-32" },
    { header: "Prazo", accessor: "id" as keyof ExtendedProject },
    { header: "Ações", accessor: "id" as keyof ExtendedProject }
  ];

  return (
    <DataTable
      title="Lista de Obras"
      data={projects}
      columns={columns}
      renderRow={renderProjectRow}
      minWidth={TABLE_CONFIG.MIN_WIDTHS.LARGE}
      emptyMessage="Nenhum projeto encontrado"
    />
  );
}