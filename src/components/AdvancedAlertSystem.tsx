import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIntegratedDashboard } from "@/hooks/useIntegratedDashboard";
import { useOptimizedPurchaseBreakdown } from "@/hooks/useOptimizedPurchaseBreakdown";
import { formatCurrency } from "@/utils/formatters";
import { AlertTriangle, TrendingDown, Clock, DollarSign, ShieldAlert } from "lucide-react";

interface AdvancedAlertSystemProps {
  projectId: number;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  value?: string;
  icon: React.ReactNode;
}

export function AdvancedAlertSystem({ projectId }: AdvancedAlertSystemProps) {
  const { data: dashboardData } = useIntegratedDashboard(projectId);
  const { data: purchaseBreakdown } = useOptimizedPurchaseBreakdown(projectId);

  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    if (!dashboardData || !purchaseBreakdown) return alerts;

    // 1. Alertas de Limite Excedido
    const limitesExcedidos = dashboardData.filter(item => item.limite_excedido);
    if (limitesExcedidos.length > 0) {
      alerts.push({
        id: 'limite-excedido',
        type: 'critical',
        title: 'Limite de Gastos Excedido',
        description: `${limitesExcedidos.length} categoria(s) excedem o limite: ${limitesExcedidos.map(item => item.categoria).join(', ')}`,
        icon: <ShieldAlert className="h-4 w-4" />
      });
    }

    // 2. Alertas de Desvio Orçamentário
    const categoriasComDesvio = dashboardData.filter(item => 
      item.valor_orcamentado > 0 && item.percentual_execucao > 110
    );
    if (categoriasComDesvio.length > 0) {
      alerts.push({
        id: 'desvio-orcamentario',
        type: 'warning',
        title: 'Desvio Orçamentário Detectado',
        description: `${categoriasComDesvio.length} categoria(s) com execução acima de 110% do orçamento`,
        icon: <TrendingDown className="h-4 w-4" />
      });
    }

    // 3. Alertas de Baixa Taxa de Aprovação
    const categoriasComBaixaAprovacao = purchaseBreakdown.filter(item => 
      item.percentual_aprovacao < 50 && item.total_requisicoes > 2
    );
    if (categoriasComBaixaAprovacao.length > 0) {
      alerts.push({
        id: 'baixa-aprovacao',
        type: 'warning',
        title: 'Taxa de Aprovação Baixa',
        description: `${categoriasComBaixaAprovacao.length} categoria(s) com aprovação abaixo de 50%`,
        icon: <Clock className="h-4 w-4" />
      });
    }

    // 4. Alertas de Valor Pendente Alto
    const totalPendente = purchaseBreakdown.reduce((sum, item) => sum + item.valor_pendente, 0);
    const totalAprovado = purchaseBreakdown.reduce((sum, item) => sum + item.valor_aprovado, 0);
    const percentualPendente = totalAprovado > 0 ? (totalPendente / (totalPendente + totalAprovado)) * 100 : 0;

    if (percentualPendente > 30) {
      alerts.push({
        id: 'valor-pendente-alto',
        type: 'info',
        title: 'Alto Valor Pendente de Aprovação',
        description: `${percentualPendente.toFixed(1)}% do valor total está pendente de aprovação`,
        value: formatCurrency(totalPendente),
        icon: <DollarSign className="h-4 w-4" />
      });
    }

    // 5. Alertas de Concentração de Gastos
    const totalGastos = dashboardData.reduce((sum, item) => sum + item.valor_gasto, 0);
    const categoriaComMaiorGasto = dashboardData.reduce((max, item) => 
      item.valor_gasto > max.valor_gasto ? item : max, dashboardData[0]
    );

    if (totalGastos > 0 && categoriaComMaiorGasto && categoriaComMaiorGasto.valor_gasto > 0) {
      const percentualConcentracao = (categoriaComMaiorGasto.valor_gasto / totalGastos) * 100;
      if (percentualConcentracao > 60) {
        alerts.push({
          id: 'concentracao-gastos',
          type: 'info',
          title: 'Concentração de Gastos',
          description: `${percentualConcentracao.toFixed(1)}% dos gastos estão concentrados em "${categoriaComMaiorGasto.categoria}"`,
          value: formatCurrency(categoriaComMaiorGasto.valor_gasto),
          icon: <AlertTriangle className="h-4 w-4" />
        });
      }
    }

    return alerts.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.type] - order[b.type];
    });
  };

  const alerts = generateAlerts();

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <ShieldAlert className="h-5 w-5" />
            Sistema de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 text-sm">
            ✅ Nenhum alerta detectado. Todas as métricas financeiras estão dentro dos parâmetros normais.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getAlertVariant = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getAlertColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Sistema de Alertas
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
            <div className="flex items-start gap-3">
              <div className={getAlertColor(alert.type)}>
                {alert.icon}
              </div>
              <div className="flex-1 space-y-1">
                <AlertTitle className="text-sm font-medium">
                  {alert.title}
                </AlertTitle>
                <AlertDescription className="text-sm">
                  {alert.description}
                  {alert.value && (
                    <div className="mt-1 font-medium">
                      Valor: {alert.value}
                    </div>
                  )}
                </AlertDescription>
              </div>
              <Badge 
                variant={
                  alert.type === 'critical' ? 'destructive' : 
                  alert.type === 'warning' ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {alert.type === 'critical' ? 'Crítico' : 
                 alert.type === 'warning' ? 'Atenção' : 'Info'}
              </Badge>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}