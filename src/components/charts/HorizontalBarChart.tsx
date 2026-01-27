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
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <ChartContainer config={chartConfig} className="w-full min-h-[280px] h-auto">
        <ResponsiveContainer width="100%" height={Math.max(280, data.length * 50)}>
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              tickFormatter={valueFormatter} 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              className="text-xs"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [valueFormatter(Number(value)), ""]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
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
