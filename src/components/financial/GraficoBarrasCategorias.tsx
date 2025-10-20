import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MovimentoData {
  categoria: string;
  tipo_movimento: string;
  valor: number;
}

interface GraficoBarrasCategoriasProps {
  movimentos: MovimentoData[];
}

export function GraficoBarrasCategorias({ movimentos }: GraficoBarrasCategoriasProps) {
  // Agrupar despesas por categoria
  const despesasPorCategoria = movimentos
    .filter((mov) => mov.tipo_movimento === "saida")
    .reduce((acc, mov) => {
      if (!acc[mov.categoria]) {
        acc[mov.categoria] = 0;
      }
      acc[mov.categoria] += mov.valor;
      return acc;
    }, {} as Record<string, number>);

  const dados = Object.entries(despesasPorCategoria)
    .map(([categoria, valor]) => ({
      categoria: categoria.length > 20 ? categoria.substring(0, 20) + "..." : categoria,
      valor,
    }))
    .sort((a, b) => b.valor - a.valor);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="categoria"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Legend />
            <Bar
              dataKey="valor"
              fill="hsl(var(--chart-2))"
              name="Valor Gasto"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
