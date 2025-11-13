import { lazy, Suspense, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { formatCurrency } from "@/utils/formatters";
import { useProjectContext } from "@/contexts/ProjectContext";
import { AlertCircle, TrendingUp, TrendingDown, ShoppingCart, CheckCircle, Target, ClipboardCheck, Search, Maximize2, Wallet, Building, Users, Truck, DollarSign } from "lucide-react";
import { FinanceModal } from "@/components/modals/FinanceModal";
import { useConsolidatedFinancialData } from "@/hooks/useConsolidatedFinancialData";
import { useRequisitions } from "@/hooks/useRequisitions";
import SectionLoadingFallback, { ChartLoadingFallback } from "@/components/loading/SectionLoadingFallback";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load componentes pesados
const IntegratedFinancialDashboard = lazy(() => import("@/components/IntegratedFinancialDashboard").then(m => ({
  default: m.IntegratedFinancialDashboard
})));
const ExpandedFinancialDashboard = lazy(() => import("@/components/financial/ExpandedFinancialDashboard").then(m => ({
  default: m.ExpandedFinancialDashboard
})));
const FluxoCaixaSection = lazy(() => import("@/components/financial/FluxoCaixaSection").then(m => ({
  default: m.FluxoCaixaSection
})));
const CategoryExpenseCard = lazy(() => import("@/components/financial/CategoryExpenseCard").then(m => ({
  default: m.CategoryExpenseCard
})));
const TaskFinancialBreakdown = lazy(() => import("@/components/financial/TaskFinancialBreakdown").then(m => ({
  default: m.TaskFinancialBreakdown
})));
const TaskVsRealityAnalysis = lazy(() => import("@/components/financial/TaskVsRealityAnalysis").then(m => ({
  default: m.TaskVsRealityAnalysis
})));
const OptimizedApprovalInterface = lazy(() => import("@/components/OptimizedApprovalInterface").then(m => ({
  default: m.OptimizedApprovalInterface
})));
const DiscrepancyReport = lazy(() => import("@/components/DiscrepancyReport").then(m => ({
  default: m.DiscrepancyReport
})));
const ContasCorrentesSection = lazy(() => import("@/components/financial/ContasCorrentesSection").then(m => ({
  default: m.ContasCorrentesSection
})));
const CollapsibleFinancialSection = lazy(() => import("@/components/financial/CollapsibleFinancialSection").then(m => ({
  default: m.CollapsibleFinancialSection
})));
const SummaryCardSkeleton = () => <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardContent>
  </Card>;
export function ConsolidatedFinancasPage() {
  const {
    selectedProjectId
  } = useProjectContext();
  const {
    data: consolidatedData,
    isLoading
  } = useConsolidatedFinancialData(selectedProjectId || 0);
  const {
    data: requisitions = []
  } = useRequisitions();
  const [expandedDashboardOpen, setExpandedDashboardOpen] = useState(false);

  // Memoized calculations usando dados consolidados
  const summaryStats = useMemo(() => {
    if (!consolidatedData?.requisitions_summary) {
      return {
        totalPurchaseValue: 0,
        totalApprovedValue: 0,
        totalPendingValue: 0,
        approvalRate: 0
      };
    }
    const {
      total_value = 0,
      pending_value = 0,
      total_requisitions = 0,
      approved_requisitions = 0
    } = consolidatedData.requisitions_summary;
    return {
      totalPurchaseValue: total_value,
      totalApprovedValue: total_value - pending_value,
      totalPendingValue: pending_value,
      approvalRate: total_requisitions > 0 ? approved_requisitions / total_requisitions * 100 : 0
    };
  }, [consolidatedData?.requisitions_summary]);
  const pendingApprovalsCount = consolidatedData?.requisitions_summary?.pending_approvals || 0;
  if (!selectedProjectId) {
    return <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-2xl font-semibold mb-2">Selecione um Projeto</h2>
            <p className="text-muted-foreground">
              Por favor, selecione um projeto no menu superior para ver a análise financeira.
            </p>
          </div>
        </div>
      </div>;
  }
  return <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Análise Financeira</h1>
        <div className="flex gap-2">
          <FinanceModal projectId={selectedProjectId} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        {isLoading && !consolidatedData ? <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </> : <>
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Total Compras</p>
                    <p className="text-xs sm:text-sm lg:text-base font-bold break-words">
                      {formatCurrency(summaryStats.totalPurchaseValue)}
                    </p>
                  </div>
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Aprovado</p>
                    <p className="text-xs sm:text-sm lg:text-base font-bold text-green-600 break-words">
                      {formatCurrency(summaryStats.totalApprovedValue)}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Pendente</p>
                    <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-600 break-words">
                      {formatCurrency(summaryStats.totalPendingValue)}
                    </p>
                  </div>
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Taxa Aprovação</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                      {(summaryStats.approvalRate ?? 0).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Score Eficiência</p>
                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${(consolidatedData?.task_analytics?.efficiency_score || 0) >= 80 ? 'text-green-600' : (consolidatedData?.task_analytics?.efficiency_score || 0) >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      {(consolidatedData?.task_analytics?.efficiency_score ?? 0).toFixed(0)}%
                    </p>
                  </div>
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          </>}
      </div>

      {/* Integrated Financial Dashboard */}
      <Suspense fallback={<ChartLoadingFallback />}>
        
      </Suspense>

      {expandedDashboardOpen && <Suspense fallback={null}>
          <ExpandedFinancialDashboard open={expandedDashboardOpen} onOpenChange={setExpandedDashboardOpen} projectId={selectedProjectId} />
        </Suspense>}

      {/* Collapsible Sections */}
      <Accordion type="multiple" className="w-full space-y-3">
        <CollapsibleFinancialSection value="fluxo-caixa" title="Fluxo de Caixa (Administrativo)" icon={Wallet} badge={{
        text: "FOA",
        variant: "default"
      }}>
          <Suspense fallback={<SectionLoadingFallback rows={5} />}>
            {selectedProjectId ? (
              <FluxoCaixaSection projectId={selectedProjectId} />
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Selecione um projeto para visualizar o fluxo de caixa</p>
              </div>
            )}
          </Suspense>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="expenses" title="Gestão de Gastos por Categoria" icon={TrendingDown} badge={{
        text: `Dados consolidados`,
        variant: "outline"
      }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Suspense fallback={<SectionLoadingFallback rows={2} />}>
              <CategoryExpenseCard category="material" title="Materiais" icon={Building} projectId={selectedProjectId} totalBudget={consolidatedData?.financas?.find(f => f.categoria === "Materiais de Construção")?.orcamentado || 1000000} fromTasks={consolidatedData?.integrated_expenses?.material_total || 0} fromCentroCusto={0} manualExpenses={0} />
            </Suspense>
            <Suspense fallback={<SectionLoadingFallback rows={2} />}>
              <CategoryExpenseCard category="mao_obra" title="Mão de Obra" icon={Users} projectId={selectedProjectId} totalBudget={consolidatedData?.financas?.find(f => f.categoria === "Mão de Obra")?.orcamentado || 1000000} fromTasks={consolidatedData?.integrated_expenses?.mao_obra_total || 0} fromCentroCusto={0} manualExpenses={0} />
            </Suspense>
            <Suspense fallback={<SectionLoadingFallback rows={2} />}>
              <CategoryExpenseCard category="patrimonio" title="Patrimônio" icon={Truck} projectId={selectedProjectId} totalBudget={consolidatedData?.financas?.find(f => f.categoria === "Equipamentos")?.orcamentado || 1000000} fromTasks={consolidatedData?.integrated_expenses?.patrimonio_total || 0} fromCentroCusto={0} manualExpenses={0} />
            </Suspense>
            <Suspense fallback={<SectionLoadingFallback rows={2} />}>
              <CategoryExpenseCard category="indireto" title="Custos Indiretos" icon={DollarSign} projectId={selectedProjectId} totalBudget={consolidatedData?.financas?.find(f => f.categoria === "Custos Indiretos")?.orcamentado || 1000000} fromTasks={consolidatedData?.integrated_expenses?.indireto_total || 0} fromCentroCusto={0} manualExpenses={0} />
            </Suspense>
          </div>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="tasks" title="Custos e Performance por Tarefas" icon={Target} badge={consolidatedData?.task_analytics ? {
        text: `Score: ${(consolidatedData.task_analytics.efficiency_score ?? 0).toFixed(0)}%`,
        variant: (consolidatedData.task_analytics.efficiency_score ?? 0) >= 80 ? "default" : (consolidatedData.task_analytics.efficiency_score ?? 0) >= 60 ? "secondary" : "destructive"
      } : undefined}>
          <div className="space-y-6">
            <Suspense fallback={<SectionLoadingFallback rows={4} />}>
              <TaskFinancialBreakdown projectId={selectedProjectId} />
            </Suspense>
            <Suspense fallback={<ChartLoadingFallback />}>
              <TaskVsRealityAnalysis projectId={selectedProjectId} />
            </Suspense>
          </div>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="approvals" title="Aprovações Pendentes" icon={ClipboardCheck} badge={pendingApprovalsCount > 0 ? {
        text: `${pendingApprovalsCount}`,
        variant: "destructive"
      } : {
        text: "0",
        variant: "outline"
      }}>
          <Suspense fallback={<SectionLoadingFallback rows={3} />}>
            <OptimizedApprovalInterface projectId={selectedProjectId} />
          </Suspense>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="audit" title="Auditoria e Discrepâncias" icon={Search} badge={(consolidatedData?.discrepancies?.length || 0) > 0 ? {
        text: `${consolidatedData?.discrepancies?.length || 0}`,
        variant: "destructive"
      } : undefined}>
          <Suspense fallback={<SectionLoadingFallback rows={3} />}>
            <DiscrepancyReport projectId={selectedProjectId} />
          </Suspense>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="clientes" title="Contas Correntes - Clientes" icon={Users} badge={{
        text: `${consolidatedData?.clientes?.length || 0} clientes`,
        variant: "outline"
      }}>
          <Suspense fallback={<SectionLoadingFallback rows={4} />}>
            <ContasCorrentesSection projectId={selectedProjectId} mode="clientes" />
          </Suspense>
        </CollapsibleFinancialSection>
      </Accordion>

      <div className="text-xs text-muted-foreground text-center mt-6">
        ⚡ Performance otimizada: dados carregados em query única consolidada
      </div>
    </div>;
}