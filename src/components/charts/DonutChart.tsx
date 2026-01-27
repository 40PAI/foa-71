import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    fill?: string;
    status?: 'pendente' | 'cotacoes' | 'aprovado' | 'oc-gerada' | 'liquidado';
  }>;
  title: string;
}

// Cores fixas do design system para cada índice
const FIXED_COLORS = [
  'hsl(var(--warning))',      // Laranja/Amarelo - Pendentes
  'hsl(var(--chart-2))',      // Azul - Em Aprovação
  'hsl(var(--chart-1))',      // Verde - Aprovadas
  'hsl(var(--chart-3))',      // Roxo
  'hsl(var(--chart-4))',      // Vermelho
  'hsl(var(--chart-5))',      // Outra cor
];

// Mapa de status para cores fixas
const STATUS_COLOR_MAP: Record<string, string> = {
  'pendente': 'hsl(var(--warning))',
  'cotacoes': 'hsl(var(--chart-2))',
  'aprovado': 'hsl(var(--chart-1))',
  'oc-gerada': 'hsl(var(--chart-3))',
  'liquidado': 'hsl(var(--chart-4))',
};

const chartConfig = {
  value: {
    label: "Quantidade",
    color: "hsl(var(--chart-1))",
  },
};

export function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Função determinística para obter cor - sem random!
  const getColor = (entry: typeof data[0], index: number): string => {
    // Prioridade 1: usar fill se fornecido
    if (entry.fill) return entry.fill;
    // Prioridade 2: usar cor baseada no status
    if (entry.status && STATUS_COLOR_MAP[entry.status]) {
      return STATUS_COLOR_MAP[entry.status];
    }
    // Prioridade 3: usar cor fixa baseada no índice
    return FIXED_COLORS[index % FIXED_COLORS.length];
  };

  // Preparar dados com cores fixas para a legenda
  const dataWithColors = data.map((entry, index) => ({
    ...entry,
    fill: getColor(entry, index),
  }));

  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithColors}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={3}
              dataKey="value"
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="font-semibold text-sm">{data.name}</p>
                      <p className="text-xs">
                        {data.value} ({percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
              formatter={(value, entry) => (
                <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="text-center">
        <div className="text-xl sm:text-2xl font-bold">{total}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">Total de Requisições</div>
      </div>
    </div>
  );
}