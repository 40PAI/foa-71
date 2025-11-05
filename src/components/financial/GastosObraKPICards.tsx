import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Wallet, Coins } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { GastoObraSummary } from "@/hooks/useGastosObra";
interface GastosObraKPICardsProps {
  summary: GastoObraSummary;
  isLoading: boolean;
}
export function GastosObraKPICards({
  summary,
  isLoading
}: GastosObraKPICardsProps) {
  const totalEntradas = summary.total_recebimento_foa + summary.total_fof_financiamento + summary.total_foa_auto;
  const saldoPositivo = summary.saldo_atual >= 0;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recebimento FOA</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? "..." : formatCurrency(summary.total_recebimento_foa)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Cliente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FOF Financiamento</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {isLoading ? "..." : formatCurrency(summary.total_fof_financiamento)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Financiamento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FOA Auto Financiamento</CardTitle>
          <Coins className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {isLoading ? "..." : formatCurrency(summary.total_foa_auto)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Auto</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {isLoading ? "..." : formatCurrency(summary.total_saidas)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Saídas</p>
        </CardContent>
      </Card>

      <Card className={saldoPositivo ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <Wallet className={`h-4 w-4 ${saldoPositivo ? "text-green-600" : "text-red-600"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldoPositivo ? "text-green-600" : "text-red-600"}`}>
            {isLoading ? "..." : formatCurrency(summary.saldo_atual)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{summary.total_movimentos} movimentos</p>
        </CardContent>
      </Card>
    </div>;
}