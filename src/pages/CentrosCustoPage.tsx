import { useState } from "react";
import { Plus, Filter, Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaldosCentrosCusto, useCentrosCusto } from "@/hooks/useCentrosCusto";
import { CentroCustoModal } from "@/components/modals/CentroCustoModal";
import { ImportFOAModal } from "@/components/modals/ImportFOAModal";
import { GraficoLinhaMovimentos } from "@/components/financial/GraficoLinhaMovimentos";
import { GraficoBarrasCategorias } from "@/components/financial/GraficoBarrasCategorias";
import { useProjectContext } from "@/contexts/ProjectContext";
import { formatCurrencyInput } from "@/utils/currency";
import { generateFOAExcel } from "@/utils/excelExporter";
import { useMovimentosFinanceiros } from "@/hooks/useMovimentosFinanceiros";
import { toast } from "sonner";
import { MovimentacoesFinanceirasCard } from "@/components/financial/MovimentacoesFinanceirasCard";

export default function CentrosCustoPage() {
  const { selectedProjectId, projectData } = useProjectContext();
  const selectedProject = projectData?.project;
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCentroCustoId, setSelectedCentroCustoId] = useState<string>("all");

  const handleExportExcel = async () => {
    if (!selectedProject) return;
    try {
      await generateFOAExcel(selectedProject.id);
      toast.success("Excel FOA exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
      console.error(error);
    }
  };

  const { data: saldos, isLoading: loadingSaldos } = useSaldosCentrosCusto(selectedProject?.id);
  const { data: centrosCusto } = useCentrosCusto(selectedProject?.id);
  const { data: movimentos } = useMovimentosFinanceiros(selectedProject?.id, {
    centroCustoId: selectedCentroCustoId !== "all" ? selectedCentroCustoId : undefined
  });

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione um projeto para visualizar os centros de custo</p>
      </div>
    );
  }


  // Filtrar saldos por centro de custo selecionado
  const filteredSaldos = selectedCentroCustoId === "all" 
    ? saldos 
    : saldos?.filter(s => s.centro_custo_id === selectedCentroCustoId);

  // Calcular KPIs baseados nos saldos filtrados
  const totalOrcamento = filteredSaldos?.reduce((acc, s) => acc + s.orcamento_mensal, 0) || 0;
  const totalGasto = filteredSaldos?.reduce((acc, s) => acc + s.total_saidas, 0) || 0;
  const totalSaldo = filteredSaldos?.reduce((acc, s) => acc + s.saldo, 0) || 0;
  const centrosEmAlerta = filteredSaldos?.filter(s => s.percentual_utilizado >= 80).length || 0;
  
  // Obter info do centro selecionado
  const selectedCentro = selectedCentroCustoId !== "all" 
    ? centrosCusto?.find(c => c.id === selectedCentroCustoId)
    : null;


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Centros de Custo</h1>
            <p className="text-muted-foreground">Projeto: {selectedProject.nome}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Excel FOA
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Centro de Custo
            </Button>
          </div>
        </div>
        
        {/* Seletor de Centro de Custo */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filtrar por Centro:</label>
          <Select value={selectedCentroCustoId} onValueChange={setSelectedCentroCustoId}>
            <SelectTrigger className="w-[350px]">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orçamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyInput(totalOrcamento)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyInput(totalGasto)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalOrcamento > 0 ? Math.round((totalGasto / totalOrcamento) * 100) : 0}% do orçamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyInput(totalSaldo)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Centros em Alerta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{centrosEmAlerta}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ≥80% do orçamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      {movimentos && movimentos.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <GraficoLinhaMovimentos movimentos={movimentos} />
          <GraficoBarrasCategorias movimentos={movimentos} />
        </div>
      )}


      {/* Movimentações Financeiras */}
      <MovimentacoesFinanceirasCard 
        projectId={selectedProject.id}
        centroCustoId={selectedCentroCustoId !== "all" ? selectedCentroCustoId : undefined}
      />

      <CentroCustoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={selectedProject.id}
      />
      
      <ImportFOAModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        projectId={selectedProject.id}
      />
    </div>
  );
}
