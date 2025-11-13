import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { useTaskFinancialAnalytics, useTopDeviationTasks } from "@/hooks/useTaskFinancialAnalytics";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TrendingDown, TrendingUp, Clock, DollarSign, Target, AlertTriangle } from "lucide-react";

interface TaskVsRealityAnalysisProps {
  projectId: number;
}

export function TaskVsRealityAnalysis({ projectId }: TaskVsRealityAnalysisProps) {
  const { data: analytics, isLoading: loadingAnalytics } = useTaskFinancialAnalytics(projectId);
  const { data: topDeviations = [], isLoading: loadingDeviations } = useTopDeviationTasks(projectId, 5);

  if (loadingAnalytics || loadingDeviations) {
    return <LoadingSkeleton variant="card" className="mb-6" />;
  }

  // Validação defensiva - garante que analytics existe e tem todas as propriedades necessárias
  if (!analytics || typeof analytics !== 'object') return null;

  const getDeviationColor = (percentage: number) => {
    if (percentage <= 0) return "text-success";
    if (percentage <= 10) return "text-warning";
    return "text-destructive";
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Planejados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_planned_cost)}</div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">
                Material: {formatCurrency(analytics.material_planned)}
              </div>
              <div className="text-xs text-muted-foreground">
                Mão de Obra: {formatCurrency(analytics.labor_planned)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Reais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_real_expenses)}</div>
            <div className={`mt-2 flex items-center text-xs ${getDeviationColor(analytics.budget_deviation_percentage ?? 0)}`}>
              {(analytics.budget_deviation ?? 0) >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
              {Math.abs(analytics.budget_deviation_percentage ?? 0).toFixed(1)}% de desvio
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(Math.abs(analytics.budget_deviation ?? 0))} {(analytics.budget_deviation ?? 0) >= 0 ? 'acima' : 'abaixo'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Temporal</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.time_efficiency_percentage ?? 0).toFixed(1)}%</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Previsto: {analytics.total_planned_days ?? 0} dias
            </div>
            <div className="text-xs text-muted-foreground">
              Real: {analytics.total_real_days ?? 0} dias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Eficiência</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEfficiencyColor(analytics.efficiency_score ?? 0)}`}>
              {(analytics.efficiency_score ?? 0).toFixed(0)}%
            </div>
            <Progress value={analytics.efficiency_score ?? 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Análise de Tarefas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Orçamentária</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tarefas no Orçamento</span>
              <Badge variant="outline" className="bg-success/10 text-success">
                {analytics.tasks_on_budget}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tarefas Acima do Orçamento</span>
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                {analytics.tasks_over_budget}
              </Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Taxa de Sucesso Orçamentário</span>
                <span className="font-medium">
                  {(((analytics.tasks_on_budget ?? 0) / ((analytics.tasks_on_budget ?? 0) + (analytics.tasks_over_budget ?? 0)) || 0) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={((analytics.tasks_on_budget ?? 0) / ((analytics.tasks_on_budget ?? 0) + (analytics.tasks_over_budget ?? 0)) || 0) * 100} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance de Prazo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tarefas no Prazo</span>
              <Badge variant="outline" className="bg-success/10 text-success">
                {analytics.tasks_on_time}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tarefas Atrasadas</span>
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                {analytics.tasks_delayed}
              </Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Taxa de Cumprimento de Prazo</span>
                <span className="font-medium">
                  {(((analytics.tasks_on_time ?? 0) / ((analytics.tasks_on_time ?? 0) + (analytics.tasks_delayed ?? 0)) || 0) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={((analytics.tasks_on_time ?? 0) / ((analytics.tasks_on_time ?? 0) + (analytics.tasks_delayed ?? 0)) || 0) * 100} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Desvios */}
      {topDeviations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Top 5 Tarefas com Maior Desvio Orçamentário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDeviations.map((task) => (
                <div key={task.task_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.descricao}</h4>
                      <p className="text-sm text-muted-foreground">Responsável: {task.responsavel}</p>
                    </div>
                    <Badge variant={(task.desvio_percentual ?? 0) > 0 ? "destructive" : "default"}>
                      {(task.desvio_percentual ?? 0) > 0 ? '+' : ''}{(task.desvio_percentual ?? 0).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Planejado: </span>
                      <span className="font-medium">{formatCurrency(task.custo_planejado)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Real: </span>
                      <span className="font-medium">{formatCurrency(task.gasto_real)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Desvio: </span>
                      <span className={`font-medium ${getDeviationColor(task.desvio_percentual)}`}>
                        {formatCurrency(Math.abs(task.desvio_orcamentario))}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className="font-medium">{task.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
