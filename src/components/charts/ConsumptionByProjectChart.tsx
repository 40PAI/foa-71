import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Flame, Maximize2 } from "lucide-react";
import { useConsumptionByProject } from "@/hooks/useMaterialChartData";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer config={chartConfig} className={expanded ? "h-[450px] w-full" : "h-80 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={expanded ? 140 : 100}
            innerRadius={expanded ? 60 : 40}
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
  );

  const Stats = () => (
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
  );

  return (
    <>
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
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Total: {totalConsumo.toLocaleString()} un.
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsExpanded(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expandir gráfico</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContent expanded={false} />
          <Stats />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Badge variant="outline">
                Total: {totalConsumo.toLocaleString()} un.
              </Badge>
            </div>
            <ChartContent expanded={true} />
            <Stats />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
