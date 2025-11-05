import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CashFlowMovement } from "@/types/cashflow";
import { formatCurrency } from "@/utils/formatters";

interface FluxoCaixaCategoryChartProps {
  movements: CashFlowMovement[];
}

// Cores do design system
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function FluxoCaixaCategoryChart({ movements }: FluxoCaixaCategoryChartProps) {
  // Agrupar saídas por categoria
  const categoryData = movements
    .filter(m => m.tipo_movimento === 'saida')
    .reduce((acc, m) => {
      const categoria = m.categoria || "Sem Categoria";
      acc[categoria] = (acc[categoria] || 0) + Number(m.valor);
      return acc;
    }, {} as Record<string, number>);

  // Converter para array e ordenar
  const chartData = Object.entries(categoryData)
    .map(([name, value]) => ({
      name: name.length > 25 ? name.substring(0, 25) + "..." : name,
      value: value,
      fullName: name
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 categorias

  const totalDespesas = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum gasto registrado no período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  // Função para formatar valores no eixo Y de forma compacta
  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentual = ((data.value / totalDespesas) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {percentual}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
            <XAxis 
              type="number" 
              tickFormatter={formatCompactCurrency}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={90}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
