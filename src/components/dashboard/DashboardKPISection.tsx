import { useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { KPIGrid } from "@/components/common/KPIGrid";
import { formatCurrency } from "@/utils/formatters";
import type { DashboardGeralKPIs } from "@/hooks/useDashboardGeral";

interface DashboardKPISectionProps {
  kpis: DashboardGeralKPIs;
}

export function DashboardKPISection({ kpis }: DashboardKPISectionProps) {
  const kpiItems = useMemo(() => {
    const percentualGasto = kpis.percentual_gasto || 0;
    
    return [
      {
        title: "Total de Projetos",
        value: kpis.total_projetos,
        subtitle: `${kpis.projetos_ativos} ativos`,
        icon: <Building2 className="h-4 w-4" />,
        alert: kpis.projetos_ativos > 0 ? "green" : "yellow"
      },
      {
        title: "Orçamento Total",
        value: formatCurrency(kpis.orcamento_total),
        subtitle: "Todos os projetos",
        icon: <DollarSign className="h-4 w-4" />,
        alert: "green"
      },
      {
        title: "Gasto Total",
        value: formatCurrency(kpis.gasto_total),
        subtitle: `${percentualGasto.toFixed(1)}% do orçamento`,
        icon: percentualGasto > 100 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />,
        alert: percentualGasto > 100 ? "red" : percentualGasto > 90 ? "yellow" : "green"
      },
      {
        title: "Saldo Disponível",
        value: formatCurrency(kpis.saldo_disponivel),
        subtitle: kpis.saldo_disponivel < 0 ? "Acima do orçamento" : "Saldo restante",
        icon: <DollarSign className="h-4 w-4" />,
        alert: kpis.saldo_disponivel < 0 ? "red" : kpis.saldo_disponivel < kpis.orcamento_total * 0.1 ? "yellow" : "green"
      }
    ];
  }, [kpis]);

  return <KPIGrid items={kpiItems} columns={4} />;
}
