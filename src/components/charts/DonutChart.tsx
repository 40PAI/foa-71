import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    status?: 'pendente' | 'cotacoes' | 'aprovado' | 'oc-gerada' | 'liquidado';
  }>;
  title: string;
}

const chartConfig = {
  value: {
    label: "Quantidade",
    color: "hsl(var(--chart-1))",
  },
};

export function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pendente': return 'hsl(var(--color-pendente))';
      case 'cotacoes': return 'hsl(var(--color-cotacoes))';
      case 'aprovado': return 'hsl(var(--color-aprovado))';
      case 'oc-gerada': return 'hsl(var(--color-oc-gerada))';
      case 'liquidado': return 'hsl(var(--color-liquidado))';
      default: return `hsl(var(--chart-${Math.floor(Math.random() * 6) + 1}))`;
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
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