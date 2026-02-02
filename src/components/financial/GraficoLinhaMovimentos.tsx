import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Brush } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, ZoomOut } from "lucide-react";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface MovimentoData {
  data_movimento: string;
  tipo_movimento: string;
  valor: number;
}

interface GraficoLinhaMovimentosProps {
  movimentos: MovimentoData[];
}

export function GraficoLinhaMovimentos({ movimentos }: GraficoLinhaMovimentosProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined);
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined);

  // Agrupar movimentos por data
  const dadosAgrupados = movimentos.reduce((acc, mov) => {
    const data = format(new Date(mov.data_movimento), "dd/MM", { locale: pt });
    
    if (!acc[data]) {
      acc[data] = { data, entradas: 0, saidas: 0, saldo: 0 };
    }
    
    if (mov.tipo_movimento === "entrada") {
      acc[data].entradas += mov.valor;
    } else {
      acc[data].saidas += mov.valor;
    }
    
    return acc;
  }, {} as Record<string, { data: string; entradas: number; saidas: number; saldo: number }>);

  // Calcular saldo acumulado
  const dados = Object.values(dadosAgrupados).map((item, index, array) => {
    const saldoAnterior = index > 0 ? array[index - 1].saldo : 0;
    item.saldo = saldoAnterior + item.entradas - item.saidas;
    return item;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "+";
    
    if (absValue >= 1000000) {
      return `${sign}${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${sign}${(absValue / 1000).toFixed(0)}K`;
    }
    return `${sign}${absValue.toFixed(0)}`;
  };

  const CustomSaldoLabel = (props: any) => {
    const { x, y, width, value } = props;
    const saldoColor = value >= 0 ? "hsl(var(--chart-3))" : "hsl(var(--chart-2))";
    
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill={saldoColor}
        textAnchor="middle"
        fontSize={12}
        fontWeight="600"
      >
        {formatCompactCurrency(value)}
      </text>
    );
  };

  const handleBrushChange = useCallback((newIndex: { startIndex?: number; endIndex?: number }) => {
    setBrushStartIndex(newIndex.startIndex);
    setBrushEndIndex(newIndex.endIndex);
  }, []);

  const handleResetZoom = useCallback(() => {
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
  }, []);

  const isZoomed = brushStartIndex !== undefined || brushEndIndex !== undefined;
  const defaultStartIndex = Math.max(0, dados.length - 15);

  const ChartContent = ({ height }: { height: number }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={dados} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="data" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          tickFormatter={(value) => formatCompactCurrency(value)}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: "10px" }}
          iconType="rect"
        />
        <Bar
          dataKey="entradas"
          fill="hsl(var(--chart-3))"
          name="Entradas"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="saidas"
          fill="hsl(var(--chart-2))"
          name="Saídas"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="saldo"
          fill="transparent"
          name="Saldo"
        >
          <LabelList content={CustomSaldoLabel} />
        </Bar>
        <Brush
          dataKey="data"
          height={30}
          stroke="hsl(var(--primary))"
          fill="hsl(var(--muted))"
          travellerWidth={10}
          startIndex={brushStartIndex ?? defaultStartIndex}
          endIndex={brushEndIndex ?? dados.length - 1}
          onChange={handleBrushChange}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução Temporal - Entradas, Saídas e Saldo</CardTitle>
            <div className="flex items-center gap-2">
              {isZoomed && (
                <TooltipProvider>
                  <TooltipUI>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        onClick={handleResetZoom}
                      >
                        <ZoomOut className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voltar à vista completa</p>
                    </TooltipContent>
                  </TooltipUI>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <TooltipUI>
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
                </TooltipUI>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">
            Arraste as extremidades da barra inferior para ampliar um período específico
          </p>
          <ChartContent height={400} />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evolução Temporal - Entradas, Saídas e Saldo</DialogTitle>
          </DialogHeader>
          <div className="h-[500px]">
            <ChartContent height={500} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
