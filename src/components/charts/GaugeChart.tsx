
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface GaugeChartProps {
  value: number;
  title: string;
  unit?: string;
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--chart-1))",
  },
  remaining: {
    label: "Restante",
    color: "hsl(var(--muted))",
  },
};

export function GaugeChart({ value, title, unit = "%" }: GaugeChartProps) {
  const data = [
    { name: "value", value: Math.min(value, 100) },
    { name: "remaining", value: Math.max(100 - value, 0) }
  ];

  const getColor = (value: number) => {
    if (value >= 85) return "hsl(var(--color-excelente))";     /* Verde escuro >85% */
    if (value >= 70) return "hsl(var(--color-bom))";           /* Verde médio 70-85% */
    if (value >= 50) return "hsl(var(--color-atencao))";       /* Amarelo 50-70% */
    return "hsl(var(--color-critico))";                        /* Vermelho <50% */
  };

  const getGradient = (value: number) => {
    if (value >= 85) return "var(--gradient-success)";
    if (value >= 70) return "var(--gradient-warning)";
    return "var(--gradient-danger)";
  };

  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] lg:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
            >
              <Cell fill={getColor(value)} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="text-center">
        <div 
          className="text-xl sm:text-2xl font-bold animate-pulse" 
          style={{ 
            color: getColor(value),
            background: getGradient(value),
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {value.toFixed(1)}{unit}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {value >= 85 ? "Excelente" : value >= 70 ? "Bom" : "Precisa Melhorar"}
        </div>
      </div>
    </div>
  );
}
