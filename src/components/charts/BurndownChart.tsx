import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine, Area, ComposedChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, AlertTriangle, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BurndownChartProps {
  data: Array<{
    tarefa: string;
    planejado: number;
    real: number;
    status: string;
  }>;
}

const chartConfig = {
  planejado: {
    label: "Tarefas Restantes (Ideal)",
    color: "hsl(var(--chart-1))",
  },
  real: {
    label: "Tarefas Restantes (Real)",
    color: "hsl(var(--chart-2))",
  },
};

export function BurndownChart({ data }: BurndownChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Verificar se os dados são temporais (mês/ano) ou por tarefa
  const isTemporalData = data.length > 0 && data[0].tarefa?.includes('/');
  
  // Calcular se está atrasado (real > planejado no último ponto)
  const lastPoint = data[data.length - 1];
  const isDelayed = lastPoint ? lastPoint.real > lastPoint.planejado : false;
  
  // Calcular métricas
  const firstPoint = data[0];
  const totalTasks = firstPoint?.planejado || 0;
  const currentRemaining = lastPoint?.real || 0;
  const completedTasks = totalTasks - currentRemaining;

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer 
      config={chartConfig} 
      className={expanded ? "h-[500px] w-full" : "h-[220px] sm:h-[280px] lg:h-[300px] w-full max-w-4xl"}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="burndownIdeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="tarefa" 
            fontSize={expanded ? 11 : 10}
            className="text-xs"
            angle={isTemporalData ? 0 : -45}
            textAnchor={isTemporalData ? "middle" : "end"}
            height={isTemporalData ? 30 : 50}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            fontSize={expanded ? 12 : 11}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ 
              value: 'Tarefas Restantes', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: expanded ? 11 : 10, fill: 'hsl(var(--muted-foreground))' }
            }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend 
            wrapperStyle={{ fontSize: expanded ? '12px' : '11px', paddingTop: '10px' }}
          />
          
          {/* Área do planejado (ideal) */}
          <Area
            type="monotone"
            dataKey="planejado"
            stroke="var(--color-planejado)"
            fill="url(#burndownIdeal)"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Ideal"
          />
          
          {/* Linha do real */}
          <Line 
            type="monotone" 
            dataKey="real" 
            stroke="var(--color-real)" 
            strokeWidth={2.5}
            dot={{ r: expanded ? 5 : 4, fill: 'var(--color-real)' }}
            activeDot={{ r: expanded ? 8 : 6 }}
            name="Real"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const Summary = () => (
    isTemporalData ? (
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground grid grid-cols-3 gap-2 max-w-md mx-auto">
        <div className="text-center">
          <span className="font-medium text-foreground">{totalTasks}</span>
          <p>Total Tarefas</p>
        </div>
        <div className="text-center">
          <span className="font-medium text-foreground">{completedTasks}</span>
          <p>Concluídas</p>
        </div>
        <div className="text-center">
          <span className={`font-medium ${isDelayed ? 'text-destructive' : 'text-foreground'}`}>{currentRemaining}</span>
          <p>Restantes</p>
        </div>
      </div>
    ) : null
  );

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
            Burndown de Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 mx-auto opacity-50" />
              <p className="text-sm">Dados insuficientes para gráfico de burndown</p>
              <p className="text-xs">Adicione tarefas com prazos ao projeto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
              Burndown de Tarefas
            </CardTitle>
            <div className="flex items-center gap-2">
              {isTemporalData && (
                <Badge variant={isDelayed ? 'destructive' : 'default'} className="text-xs">
                  {isDelayed ? 'Atrasado' : 'No Prazo'}
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsExpanded(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expandir gráfico</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {!isTemporalData && (
            <p className="text-xs text-muted-foreground">
              Visualização simplificada. Adicione datas às tarefas para ver evolução temporal.
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ChartContent expanded={false} />
          <Summary />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Burndown de Tarefas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ChartContent expanded={true} />
            <Summary />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
