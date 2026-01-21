import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { PieChart as PieChartIcon, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCostCenterUtilization } from "@/hooks/useFinancialChartData";
import { Badge } from "@/components/ui/badge";

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

const getBarColor = (status: string, percentual: number) => {
  if (status === 'critico' || percentual >= 90) return "hsl(0, 84%, 60%)";
  if (status === 'atencao' || percentual >= 70) return "hsl(45, 93%, 47%)";
  return "hsl(142, 76%, 36%)";
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

  const criticalCount = data.filter(d => d.status === 'critico').length;
  const warningCount = data.filter(d => d.status === 'atencao').length;
  const totalOrcamento = data.reduce((sum, d) => sum + d.orcamento, 0);
  const totalGasto = data.reduce((sum, d) => sum + d.gasto, 0);

  // Take top 8 for visualization
  const chartData = data.slice(0, 8).map(d => ({
    ...d,
    nome: d.nome.length > 15 ? d.nome.substring(0, 15) + '...' : d.nome,
    nomeCompleto: d.nome,
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
            <CardDescription>
              {criticalCount > 0 && (
                <span className="text-red-600">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  {criticalCount} centro(s) crítico(s)
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-yellow-600 ml-2">
                  {warningCount} em atenção
                </span>
              )}
            </CardDescription>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Utilização Total</div>
            <div className="font-bold">
              {totalOrcamento > 0 ? ((totalGasto / totalOrcamento) * 100).toFixed(1) : 0}%
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
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                      <p className="text-sm font-bold">Utilização: {data.percentual.toFixed(1)}%</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="percentual" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status, entry.percentual)} />
                ))}
                <LabelList 
                  dataKey="percentual" 
                  position="right" 
                  formatter={(value: number) => `${value.toFixed(0)}%`}
                  style={{ fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Normal (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Atenção (70-90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Crítico (&gt;90%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
