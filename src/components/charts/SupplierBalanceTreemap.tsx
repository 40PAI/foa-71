import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Treemap, ResponsiveContainer } from "recharts";
import { Users, Maximize2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useSupplierBalancesChart } from "@/hooks/useFinancialChartData";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SupplierBalanceTreemapProps {
  projectId?: number;
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
  "hsl(30, 80%, 55%)",
  "hsl(260, 60%, 50%)",
];

interface CustomContentProps {
  root?: any;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
}

const CustomContent = ({ x = 0, y = 0, width = 0, height = 0, index = 0, name = '', value = 0 }: CustomContentProps) => {
  if (width < 40 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: 'hsl(var(--background))',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
        rx={4}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontWeight="bold"
          >
            {name.length > 12 ? name.substring(0, 12) + '...' : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="white"
            fontSize={10}
            opacity={0.9}
          >
            {formatCurrency(value)}
          </text>
        </>
      )}
    </g>
  );
};

export function SupplierBalanceTreemap({ projectId, title = "Saldos por Fornecedor" }: SupplierBalanceTreemapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useSupplierBalancesChart(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
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
            <Users className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Sem dados de fornecedores
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare treemap data - use absolute values for size
  const treemapData = data.map((d, i) => ({
    name: d.nome,
    size: Math.abs(d.saldo),
    value: d.saldo,
    credito: d.total_credito,
    debito: d.total_debito,
  }));

  const totalAPagar = data.filter(d => d.saldo > 0).reduce((sum, d) => sum + d.saldo, 0);
  const totalAReceber = data.filter(d => d.saldo < 0).reduce((sum, d) => sum + Math.abs(d.saldo), 0);

  const ChartContent = ({ expanded }: { expanded: boolean }) => (
    <div className={expanded ? "h-[450px] w-full" : "h-80 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="hsl(var(--background))"
          content={<CustomContent />}
        >
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                  <p className="font-semibold">{data.name}</p>
                  <p className="text-sm">Crédito: {formatCurrency(data.credito)}</p>
                  <p className="text-sm">Débito: {formatCurrency(data.debito)}</p>
                  <p className={`text-sm font-bold ${data.value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Saldo: {formatCurrency(data.value)}
                  </p>
                </div>
              );
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );

  const SupplierList = () => (
    <div className="mt-4 pt-4 border-t space-y-2 max-h-40 overflow-y-auto">
      {data.slice(0, 5).map((supplier, i) => (
        <div key={supplier.fornecedor_id} className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[i % COLORS.length] }} 
            />
            <span className="truncate max-w-[150px]">{supplier.nome}</span>
          </div>
          <span className={`font-medium ${supplier.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(supplier.saldo)}
          </span>
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
                <Users className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>Top 10 fornecedores por saldo</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-red-600 border-red-300">
                A Pagar: {formatCurrency(totalAPagar)}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                A Receber: {formatCurrency(totalAReceber)}
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
          <SupplierList />
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Badge variant="outline" className="text-red-600 border-red-300">
                A Pagar: {formatCurrency(totalAPagar)}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                A Receber: {formatCurrency(totalAReceber)}
              </Badge>
            </div>
            <ChartContent expanded={true} />
            <SupplierList />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
