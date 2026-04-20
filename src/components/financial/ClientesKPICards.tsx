import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, TrendingDown, Wallet, Percent, Clock } from "lucide-react";
import { useClientesKPIs } from "@/hooks/useClientes";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatCurrency } from "@/utils/formatters";
import { InfoTooltip, InfoTooltipContent } from "@/components/common/InfoTooltip";
import { KPI_INFO } from "@/lib/kpiDescriptions";

interface ClientesKPICardsProps {
  projectId?: number;
}

export function ClientesKPICards({ projectId }: ClientesKPICardsProps) {
  const { data: kpis, isLoading } = useClientesKPIs(projectId);

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  if (!kpis) return null;

  const cards: Array<{
    title: string;
    value: string;
    icon: typeof Users;
    variant: "default" | "success" | "warning" | "destructive";
    info: InfoTooltipContent;
  }> = [
    {
      title: "Total Clientes",
      value: kpis.total_clientes.toString(),
      icon: Users,
      variant: "default",
      info: KPI_INFO.totalClientes,
    },
    {
      title: "Total Contratado",
      value: formatCurrency(kpis.total_contratado),
      icon: TrendingUp,
      variant: "default",
      info: KPI_INFO.totalContratadoClientes,
    },
    {
      title: "Total Recebido",
      value: formatCurrency(kpis.total_recebido),
      icon: Wallet,
      variant: "success",
      info: KPI_INFO.totalRecebido,
    },
    {
      title: "Saldo a Receber",
      value: formatCurrency(kpis.saldo_receber),
      icon: TrendingDown,
      variant: kpis.saldo_receber > 0 ? "warning" : "default",
      info: KPI_INFO.saldoReceber,
    },
    {
      title: "Taxa de Recebimento",
      value: `${kpis.taxa_recebimento.toFixed(1)}%`,
      icon: Percent,
      variant: kpis.taxa_recebimento >= 80 ? "success" : kpis.taxa_recebimento >= 50 ? "warning" : "destructive",
      info: KPI_INFO.taxaRecebimento,
    },
    {
      title: "Prazo Médio Recebimento",
      value: `${Math.round(kpis.prazo_medio_recebimento)} dias`,
      icon: Clock,
      variant: "default",
      info: KPI_INFO.prazoMedioRecebimento,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">{card.title}</CardTitle>
              <InfoTooltip {...card.info} title={card.info.title || card.title} />
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
