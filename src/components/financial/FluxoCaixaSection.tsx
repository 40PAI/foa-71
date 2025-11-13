import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FluxoCaixaKPICards } from "./FluxoCaixaKPICards";
import { FluxoCaixaCategoryChart } from "./FluxoCaixaCategoryChart";
import { FluxoCaixaFilters } from "./FluxoCaixaFilters";
import { FluxoCaixaTable } from "./FluxoCaixaTable";
import { CashFlowMovementModal } from "../modals/CashFlowMovementModal";
import { useCashFlowMovements, useCashFlowSummary } from "@/hooks/useCashFlow";
import { CashFlowMovement } from "@/types/cashflow";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface FluxoCaixaSectionProps {
  projectId: number;
}

export function FluxoCaixaSection({ projectId }: FluxoCaixaSectionProps) {
  // Estados para filtros
  const [filterType, setFilterType] = useState<"week" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Estados para modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<CashFlowMovement | undefined>();

  // Calcular datas baseado no filtro
  const { dataInicio, dataFim } = useMemo(() => {
    const today = new Date();
    
    if (filterType === "week") {
      return {
        dataInicio: startOfWeek(today, { weekStartsOn: 1 }),
        dataFim: endOfWeek(today, { weekStartsOn: 1 })
      };
    } else if (filterType === "month") {
      return {
        dataInicio: startOfMonth(today),
        dataFim: endOfMonth(today)
      };
    } else {
      return {
        dataInicio: startDate,
        dataFim: endDate
      };
    }
  }, [filterType, startDate, endDate]);

  // Buscar movimentos do fluxo de caixa
  const { data: movements = [], isLoading: loadingMovements } = useCashFlowMovements(projectId);
  
  // Buscar resumo do fluxo de caixa
  const { data: summary, isLoading: loadingSummary } = useCashFlowSummary(projectId);

  // Filtrar movimentos por data
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const movDate = new Date(m.data_movimento);
      if (dataInicio && movDate < dataInicio) return false;
      if (dataFim && movDate > dataFim) return false;
      return true;
    });
  }, [movements, dataInicio, dataFim]);

  const isLoading = loadingMovements || loadingSummary;

  const handleEdit = (movement: CashFlowMovement) => {
    setEditingMovement(movement);
    setModalOpen(true);
  };

  const handleNewMovement = () => {
    console.log('🔵 handleNewMovement chamado', { projectId, modalOpen });
    
    if (!projectId) {
      console.error('❌ projectId não fornecido');
      return;
    }
    
    setEditingMovement(undefined);
    setModalOpen(true);
    console.log('🟢 Modal state atualizado para true');
  };

  // Validação: Sem movimentos
  if (!isLoading && filteredMovements.length === 0) {
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

        <FluxoCaixaKPICards summary={summary} isLoading={isLoading} />

        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Movimento Registrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece registrando movimentações do fluxo de caixa administrativo.
            </p>
            <Button onClick={handleNewMovement}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeiro Movimento
            </Button>
          </CardContent>
        </Card>

        {/* Modal de Movimento (também no estado vazio) */}
        <CashFlowMovementModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projectId={projectId}
          movement={editingMovement}
        />
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
      <FluxoCaixaKPICards
        summary={summary}
        isLoading={isLoading}
      />

      {/* Gráfico de Distribuição por Categoria */}
      <FluxoCaixaCategoryChart movements={filteredMovements} />

      {/* Tabela de Movimentações */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Movimentações do Fluxo de Caixa</h3>
            <Button onClick={handleNewMovement} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Movimento
            </Button>
          </div>
          
          <FluxoCaixaTable
            movements={filteredMovements}
            onEdit={handleEdit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Modal de Movimento */}
      <CashFlowMovementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={projectId}
        movement={editingMovement}
      />
    </div>
  );
}
