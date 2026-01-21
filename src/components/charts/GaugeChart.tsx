import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GaugeChartProps {
  value: number;
  title: string;
  unit?: string;
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--chart-1))",
  },
  remaining: {
    label: "Restante",
    color: "hsl(var(--muted))",
  },
};

export function GaugeChart({ value, title, unit = "%" }: GaugeChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const data = [
    { name: "value", value: Math.min(value, 100) },
    { name: "remaining", value: Math.max(100 - value, 0) }
  ];

  const getColor = (value: number) => {
    if (value >= 85) return "hsl(var(--color-excelente))";     /* Verde escuro >85% */
    if (value >= 70) return "hsl(var(--color-bom))";           /* Verde médio 70-85% */
    if (value >= 50) return "hsl(var(--color-atencao))";       /* Amarelo 50-70% */
    return "hsl(var(--color-critico))";                        /* Vermelho <50% */
  };

  const getGradient = (value: number) => {
    if (value >= 85) return "var(--gradient-success)";
    if (value >= 70) return "var(--gradient-warning)";
    return "var(--gradient-danger)";
  };

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <ChartContainer config={chartConfig} className={expanded ? "h-[300px]" : "h-[180px] sm:h-[200px] lg:h-[220px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={expanded ? 80 : 50}
            outerRadius={expanded ? 120 : 70}
            dataKey="value"
          >
            <Cell fill={getColor(value)} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const ValueDisplay = ({ expanded }: { expanded: boolean }) => (
    <div className="text-center">
      <div 
        className={`${expanded ? 'text-3xl' : 'text-xl sm:text-2xl'} font-bold animate-pulse`}
        style={{ 
          color: getColor(value),
          background: getGradient(value),
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {value.toFixed(1)}{unit}
      </div>
      <div className={`${expanded ? 'text-base' : 'text-xs sm:text-sm'} text-muted-foreground`}>
        {value >= 85 ? "Excelente" : value >= 70 ? "Bom" : "Precisa Melhorar"}
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
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
        </CardHeader>
        <CardContent className="space-y-2">
          <ChartContent expanded={false} />
          <ValueDisplay expanded={false} />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ChartContent expanded={true} />
            <ValueDisplay expanded={true} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
