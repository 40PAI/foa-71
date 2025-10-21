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

const getBarColor = (status?: string) => {
  switch (status) {
    case 'critico':
      return 'hsl(var(--destructive))';
    case 'atencao':
      return 'hsl(var(--warning))';
    default:
      return 'hsl(var(--chart-1))';
  }
};

export function HorizontalBarChart({ 
  data, 
  title, 
  valueFormatter = formatCurrency 
}: HorizontalBarChartProps) {
  return (
    <div className="space-y-2">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={valueFormatter} />
            <YAxis type="category" dataKey="name" width={90} />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [valueFormatter(Number(value)), ""]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
