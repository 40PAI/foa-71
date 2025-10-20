import { useState } from "react";
import { Plus, Filter, Download, Upload, TrendingUp, AlertTriangle, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCentrosCusto, useSaldosCentrosCusto } from "@/hooks/useCentrosCusto";
import { CentroCustoModal } from "@/components/modals/CentroCustoModal";
import { ImportFOAModal } from "@/components/modals/ImportFOAModal";
import { MovimentoFinanceiroModal } from "@/components/modals/MovimentoFinanceiroModal";
import { GraficoLinhaMovimentos } from "@/components/financial/GraficoLinhaMovimentos";
import { GraficoBarrasCategorias } from "@/components/financial/GraficoBarrasCategorias";
import { useProjectContext } from "@/contexts/ProjectContext";
import { formatCurrencyInput } from "@/utils/currency";
import { generateFOAExcel } from "@/utils/excelExporter";
import { useMovimentosFinanceiros } from "@/hooks/useMovimentosFinanceiros";
import { toast } from "sonner";

export default function CentrosCustoPage() {
  const { selectedProjectId, projectData } = useProjectContext();
  const selectedProject = projectData?.project;
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [movimentoModalOpen, setMovimentoModalOpen] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<any>(null);
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: centrosCusto, isLoading: loadingCentros } = useCentrosCusto(selectedProject?.id);
  const { data: saldos, isLoading: loadingSaldos } = useSaldosCentrosCusto(selectedProject?.id);
  const { data: movimentos, refetch: refetchMovimentos } = useMovimentosFinanceiros(selectedProject?.id);

  const handleAddMovimento = (centro: any) => {
    setSelectedCentro(centro);
    setMovimentoModalOpen(true);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione um projeto para visualizar os centros de custo</p>
      </div>
    );
  }

  const filteredSaldos = saldos?.filter(saldo => {
    const matchesTipo = filterTipo === "all" || saldo.tipo === filterTipo;
    const matchesSearch = saldo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         saldo.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTipo && matchesSearch;
  });

  // Calcular KPIs
  const totalOrcamento = saldos?.reduce((acc, s) => acc + s.orcamento_mensal, 0) || 0;
  const totalGasto = saldos?.reduce((acc, s) => acc + s.total_saidas, 0) || 0;
  const totalSaldo = saldos?.reduce((acc, s) => acc + s.saldo, 0) || 0;
  const centrosEmAlerta = saldos?.filter(s => s.percentual_utilizado >= 80).length || 0;

  const getStatusColor = (percentual: number) => {
    if (percentual >= 100) return "destructive";
    if (percentual >= 90) return "destructive";
    if (percentual >= 80) return "secondary";
    return "default";
  };

  const getStatusText = (percentual: number) => {
    if (percentual >= 100) return "Excedido";
    if (percentual >= 90) return "Crítico";
    if (percentual >= 80) return "Atenção";
    return "Normal";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5" />
            <div className="flex-1 flex gap-4">
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="projeto">Projeto</SelectItem>
                  <SelectItem value="departamento">Departamento</SelectItem>
                  <SelectItem value="categoria">Categoria</SelectItem>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Centros de Custo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Orçamento</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Utilização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSaldos?.map((saldo) => (
                <TableRow 
                  key={saldo.centro_custo_id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    const centro = centrosCusto?.find(c => c.id === saldo.centro_custo_id);
                    if (centro) handleAddMovimento(centro);
                  }}
                >
                  <TableCell className="font-mono">{saldo.codigo}</TableCell>
                  <TableCell className="font-medium">{saldo.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{saldo.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrencyInput(saldo.orcamento_mensal)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrencyInput(saldo.total_saidas)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${saldo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrencyInput(saldo.saldo)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(saldo.percentual_utilizado, 100)} 
                        className="w-[100px]"
                      />
                      <span className="text-sm">
                        {Math.round(saldo.percentual_utilizado)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(saldo.percentual_utilizado)}>
                      {getStatusText(saldo.percentual_utilizado)}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const centro = centrosCusto?.find(c => c.id === saldo.centro_custo_id);
                        if (centro) handleAddMovimento(centro);
                      }}
                    >
                      <LineChart className="h-4 w-4 mr-2" />
                      Movimento
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

      {selectedCentro && (
        <MovimentoFinanceiroModal
          open={movimentoModalOpen}
          onOpenChange={(open) => {
            setMovimentoModalOpen(open);
            if (!open) setSelectedCentro(null);
          }}
          movimento={undefined}
          projectId={selectedProject.id}
        />
      )}
    </div>
  );
}
