import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp, Wallet, TrendingDown, DollarSign } from "lucide-react";
import type { MovimentoFinanceiro } from "@/types/centroCusto";

interface FluxoCaixaKPICardsProps {
  movimentos: MovimentoFinanceiro[];
  isLoading?: boolean;
}

export function FluxoCaixaKPICards({ movimentos, isLoading }: FluxoCaixaKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calcular totais por fonte de financiamento
  const fofFinanciamento = movimentos
    .filter(m => m.tipo_movimento === 'entrada' && m.fonte_financiamento === 'FOF_FIN')
    .reduce((sum, m) => sum + Number(m.valor), 0);
    
  const foaAuto = movimentos
    .filter(m => m.tipo_movimento === 'entrada' && 
                  (m.fonte_financiamento === 'FOA_AUTO' || m.fonte_financiamento === 'REC_FOA'))
    .reduce((sum, m) => sum + Number(m.valor), 0);
    
  const custoTotal = movimentos
    .filter(m => m.tipo_movimento === 'saida')
    .reduce((sum, m) => sum + Number(m.valor), 0);
    
  const saldoAtual = (fofFinanciamento + foaAuto) - custoTotal;

  const totalMovimentos = movimentos.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                FOF Financiamento
              </p>
              <p className="text-xs sm:text-sm lg:text-base font-bold text-blue-600 break-words">
                {formatCurrency(fofFinanciamento)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recebido do FOF
              </p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                FOA Auto
              </p>
              <p className="text-xs sm:text-sm lg:text-base font-bold text-green-600 break-words">
                {formatCurrency(foaAuto)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recursos FOA
              </p>
            </div>
            <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                Custo Total
              </p>
              <p className="text-xs sm:text-sm lg:text-base font-bold text-red-600 break-words">
                {formatCurrency(custoTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total Saídas
              </p>
            </div>
            <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                Saldo Atual
              </p>
              <p className={`text-xs sm:text-sm lg:text-base font-bold break-words ${
                saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(saldoAtual)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalMovimentos} movimentos
              </p>
            </div>
            <DollarSign className={`h-6 w-6 sm:h-8 sm:w-8 shrink-0 ${
              saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'
            }`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
