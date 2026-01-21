import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { PieChart as PieChartIcon, AlertTriangle, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCostCenterUtilization } from "@/hooks/useFinancialChartData";
import { clampPercentage, formatPercentageWithExcess } from "@/lib/helpers";

interface CostCenterUtilizationChartProps {
  projectId?: number;
  title?: string;
}

const chartConfig = {
  gasto: {
    label: "Gasto",
    color: "hsl(217, 91%, 60%)",
  },
};

const getBarColor = (percentual: number) => {
  if (percentual >= 100) return "hsl(0, 84%, 50%)"; // Exceeded - darker red
  if (percentual >= 90) return "hsl(0, 84%, 60%)"; // Critical
  if (percentual >= 70) return "hsl(45, 93%, 47%)"; // Warning
  return "hsl(142, 76%, 36%)"; // Normal
};

export function CostCenterUtilizationChart({ projectId, title = "Utilização por Centro de Custo" }: CostCenterUtilizationChartProps) {
  const { data, isLoading } = useCostCenterUtilization(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
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
            <PieChartIcon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Sem dados de centros de custo
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = data.filter(d => d.percentual >= 90).length;
  const exceededCount = data.filter(d => d.percentual >= 100).length;
  const warningCount = data.filter(d => d.percentual >= 70 && d.percentual < 90).length;
  const totalOrcamento = data.reduce((sum, d) => sum + d.orcamento, 0);
  const totalGasto = data.reduce((sum, d) => sum + d.gasto, 0);
  const totalUtilizacao = totalOrcamento > 0 ? (totalGasto / totalOrcamento) * 100 : 0;

  // Take top 8 for visualization, with clamped percentages for the bar
  const chartData = data.slice(0, 8).map(d => ({
    ...d,
    nome: d.nome.length > 15 ? d.nome.substring(0, 15) + '...' : d.nome,
    nomeCompleto: d.nome,
    percentualVisual: clampPercentage(d.percentual), // Clamped for bar width
    percentualReal: d.percentual, // Real value for display
    excedido: d.percentual >= 100,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-2 mt-1">
              {exceededCount > 0 && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {exceededCount} excedido(s)
                </span>
              )}
              {criticalCount > 0 && criticalCount !== exceededCount && (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {criticalCount - exceededCount} crítico(s)
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-yellow-600">
                  {warningCount} em atenção
                </span>
              )}
            </CardDescription>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Utilização Total</div>
            <div className={`font-bold ${totalUtilizacao >= 100 ? 'text-destructive' : totalUtilizacao >= 90 ? 'text-red-600' : ''}`}>
              {formatPercentageWithExcess(totalUtilizacao, 1)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                type="category" 
                dataKey="nome" 
                width={100}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.nomeCompleto}</p>
                      <p className="text-sm">Orçamento: {formatCurrency(data.orcamento)}</p>
                      <p className="text-sm">Gasto: {formatCurrency(data.gasto)}</p>
                      <p className={`text-sm font-bold ${data.excedido ? 'text-destructive' : ''}`}>
                        Utilização: {formatPercentageWithExcess(data.percentualReal, 1)}
                      </p>
                      {data.excedido && (
                        <p className="text-xs text-destructive mt-1">
                          ⚠️ Orçamento excedido em {formatCurrency(data.gasto - data.orcamento)}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="percentualVisual" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.percentualReal)} />
                ))}
                <LabelList 
                  dataKey="percentualReal" 
                  position="right" 
                  formatter={(value: number) => value >= 100 ? `${clampPercentage(value)}%+` : `${value.toFixed(0)}%`}
                  style={{ fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
            <span>Normal (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} />
            <span>Atenção (70-90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
            <span>Crítico (90-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 84%, 50%)" }} />
            <span>Excedido (&gt;100%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
