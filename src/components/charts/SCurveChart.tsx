
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SCurveChartProps {
  data: Array<{
    periodo: string;
    fisico: number;
    financeiro: number;
    tempo: number;
  }>;
}

const chartConfig = {
  fisico: {
    label: "Avanço Físico",
    color: "hsl(var(--chart-1))",
  },
  financeiro: {
    label: "Avanço Financeiro",
    color: "hsl(var(--chart-2))",
  },
  tempo: {
    label: "Avanço Temporal",
    color: "hsl(var(--chart-3))",
  },
};

export function SCurveChart({ data }: SCurveChartProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold">S-Curve: Avanço Físico × Financeiro × Temporal</h3>
      <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="periodo" 
              fontSize={12}
              className="text-xs sm:text-sm"
            />
            <YAxis 
              domain={[0, 100]} 
              fontSize={12}
              className="text-xs sm:text-sm"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="fisico" 
              stroke="var(--color-fisico)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-fisico)", strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="financeiro" 
              stroke="var(--color-financeiro)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-financeiro)", strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="tempo" 
              stroke="var(--color-tempo)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-tempo)", strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
