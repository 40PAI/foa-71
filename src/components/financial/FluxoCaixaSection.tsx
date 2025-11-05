import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, Wallet } from "lucide-react";
import { FluxoCaixaKPICards } from "./FluxoCaixaKPICards";
import { FluxoCaixaFilters } from "./FluxoCaixaFilters";
import { FluxoCaixaCategoryChart } from "./FluxoCaixaCategoryChart";
import { GastosObraTable } from "./GastosObraTable";
import { GastoObraModal } from "@/components/modals/GastoObraModal";
import { useCentrosCusto } from "@/hooks/useCentrosCusto";
import { useMovimentosFinanceiros } from "@/hooks/useMovimentosFinanceiros";
import { useGastosObra, GastoObra } from "@/hooks/useGastosObra";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

interface FluxoCaixaSectionProps {
  projectId: number;
}

export function FluxoCaixaSection({ projectId }: FluxoCaixaSectionProps) {
  const [filterType, setFilterType] = useState<"week" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<GastoObra | undefined>();

  // Buscar centros de custo
  const { data: centros = [], isLoading: isLoadingCentros } = useCentrosCusto(projectId);

  // Identificar centro de custo administrativo
  const centroAdministrativo = useMemo(() => {
    return centros.find(
      (c) =>
        c.tipo === "departamento" &&
        (c.nome.toLowerCase().includes("administrat") ||
          c.codigo?.toLowerCase() === "adm" ||
          c.codigo?.toLowerCase() === "admin")
    );
  }, [centros]);

  // Calcular datas baseadas no filtro selecionado
  const { dataInicio, dataFim } = useMemo(() => {
    const now = new Date();
    
    if (filterType === "week") {
      return {
        dataInicio: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        dataFim: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    } else if (filterType === "month") {
      return {
        dataInicio: format(startOfMonth(now), "yyyy-MM-dd"),
        dataFim: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    } else if (filterType === "custom" && startDate && endDate) {
      return {
        dataInicio: format(startDate, "yyyy-MM-dd"),
        dataFim: format(endDate, "yyyy-MM-dd"),
      };
    }
    
    // Default: mês atual
    return {
      dataInicio: format(startOfMonth(now), "yyyy-MM-dd"),
      dataFim: format(endOfMonth(now), "yyyy-MM-dd"),
    };
  }, [filterType, startDate, endDate]);

  // Buscar movimentos financeiros do centro administrativo
  const { data: movimentos = [], isLoading: isLoadingMovimentos } = useMovimentosFinanceiros(
    projectId,
    {
      centroCustoId: centroAdministrativo?.id,
      dataInicio,
      dataFim,
    }
  );

  // Buscar gastos de obra (movimentações na tabela gastos_obra_view)
  const { data: gastosObra = [], isLoading: isLoadingGastos } = useGastosObra(projectId);

  // Filtrar gastos pelo centro administrativo e período
  const gastosFiltrados = useMemo(() => {
    return gastosObra.filter((gasto) => {
      const matchesCentro = gasto.centro_custo_id === centroAdministrativo?.id;
      const gastoDate = gasto.data_movimento;
      const matchesDate = 
        (!dataInicio || gastoDate >= dataInicio) &&
        (!dataFim || gastoDate <= dataFim);
      return matchesCentro && matchesDate;
    });
  }, [gastosObra, centroAdministrativo?.id, dataInicio, dataFim]);

  const handleEdit = (gasto: GastoObra) => {
    setEditingGasto(gasto);
    setModalOpen(true);
  };

  const handleNewGasto = () => {
    setEditingGasto(undefined);
    setModalOpen(true);
  };

  // Auto-selecionar mês atual ao carregar
  useEffect(() => {
    if (filterType === "custom" && !startDate && !endDate) {
      const now = new Date();
      setStartDate(startOfMonth(now));
      setEndDate(endOfMonth(now));
    }
  }, [filterType, startDate, endDate]);

  // Verificar se centro administrativo existe
  if (isLoadingCentros) {
    return (
      <div className="space-y-6">
        <FluxoCaixaKPICards movimentos={[]} isLoading={true} />
      </div>
    );
  }

  if (!centroAdministrativo) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Centro de Custo Administrativo Não Encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            Por favor, crie um centro de custo do tipo "Departamento" com o nome
            "Administrativo" para utilizar esta funcionalidade.
          </p>
          <p className="text-sm text-muted-foreground">
            Acesse <strong>Centros de Custo</strong> para criar o centro administrativo.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Verificar se há movimentos
  const hasMovements = movimentos.length > 0;

  if (!isLoadingMovimentos && !hasMovements) {
    return (
      <div className="space-y-6">
        <FluxoCaixaFilters
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <FluxoCaixaKPICards movimentos={[]} isLoading={false} />

        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Movimento Registrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece registrando movimentações financeiras do centro administrativo.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Os movimentos do centro <strong>{centroAdministrativo.nome}</strong> aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros Temporais */}
      <FluxoCaixaFilters
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* KPI Cards */}
      <FluxoCaixaKPICards movimentos={movimentos} isLoading={isLoadingMovimentos} />

      {/* Gráfico de Distribuição por Categoria */}
      <FluxoCaixaCategoryChart movimentos={movimentos} />

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Movimentações Financeiras</CardTitle>
          <Button onClick={handleNewGasto} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Movimento
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <GastosObraTable gastos={gastosFiltrados} onEdit={handleEdit} />
        </CardContent>
      </Card>

      {/* Modal para adicionar/editar gastos */}
      <GastoObraModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        gasto={editingGasto}
        projectId={projectId}
        defaultCentroCustoId={centroAdministrativo.id}
      />
    </div>
  );
}
