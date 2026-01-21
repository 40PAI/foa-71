import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Area, ComposedChart, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SCurveChartProps {
  data: Array<{
    periodo: string;
    fisico: number;
    financeiro: number;
    tempo: number;
  }>;
}

const chartConfig = {
  fisico: {
    label: "Avanço Físico",
    color: "hsl(var(--chart-1))",
  },
  financeiro: {
    label: "Avanço Financeiro",
    color: "hsl(var(--chart-2))",
  },
  tempo: {
    label: "Baseline Linear",
    color: "hsl(var(--chart-3))",
  },
};

export function SCurveChart({ data }: SCurveChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calcular estatísticas para mostrar no header
  const lastPoint = data[data.length - 1];
  const hasMultiplePoints = data.length > 3;
  
  // Calcular gap entre físico e financeiro no último ponto
  const gap = lastPoint ? Math.abs(lastPoint.financeiro - lastPoint.fisico) : 0;
  const gapStatus = gap > 20 ? 'destructive' : gap > 10 ? 'secondary' : 'default';

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer 
      config={chartConfig} 
      className={expanded ? "h-[500px] w-full" : "h-[250px] sm:h-[300px] lg:h-[350px] w-full max-w-4xl"}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFisico" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorFinanceiro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="periodo" 
            fontSize={expanded ? 12 : 11}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            domain={[0, 100]} 
            fontSize={expanded ? 12 : 11}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip 
            content={<ChartTooltipContent />} 
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Legend 
            wrapperStyle={{ fontSize: expanded ? '12px' : '11px', paddingTop: '10px' }}
          />
          
          {/* Linha de baseline linear (tracejada) */}
          <Line 
            type="monotone" 
            dataKey="tempo" 
            stroke="var(--color-tempo)" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Baseline Linear"
          />
          
          {/* Área e linha do avanço financeiro */}
          <Area
            type="monotone"
            dataKey="financeiro"
            stroke="var(--color-financeiro)"
            fill="url(#colorFinanceiro)"
            strokeWidth={2}
          />
          
          {/* Área e linha do avanço físico */}
          <Area
            type="monotone"
            dataKey="fisico"
            stroke="var(--color-fisico)"
            fill="url(#colorFisico)"
            strokeWidth={2.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const Summary = () => (
    hasMultiplePoints ? (
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground grid grid-cols-3 gap-2 max-w-md mx-auto">
        <div className="text-center">
          <span className="font-medium text-foreground">{lastPoint?.fisico?.toFixed(1) || 0}%</span>
          <p>Físico</p>
        </div>
        <div className="text-center">
          <span className="font-medium text-foreground">{lastPoint?.financeiro?.toFixed(1) || 0}%</span>
          <p>Financeiro</p>
        </div>
        <div className="text-center">
          <span className="font-medium text-foreground">{lastPoint?.tempo?.toFixed(1) || 0}%</span>
          <p>Temporal</p>
        </div>
      </div>
    ) : null
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              S-Curve: Avanço Físico × Financeiro × Temporal
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasMultiplePoints && gap > 0 && (
                <Badge variant={gapStatus} className="text-xs">
                  Gap: {gap.toFixed(0)}%
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
          {!hasMultiplePoints && (
            <p className="text-xs text-muted-foreground">
              Dados insuficientes para curva temporal completa. Adicione mais tarefas com prazos para visualizar evolução mensal.
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
              <TrendingUp className="h-5 w-5" />
              S-Curve: Avanço Físico × Financeiro × Temporal
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
