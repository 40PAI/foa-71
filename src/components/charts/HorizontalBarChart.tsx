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
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
      <ChartContainer config={chartConfig} className="w-full min-h-[140px] h-auto">
        <ResponsiveContainer width="100%" height={Math.max(140, data.length * 28)}>
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 5, right: 20, top: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              tickFormatter={valueFormatter} 
              className="text-[10px]"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={85}
              className="text-[10px]"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [valueFormatter(Number(value)), ""]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
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
