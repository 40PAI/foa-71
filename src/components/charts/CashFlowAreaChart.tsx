import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Legend,
  Tooltip,
  ReferenceLine,
  Dot
} from "recharts";
import { TrendingUp, TrendingDown, Maximize2, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCashFlowMonthly } from "@/hooks/useFinancialChartData";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    color: "hsl(0, 72%, 51%)",
  },
  saldo: {
    label: "Saldo Acumulado",
    color: "hsl(217, 91%, 60%)",
  },
};

// Custom dot component for peak markers
const PeakDot = (props: any) => {
  const { cx, cy, payload, dataKey, maxValue, color } = props;
  const value = payload[dataKey];
  const isPeak = value === maxValue && value > 0;
  
  if (isPeak) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.2} />
        <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
      </g>
    );
  }
  
  return <circle cx={cx} cy={cy} r={3} fill={color} stroke="white" strokeWidth={1} />;
};

// Custom tooltip with variation percentages
const CustomTooltip = ({ active, payload, label, data }: any) => {
  if (!active || !payload?.length) return null;
  
  const current = payload[0]?.payload;
  if (!current) return null;
  
  const currentIndex = data?.findIndex((d: any) => d.mes === label) ?? -1;
  const prev = currentIndex > 0 ? data[currentIndex - 1] : null;
  
  const calcVariation = (curr: number, previous: number | null) => {
    if (!previous || previous === 0) return null;
    return ((curr - previous) / previous) * 100;
  };
  
  const variacaoEntradas = calcVariation(current.entradas, prev?.entradas);
  const variacaoSaidas = calcVariation(current.saidas, prev?.saidas);
  
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 min-w-[200px]">
      <p className="font-bold text-foreground mb-3 text-base border-b pb-2">{label}</p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            Entradas:
          </span>
          <div className="text-right">
            <span className="font-semibold text-emerald-600">{formatCurrency(current.entradas)}</span>
            {variacaoEntradas !== null && (
              <span className={`text-xs ml-1 ${variacaoEntradas >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ({variacaoEntradas >= 0 ? '+' : ''}{variacaoEntradas.toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            Saídas:
          </span>
          <div className="text-right">
            <span className="font-semibold text-red-600">{formatCurrency(current.saidas)}</span>
            {variacaoSaidas !== null && (
              <span className={`text-xs ml-1 ${variacaoSaidas <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ({variacaoSaidas >= 0 ? '+' : ''}{variacaoSaidas.toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t mt-2">
          <span className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            Saldo:
          </span>
          <span className={`font-bold ${current.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(current.saldo)}
          </span>
        </div>
      </div>
    </div>
  );
};

export function CashFlowAreaChart({ projectId, months = 12, title = "Fluxo de Caixa Mensal" }: CashFlowAreaChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useCashFlowMonthly(projectId, months);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const totalEntradas = data.reduce((sum, d) => sum + d.entradas, 0);
    const totalSaidas = data.reduce((sum, d) => sum + d.saidas, 0);
    const saldoFinal = data[data.length - 1]?.saldo || 0;
    
    const maxEntradas = Math.max(...data.map(d => d.entradas));
    const maxSaidas = Math.max(...data.map(d => d.saidas));
    const minSaldo = Math.min(...data.map(d => d.saldo));
    
    const mesPicoEntradas = data.find(d => d.entradas === maxEntradas)?.mes || '';
    const mesPicoSaidas = data.find(d => d.saidas === maxSaidas)?.mes || '';
    
    const mediaEntradas = totalEntradas / data.length;
    const mediaSaidas = totalSaidas / data.length;
    
    return {
      totalEntradas,
      totalSaidas,
      saldoFinal,
      maxEntradas,
      maxSaidas,
      minSaldo,
      mesPicoEntradas,
      mesPicoSaidas,
      mediaEntradas,
      mediaSaidas,
    };
  }, [data]);

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

  if (!data || data.length === 0 || !stats) {
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

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer config={chartConfig} className={expanded ? "h-[500px] w-full" : "h-80 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <defs>
            {/* Professional green gradient for entries */}
            <linearGradient id="gradientEntradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.5} />
              <stop offset="50%" stopColor="hsl(142, 76%, 40%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.05} />
            </linearGradient>
            {/* Professional red gradient for exits */}
            <linearGradient id="gradientSaidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.5} />
              <stop offset="50%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(0, 72%, 60%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--muted-foreground))" 
            strokeOpacity={0.15}
            vertical={false}
          />
          
          <XAxis 
            dataKey="mes" 
            tick={{ fontSize: expanded ? 13 : 11, fill: 'hsl(var(--muted-foreground))' }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.5 }}
            dy={10}
          />
          
          <YAxis 
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value.toString();
            }}
            tick={{ fontSize: expanded ? 12 : 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          
          {/* Reference line at zero */}
          <ReferenceLine 
            y={0} 
            stroke="hsl(var(--muted-foreground))" 
            strokeOpacity={0.5}
            strokeDasharray="4 4"
          />
          
          <Tooltip 
            content={<CustomTooltip data={data} />}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.3, strokeDasharray: '4 4' }}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
          />
          
          {/* Area for entries - linear curves */}
          <Area
            type="linear"
            dataKey="entradas"
            stroke="hsl(142, 76%, 36%)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#gradientEntradas)"
            name="Entradas"
            dot={(props) => (
              <PeakDot 
                {...props} 
                dataKey="entradas" 
                maxValue={stats.maxEntradas} 
                color="hsl(142, 76%, 36%)" 
              />
            )}
            activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: 'hsl(142, 76%, 36%)' }}
          />
          
          {/* Area for exits - linear curves */}
          <Area
            type="linear"
            dataKey="saidas"
            stroke="hsl(0, 72%, 51%)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#gradientSaidas)"
            name="Saídas"
            dot={(props) => (
              <PeakDot 
                {...props} 
                dataKey="saidas" 
                maxValue={stats.maxSaidas} 
                color="hsl(0, 72%, 51%)" 
              />
            )}
            activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: 'hsl(0, 72%, 51%)' }}
          />
          
          {/* Dashed line for accumulated balance */}
          <Line
            type="linear"
            dataKey="saldo"
            stroke="hsl(217, 91%, 60%)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            name="Saldo Acumulado"
            activeDot={{ r: 5, stroke: 'white', strokeWidth: 2, fill: 'hsl(217, 91%, 60%)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const Summary = () => (
    <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Saldo acumulado:</span>
        <span className={`font-bold text-lg ${stats.saldoFinal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {formatCurrency(stats.saldoFinal)}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Média entradas: <span className="text-emerald-600 font-medium">{formatCurrency(stats.mediaEntradas)}/mês</span></span>
        <span>Média saídas: <span className="text-red-600 font-medium">{formatCurrency(stats.mediaSaidas)}/mês</span></span>
      </div>
    </div>
  );

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {title}
                </CardTitle>
                <CardDescription>Últimos {months} meses de movimentações</CardDescription>
              </div>
              <TooltipProvider>
                <UITooltip>
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
                </UITooltip>
              </TooltipProvider>
            </div>
            
            {/* Stats badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total: {formatCurrency(stats.totalEntradas)}
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50/50 dark:bg-red-950/20">
                <TrendingDown className="h-3 w-3 mr-1" />
                Total: {formatCurrency(stats.totalSaidas)}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20">
                <BarChart3 className="h-3 w-3 mr-1" />
                Pico: {stats.mesPicoSaidas} ({formatCurrency(stats.maxSaidas)})
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ChartContent expanded={false} />
          <Summary />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                Entradas: {formatCurrency(stats.totalEntradas)}
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50/50 dark:bg-red-950/20">
                <TrendingDown className="h-3 w-3 mr-1" />
                Saídas: {formatCurrency(stats.totalSaidas)}
              </Badge>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                <BarChart3 className="h-3 w-3 mr-1" />
                Pico Entrada: {stats.mesPicoEntradas}
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50/50 dark:bg-red-950/20">
                <BarChart3 className="h-3 w-3 mr-1" />
                Pico Saída: {stats.mesPicoSaidas}
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
