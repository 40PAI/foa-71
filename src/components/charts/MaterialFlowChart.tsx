import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Package, TrendingUp, TrendingDown, RotateCcw, Flame, Maximize2 } from "lucide-react";
import { useMaterialFlow } from "@/hooks/useMaterialChartData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export function MaterialFlowChart({ projectId, days = 90, title = "Fluxo de Materiais" }: MaterialFlowChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useMaterialFlow(projectId, days);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
            Sem dados de movimentações de materiais
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = data.reduce(
    (acc, d) => ({
      entradas: acc.entradas + d.entradas,
      saidas: acc.saidas + d.saidas,
      consumos: acc.consumos + d.consumos,
      devolucoes: acc.devolucoes + d.devolucoes,
    }),
    { entradas: 0, saidas: 0, consumos: 0, devolucoes: 0 }
  );

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer config={chartConfig} className={expanded ? "h-[450px] w-full" : "h-64 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEntradasMat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorSaidasMat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorConsumos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorDevolucoes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
          <XAxis 
            dataKey="periodo" 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="entradas"
            stackId="1"
            stroke="hsl(142, 76%, 36%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEntradasMat)"
          />
          <Area
            type="monotone"
            dataKey="saidas"
            stackId="2"
            stroke="hsl(0, 84%, 60%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSaidasMat)"
          />
          <Area
            type="monotone"
            dataKey="consumos"
            stackId="2"
            stroke="hsl(217, 91%, 60%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorConsumos)"
          />
          <Area
            type="monotone"
            dataKey="devolucoes"
            stackId="1"
            stroke="hsl(45, 93%, 47%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDevolucoes)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const Summary = ({ compact = false }: { compact?: boolean }) => (
    <div className={`grid grid-cols-4 gap-2 ${compact ? 'pt-3' : 'pt-4'} border-t border-border/50`}>
      <div className="text-center space-y-0.5">
        <div className="flex items-center justify-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="text-[10px] text-muted-foreground font-medium">Entradas</span>
        </div>
        <div className="text-sm font-bold text-green-600">{totals.entradas}</div>
      </div>
      <div className="text-center space-y-0.5">
        <div className="flex items-center justify-center gap-1">
          <TrendingDown className="h-3 w-3 text-red-500" />
          <span className="text-[10px] text-muted-foreground font-medium">Saídas</span>
        </div>
        <div className="text-sm font-bold text-red-500">{totals.saidas}</div>
      </div>
      <div className="text-center space-y-0.5">
        <div className="flex items-center justify-center gap-1">
          <Flame className="h-3 w-3 text-blue-500" />
          <span className="text-[10px] text-muted-foreground font-medium">Consumos</span>
        </div>
        <div className="text-sm font-bold text-blue-500">{totals.consumos}</div>
      </div>
      <div className="text-center space-y-0.5">
        <div className="flex items-center justify-center gap-1">
          <RotateCcw className="h-3 w-3 text-yellow-600" />
          <span className="text-[10px] text-muted-foreground font-medium">Devoluções</span>
        </div>
        <div className="text-sm font-bold text-yellow-600">{totals.devolucoes}</div>
      </div>
    </div>
  );

  return (
    <>
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Package className="h-4 w-4 text-primary" />
                {title}
              </CardTitle>
              <CardDescription className="text-xs">
                Últimos {days} dias de movimentações
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-foreground -mt-1 -mr-1"
                    onClick={() => setIsExpanded(true)}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">Expandir gráfico</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <ChartContent expanded={false} />
          <Summary compact />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              {title}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Últimos {days} dias
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <ChartContent expanded={true} />
            <Summary />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}