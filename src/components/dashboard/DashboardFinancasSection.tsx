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
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-semibold">Finanças</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded bg-muted/30">
            <p className="text-xs text-muted-foreground leading-tight">Orçamento Total</p>
            <p className="text-lg font-bold break-all leading-tight">{formatCurrency(orcamentoTotal)}</p>
          </div>
          <div className="p-3 border rounded bg-muted/30">
            <p className="text-xs text-muted-foreground leading-tight">Gasto Total</p>
            <p className="text-lg font-bold break-all leading-tight">{formatCurrency(gastoTotal)}</p>
            <p className="text-xs text-muted-foreground">{percentualGasto}%</p>
          </div>
        </div>

        {topProjetosGasto.length > 0 ? (
          <div className="w-full">
            <h3 className="text-sm font-semibold mb-2">Top 5 Projetos</h3>
            <div className="w-full">
              <HorizontalBarChart data={chartData} valueFormatter={formatCurrency} />
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-2 text-sm">Sem dados</p>
        )}
      </CardContent>
    </Card>
  );
}