import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Package, TrendingUp } from "lucide-react";
import { useTopMaterials } from "@/hooks/useMaterialChartData";
import { Badge } from "@/components/ui/badge";

interface TopMaterialsChartProps {
  projectId?: number;
  limit?: number;
  title?: string;
}

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(217, 91%, 65%)",
  "hsl(217, 91%, 70%)",
  "hsl(217, 85%, 75%)",
  "hsl(217, 80%, 78%)",
  "hsl(217, 75%, 80%)",
  "hsl(217, 70%, 82%)",
  "hsl(217, 65%, 84%)",
  "hsl(217, 60%, 86%)",
  "hsl(217, 55%, 88%)",
];

const chartConfig = {
  total_movimentado: {
    label: "Quantidade Movimentada",
    color: "hsl(217, 91%, 60%)",
  },
};

export function TopMaterialsChart({ projectId, limit = 10, title = "Top Materiais Movimentados" }: TopMaterialsChartProps) {
  const { data, isLoading } = useTopMaterials(projectId, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
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
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Sem dados de movimentações de materiais
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMovimentado = data.reduce((sum, d) => sum + d.total_movimentado, 0);

  // Prepare chart data with truncated names
  const chartData = data.map(d => ({
    ...d,
    nomeDisplay: d.nome.length > 20 ? d.nome.substring(0, 20) + '...' : d.nome,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>Materiais com maior volume de movimentação</CardDescription>
          </div>
          <Badge variant="outline">
            <Package className="h-3 w-3 mr-1" />
            Total: {totalMovimentado.toLocaleString()} un.
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                type="category" 
                dataKey="nomeDisplay" 
                width={120}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.nome}</p>
                      <p className="text-xs text-muted-foreground">{data.codigo}</p>
                      <p className="text-sm mt-1">
                        <span className="font-bold">{data.total_movimentado.toLocaleString()}</span> {data.unidade}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total_movimentado" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList 
                  dataKey="total_movimentado" 
                  position="right" 
                  formatter={(value: number) => value.toLocaleString()}
                  style={{ fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
