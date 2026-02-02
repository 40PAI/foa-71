import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GastosObraKPICards } from "./GastosObraKPICards";
import { GastosObraTable } from "./GastosObraTable";
import { GastoObraModal } from "@/components/modals/GastoObraModal";
import { useGastosObra, useGastosObraSummary, GastoObra } from "@/hooks/useGastosObra";
import { Skeleton } from "@/components/ui/skeleton";
interface MovimentacoesFinanceirasCardProps {
  projectId: number | null | undefined;
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
  centroCustoId
}: MovimentacoesFinanceirasCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<GastoObra | undefined>();

  // Garantir que só buscamos dados se projectId for válido
  const validProjectId = projectId || 0;
  const {
    data: gastos,
    isLoading: gastosLoading
  } = useGastosObra(validProjectId, centroCustoId);
  const {
    data: summary,
    isLoading: summaryLoading
  } = useGastosObraSummary(validProjectId, filterType === "month" ? selectedMonth : undefined, filterType === "month" ? selectedYear : undefined, centroCustoId);
  const filteredGastos = filterType === "all" ? gastos || [] : gastos?.filter(gasto => {
    const gastoDate = new Date(gasto.data_movimento);
    return gastoDate.getMonth() + 1 === selectedMonth && gastoDate.getFullYear() === selectedYear;
  }) || [];
  const handleEdit = (gasto: GastoObra) => {
    setEditingGasto(gasto);
    setModalOpen(true);
  };
  const handleNewGasto = () => {
    setEditingGasto(undefined);
    setModalOpen(true);
  };
  return <div className="space-y-6">
      {/* KPI Cards */}
      {summaryLoading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
              </CardContent>
            </Card>)}
        </div> : summary ? <GastosObraKPICards summary={summary} isLoading={summaryLoading} /> : null}

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
            
          </div>
        </CardHeader>
        <CardContent>
          {gastosLoading ? <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div> : <GastosObraTable gastos={filteredGastos} onEdit={handleEdit} />}
        </CardContent>
      </Card>

      {projectId && <GastoObraModal open={modalOpen} onOpenChange={setModalOpen} projectId={projectId} gasto={editingGasto} defaultCentroCustoId={centroCustoId} />}
    </div>;
}