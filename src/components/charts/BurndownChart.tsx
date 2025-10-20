
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BurndownChartProps {
  data: Array<{
    tarefa: string;
    planejado: number;
    real: number;
    status: string;
  }>;
}

const chartConfig = {
  planejado: {
    label: "Planejado",
    color: "hsl(var(--chart-1))",
  },
  real: {
    label: "Real",
    color: "hsl(var(--chart-2))",
  },
};

export function BurndownChart({ data }: BurndownChartProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold">Burndown de Tarefas</h3>
      <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tarefa" 
              fontSize={11}
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[0, 100]} 
              fontSize={11}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="planejado" 
              stroke="var(--color-planejado)" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="real" 
              stroke="var(--color-real)" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
