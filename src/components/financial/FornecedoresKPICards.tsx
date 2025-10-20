import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, TrendingUp, TrendingDown, CreditCard, Percent, Clock } from "lucide-react";
import { useFornecedoresKPIs } from "@/hooks/useFornecedores";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatCurrency } from "@/utils/formatters";

interface FornecedoresKPICardsProps {
  projectId?: number;
}

export function FornecedoresKPICards({ projectId }: FornecedoresKPICardsProps) {
  const { data: kpis, isLoading } = useFornecedoresKPIs(projectId);

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  if (!kpis) return null;

  const cards = [
    {
      title: "Total Fornecedores",
      value: kpis.total_fornecedores.toString(),
      icon: Truck,
      variant: "default" as const,
    },
    {
      title: "Total Contratado",
      value: formatCurrency(kpis.total_contratado),
      icon: TrendingUp,
      variant: "default" as const,
    },
    {
      title: "Total Pago",
      value: formatCurrency(kpis.total_pago),
      icon: CreditCard,
      variant: "destructive" as const,
    },
    {
      title: "Saldo a Pagar",
      value: formatCurrency(kpis.saldo_pagar),
      icon: TrendingDown,
      variant: kpis.saldo_pagar > 0 ? "warning" as const : "default" as const,
    },
    {
      title: "Taxa de Pagamento",
      value: `${kpis.taxa_pagamento.toFixed(1)}%`,
      icon: Percent,
      variant: kpis.taxa_pagamento >= 80 ? "warning" as const : kpis.taxa_pagamento >= 50 ? "default" as const : "success" as const,
    },
    {
      title: "Prazo Médio Pagamento",
      value: `${Math.round(kpis.prazo_medio_pagamento)} dias`,
      icon: Clock,
      variant: "default" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
