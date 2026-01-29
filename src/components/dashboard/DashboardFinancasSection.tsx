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
    name: projeto.nome.length > 20 ? projeto.nome.substring(0, 20) + "..." : projeto.nome,
    value: projeto.gasto,
    status: projeto.percentual_gasto > 110 ? 'critico' as const : projeto.percentual_gasto > 90 ? 'atencao' as const : 'normal' as const
  }));
  const percentualGasto = orcamentoTotal > 0 ? (gastoTotal / orcamentoTotal * 100).toFixed(1) : "0.0";
  return <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-semibold">Finanças</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 border rounded-md bg-muted/30">
            <p className="text-xs text-muted-foreground">Orçamento Total</p>
            <p className="text-lg font-bold">{formatCurrency(orcamentoTotal)}</p>
          </div>
          <div className="p-2.5 border rounded-md bg-muted/30">
            <p className="text-xs text-muted-foreground">Gasto Total</p>
            <p className="text-lg font-bold">{formatCurrency(gastoTotal)}</p>
            <p className="text-xs text-muted-foreground">{percentualGasto}% do orçamento</p>
          </div>
        </div>

        {topProjetosGasto.length > 0 ? (
          <div className="w-full">
            <h3 className="text-xs font-semibold mb-2">Top 5 Projetos por Gasto</h3>
            <div className="w-full">
              <HorizontalBarChart data={chartData} valueFormatter={formatCurrency} />
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4 text-sm">Nenhum dado financeiro disponível</p>
        )}
      </CardContent>
    </Card>;
}