import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Package, TrendingUp, TrendingDown, RotateCcw, Flame } from "lucide-react";
import { useMaterialFlow } from "@/hooks/useMaterialChartData";
import { Badge } from "@/components/ui/badge";

interface MaterialFlowChartProps {
  projectId?: number;
  days?: number;
  title?: string;
}

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "hsl(142, 76%, 36%)",
    icon: TrendingUp,
  },
  saidas: {
    label: "Saídas",
    color: "hsl(0, 84%, 60%)",
    icon: TrendingDown,
  },
  consumos: {
    label: "Consumos",
    color: "hsl(217, 91%, 60%)",
    icon: Flame,
  },
  devolucoes: {
    label: "Devoluções",
    color: "hsl(45, 93%, 47%)",
    icon: RotateCcw,
  },
};

export function MaterialFlowChart({ projectId, days = 30, title = "Fluxo de Materiais" }: MaterialFlowChartProps) {
  const { data, isLoading } = useMaterialFlow(projectId, days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Sem dados de movimentações de materiais
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totals = data.reduce(
    (acc, d) => ({
      entradas: acc.entradas + d.entradas,
      saidas: acc.saidas + d.saidas,
      consumos: acc.consumos + d.consumos,
      devolucoes: acc.devolucoes + d.devolucoes,
    }),
    { entradas: 0, saidas: 0, consumos: 0, devolucoes: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>Últimos {days} dias de movimentações</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-green-600 border-green-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              {totals.entradas} un.
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-300">
              <TrendingDown className="h-3 w-3 mr-1" />
              {totals.saidas} un.
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              <Flame className="h-3 w-3 mr-1" />
              {totals.consumos} un.
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntradasMat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorSaidasMat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorConsumos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorDevolucoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="entradas"
                stackId="1"
                stroke="hsl(142, 76%, 36%)"
                fillOpacity={1}
                fill="url(#colorEntradasMat)"
              />
              <Area
                type="monotone"
                dataKey="saidas"
                stackId="2"
                stroke="hsl(0, 84%, 60%)"
                fillOpacity={1}
                fill="url(#colorSaidasMat)"
              />
              <Area
                type="monotone"
                dataKey="consumos"
                stackId="2"
                stroke="hsl(217, 91%, 60%)"
                fillOpacity={1}
                fill="url(#colorConsumos)"
              />
              <Area
                type="monotone"
                dataKey="devolucoes"
                stackId="1"
                stroke="hsl(45, 93%, 47%)"
                fillOpacity={1}
                fill="url(#colorDevolucoes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary footer */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="text-muted-foreground">Entradas</div>
            <div className="font-bold text-green-600">{totals.entradas}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Saídas</div>
            <div className="font-bold text-red-600">{totals.saidas}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Consumos</div>
            <div className="font-bold text-blue-600">{totals.consumos}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Devoluções</div>
            <div className="font-bold text-yellow-600">{totals.devolucoes}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
