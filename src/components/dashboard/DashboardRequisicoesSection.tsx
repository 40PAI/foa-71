import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DonutChart } from "@/components/charts/DonutChart";
import { formatCurrency } from "@/utils/formatters";
import { Maximize2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RequisitionsAnalyticsModal } from "@/components/modals/RequisitionsAnalyticsModal";
import type { RequisicoesResumo } from "@/hooks/useDashboardGeral";

interface DashboardRequisicoesSectionProps {
  requisicoesResumo: RequisicoesResumo;
}

export function DashboardRequisicoesSection({ requisicoesResumo }: DashboardRequisicoesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = [
    { name: "Pendentes", value: requisicoesResumo.pendentes, fill: "hsl(var(--warning))" },
    { name: "Em Aprovação", value: requisicoesResumo.aprovacao, fill: "hsl(var(--chart-2))" },
    { name: "Aprovadas", value: requisicoesResumo.aprovadas, fill: "hsl(var(--chart-1))" },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-responsive-xl">Compras & Requisições</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver análise detalhada</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{requisicoesResumo.total}</p>
            </div>
            <div className="p-3 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold text-warning">{requisicoesResumo.pendentes}</p>
            </div>
            <div className="p-3 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground">Em Aprovação</p>
              <p className="text-xl font-bold text-primary">{requisicoesResumo.aprovacao}</p>
            </div>
            <div className="p-3 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground">Aprovadas</p>
              <p className="text-xl font-bold text-chart-1">{requisicoesResumo.aprovadas}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-xl font-bold">{formatCurrency(requisicoesResumo.valor_total)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Valor Pendente</p>
              <p className="text-xl font-bold">{formatCurrency(requisicoesResumo.valor_pendente)}</p>
            </div>
          </div>

          {requisicoesResumo.total > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Distribuição por Status</h3>
              <DonutChart data={chartData} title={`Taxa de Aprovação: ${requisicoesResumo.taxa_aprovacao.toFixed(1)}%`} />
            </div>
          )}
        </CardContent>
      </Card>

      <RequisitionsAnalyticsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        requisicoesResumo={requisicoesResumo}
      />
    </>
  );
}
