import { useState } from "react";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaldosCentrosCusto, useCentrosCusto, useProjectFinancialTotals } from "@/hooks/useCentrosCusto";
import { CentroCustoModal } from "@/components/modals/CentroCustoModal";
import { MovimentosImportModal } from "@/components/modals/MovimentosImportModal";
import { GraficoLinhaMovimentos } from "@/components/financial/GraficoLinhaMovimentos";
import { GraficoBarrasCategorias } from "@/components/financial/GraficoBarrasCategorias";
import { useProjectContext } from "@/contexts/ProjectContext";
import { formatCurrencyInput } from "@/utils/currency";
import { generateFOAExcel } from "@/utils/excelExporter";
import { useMovimentosFinanceiros } from "@/hooks/useMovimentosFinanceiros";
import { toast } from "sonner";
import { MovimentacoesFinanceirasCard } from "@/components/financial/MovimentacoesFinanceirasCard";
import { ProjectGuard } from "@/components/common/ProjectGuard";

export default function CentrosCustoPage() {
  const { selectedProjectId } = useProjectContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedCentroCustoId, setSelectedCentroCustoId] = useState<string>("all");

  const handleExportExcel = async () => {
    if (!selectedProjectId) return;
    try {
      await generateFOAExcel(selectedProjectId);
      toast.success("Excel FOA exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
      console.error(error);
    }
  };

  const { data: saldos } = useSaldosCentrosCusto(selectedProjectId || undefined);
  const { data: centrosCusto } = useCentrosCusto(selectedProjectId || undefined);
  const { data: movimentos } = useMovimentosFinanceiros(selectedProjectId || undefined, {
    centroCustoId: selectedCentroCustoId !== "all" ? selectedCentroCustoId : undefined
  });

  // Buscar totais do projecto quando "Todos" está selecionado
  const { data: projectTotals } = useProjectFinancialTotals(
    selectedCentroCustoId === "all" ? selectedProjectId || undefined : undefined
  );

  // Filtrar saldos por centro de custo selecionado
  const filteredSaldos = selectedCentroCustoId === "all" 
    ? saldos 
    : saldos?.filter(s => s.centro_custo_id === selectedCentroCustoId);

  // Calcular KPIs baseados nos dados disponíveis
  // Quando "all" está selecionado, usar totais do projecto (inclui movimentos sem CC)
  const totalOrcamento = selectedCentroCustoId === "all" && projectTotals
    ? projectTotals.totalOrcamento
    : filteredSaldos?.reduce((acc, s) => acc + s.orcamento_mensal, 0) || 0;
  
  const totalGasto = selectedCentroCustoId === "all" && projectTotals
    ? projectTotals.totalGasto
    : filteredSaldos?.reduce((acc, s) => acc + s.total_saidas, 0) || 0;
  
  const totalSaldo = selectedCentroCustoId === "all" && projectTotals
    ? projectTotals.totalSaldo
    : filteredSaldos?.reduce((acc, s) => acc + s.saldo, 0) || 0;
  
  const centrosEmAlerta = filteredSaldos?.filter(s => s.percentual_utilizado >= 80).length || 0;
  
  // Obter info do centro selecionado
  const selectedCentro = selectedCentroCustoId !== "all" 
    ? centrosCusto?.find(c => c.id === selectedCentroCustoId)
    : null;


  return (
    <ProjectGuard projectId={selectedProjectId}>
      <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Centros de Custo</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                💡 Os Centros de Custo são criados durante a criação/edição do projeto
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Importar Movimentos</span>
                <span className="sm:hidden">Importar</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Exportar</span>
              </Button>
            </div>
          </div>

          {/* Seletor de Centro de Custo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium">Filtrar por Centro:</label>
            <Select value={selectedCentroCustoId} onValueChange={setSelectedCentroCustoId}>
              <SelectTrigger className="w-full sm:w-[350px]">
                <SelectValue placeholder="Selecione um centro de custo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Centros de Custo</SelectItem>
                {centrosCusto?.map(centro => (
                  <SelectItem key={centro.id} value={centro.id}>
                    {centro.codigo} - {centro.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCentro && (
              <div className="text-sm text-muted-foreground">
                Tipo: {selectedCentro.tipo}
              </div>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="max-h-28">
            <CardHeader size="sm" className="pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Orçamento Total
              </CardTitle>
            </CardHeader>
            <CardContent size="sm">
              <div className="text-base sm:text-lg lg:text-xl font-bold truncate">{formatCurrencyInput(totalOrcamento)}</div>
            </CardContent>
          </Card>

          <Card className="max-h-28">
            <CardHeader size="sm" className="pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Custo
              </CardTitle>
            </CardHeader>
            <CardContent size="sm">
              <div className="text-base sm:text-lg lg:text-xl font-bold truncate">{formatCurrencyInput(totalGasto)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {totalOrcamento > 0 ? Math.round((totalGasto / totalOrcamento) * 100) : 0}% do orçamento
              </p>
            </CardContent>
          </Card>

          <Card className="max-h-28">
            <CardHeader size="sm" className="pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Saldo Disponível
              </CardTitle>
            </CardHeader>
            <CardContent size="sm">
              <div className="text-base sm:text-lg lg:text-xl font-bold truncate">{formatCurrencyInput(totalSaldo)}</div>
            </CardContent>
          </Card>

          <Card className="max-h-28">
            <CardHeader size="sm" className="pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Em Alerta
              </CardTitle>
            </CardHeader>
            <CardContent size="sm">
              <div className="text-base sm:text-lg lg:text-xl font-bold">{centrosEmAlerta}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                ≥80% do orçamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        {movimentos && movimentos.length > 0 && (
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
            <GraficoLinhaMovimentos movimentos={movimentos} />
            <GraficoBarrasCategorias movimentos={movimentos} />
          </div>
        )}

        {/* Movimentações Financeiras */}
        {selectedProjectId && (
          <MovimentacoesFinanceirasCard 
            projectId={selectedProjectId}
            centroCustoId={selectedCentroCustoId !== "all" ? selectedCentroCustoId : undefined}
          />
        )}

        <CentroCustoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projectId={selectedProjectId}
        />
        
        <MovimentosImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          projectId={selectedProjectId}
        />
      </div>
    </ProjectGuard>
  );
}
