import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine, Area, ComposedChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";

interface TimelineChartProps {
  data: Array<{
    periodo: string;
    avanco_linear: number;
    avanco_real: number;
    ppc_semanal: number;
  }>;
  title: string;
}

const chartConfig = {
  avanco_linear: {
    label: "Avanço Linear Esperado",
    color: "hsl(var(--chart-1))",
  },
  avanco_real: {
    label: "Avanço Real (Físico)",
    color: "hsl(var(--chart-2))",
  },
  ppc_semanal: {
    label: "Avanço Financeiro",
    color: "hsl(var(--chart-3))",
  },
};

export function TimelineChart({ data, title }: TimelineChartProps) {
  const hasMultiplePoints = data.length > 3;
  const lastPoint = data[data.length - 1];
  
  // Calcular gap entre linear e real
  const gap = lastPoint ? lastPoint.avanco_linear - lastPoint.avanco_real : 0;
  const isDelayed = gap > 10;

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 mx-auto opacity-50" />
              <p className="text-sm">Dados insuficientes para gráfico temporal</p>
              <p className="text-xs">Configure datas de início e fim do projeto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            {title}
          </CardTitle>
          {hasMultiplePoints && (
            <Badge variant={isDelayed ? 'destructive' : 'default'} className="text-xs">
              {isDelayed ? `Atraso: ${gap.toFixed(0)}%` : 'No Prazo'}
            </Badge>
          )}
        </div>
        {!hasMultiplePoints && (
          <p className="text-xs text-muted-foreground">
            Visualização simplificada. Mais pontos serão adicionados com o progresso do projeto.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] sm:h-[320px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvancoReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="periodo" 
                fontSize={11}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={[0, 100]} 
                fontSize={11}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              
              {/* Linha de referência para 80% (meta PPC) */}
              <ReferenceLine 
                y={80} 
                stroke="hsl(var(--chart-4))" 
                strokeDasharray="5 5" 
                label={{ 
                  value: "Meta 80%", 
                  position: "right", 
                  fontSize: 10,
                  fill: 'hsl(var(--muted-foreground))'
                }} 
              />
              
              {/* Linha de baseline linear (tracejada) */}
              <Line 
                type="monotone" 
                dataKey="avanco_linear" 
                stroke="var(--color-avanco_linear)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Baseline Linear"
              />
              
              {/* Área e linha do avanço real físico */}
              <Area
                type="monotone"
                dataKey="avanco_real"
                stroke="var(--color-avanco_real)"
                fill="url(#colorAvancoReal)"
                strokeWidth={2.5}
                name="Avanço Físico"
              />
              
              {/* Linha do avanço financeiro */}
              <Line 
                type="monotone" 
                dataKey="ppc_semanal" 
                stroke="var(--color-ppc_semanal)" 
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-ppc_semanal)' }}
                name="Avanço Financeiro"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Resumo */}
        {hasMultiplePoints && lastPoint && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground grid grid-cols-3 gap-2">
            <div className="text-center">
              <span className="font-medium text-foreground">{lastPoint.avanco_linear?.toFixed(1) || 0}%</span>
              <p>Esperado</p>
            </div>
            <div className="text-center">
              <span className={`font-medium ${isDelayed ? 'text-destructive' : 'text-foreground'}`}>
                {lastPoint.avanco_real?.toFixed(1) || 0}%
              </span>
              <p>Real Físico</p>
            </div>
            <div className="text-center">
              <span className="font-medium text-foreground">{lastPoint.ppc_semanal?.toFixed(1) || 0}%</span>
              <p>Financeiro</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}