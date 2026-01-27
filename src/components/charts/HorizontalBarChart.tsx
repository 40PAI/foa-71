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
  // Fixed height - max 5 items at 36px each + padding
  const chartHeight = Math.min(data.length, 5) * 36 + 30;
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data.slice(0, 5)} 
            layout="vertical" 
            margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={valueFormatter} 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={90}
              className="text-xs"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [valueFormatter(Number(value)), ""]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {data.slice(0, 5).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index, entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
