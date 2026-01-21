import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Package, TrendingUp, Maximize2 } from "lucide-react";
import { useTopMaterials } from "@/hooks/useMaterialChartData";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer config={chartConfig} className={expanded ? "h-[500px] w-full" : "h-80 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: expanded ? 30 : 20, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            tick={{ fontSize: expanded ? 12 : 11 }}
          />
          <YAxis 
            type="category" 
            dataKey="nomeDisplay" 
            width={expanded ? 150 : 120}
            tick={{ fontSize: expanded ? 12 : 11 }}
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
              style={{ fontSize: expanded ? 12 : 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  return (
    <>
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
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Package className="h-3 w-3 mr-1" />
                Total: {totalMovimentado.toLocaleString()} un.
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
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Badge variant="outline">
                <Package className="h-3 w-3 mr-1" />
                Total: {totalMovimentado.toLocaleString()} un.
              </Badge>
            </div>
            <ChartContent expanded={true} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
