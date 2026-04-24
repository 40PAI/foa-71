import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Landmark, Receipt, RefreshCw, PlusCircle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { GastoObraSummary } from "@/hooks/useGastosObra";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { InfoTooltip } from "@/components/common/InfoTooltip";

interface GastosObraKPICardsProps {
  summary: GastoObraSummary;
  isLoading: boolean;
}

export function GastosObraKPICards({
  summary,
  isLoading
}: GastosObraKPICardsProps) {
  const [isEntradasOpen, setIsEntradasOpen] = useState(false);
  const saldoPositivo = summary.saldo_atual >= 0;
  const hasEntradasPorSubtipo = summary.entradas_por_subtipo && (
    summary.entradas_por_subtipo.valor_inicial > 0 ||
    summary.entradas_por_subtipo.recebimento_cliente > 0 ||
    summary.entradas_por_subtipo.financiamento_adicional > 0 ||
    summary.entradas_por_subtipo.reembolso > 0
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <CardTitle className="font-medium break-words leading-tight min-w-0 flex-1" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>Recebimento FOA</CardTitle>
              <InfoTooltip
                title="Recebimento FOA"
                description="Total recebido do cliente para financiar a obra (entradas FOA)."
                formula="SUM(movimentos WHERE subtipo = 'recebimento_cliente')"
              />
            </div>
            <ArrowUpCircle className="h-4 w-4 text-green-600 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-green-600 break-all leading-tight" style={{ fontSize: "clamp(1rem, 2.4vw, 1.5rem)" }}>
              {isLoading ? "..." : formatCurrency(summary.total_recebimento_foa)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <CardTitle className="font-medium break-words leading-tight min-w-0 flex-1" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>FOF Financiamento</CardTitle>
              <InfoTooltip
                title="FOF Financiamento"
                description="Saídas relativas ao financiamento FOF (Fundo Operacional de Financiamento) do projeto."
                formula="SUM(saídas WHERE tipo = 'FOF')"
              />
            </div>
            <ArrowDownCircle className="h-4 w-4 text-red-600 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 break-all leading-tight" style={{ fontSize: "clamp(1rem, 2.4vw, 1.5rem)" }}>
              {isLoading ? "..." : formatCurrency(summary.total_fof_financiamento)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Saídas FOF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <CardTitle className="font-medium break-words leading-tight min-w-0 flex-1" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>FOA Auto Financiamento</CardTitle>
              <InfoTooltip
                title="FOA Auto Financiamento"
                description="Saídas referentes ao auto-financiamento da obra pela FOA."
                formula="SUM(saídas WHERE tipo = 'FOA Auto')"
              />
            </div>
            <ArrowDownCircle className="h-4 w-4 text-red-600 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 break-all leading-tight" style={{ fontSize: "clamp(1rem, 2.4vw, 1.5rem)" }}>
              {isLoading ? "..." : formatCurrency(summary.total_foa_auto)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Saídas FOA Auto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <CardTitle className="font-medium break-words leading-tight min-w-0 flex-1" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>Total de Custo</CardTitle>
              <InfoTooltip
                title="Total de Custo"
                description="Soma de todas as saídas/despesas registadas para a obra, independentemente da origem."
                formula="SUM(movimentos WHERE tipo = 'saída')"
              />
            </div>
            <ArrowDownCircle className="h-4 w-4 text-red-600 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 break-all leading-tight" style={{ fontSize: "clamp(1rem, 2.4vw, 1.5rem)" }}>
              {isLoading ? "..." : formatCurrency(summary.total_custos)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Todas as saídas</p>
          </CardContent>
        </Card>

        <Card className={saldoPositivo ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:bg-red-950/20"}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <CardTitle className="font-medium break-words leading-tight min-w-0 flex-1" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>Saldo</CardTitle>
              <InfoTooltip
                title="Saldo da Obra"
                description="Saldo atual da obra: total de entradas (recebimentos) menos total de saídas (custos)."
                formula="entradas - custos"
              />
            </div>
            <Wallet className={`h-4 w-4 ${saldoPositivo ? "text-green-600" : "text-red-600"} shrink-0`} />
          </CardHeader>
          <CardContent>
            <div className={`font-bold break-all leading-tight ${saldoPositivo ? "text-green-600" : "text-red-600"}`} style={{ fontSize: "clamp(1rem, 2.4vw, 1.5rem)" }}>
              {isLoading ? "..." : formatCurrency(summary.saldo_atual)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{summary.total_movimentos} movimentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown de Entradas por Subtipo */}
      {hasEntradasPorSubtipo && (
        <Collapsible open={isEntradasOpen} onOpenChange={setIsEntradasOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-4 w-4 transition-transform ${isEntradasOpen ? 'rotate-180' : ''}`} />
            Ver detalhamento de entradas por tipo
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Capital Inicial</CardTitle>
                  <Landmark className="h-3.5 w-3.5 text-emerald-600" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg font-bold text-emerald-600">
                    {isLoading ? "..." : formatCurrency(summary.entradas_por_subtipo?.valor_inicial || 0)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Arranque do projeto</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Recebimentos Cliente</CardTitle>
                  <Receipt className="h-3.5 w-3.5 text-blue-600" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg font-bold text-blue-600">
                    {isLoading ? "..." : formatCurrency(summary.entradas_por_subtipo?.recebimento_cliente || 0)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Durante execução</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Financ. Adicional</CardTitle>
                  <PlusCircle className="h-3.5 w-3.5 text-purple-600" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg font-bold text-purple-600">
                    {isLoading ? "..." : formatCurrency(summary.entradas_por_subtipo?.financiamento_adicional || 0)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Injeção extra</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50/30 dark:bg-gray-950/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">Reembolsos</CardTitle>
                  <RefreshCw className="h-3.5 w-3.5 text-gray-600" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg font-bold text-gray-600">
                    {isLoading ? "..." : formatCurrency(summary.entradas_por_subtipo?.reembolso || 0)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Devoluções</p>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}