import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { TaskModal } from "@/components/modals/TaskModal";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useProjectContext } from "@/contexts/ProjectContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, Clock, AlertTriangle, Target, User, Calendar, Plus, Edit, Layers, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function TarefasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { toast } = useToast();
  const { selectedProjectId } = useProjectContext();
  
  const { data: tasks = [], isLoading } = useTasks(selectedProjectId);
  const { data: projects = [] } = useProjects();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const totalTarefas = tasks.length;
  const tarefasConcluidas = tasks.filter(t => t.status === 'Concluído').length;
  const tarefasAtrasadas = tasks.filter(t => 
    new Date(t.prazo) < new Date() && t.status !== 'Concluído'
  ).length;
  const percentualConclusao = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-green-500';
      case 'Em Andamento': return 'bg-blue-500';
      case 'Pendente': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Residencial': return 'border-blue-300 text-blue-700';
      case 'Comercial': return 'border-green-300 text-green-700';
      case 'Industrial': return 'border-purple-300 text-purple-700';
      case 'Infraestrutura': return 'border-orange-300 text-orange-700';
      case 'Reforma': return 'border-cyan-300 text-cyan-700';
      default: return 'border-gray-300 text-gray-700';
    }
  };

  const isAtrasada = (prazo: string, status: string) => {
    return new Date(prazo) < new Date() && status !== 'Concluído';
  };

  const diasRestantes = (prazo: string) => {
    const diff = new Date(prazo).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateProgress = async (taskId: number, newProgress: number) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        percentual_conclusao: newProgress,
        status: newProgress === 100 ? 'Concluído' : 'Em Andamento'
      });
      toast({
        title: "Progresso atualizado",
        description: "O progresso da tarefa foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar progresso da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleStartTask = async (taskId: number) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        status: 'Em Andamento'
      });
      toast({
        title: "Tarefa iniciada",
        description: "A tarefa foi marcada como em andamento.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao iniciar tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast({
        title: "Tarefa eliminada",
        description: "A tarefa foi eliminada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao eliminar tarefa.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  // Show message when no project is selected
  if (!selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Target className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
          <h2 className="text-xl font-semibold mb-2">Selecione um Projeto</h2>
          <p className="text-muted-foreground">
            Escolha um projeto no cabeçalho para ver suas tarefas
          </p>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="w-full space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">Tarefas de Execução</h1>
          {selectedProject && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
              Projeto: {selectedProject.nome}
            </p>
          )}
        </div>
        <Button onClick={handleNewTask} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nova Tarefa</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* KPIs de Tarefas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total de Tarefas"
          value={totalTarefas}
          subtitle="Ativas no projeto"
          icon={<Target className="h-4 w-4" />}
          alert="green"
        />
        <KPICard
          title="Taxa de Conclusão"
          value={`${percentualConclusao.toFixed(0)}%`}
          subtitle={`${tarefasConcluidas} de ${totalTarefas} concluídas`}
          icon={<CheckCircle className="h-4 w-4" />}
          alert={percentualConclusao >= 80 ? "green" : percentualConclusao >= 60 ? "yellow" : "red"}
        />
        <KPICard
          title="Tarefas Atrasadas"
          value={tarefasAtrasadas}
          subtitle={tarefasAtrasadas > 0 ? "Requer atenção" : "Todas em dia"}
          icon={<AlertTriangle className="h-4 w-4" />}
          alert={tarefasAtrasadas > 0 ? "red" : "green"}
        />
        <KPICard
          title="Em Andamento"
          value={tasks.filter(t => t.status === 'Em Andamento').length}
          subtitle="Tarefas ativas"
          icon={<Clock className="h-4 w-4" />}
          alert="green"
        />
      </div>

      {totalTarefas === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Target className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
              <p className="text-muted-foreground">
                Nenhuma tarefa encontrada para este projeto
              </p>
              <Button variant="outline" onClick={handleNewTask} className="mt-2">
                Criar primeira tarefa
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Cards de Tarefas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {tasks.map((tarefa) => {
              const projeto = projects.find(p => p.id === tarefa.id_projeto);
              const atrasada = isAtrasada(tarefa.prazo, tarefa.status);
              const dias = diasRestantes(tarefa.prazo);
              
              return (
                <Card key={tarefa.id} className={`relative ${atrasada ? 'border-status-danger bg-status-danger/10 dark:bg-status-danger/5' : ''} h-fit`}>
                  <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="outline" className={`${getTipoColor(tarefa.tipo)} text-xs whitespace-nowrap flex-shrink-0`}>
                        {tarefa.tipo}
                      </Badge>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(tarefa)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 p-1 sm:p-2"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem a certeza que deseja eliminar a tarefa "{tarefa.descricao}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTask(tarefa.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-white text-xs mb-2 ${getStatusColor(tarefa.status)} flex-shrink-0`}
                      >
                        {tarefa.status}
                      </Badge>
                      <CardTitle className="text-sm sm:text-base line-clamp-2 leading-tight" title={tarefa.descricao}>
                        {tarefa.descricao}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate" title={tarefa.responsavel}>{tarefa.responsavel}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="truncate">Prazo: {new Date(tarefa.prazo).toLocaleDateString('pt-PT')}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {atrasada && (
                          <Badge variant="destructive" className="text-xs whitespace-nowrap">
                            {Math.abs(dias)} dias atrasado
                          </Badge>
                        )}
                        {!atrasada && dias <= 3 && dias >= 0 && (
                          <Badge variant="outline" className="text-xs border-warning text-warning whitespace-nowrap">
                            {dias} dia{dias !== 1 ? 's' : ''} restante{dias !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {tarefa.id_etapa && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        <span>Etapa: {tarefa.id_etapa}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{tarefa.percentual_conclusao}%</span>
                      </div>
                      <Progress value={tarefa.percentual_conclusao} className="h-2" />
                    </div>

                    {tarefa.status === 'Em Andamento' && (
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleUpdateProgress(tarefa.id, Math.min(100, tarefa.percentual_conclusao + 25))}
                        >
                          Atualizar Progresso
                        </Button>
                      </div>
                    )}

                    {tarefa.status === 'Pendente' && (
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleStartTask(tarefa.id)}
                        >
                          Iniciar Tarefa
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Resumo por Tipo de Tarefa */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg">Resumo por Tipo de Projeto</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {['Residencial', 'Comercial', 'Industrial', 'Infraestrutura', 'Reforma'].map(tipo => {
                  const tarefasTipo = tasks.filter(t => t.tipo === tipo);
                  const concluidas = tarefasTipo.filter(t => t.status === 'Concluído').length;
                  const percentual = tarefasTipo.length > 0 ? (concluidas / tarefasTipo.length) * 100 : 0;
                  
                  return (
                    <div key={tipo} className="text-center p-3 sm:p-4 border rounded-lg min-w-0">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold">{tarefasTipo.length}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">{tipo}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {percentual.toFixed(0)}% concluídas
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={editingTask}
      />
    </div>
  );
}
