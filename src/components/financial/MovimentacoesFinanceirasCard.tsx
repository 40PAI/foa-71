import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GastosObraKPICards } from "./GastosObraKPICards";
import { MovimentosPorFonteTable } from "./MovimentosPorFonteTable";
import { GastoObraModal } from "@/components/modals/GastoObraModal";
import { useGastosObraSummary } from "@/hooks/useGastosObra";
import { useMovimentosPorFonte } from "@/hooks/useMovimentosPorFonte";
import { Skeleton } from "@/components/ui/skeleton";

interface MovimentacoesFinanceirasCardProps {
  projectId: number;
  selectedMonth?: number;
  selectedYear?: number;
  filterType?: "all" | "month";
  centroCustoId?: string;
}

export function MovimentacoesFinanceirasCard({
  projectId,
  selectedMonth,
  selectedYear,
  filterType = "all",
  centroCustoId,
}: MovimentacoesFinanceirasCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Usar o novo hook para movimentos por fonte
  const { data: movimentos, isLoading: movimentosLoading } = useMovimentosPorFonte({
    projectId,
    centroCustoId,
    // TODO: Adicionar dataInicio/dataFim quando filtros temporais estiverem implementados
  });

  // Manter os KPIs usando o hook existente
  const { data: summary, isLoading: summaryLoading } = useGastosObraSummary(
    projectId,
    filterType === "month" ? selectedMonth : undefined,
    filterType === "month" ? selectedYear : undefined,
    centroCustoId
  );

  const handleNewGasto = () => {
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <GastosObraKPICards summary={summary} isLoading={summaryLoading} />
      ) : null}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movimentações Financeiras</CardTitle>
              <CardDescription>
                Lista completa de entradas e saídas com saldo acumulado
              </CardDescription>
            </div>
            <Button onClick={handleNewGasto}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Movimento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {movimentosLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <MovimentosPorFonteTable movimentos={movimentos || []} />
          )}
        </CardContent>
      </Card>

      <GastoObraModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={projectId}
        defaultCentroCustoId={centroCustoId}
      />
    </div>
  );
}
