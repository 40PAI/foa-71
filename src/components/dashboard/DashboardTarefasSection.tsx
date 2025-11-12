import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TarefasResumo, ProjetoTarefas } from "@/hooks/useDashboardGeral";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "@/contexts/ProjectContext";

interface DashboardTarefasSectionProps {
  tarefasResumo: TarefasResumo;
  topProjetosTarefas: ProjetoTarefas[];
}

export function DashboardTarefasSection({
  tarefasResumo,
  topProjetosTarefas
}: DashboardTarefasSectionProps) {
  const navigate = useNavigate();
  const { setSelectedProjectId } = useProjectContext();

  const handleProjetoClick = (projetoId: number) => {
    setSelectedProjectId(projetoId);
    navigate('/tarefas');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-responsive-xl">✅ Tarefas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{tarefasResumo.total}</p>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">Concluídas</p>
            <p className="text-xl font-bold text-green-600">{tarefasResumo.concluidas}</p>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">Em Andamento</p>
            <p className="text-xl font-bold text-blue-600">{tarefasResumo.em_andamento}</p>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">Atrasadas</p>
            <p className="text-xl font-bold text-red-600">{tarefasResumo.atrasadas}</p>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Taxa de Conclusão</p>
            <p className="text-lg font-bold">{tarefasResumo.taxa_conclusao.toFixed(1)}%</p>
          </div>
          <Progress value={tarefasResumo.taxa_conclusao} className="h-2" />
        </div>

        {topProjetosTarefas.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Top 5 Projetos por Tarefas Concluídas</h3>
            <div className="space-y-2">
              {topProjetosTarefas.map((projeto, index) => (
                <div 
                  key={index} 
                  onClick={() => handleProjetoClick(projeto.projeto_id)}
                  className="flex items-center justify-between p-2 border rounded bg-card cursor-pointer hover:bg-accent hover:shadow-md transition-all duration-200"
                >
                  <span className="text-sm font-medium truncate flex-1">
                    {projeto.projeto_nome}
                  </span>
                  <span className="text-xs text-muted-foreground mr-2">
                    {projeto.concluidas}/{projeto.total_tarefas}
                  </span>
                  <span className="text-xs font-bold min-w-[45px] text-right">
                    {projeto.percentual.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
