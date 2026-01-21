import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { useMaterialMovements } from "@/hooks/useMaterialMovements";

interface DashboardArmazemSectionProps {
  onOpenAnalytics?: () => void;
}

export function DashboardArmazemSection({ onOpenAnalytics }: DashboardArmazemSectionProps) {
  const { data: materials, isLoading: loadingMaterials } = useMaterialsArmazem();
  const { data: movements, isLoading: loadingMovements } = useMaterialMovements();

  if (loadingMaterials || loadingMovements) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-muted-foreground">
            Carregando dados do armazém...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate KPIs
  const totalMaterials = materials?.length || 0;
  const totalStock = materials?.reduce((sum, m) => sum + (m.quantidade_stock || 0), 0) || 0;
  
  // Critical stock (less than 20% of assumed minimum of 50 units)
  const criticalItems = materials?.filter(m => (m.quantidade_stock || 0) < 10) || [];
  const lowStockItems = materials?.filter(m => (m.quantidade_stock || 0) >= 10 && (m.quantidade_stock || 0) < 30) || [];
  
  // Recent movements
  const recentMovements = movements?.slice(0, 5) || [];
  
  // Movement summary (last 30 days)
  const entradas = movements?.filter(m => m.tipo_movimentacao === 'entrada').length || 0;
  const saidas = movements?.filter(m => m.tipo_movimentacao === 'saida').length || 0;
  const consumos = movements?.filter(m => m.tipo_movimentacao === 'consumo').length || 0;

  const healthPercentage = totalMaterials > 0 
    ? Math.round(((totalMaterials - criticalItems.length) / totalMaterials) * 100)
    : 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-responsive-xl flex items-center gap-2">
          <Package className="h-5 w-5" />
          Armazém
        </CardTitle>
        {onOpenAnalytics && (
          <Button variant="outline" size="sm" onClick={onOpenAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Análise
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">Total Materiais</p>
            <p className="text-xl font-bold">{totalMaterials}</p>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">Unidades em Stock</p>
            <p className="text-xl font-bold">{totalStock.toLocaleString()}</p>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              Stock Crítico
            </p>
            <p className="text-xl font-bold text-destructive">{criticalItems.length}</p>
          </div>
          <div className="p-3 border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">Stock Baixo</p>
            <p className="text-xl font-bold text-warning">{lowStockItems.length}</p>
          </div>
        </div>

        {/* Stock Health */}
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Saúde do Stock</p>
            <p className="text-lg font-bold">{healthPercentage}%</p>
          </div>
          <Progress 
            value={healthPercentage} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {totalMaterials - criticalItems.length} de {totalMaterials} materiais com stock adequado
          </p>
        </div>

        {/* Movement Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 border rounded-lg bg-card text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-chart-1 mb-1" />
            <p className="text-lg font-bold text-chart-1">{entradas}</p>
            <p className="text-xs text-muted-foreground">Entradas</p>
          </div>
          <div className="p-3 border rounded-lg bg-card text-center">
            <TrendingDown className="h-4 w-4 mx-auto text-destructive mb-1" />
            <p className="text-lg font-bold text-destructive">{saidas}</p>
            <p className="text-xs text-muted-foreground">Saídas</p>
          </div>
          <div className="p-3 border rounded-lg bg-card text-center">
            <Package className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-primary">{consumos}</p>
            <p className="text-xs text-muted-foreground">Consumos</p>
          </div>
        </div>

        {/* Critical Items Alert */}
        {criticalItems.length > 0 && (
          <div className="p-3 border border-destructive/50 rounded-lg bg-destructive/5">
            <p className="text-sm font-medium text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Materiais em Stock Crítico
            </p>
            <div className="flex flex-wrap gap-2">
              {criticalItems.slice(0, 5).map((item) => (
                <Badge key={item.id} variant="destructive" className="text-xs">
                  {item.nome_material} ({item.quantidade_stock} un)
                </Badge>
              ))}
              {criticalItems.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{criticalItems.length - 5} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Movements */}
        {recentMovements.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Movimentações Recentes</h3>
            <div className="space-y-2">
              {recentMovements.map((mov) => (
                <div 
                  key={mov.id} 
                  className="flex items-center justify-between p-2 border rounded bg-card text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={mov.tipo_movimentacao === 'entrada' ? 'default' : 'secondary'}
                      className="text-xs capitalize"
                    >
                      {mov.tipo_movimentacao}
                    </Badge>
                    <span className="truncate max-w-[150px]">
                      {mov.material?.nome_material || 'Material'}
                    </span>
                  </div>
                  <span className="font-medium">
                    {mov.quantidade} un
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
