
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Target } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

interface StageProgressCardProps {
  stage: {
    id: number;
    numero_etapa: number;
    nome_etapa: string;
    tipo_etapa: string;
    responsavel_etapa: string;
    data_inicio_etapa: string | null;
    data_fim_prevista_etapa: string | null;
    status_etapa: string;
    observacoes: string | null;
  };
}

export function StageProgressCard({ stage }: StageProgressCardProps) {
  const { data: allTasks = [] } = useTasks();
  
  // Filter tasks for this specific stage
  const stageTasks = allTasks.filter(task => task.id_etapa === stage.id);
  const totalTasks = stageTasks.length;
  const completedTasks = stageTasks.filter(task => task.status === "Concluído").length;
  const averageProgress = totalTasks > 0 
    ? Math.round(stageTasks.reduce((acc, task) => acc + task.percentual_conclusao, 0) / totalTasks)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-green-500';
      case 'Em Curso': return 'bg-blue-500';
      case 'Atrasada': return 'bg-red-500';
      case 'Não Iniciada': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Mobilização': return 'border-indigo-300 text-indigo-700';
      case 'Fundação': return 'border-red-300 text-red-700';
      case 'Estrutura': return 'border-blue-300 text-blue-700';
      case 'Alvenaria': return 'border-yellow-300 text-yellow-700';
      case 'Acabamento': return 'border-green-300 text-green-700';
      case 'Instalações': return 'border-purple-300 text-purple-700';
      case 'Entrega': return 'border-gray-300 text-gray-700';
      case 'Desmobilização': return 'border-pink-300 text-pink-700';
      default: return 'border-gray-300 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={getTipoColor(stage.tipo_etapa)}>
            {stage.tipo_etapa}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`text-white ${getStatusColor(stage.status_etapa)}`}
          >
            {stage.status_etapa}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          Etapa {stage.numero_etapa}: {stage.nome_etapa}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{stage.responsavel_etapa}</span>
        </div>
        
        {stage.data_fim_prevista_etapa && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Prazo: {new Date(stage.data_fim_prevista_etapa).toLocaleDateString('pt-PT')}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4" />
          <span>{totalTasks} tarefa{totalTasks !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground">
            ({completedTasks} concluída{completedTasks !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Etapa</span>
            <span>{averageProgress}%</span>
          </div>
          <Progress value={averageProgress} className="h-2" />
        </div>

        {stage.observacoes && (
          <div className="text-sm text-muted-foreground">
            <strong>Observações:</strong> {stage.observacoes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
