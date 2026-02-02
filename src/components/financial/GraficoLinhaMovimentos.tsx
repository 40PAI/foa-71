import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, ZoomOut, RotateCcw } from "lucide-react";
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

// Constants for zoom
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
const ZOOM_SPEED = 0.15;

export function GraficoLinhaMovimentos({ movimentos }: GraficoLinhaMovimentosProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCenter, setZoomCenter] = useState(1); // Start at the end (most recent data)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const expandedChartRef = useRef<HTMLDivElement>(null);

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

  // Calculate visible range based on zoom level
  const visibleRange = useMemo(() => {
    const totalPoints = dados.length;
    if (totalPoints === 0) return { start: 0, end: 0 };
    
    // How many points to show based on zoom level
    const visiblePoints = Math.max(3, Math.floor(totalPoints / zoomLevel));
    
    // Calculate start and end based on center
    const centerIndex = Math.floor((totalPoints - 1) * zoomCenter);
    const halfVisible = Math.floor(visiblePoints / 2);
    
    let start = Math.max(0, centerIndex - halfVisible);
    let end = Math.min(totalPoints - 1, start + visiblePoints - 1);
    
    // Adjust if we hit the end
    if (end >= totalPoints - 1) {
      end = totalPoints - 1;
      start = Math.max(0, end - visiblePoints + 1);
    }
    
    // Adjust if we hit the start
    if (start <= 0) {
      start = 0;
      end = Math.min(totalPoints - 1, visiblePoints - 1);
    }
    
    return { start, end };
  }, [dados.length, zoomLevel, zoomCenter]);

  // Get visible data slice
  const visibleData = useMemo(() => {
    return dados.slice(visibleRange.start, visibleRange.end + 1);
  }, [dados, visibleRange]);

  // Handle wheel event for zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Determine scroll direction (scroll up = zoom in, scroll down = zoom out)
    const delta = event.deltaY > 0 ? -1 : 1;
    
    setZoomLevel(prev => {
      const newZoom = prev + (delta * ZOOM_SPEED);
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    });
  }, []);

  // Handle horizontal panning when zoomed
  const handlePan = useCallback((event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) return;
    if (zoomLevel <= 1) return;
    if (!event.shiftKey) return;
    
    event.preventDefault();
    
    const panSpeed = 0.05;
    const delta = event.deltaY > 0 ? panSpeed : -panSpeed;
    
    setZoomCenter(prev => Math.max(0, Math.min(1, prev + delta)));
  }, [zoomLevel]);

  // Detect Ctrl key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Attach wheel event to expanded chart container
  useEffect(() => {
    const container = expandedChartRef.current;
    if (!container || !isExpanded) return;
    
    const wheelHandler = (e: WheelEvent) => {
      handleWheel(e);
      handlePan(e);
    };
    
    container.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel, handlePan, isExpanded]);

  // Reset zoom when modal closes
  useEffect(() => {
    if (!isExpanded) {
      setZoomLevel(1);
      setZoomCenter(1);
    }
  }, [isExpanded]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setZoomCenter(1);
  }, []);

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

  const isZoomed = zoomLevel > 1;
  const zoomPercentage = Math.round(zoomLevel * 100);

  const ChartContent = ({ height, data }: { height: number; data: typeof dados }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
      >
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
          isAnimationActive={true}
          animationDuration={300}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="saidas"
          fill="hsl(var(--chart-2))"
          name="Saídas"
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
          animationDuration={300}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="saldo"
          fill="transparent"
          name="Saldo"
          isAnimationActive={true}
          animationDuration={300}
          animationEasing="ease-out"
        >
          <LabelList content={CustomSaldoLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução Temporal - Entradas, Saídas e Saldo</CardTitle>
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
                  <p>Expandir gráfico com zoom interactivo</p>
                </TooltipContent>
              </TooltipUI>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContent height={400} data={dados.slice(Math.max(0, dados.length - 15))} />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>Evolução Temporal - Entradas, Saídas e Saldo</DialogTitle>
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
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Voltar à vista completa</p>
                      </TooltipContent>
                    </TooltipUI>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              💡 Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl</kbd> + scroll para zoom suave • 
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono ml-1">Shift</kbd> + scroll para navegar
            </p>
            
            <div 
              ref={expandedChartRef}
              className="relative h-[500px] transition-all duration-300 ease-out"
              style={{
                cursor: isCtrlPressed 
                  ? (zoomLevel < MAX_ZOOM ? 'zoom-in' : 'zoom-out') 
                  : 'default'
              }}
            >
              {/* Zoom indicator */}
              {isZoomed && (
                <div className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted-foreground border shadow-sm animate-fade-in">
                  <span className="font-medium">🔍 {zoomPercentage}%</span>
                  <span className="ml-2 text-muted-foreground/70">
                    ({visibleData.length}/{dados.length} pontos)
                  </span>
                </div>
              )}
              
              {/* Navigation indicator when zoomed */}
              {isZoomed && dados.length > 0 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
                  <div className="h-1 bg-muted rounded-full overflow-hidden" style={{ width: '120px' }}>
                    <div 
                      className="h-full bg-primary/60 rounded-full transition-all duration-200"
                      style={{
                        width: `${(1 / zoomLevel) * 100}%`,
                        marginLeft: `${zoomCenter * (100 - (1 / zoomLevel) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
              
              <ChartContent height={500} data={visibleData} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
