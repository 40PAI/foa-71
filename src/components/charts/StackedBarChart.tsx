
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/formatters";
import { InfoTooltip, type InfoTooltipContent as InfoTooltipContentType } from "@/components/common/InfoTooltip";

interface StackedBarChartProps {
  data: Array<{
    categoria: string;
    orcamentado: number;
    gasto: number;
    desvio: number;
  }>;
  title: string;
  info?: InfoTooltipContentType;
}

const chartConfig = {
  orcamentado: {
    label: "Orçamentado",
    color: "hsl(var(--chart-1))",
  },
  gasto: {
    label: "Gasto",
    color: "hsl(var(--color-financeiro))",
  },
};

export function StackedBarChart({ data, title, info }: StackedBarChartProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {info && <InfoTooltip {...info} title={info.title || title} />}
      </div>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [formatCurrency(Number(value)), ""]}
            />
            <Legend />
            <Bar dataKey="orcamentado" fill="var(--color-orcamentado)" />
            <Bar dataKey="gasto" fill="var(--color-gasto)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
