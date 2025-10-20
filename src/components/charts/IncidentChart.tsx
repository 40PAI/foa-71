
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface IncidentChartProps {
  data: Array<{
    mes: string;
    total: number;
    incidente?: number;
    "near-miss"?: number;
  }>;
}

const chartConfig = {
  incidente: {
    label: "Incidentes",
    color: "hsl(var(--chart-6))", // Vermelho
  },
  "near-miss": {
    label: "Near-miss",
    color: "hsl(var(--chart-5))", // Amarelo
  },
};

export function IncidentChart({ data }: IncidentChartProps) {
  const totalIncidents = data.reduce((acc, item) => acc + item.total, 0);
  const incidenteCount = data.reduce((acc, item) => acc + (item.incidente || 0), 0);
  const nearMissCount = data.reduce((acc, item) => acc + (item["near-miss"] || 0), 0);

  const pieData = [
    { name: "Incidentes", value: incidenteCount, color: "hsl(var(--chart-6))" },
    { name: "Near-miss", value: nearMissCount, color: "hsl(var(--chart-5))" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Incidentes por Mês</h3>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="incidente" fill="var(--color-incidente)" />
              <Bar dataKey="near-miss" fill="var(--color-near-miss)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Distribuição por Severidade</h3>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="text-center text-sm text-muted-foreground">
          Total de {totalIncidents} ocorrências
        </div>
      </div>
    </div>
  );
}
