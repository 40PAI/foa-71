import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDREEvolucaoMensal } from "@/hooks/useDREEvolucaoMensal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/skeleton";

interface DREMonthlyEvolutionChartProps {
  projectId: number;
}

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "hsl(var(--chart-2))",
  },
  saidas: {
    label: "Saídas",
    color: "hsl(var(--chart-1))",
  },
};

export function DREMonthlyEvolutionChart({ projectId }: DREMonthlyEvolutionChartProps) {
  const { data: evolucao, isLoading } = useDREEvolucaoMensal(projectId);

  const chartData = evolucao?.map((item) => ({
    periodo: item.periodo,
    entradas: Number(item.receita_cliente),
    saidas: Number(item.custos_totais),
  })) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>Entradas vs Saídas (Últimos 12 meses)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado disponível para os últimos 12 meses
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
        <CardDescription>Entradas vs Saídas (Últimos 12 meses)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="periodo" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                className="text-xs"
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [formatCurrency(Number(value)), ""]}
              />
              <Legend />
              <Bar 
                dataKey="entradas" 
                fill="hsl(var(--chart-2))" 
                name="Entradas"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="saidas" 
                fill="hsl(var(--chart-1))" 
                name="Saídas"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
