import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, TrendingUp, TrendingDown, CreditCard, Percent, Clock } from "lucide-react";
import { useFornecedoresKPIs } from "@/hooks/useFornecedores";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatCurrency } from "@/utils/formatters";
import { InfoTooltip, InfoTooltipContent } from "@/components/common/InfoTooltip";
import { KPI_INFO } from "@/lib/kpiDescriptions";

interface FornecedoresKPICardsProps {
  projectId?: number;
}

export function FornecedoresKPICards({ projectId }: FornecedoresKPICardsProps) {
  const { data: kpis, isLoading } = useFornecedoresKPIs(projectId);

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  if (!kpis) return null;

  const cards: Array<{
    title: string;
    value: string;
    icon: typeof Truck;
    info: InfoTooltipContent;
  }> = [
    {
      title: "Total Fornecedores",
      value: kpis.total_fornecedores.toString(),
      icon: Truck,
      info: KPI_INFO.totalFornecedores,
    },
    {
      title: "Total Contratado",
      value: formatCurrency(kpis.total_contratado),
      icon: TrendingUp,
      info: KPI_INFO.totalContratadoFornecedores,
    },
    {
      title: "Total Pago",
      value: formatCurrency(kpis.total_pago),
      icon: CreditCard,
      info: KPI_INFO.totalPagoFornecedores,
    },
    {
      title: "Saldo a Pagar",
      value: formatCurrency(kpis.saldo_pagar),
      icon: TrendingDown,
      info: KPI_INFO.saldoDevedor,
    },
    {
      title: "Taxa de Pagamento",
      value: `${kpis.taxa_pagamento.toFixed(1)}%`,
      icon: Percent,
      info: KPI_INFO.taxaPagamento,
    },
    {
      title: "Prazo Médio Pagamento",
      value: `${Math.round(kpis.prazo_medio_pagamento)} dias`,
      icon: Clock,
      info: KPI_INFO.prazoMedioPagamento,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">{card.title}</CardTitle>
              <InfoTooltip {...card.info} title={card.title} />
            </div>
            <card.icon className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
