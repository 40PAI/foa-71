import { Card } from "@/components/ui/card";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface TasksFinancialSectionProps {
  data: {
    topPorCusto: Array<{
      descricao: string;
      custo: number;
      desvio: number;
    }>;
    tarefasNoOrcamento: number;
    tarefasAcimaOrcamento: number;
    eficienciaFinanceira: number;
  };
}

export function TasksFinancialSection({ data }: TasksFinancialSectionProps) {
  const chartData = data.topPorCusto.map(task => ({
    name: task.descricao.length > 30 ? task.descricao.substring(0, 27) + '...' : task.descricao,
    value: task.custo,
    status: task.desvio > 0 ? 'critico' : 'normal' as 'normal' | 'atencao' | 'critico',
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <p className="text-sm text-muted-foreground">Tarefas no Orçamento</p>
          </div>
          <p className="text-2xl font-bold mt-2 text-success">{data.tarefasNoOrcamento}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-muted-foreground">Tarefas Acima do Orçamento</p>
          </div>
          <p className="text-2xl font-bold mt-2 text-destructive">{data.tarefasAcimaOrcamento}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Eficiência Financeira</p>
          </div>
          <p className="text-2xl font-bold mt-2">{(data.eficienciaFinanceira ?? 0).toFixed(1)}%</p>
        </Card>
      </div>

      {/* Gráfico */}
      {data.topPorCusto.length > 0 && (
        <Card className="p-4">
          <HorizontalBarChart 
            data={chartData}
            title="Top 5 Tarefas por Custo Real"
          />
        </Card>
      )}

      {/* Tabela detalhada */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Análise Detalhada de Tarefas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Descrição</th>
                <th className="text-right p-2">Custo Real</th>
                <th className="text-right p-2">Desvio</th>
                <th className="text-right p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.topPorCusto.map((task, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="p-2 max-w-xs truncate">{task.descricao}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(task.custo)}</td>
                  <td className={`p-2 text-right font-semibold ${
                    task.desvio > 0 ? 'text-destructive' : 'text-success'
                  }`}>
                    {task.desvio > 0 ? '+' : ''}{formatCurrency(task.desvio)}
                  </td>
                  <td className="p-2 text-right">
                    {task.desvio > 0 ? (
                      <span className="text-destructive">Acima</span>
                    ) : (
                      <span className="text-success">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
