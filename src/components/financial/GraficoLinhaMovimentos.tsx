import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface MovimentoData {
  data_movimento: string;
  tipo_movimento: string;
  valor: number;
}

interface GraficoLinhaMovimentosProps {
  movimentos: MovimentoData[];
}

export function GraficoLinhaMovimentos({ movimentos }: GraficoLinhaMovimentosProps) {
  // Agrupar movimentos por data
  const dadosAgrupados = movimentos.reduce((acc, mov) => {
    const data = format(new Date(mov.data_movimento), "dd/MM", { locale: pt });
    
    if (!acc[data]) {
      acc[data] = { data, entradas: 0, saidas: 0, saldo: 0 };
    }
    
    if (mov.tipo_movimento === "entrada") {
      acc[data].entradas += mov.valor;
    } else {
      acc[data].saidas += mov.valor;
    }
    
    return acc;
  }, {} as Record<string, { data: string; entradas: number; saidas: number; saldo: number }>);

  // Calcular saldo acumulado
  const dados = Object.values(dadosAgrupados).map((item, index, array) => {
    const saldoAnterior = index > 0 ? array[index - 1].saldo : 0;
    item.saldo = saldoAnterior + item.entradas - item.saidas;
    return item;
  });

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
        <CardTitle>Evolução Temporal - Entradas, Saídas e Saldo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
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
            <Line
              type="monotone"
              dataKey="entradas"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              name="Entradas"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="saidas"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Saídas"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              name="Saldo"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
