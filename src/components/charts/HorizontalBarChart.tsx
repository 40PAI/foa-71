import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/formatters";

interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    status?: 'normal' | 'atencao' | 'critico';
  }>;
  title?: string;
  valueFormatter?: (value: number) => string;
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--chart-1))",
  },
};

// Cores do design system para barras distintas
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const getBarColor = (index: number, status?: string) => {
  // Se tem status crítico ou atenção, usa cores de alerta
  if (status === 'critico') return 'hsl(var(--destructive))';
  if (status === 'atencao') return 'hsl(var(--warning))';
  // Caso contrário, usa cores variadas do design system
  return CHART_COLORS[index % CHART_COLORS.length];
};

export function HorizontalBarChart({ 
  data, 
  title, 
  valueFormatter = formatCurrency 
}: HorizontalBarChartProps) {
  // Calcular altura compacta: barSize + pequeno espaço entre barras
  const barHeight = 18;
  const barGap = 4;
  const chartHeight = Math.max(80, data.length * (barHeight + barGap) + 20);

  return (
    <div className="w-full">
      {title && <h3 className="text-xs font-semibold mb-0.5">{title}</h3>}
      <ChartContainer config={chartConfig} className="w-full" style={{ minHeight: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
            barCategoryGap={barGap}
          >
            <XAxis 
              type="number" 
              tickFormatter={valueFormatter} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 8 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={55}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 8 }}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [valueFormatter(Number(value)), ""]}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={barHeight}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index, entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
