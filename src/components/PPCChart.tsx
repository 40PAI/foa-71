import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePPCHistory } from "@/hooks/usePPCHistory";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "./ui/badge";
import { WeeklyPPCButton } from "./WeeklyPPCButton";
import { TrendingUp } from "lucide-react";

interface PPCChartProps {
  projectId: number;
}

export function PPCChart({ projectId }: PPCChartProps) {
  const { data: ppcHistory, isLoading } = usePPCHistory(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Histórico PPC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!ppcHistory?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Histórico PPC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum dados de PPC disponível ainda. Execute algumas tarefas para ver o histórico.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = ppcHistory.map(entry => ({
    periodo: `${new Date(entry.semana_inicio).toLocaleDateString()} - ${new Date(entry.semana_fim).toLocaleDateString()}`,
    ppc: entry.ppc_percentual,
    tarefas_programadas: entry.tarefas_programadas,
    tarefas_concluidas: entry.tarefas_concluidas,
    status: entry.status_ppc,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            PPC Semanal - Percentual da Programação Cumprida
          </div>
          <div className="flex gap-2">
            <WeeklyPPCButton projectId={projectId} variant="register" />
            <WeeklyPPCButton projectId={projectId} variant="calculate" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="periodo" 
                fontSize={12}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 100]}
                fontSize={12}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-primary">
                            PPC: {data.ppc}%
                          </p>
                          <Badge 
                            variant={data.status === 'Bom' ? 'default' : data.status === 'Médio' ? 'secondary' : 'destructive'}
                          >
                            {data.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {data.tarefas_concluidas} de {data.tarefas_programadas} tarefas no prazo
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ppc" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {ppcHistory.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">PPC Médio:</p>
              <p className="font-medium">
                {(ppcHistory.reduce((acc, entry) => acc + entry.ppc_percentual, 0) / ppcHistory.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Último PPC:</p>
              <p className="font-medium">
                {ppcHistory[ppcHistory.length - 1].ppc_percentual}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}