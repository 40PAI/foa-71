import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Maximize2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCashFlowMonthly, type CashFlowData } from "@/hooks/useFinancialChartData";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CashFlowAreaChartProps {
  projectId?: number;
  months?: number;
  title?: string;
}

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "hsl(142, 76%, 36%)",
  },
  saidas: {
    label: "Saídas",
    color: "hsl(0, 84%, 60%)",
  },
  saldo: {
    label: "Saldo Acumulado",
    color: "hsl(217, 91%, 60%)",
  },
};

export function CashFlowAreaChart({ projectId, months = 12, title = "Fluxo de Caixa Mensal" }: CashFlowAreaChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useCashFlowMonthly(projectId, months);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
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
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Sem dados de movimentos financeiros
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalEntradas = data.reduce((sum, d) => sum + d.entradas, 0);
  const totalSaidas = data.reduce((sum, d) => sum + d.saidas, 0);
  const saldoFinal = data[data.length - 1]?.saldo || 0;

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer config={chartConfig} className={expanded ? "h-[500px] w-full" : "h-80 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="mes" 
            tick={{ fontSize: expanded ? 13 : 12 }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--muted))' }}
          />
          <YAxis 
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            tick={{ fontSize: expanded ? 13 : 12 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--muted))' }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [formatCurrency(value as number), chartConfig[name as keyof typeof chartConfig]?.label || name]}
              />
            }
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="entradas"
            stroke="hsl(142, 76%, 36%)"
            fillOpacity={1}
            fill="url(#colorEntradas)"
            name="Entradas"
          />
          <Area
            type="monotone"
            dataKey="saidas"
            stroke="hsl(0, 84%, 60%)"
            fillOpacity={1}
            fill="url(#colorSaidas)"
            name="Saídas"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const Summary = () => (
    <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
      <span className="text-muted-foreground">Saldo acumulado:</span>
      <span className={`font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(saldoFinal)}
      </span>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>Últimos {months} meses de movimentações</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-300">
                <TrendingUp className="h-3 w-3 mr-1" />
                {formatCurrency(totalEntradas)}
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300">
                <TrendingDown className="h-3 w-3 mr-1" />
                {formatCurrency(totalSaidas)}
              </Badge>
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
        </CardHeader>
        <CardContent>
          <ChartContent expanded={false} />
          <Summary />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Badge variant="outline" className="text-green-600 border-green-300">
                <TrendingUp className="h-3 w-3 mr-1" />
                Entradas: {formatCurrency(totalEntradas)}
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300">
                <TrendingDown className="h-3 w-3 mr-1" />
                Saídas: {formatCurrency(totalSaidas)}
              </Badge>
            </div>
            <ChartContent expanded={true} />
            <Summary />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
