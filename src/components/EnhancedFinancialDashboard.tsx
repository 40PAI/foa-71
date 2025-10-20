import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIntegratedDashboard } from "@/hooks/useIntegratedDashboard";
import { formatCurrency } from "@/utils/formatters";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { StackedBarChart } from "./charts/StackedBarChart";
import { AdvancedAlertSystem } from "./AdvancedAlertSystem";

interface EnhancedFinancialDashboardProps {
  projectId: number;
}

export function EnhancedFinancialDashboard({ projectId }: EnhancedFinancialDashboardProps) {
  const { data: dashboardData, isLoading } = useIntegratedDashboard(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!dashboardData || dashboardData.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nenhum dado financeiro encontrado para este projeto.
        </AlertDescription>
      </Alert>
    );
  }

  const totalOrcamentado = dashboardData.reduce((sum, item) => sum + item.valor_orcamentado, 0);
  const totalGasto = dashboardData.reduce((sum, item) => sum + item.valor_gasto, 0);
  const totalPendente = dashboardData.reduce((sum, item) => sum + item.valor_pendente, 0);
  const limitesExcedidos = dashboardData.filter(item => item.limite_excedido);

  // Dados para gráfico de barras empilhadas
  const chartData = dashboardData.map(item => ({
    categoria: item.categoria,
    orcamentado: item.valor_orcamentado,
    gasto: item.valor_gasto,
    desvio: item.valor_gasto - item.valor_orcamentado,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico': return 'destructive';
      case 'Atenção': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Crítico': return <TrendingDown className="h-4 w-4" />;
      case 'Atenção': return <AlertTriangle className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sistema de Alertas Avançado */}
      <AdvancedAlertSystem projectId={projectId} />
      {/* Alertas de Limite Excedido */}
      {limitesExcedidos.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alerta:</strong> {limitesExcedidos.length} categoria(s) excedem o limite de gastos do projeto:
            {limitesExcedidos.map(item => ` ${item.categoria}`).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçamentado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOrcamentado)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGasto)}</div>
            <p className="text-xs text-muted-foreground">
              {totalOrcamentado > 0 ? ((totalGasto / totalOrcamentado) * 100).toFixed(1) : 0}% do orçamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente Aprovação</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPendente)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.max(0, totalOrcamentado - totalGasto - totalPendente))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras Comparativo */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Orçado vs Gasto por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <StackedBarChart 
            data={chartData} 
            title="Análise Financeira por Categoria"
          />
        </CardContent>
      </Card>

      {/* Detalhamento por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardData.map((item) => (
          <Card key={item.categoria} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.categoria}</CardTitle>
              <Badge variant={getStatusColor(item.status_alerta) as any}>
                {getStatusIcon(item.status_alerta)}
                {item.status_alerta}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Orçamentado:</span>
                  <span className="font-medium">{formatCurrency(item.valor_orcamentado)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gasto:</span>
                  <span className="font-medium">{formatCurrency(item.valor_gasto)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pendente:</span>
                  <span className="font-medium">{formatCurrency(item.valor_pendente)}</span>
                </div>
                
                <Progress 
                  value={item.percentual_execucao} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.percentual_execucao.toFixed(1)}% executado</span>
                  <span>
                    {item.valor_orcamentado > 0 
                      ? `${(((item.valor_gasto + item.valor_pendente) / item.valor_orcamentado) * 100).toFixed(1)}% comprometido`
                      : 'N/A'
                    }
                  </span>
                </div>

                {item.limite_excedido && (
                  <Badge variant="destructive" className="w-full justify-center">
                    Limite Excedido
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}