import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";
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

  const formatCompactCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "+";
    
    if (absValue >= 1000000) {
      return `${sign}${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${sign}${(absValue / 1000).toFixed(0)}K`;
    }
    return `${sign}${absValue.toFixed(0)}`;
  };

  const CustomSaldoLabel = (props: any) => {
    const { x, y, width, value } = props;
    const saldoColor = value >= 0 ? "hsl(var(--chart-3))" : "hsl(var(--chart-2))";
    
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill={saldoColor}
        textAnchor="middle"
        fontSize={12}
        fontWeight="600"
      >
        {formatCompactCurrency(value)}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Temporal - Entradas, Saídas e Saldo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dados} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="data" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => formatCompactCurrency(value)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "10px" }}
              iconType="rect"
            />
            <Bar
              dataKey="entradas"
              fill="hsl(var(--chart-3))"
              name="Entradas"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="saidas"
              fill="hsl(var(--chart-2))"
              name="Saídas"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="saldo"
              fill="transparent"
              name="Saldo"
            >
              <LabelList content={CustomSaldoLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
