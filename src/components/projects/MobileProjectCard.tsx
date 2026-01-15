import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2, BarChart3, FileText, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { ProjectChartsModal } from "@/components/modals/ProjectChartsModal";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectDocumentsModal } from "@/components/modals/ProjectDocumentsModal";
import { UpdateMetricsButton } from "@/components/UpdateMetricsButton";
import type { ExtendedProject } from "@/types/project";

interface MobileProjectCardProps {
  project: ExtendedProject;
  kpi?: any;
  onDelete: (id: number, nome: string) => void;
  onComplete?: (id: number, nome: string) => void;
  onCancel?: (id: number, nome: string) => void;
  isUpdating?: boolean;
}

export function MobileProjectCard({ 
  project, 
  kpi, 
  onDelete, 
  onComplete,
  onCancel,
  isUpdating 
}: MobileProjectCardProps) {
  const diasRestantes = Math.ceil(
    (new Date(project.data_fim_prevista).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = diasRestantes < 0;
  const isNearDeadline = diasRestantes > 0 && diasRestantes <= 7;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header com nome e status */}
        <div className="p-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{project.nome}</h3>
              <p className="text-xs text-muted-foreground truncate">{project.cliente}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Progress bars */}
        <div className="p-3 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Físico</span>
              <span className="font-medium">{formatPercentage(project.avanco_fisico || 0)}</span>
            </div>
            <Progress value={project.avanco_fisico || 0} className="h-1.5" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Financeiro</span>
              <span className="font-medium">{formatPercentage(project.avanco_financeiro || 0)}</span>
            </div>
            <Progress value={project.avanco_financeiro || 0} className="h-1.5" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tempo</span>
              <span className="font-medium">{formatPercentage(project.avanco_tempo || 0)}</span>
            </div>
            <Progress value={project.avanco_tempo || 0} className="h-1.5" />
          </div>
        </div>

        {/* Metadata */}
        <div className="px-3 pb-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {isOverdue ? (
                <span className="text-destructive">{Math.abs(diasRestantes)}d atraso</span>
              ) : (
                <span>{diasRestantes}d restantes</span>
              )}
            </Badge>
            
            {project.encarregado && (
              <Badge variant="secondary" className="truncate max-w-[120px]">
                {project.encarregado}
              </Badge>
            )}
            
            <Badge variant="outline">
              {formatCurrency(project.orcamento || 0)}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-1 px-2 py-2 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-0.5">
            <UpdateMetricsButton projectId={project.id!} />
            <ProjectChartsModal projectId={project.id!} projectName={project.nome} />
            <ProjectDetailsModal projectId={project.id!} projectName={project.nome} />
            <ProjectDocumentsModal projectId={project.id!} projectName={project.nome} />
          </div>
          
          <div className="flex items-center gap-0.5">
            <ProjectModal project={project as any} trigger="edit" />
            
            {onComplete && project.status !== "Concluído" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onComplete(project.id!, project.nome)}
                disabled={isUpdating}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            {onCancel && project.status !== "Cancelado" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onCancel(project.id!, project.nome)}
                disabled={isUpdating}
                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project.id!, project.nome)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
