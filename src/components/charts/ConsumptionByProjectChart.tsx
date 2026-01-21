import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Flame } from "lucide-react";
import { useConsumptionByProject } from "@/hooks/useMaterialChartData";
import { Badge } from "@/components/ui/badge";

interface ConsumptionByProjectChartProps {
  title?: string;
}

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 76%, 36%)",
  "hsl(45, 93%, 47%)",
  "hsl(280, 65%, 60%)",
  "hsl(0, 84%, 60%)",
  "hsl(190, 90%, 50%)",
  "hsl(320, 70%, 55%)",
  "hsl(100, 60%, 45%)",
];

const chartConfig = {
  total_consumido: {
    label: "Total Consumido",
  },
};

export function ConsumptionByProjectChart({ title = "Consumo por Projeto" }: ConsumptionByProjectChartProps) {
  const { data, isLoading } = useConsumptionByProject();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Sem dados de consumo de materiais
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalConsumo = data.reduce((sum, d) => sum + d.total_consumido, 0);

  // Prepare data for pie chart
  const pieData = data.map((d, i) => ({
    ...d,
    name: d.projeto_nome.length > 15 ? d.projeto_nome.substring(0, 15) + '...' : d.projeto_nome,
    fullName: d.projeto_nome,
    value: d.total_consumido,
    fill: COLORS[i % COLORS.length],
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>Distribuição de consumo entre obras</CardDescription>
          </div>
          <Badge variant="outline">
            Total: {totalConsumo.toLocaleString()} un.
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                innerRadius={40}
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.fullName}</p>
                      <p className="text-sm">
                        Consumido: <span className="font-bold">{data.total_consumido.toLocaleString()}</span> un.
                      </p>
                      <p className="text-sm">
                        Materiais: <span className="font-bold">{data.materiais_diferentes}</span> tipos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.percentual.toFixed(1)}% do total
                      </p>
                    </div>
                  );
                }}
              />
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry: any) => (
                  <span className="text-xs">{entry.payload.name}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Stats grid */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.slice(0, 4).map((project, i) => (
            <div key={project.projeto_id} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="text-xs text-muted-foreground truncate" title={project.projeto_nome}>
                {project.projeto_nome.length > 12 ? project.projeto_nome.substring(0, 12) + '...' : project.projeto_nome}
              </div>
              <div className="font-bold text-sm">{project.total_consumido.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
