import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Activity } from "lucide-react";
import { CashFlowSummary } from "@/types/cashflow";
import { formatCurrency } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface FluxoCaixaKPICardsProps {
  summary?: CashFlowSummary;
  isLoading?: boolean;
}

export function FluxoCaixaKPICards({ summary, isLoading }: FluxoCaixaKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const kpis = [
    {
      title: "Total Entradas",
      value: summary.total_entradas,
      description: "Recebimentos",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Total Saídas",
      value: summary.total_saidas,
      description: "Pagamentos",
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400"
    },
    {
      title: "Saldo Atual",
      value: summary.saldo,
      description: summary.saldo >= 0 ? "Saldo positivo" : "Saldo negativo",
      icon: Wallet,
      color: summary.saldo >= 0 
        ? "text-blue-600 dark:text-blue-400" 
        : "text-red-600 dark:text-red-400"
    },
    {
      title: "Total Movimentos",
      value: summary.total_movimentos,
      description: "Registros",
      icon: Activity,
      color: "text-purple-600 dark:text-purple-400",
      isCount: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </p>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {kpi.isCount ? kpi.value : formatCurrency(kpi.value)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {kpi.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
