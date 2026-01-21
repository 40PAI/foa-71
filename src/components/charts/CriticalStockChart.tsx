import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Package, AlertCircle } from "lucide-react";
import { useCriticalStock } from "@/hooks/useMaterialChartData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CriticalStockChartProps {
  title?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critico': return 'text-red-600 bg-red-50 border-red-200';
    case 'baixo': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default: return 'text-green-600 bg-green-50 border-green-200';
  }
};

const getProgressColor = (status: string) => {
  switch (status) {
    case 'critico': return 'bg-red-500';
    case 'baixo': return 'bg-yellow-500';
    default: return 'bg-green-500';
  }
};

export function CriticalStockChart({ title = "Stock Crítico" }: CriticalStockChartProps) {
  const { data, isLoading } = useCriticalStock();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
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
            <Package className="h-5 w-5 text-green-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">Todos os stocks estão em níveis normais!</p>
            <p className="text-sm text-muted-foreground mt-1">Nenhum material abaixo do mínimo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = data.filter(d => d.status === 'critico').length;
  const lowCount = data.filter(d => d.status === 'baixo').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {title}
            </CardTitle>
            <CardDescription>Materiais abaixo do nível mínimo</CardDescription>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
            {lowCount > 0 && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                {lowCount} Baixo{lowCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary gauges */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-xs text-red-600">Crítico (&lt;25%)</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{lowCount}</div>
            <div className="text-xs text-yellow-600">Baixo (25-50%)</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-2xl font-bold">{criticalCount + lowCount}</div>
            <div className="text-xs text-muted-foreground">Total Alertas</div>
          </div>
        </div>

        {/* Materials list */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.map((material) => (
            <div 
              key={material.material_id} 
              className={cn(
                "p-3 rounded-lg border",
                getStatusColor(material.status)
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={material.nome}>
                    {material.nome}
                  </p>
                  <p className="text-xs opacity-75">{material.codigo}</p>
                </div>
                <Badge 
                  variant={material.status === 'critico' ? 'destructive' : 'outline'}
                  className="ml-2 flex-shrink-0"
                >
                  {material.status === 'critico' ? '⚠️ Crítico' : '⚡ Baixo'}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Stock: {material.stock_atual} / {material.stock_minimo}</span>
                  <span>{material.percentual.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all", getProgressColor(material.status))}
                    style={{ width: `${Math.min(material.percentual, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.length > 5 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Mostrando {Math.min(data.length, 15)} de {data.length} materiais em alerta
          </p>
        )}
      </CardContent>
    </Card>
  );
}
