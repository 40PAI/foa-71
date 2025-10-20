import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTasksByWeek, useProjectWeeksInfo } from "@/hooks/useProjectWeeks";
import { LoadingSpinner } from "./LoadingSpinner";
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeeklyTaskViewProps {
  projectId: number;
}

export function WeeklyTaskView({ projectId }: WeeklyTaskViewProps) {
  const { data: weekInfo, isLoading: weekInfoLoading } = useProjectWeeksInfo(projectId);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const { data: tasks, isLoading: tasksLoading } = useTasksByWeek(projectId, selectedWeek);

  // Update selectedWeek when weekInfo loads
  useEffect(() => {
    if (weekInfo?.currentWeek) {
      setSelectedWeek(weekInfo.currentWeek);
    }
  }, [weekInfo?.currentWeek]);

  if (weekInfoLoading) return <LoadingSpinner />;
  if (!weekInfo) return <div>Erro ao carregar informações das semanas</div>;

  const canGoPrevious = selectedWeek > 1;
  const canGoNext = selectedWeek < weekInfo.totalWeeks;

  const completedTasks = tasks?.filter(task => task.status === 'Concluído').length || 0;
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDCA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case '5S':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Melhoria':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Corretiva':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com navegação semanal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Semana {selectedWeek} de {weekInfo.totalWeeks}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Vista semanal de tarefas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(selectedWeek - 1)}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(selectedWeek + 1)}
                disabled={!canGoNext}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-lg font-bold">{completedTasks}/{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{completionRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-lg font-bold">
                  {selectedWeek === weekInfo.currentWeek ? "Atual" : 
                   selectedWeek < weekInfo.currentWeek ? "Passada" : "Futura"}
                </p>
                <p className="text-sm text-muted-foreground">Status da Semana</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso da Semana</span>
              <span>{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de tarefas */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas da Semana {selectedWeek}</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <LoadingSpinner />
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(task.tipo)} variant="outline">
                          {task.tipo}
                        </Badge>
                        <Badge className={getStatusColor(task.status)} variant="outline">
                          {task.status}
                        </Badge>
                        {task.id_etapa && (
                          <Badge variant="outline" className="text-xs">
                            Etapa {task.id_etapa}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium mb-1">{task.descricao}</h4>
                      <div className="text-sm text-muted-foreground mb-2">
                        <p>Responsável: {task.responsavel}</p>
                        <p>Prazo: {format(new Date(task.prazo), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Progresso:</span>
                        <Progress value={task.percentual_conclusao} className="h-2 w-24" />
                        <span className="text-xs text-muted-foreground">{task.percentual_conclusao}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tarefa programada para esta semana</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}