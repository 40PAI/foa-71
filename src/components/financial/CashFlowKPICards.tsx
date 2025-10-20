import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCashFlowSummary } from "@/hooks/useCashFlow";

interface CashFlowKPICardsProps {
  projectId: number;
}

export function CashFlowKPICards({ projectId }: CashFlowKPICardsProps) {
  const { data: summary, isLoading } = useCashFlowSummary(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const saldo = summary?.saldo || 0;
  const saldoPositivo = saldo >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Entradas */}
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary?.total_entradas || 0)}
              </p>
              {summary && summary.total_movimentos > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.total_movimentos} movimento{summary.total_movimentos !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Saídas */}
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary?.total_saidas || 0)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card className={saldoPositivo ? "border-blue-200 dark:border-blue-800" : "border-red-200 dark:border-red-800"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${
                saldoPositivo 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatCurrency(saldo)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {saldoPositivo ? "Positivo" : "Negativo"}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              saldoPositivo 
                ? "bg-blue-100 dark:bg-blue-900/20" 
                : "bg-red-100 dark:bg-red-900/20"
            }`}>
              <Wallet className={`h-6 w-6 ${
                saldoPositivo 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-red-600 dark:text-red-400"
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
