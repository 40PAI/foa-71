
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { useProjectWeeksInfo } from "@/hooks/useProjectWeeks";
import { LoadingSpinner } from "./LoadingSpinner";
import { TemporalMethodToggle } from "@/components/TemporalMethodToggle";
import { PPCChart } from "@/components/PPCChart";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Package, 
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  CalendarDays
} from "lucide-react";

interface ProjectDetailsProps {
  projectId: number;
}

export function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const { data: projectDetails, isLoading, error } = useProjectDetails(projectId);
  const { data: weekInfo, isLoading: weekInfoLoading } = useProjectWeeksInfo(projectId);

  if (isLoading || weekInfoLoading) return <LoadingSpinner />;
  if (error || !projectDetails) return <div>Erro ao carregar detalhes do projeto</div>;

  const { project, summary, kpis, finances, employees, patrimony, tasks } = projectDetails;

  const diasRestantes = Math.ceil((new Date(project.data_fim_prevista).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Projeto */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{project.nome}</CardTitle>
              <p className="text-muted-foreground mt-1">{project.cliente}</p>
              <p className="text-sm text-muted-foreground">
                Encarregado: {project.encarregado}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Início</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(project.data_inicio).toLocaleDateString('pt-PT')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Prazo</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(project.data_fim_prevista).toLocaleDateString('pt-PT')}
                  {diasRestantes > 0 ? ` (${diasRestantes} dias)` : ` (${Math.abs(diasRestantes)} dias atrasado)`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Orçamento</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(project.orcamento)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duração</p>
                <p className="text-sm text-muted-foreground">
                  {weekInfo ? `${weekInfo.totalWeeks} semanas` : 'Calculando...'}
                  {weekInfo && (
                    <span className="block text-xs">
                      Semana {weekInfo.currentWeek} de {weekInfo.totalWeeks}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de Progresso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avanço Físico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{formatPercentage(project.avanco_fisico)}</span>
              </div>
              <Progress value={project.avanco_fisico} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avanço Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{formatPercentage(project.avanco_financeiro)}</span>
              </div>
              <Progress value={project.avanco_financeiro} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avanço Temporal {project.metodo_calculo_temporal === 'ppc' ? '(PPC)' : '(Linear)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{formatPercentage(project.avanco_tempo)}</span>
              </div>
              <Progress value={project.avanco_tempo} className="h-2" />
              {project.metodo_calculo_temporal === 'ppc' && (
                <p className="text-xs text-muted-foreground">
                  Baseado na programação cumprida
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{summary.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{summary.totalPatrimony}</p>
                <p className="text-sm text-muted-foreground">Equipamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{summary.completedTasks}/{summary.totalTasks}</p>
                <p className="text-sm text-muted-foreground">Tarefas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{summary.taskCompletionRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Situação Financeira */}
      <Card>
        <CardHeader>
          <CardTitle>Situação Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Orçamento vs Gasto</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Orçamento Total</span>
                  <span className="font-medium">{formatCurrency(project.orcamento)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gasto Atual</span>
                  <span className="font-medium">{formatCurrency(project.gasto)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Disponível</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(project.orcamento - project.gasto)}
                  </span>
                </div>
                <Progress 
                  value={(project.gasto / project.orcamento) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Por Categoria</h4>
              <div className="space-y-2">
                {finances.slice(0, 5).map((finance) => (
                  <div key={finance.id} className="flex justify-between text-sm">
                    <span>{finance.categoria}</span>
                    <span className="font-medium">
                      {formatCurrency(finance.gasto)} / {formatCurrency(finance.orcamentado)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração e Gráficos de Temporal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TemporalMethodToggle
          projectId={projectId}
          currentMethod={project.metodo_calculo_temporal || 'linear'}
          onMethodChange={() => window.location.reload()}
        />
        {project.metodo_calculo_temporal === 'ppc' && (
          <PPCChart projectId={projectId} />
        )}
      </div>

      {/* Alertas e KPIs */}
      {kpis && (
        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Desvio Prazo</span>
                </div>
                <p className={`text-lg font-bold ${kpis.desvio_prazo_dias > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {kpis.desvio_prazo_dias > 0 ? '+' : ''}{kpis.desvio_prazo_dias} dias
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Lead-time Compras</span>
                </div>
                <p className={`text-lg font-bold ${kpis.lead_time_compras_medio > 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {kpis.lead_time_compras_medio.toFixed(1)} dias
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Absentismo</span>
                </div>
                <p className={`text-lg font-bold ${kpis.absentismo_percentual > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {kpis.absentismo_percentual.toFixed(1)}%
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Status Geral</span>
                </div>
                <Badge variant="outline" className={
                  kpis.status_alerta === 'Verde' ? 'border-green-500 text-green-700' :
                  kpis.status_alerta === 'Amarelo' ? 'border-yellow-500 text-yellow-700' :
                  'border-red-500 text-red-700'
                }>
                  {kpis.status_alerta}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
