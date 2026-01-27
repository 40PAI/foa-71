import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TimelineChartProps {
  data: Array<{
    periodo: string;
    avanco_linear: number;
    avanco_real: number;
    ppc_semanal: number;
  }>;
  title: string;
}

const chartConfig = {
  avanco_linear: {
    label: "Avanço Linear Esperado",
    color: "hsl(var(--chart-1))",
  },
  avanco_real: {
    label: "Avanço Real (PPC)",
    color: "hsl(var(--color-financeiro))",
  },
  ppc_semanal: {
    label: "PPC Semanal",
    color: "hsl(var(--color-aprovado))",
  },
};

export function TimelineChart({ data, title }: TimelineChartProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      <ChartContainer config={chartConfig} className="h-[280px] sm:h-[350px] lg:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="periodo" 
              fontSize={11}
              className="text-xs"
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
            
            {/* Linha de referência para 80% (meta PPC) */}
            <ReferenceLine y={80} stroke="hsl(var(--chart-4))" strokeDasharray="5 5" label="Meta PPC (80%)" />
            
            <Line 
              type="monotone" 
              dataKey="avanco_linear" 
              stroke="var(--color-avanco_linear)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "var(--color-avanco_linear)", strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="avanco_real" 
              stroke="var(--color-avanco_real)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-avanco_real)", strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="ppc_semanal" 
              stroke="var(--color-ppc_semanal)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-ppc_semanal)", strokeWidth: 2, r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}