import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { formatCurrency } from "@/utils/formatters";
import type { ProjetoGasto } from "@/hooks/useDashboardGeral";
interface DashboardFinancasSectionProps {
  topProjetosGasto: ProjetoGasto[];
  orcamentoTotal: number;
  gastoTotal: number;
}
export function DashboardFinancasSection({
  topProjetosGasto,
  orcamentoTotal,
  gastoTotal
}: DashboardFinancasSectionProps) {
  const chartData = topProjetosGasto.map(projeto => ({
    name: projeto.nome.length > 15 ? projeto.nome.substring(0, 15) + "..." : projeto.nome,
    value: projeto.gasto,
    status: projeto.percentual_gasto > 110 ? 'critico' as const : projeto.percentual_gasto > 90 ? 'atencao' as const : 'normal' as const
  }));
  const percentualGasto = orcamentoTotal > 0 ? (gastoTotal / orcamentoTotal * 100).toFixed(1) : "0.0";
  
  return (
    <Card className="overflow-hidden max-w-md">
      <CardHeader className="py-1 px-1.5">
        <CardTitle className="text-sm font-semibold">Finanças</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-1.5 pb-1.5 pt-0">
        <div className="grid grid-cols-2 gap-1">
          <div className="p-1 border rounded bg-muted/30">
            <p className="text-[10px] text-muted-foreground leading-tight">Orçamento Total</p>
            <p className="text-sm font-bold break-all leading-tight">{formatCurrency(orcamentoTotal)}</p>
          </div>
          <div className="p-1 border rounded bg-muted/30">
            <p className="text-[10px] text-muted-foreground leading-tight">Gasto Total</p>
            <p className="text-sm font-bold break-all leading-tight">{formatCurrency(gastoTotal)}</p>
            <p className="text-[10px] text-muted-foreground">{percentualGasto}%</p>
          </div>
        </div>

        {topProjetosGasto.length > 0 ? (
          <div className="w-full">
            <h3 className="text-xs font-semibold mb-0.5">Top 5 Projetos</h3>
            <div className="w-full">
              <HorizontalBarChart data={chartData} valueFormatter={formatCurrency} />
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-0.5 text-xs">Sem dados</p>
        )}
      </CardContent>
    </Card>
  );
}