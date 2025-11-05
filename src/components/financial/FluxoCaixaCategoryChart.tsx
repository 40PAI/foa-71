import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/utils/formatters";
import type { MovimentoFinanceiro } from "@/types/centroCusto";

interface FluxoCaixaCategoryChartProps {
  movimentos: MovimentoFinanceiro[];
}

// Cores para o gráfico (usando sistema de design)
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function FluxoCaixaCategoryChart({ movimentos }: FluxoCaixaCategoryChartProps) {
  // Agrupar saídas por categoria
  const despesasPorCategoria = movimentos
    .filter((mov) => mov.tipo_movimento === "saida")
    .reduce((acc, mov) => {
      const categoria = mov.categoria || "Sem Categoria";
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += Number(mov.valor);
      return acc;
    }, {} as Record<string, number>);

  // Converter para array e ordenar por valor
  const dados = Object.entries(despesasPorCategoria)
    .map(([categoria, valor]) => ({
      categoria: categoria.length > 25 ? categoria.substring(0, 25) + "..." : categoria,
      valor,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10); // Top 10 categorias

  const totalDespesas = dados.reduce((sum, item) => sum + item.valor, 0);

  const formatCompactCurrency = (value: number) => {
    const absValue = Math.abs(value);
    
    if (absValue >= 1000000) {
      return `${(absValue / 1000000).toFixed(1)}M Kz`;
    } else if (absValue >= 1000) {
      return `${(absValue / 1000).toFixed(0)}K Kz`;
    }
    return `${absValue.toFixed(0)} Kz`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentual = ((data.value / totalDespesas) * 100).toFixed(1);
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.payload.categoria}</p>
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

  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum gasto registrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Gastos por Categoria</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top 10 categorias com maior despesa
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={dados}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={formatCompactCurrency}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="categoria"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
