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
      <CardHeader>
        <CardTitle className="text-responsive-xl">Finanças</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">Orçamento Total</p>
            <p className="text-2xl font-bold">{formatCurrency(orcamentoTotal)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">Gasto Total</p>
            <p className="text-2xl font-bold">{formatCurrency(gastoTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{percentualGasto}% do orçamento</p>
          </div>
        </div>

        {topProjetosGasto.length > 0 ? <div>
            <h3 className="text-sm font-semibold mb-3">Top 5 Projetos por Gasto</h3>
            <HorizontalBarChart data={chartData} valueFormatter={formatCurrency} />
          </div> : <p className="text-center text-muted-foreground py-8">Nenhum dado financeiro disponível</p>}
      </CardContent>
    </Card>;
}