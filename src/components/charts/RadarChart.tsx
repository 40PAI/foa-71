import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/formatters";

interface RadarChartProps {
  data: Array<{
    categoria: string;
    orcamentado: number;
    gasto: number;
    maxValue: number;
  }>;
  title: string;
}

const chartConfig = {
  orcamentado: {
    label: "Orçamentado",
    color: "hsl(var(--chart-1))",
  },
  gasto: {
    label: "Gasto Real", 
    color: "hsl(var(--chart-2))",
  },
};

// Mock data for demonstration if no real data is available
const mockData = [
  {
    categoria: "Materiais de Construção",
    orcamentado: 600000,
    gasto: 350000,
    maxValue: 600000
  },
  {
    categoria: "Equipamentos",
    orcamentado: 450000,
    gasto: 280000,
    maxValue: 450000
  },
  {
    categoria: "Ferramentas",
    orcamentado: 300000,
    gasto: 180000,
    maxValue: 300000
  },
  {
    categoria: "Mão de Obra",
    orcamentado: 800000,
    gasto: 520000,
    maxValue: 800000
  }
];

export function RadarChart({ data, title }: RadarChartProps) {
  // Use mock data if no real data is available or if data is empty
  const chartData = data && data.length > 0 ? data : mockData;
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="categoria" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => formatCurrency(value)}
              className="text-muted-foreground"
            />
            <Radar 
              name="Orçamentado" 
              dataKey="orcamentado" 
              stroke="hsl(var(--chart-1))" 
              fill="hsl(var(--chart-1))" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar 
              name="Gasto Real" 
              dataKey="gasto" 
              stroke="hsl(var(--chart-2))" 
              fill="hsl(var(--chart-2))" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [formatCurrency(Number(value)), ""]}
            />
            <Legend />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}