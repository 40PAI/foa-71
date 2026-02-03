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
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm font-semibold">Finanças</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 border rounded bg-muted/30">
            <p className="text-[10px] text-muted-foreground leading-tight">Orçamento Total</p>
            <p className="text-sm font-bold break-all leading-tight">{formatCurrency(orcamentoTotal)}</p>
          </div>
          <div className="p-2 border rounded bg-muted/30">
            <p className="text-[10px] text-muted-foreground leading-tight">Gasto Total</p>
            <p className="text-sm font-bold break-all leading-tight">{formatCurrency(gastoTotal)}</p>
            <p className="text-[10px] text-muted-foreground">{percentualGasto}%</p>
          </div>
        </div>

        {topProjetosGasto.length > 0 ? (
          <div className="w-full">
            <h3 className="text-xs font-semibold mb-1">Top 5 Projetos</h3>
            <div className="w-full">
              <HorizontalBarChart data={chartData} valueFormatter={formatCurrency} />
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-1 text-xs">Sem dados</p>
        )}
      </CardContent>
    </Card>
  );
}