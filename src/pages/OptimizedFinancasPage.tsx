import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { formatCurrency } from "@/utils/formatters";
import { useFinancesByProject } from "@/hooks/useFinances";
import { useOptimizedPurchaseBreakdown } from "@/hooks/useOptimizedPurchaseBreakdown";
import { useOptimizedRealtimeSync, useOptimizedFinancialDiscrepancies } from "@/hooks/useOptimizedFinancialIntegration";
import { useProjectContext } from "@/contexts/ProjectContext";
import { AlertCircle, TrendingUp, TrendingDown, ShoppingCart, Package, CheckCircle, Target, BarChart3, Activity, Layers, ClipboardCheck, Search, FileText, Maximize2, Wallet, ArrowRight } from "lucide-react";
import { FinanceModal } from "@/components/modals/FinanceModal";
import { OptimizedApprovalInterface } from "@/components/OptimizedApprovalInterface";
import { DiscrepancyReport } from "@/components/DiscrepancyReport";
import { IntegratedFinancialDashboard } from "@/components/IntegratedFinancialDashboard";
import { ExpenseManagement } from "@/components/ExpenseManagement";
import { TaskFinancialBreakdown } from "@/components/financial/TaskFinancialBreakdown";
import { TaskVsRealityAnalysis } from "@/components/financial/TaskVsRealityAnalysis";
import { FinancialChartsSection } from "@/components/financial/FinancialChartsSection";
import { CollapsibleFinancialSection } from "@/components/financial/CollapsibleFinancialSection";
import { ExpandedFinancialDashboard } from "@/components/financial/ExpandedFinancialDashboard";
import { useTaskFinancialAnalytics } from "@/hooks/useTaskFinancialAnalytics";
import { useMemo, useState } from "react";
import { useRequisitions } from "@/hooks/useRequisitions";
import { CategoryExpenseCard } from "@/components/financial/CategoryExpenseCard";
import { Building, Users, Truck, DollarSign } from "lucide-react";
import { useDetailedExpenses } from "@/hooks/useIntegratedFinances";
import { ContasCorrentesSection } from "@/components/financial/ContasCorrentesSection";
import { CentrosCustoSummary } from "@/components/financial/CentrosCustoSummary";
import { useClientes } from "@/hooks/useClientes";
import { FundingBreakdownSection } from "@/components/financial/FundingBreakdownSection";
import { ReembolsosFOASection } from "@/components/financial/ReembolsosFOASection";
import { useSaldosCentrosCusto } from "@/hooks/useCentrosCusto";

// Loading skeleton components
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
const TableSkeleton = () => <div className="space-y-4">
    {[...Array(5)].map((_, i) => <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>)}
  </div>;
export function OptimizedFinancasPage() {
  const {
    selectedProjectId
  } = useProjectContext();
  const {
    data: financas = [],
    isLoading: isLoadingFinances
  } = useFinancesByProject(selectedProjectId || 0);
  const {
    data: purchaseBreakdown = [],
    isLoading: isLoadingPurchases
  } = useOptimizedPurchaseBreakdown(selectedProjectId);
  const {
    data: discrepancies = [],
    isLoading: isLoadingDiscrepancies
  } = useOptimizedFinancialDiscrepancies(selectedProjectId);
  const {
    data: taskAnalytics
  } = useTaskFinancialAnalytics(selectedProjectId);
  const {
    data: requisitions = []
  } = useRequisitions();
  const {
    data: allExpenses = []
  } = useDetailedExpenses(selectedProjectId);
  const {
    data: saldos = []
  } = useSaldosCentrosCusto(selectedProjectId);
  const {
    data: clientes = []
  } = useClientes(selectedProjectId);
  const [expandedDashboardOpen, setExpandedDashboardOpen] = useState(false);

  // Calculate totals by category for cards
  const categoryTotals = useMemo(() => {
    const materialTotal = allExpenses.filter(e => e.categoria_gasto === "material").reduce((sum, e) => sum + Number(e.valor), 0);
    const payrollTotal = allExpenses.filter(e => e.categoria_gasto === "mao_obra").reduce((sum, e) => sum + Number(e.valor), 0);
    const patrimonyTotal = allExpenses.filter(e => e.categoria_gasto === "patrimonio").reduce((sum, e) => sum + Number(e.valor), 0);
    const indirectTotal = allExpenses.filter(e => e.categoria_gasto === "indireto").reduce((sum, e) => sum + Number(e.valor), 0);
    return {
      materialTotal,
      payrollTotal,
      patrimonyTotal,
      indirectTotal
    };
  }, [allExpenses]);

  // Optimized realtime sync
  useOptimizedRealtimeSync(selectedProjectId || 0, !!selectedProjectId);

  // Memoize expensive calculations with improved type safety
  const summaryStats = useMemo(() => {
    console.log('Calculating summary stats from purchase breakdown:', purchaseBreakdown);
    const totalPurchaseValue = purchaseBreakdown.reduce((acc, item) => {
      const value = Number(item.valor_pendente) + Number(item.valor_aprovado);
      return acc + value;
    }, 0);
    const totalApprovedValue = purchaseBreakdown.reduce((acc, item) => {
      const value = Number(item.valor_aprovado) || 0;
      return acc + value;
    }, 0);
    const totalPendingValue = purchaseBreakdown.reduce((acc, item) => {
      const value = Number(item.valor_pendente) || 0;
      return acc + value;
    }, 0);
    const approvalRate = totalPurchaseValue > 0 ? totalApprovedValue / totalPurchaseValue * 100 : 0;
    console.log('Summary stats calculated:', {
      totalPurchaseValue,
      totalApprovedValue,
      totalPendingValue,
      approvalRate
    });
    return {
      totalPurchaseValue,
      totalApprovedValue,
      totalPendingValue,
      approvalRate
    };
  }, [purchaseBreakdown]);

  // Calculate pending approvals
  const pendingApprovalsCount = useMemo(() => {
    const projectRequisitions = requisitions.filter(r => r.id_projeto === selectedProjectId);
    return projectRequisitions.filter(r => r.status_fluxo === 'Pendente' || r.status_fluxo === 'Aprovação Qualidade' || r.status_fluxo === 'Aprovação Direção').length;
  }, [requisitions, selectedProjectId]);
  if (!selectedProjectId) {
    return <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Análise Financeira</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Selecione um Projeto</h3>
              <p className="text-muted-foreground">
                Por favor, selecione um projeto no cabeçalho para ver a análise financeira.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="w-full space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Análise Financeira</h1>
        <div className="flex gap-2">
          
          <FinanceModal projectId={selectedProjectId} />
        </div>
      </div>

      {/* Optimized Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        {isLoadingPurchases ? <>
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
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Taxa Aprovação</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                      {summaryStats.approvalRate.toFixed(1)}%
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
                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${(taskAnalytics?.efficiency_score || 0) >= 80 ? 'text-green-600' : (taskAnalytics?.efficiency_score || 0) >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      {taskAnalytics?.efficiency_score.toFixed(0) || 0}%
                    </p>
                  </div>
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          </>}
      </div>

      {/* Integrated Financial Dashboard - Expandable */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <IntegratedFinancialDashboard projectId={selectedProjectId} />
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="sm" onClick={() => setExpandedDashboardOpen(true)} className="gap-2">
                <Maximize2 className="h-4 w-4" />
                Ver Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Dashboard Dialog */}
      <ExpandedFinancialDashboard open={expandedDashboardOpen} onOpenChange={setExpandedDashboardOpen} projectId={selectedProjectId} />

      {/* Collapsible Sections with Accordion */}
      <Accordion type="multiple" className="w-full space-y-3">
        <CollapsibleFinancialSection value="expenses" title="Gestão de Gastos por Categoria" icon={TrendingDown} badge={{
        text: `${allExpenses.length} gastos`,
        variant: "outline"
      }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryExpenseCard category="material" title="Materiais" icon={Building} projectId={selectedProjectId} totalBudget={financas.find(f => f.categoria === "Materiais de Construção")?.orcamentado || 1000000} />
            <CategoryExpenseCard category="mao_obra" title="Mão de Obra" icon={Users} projectId={selectedProjectId} totalBudget={financas.find(f => f.categoria === "Mão de Obra")?.orcamentado || 1000000} />
            <CategoryExpenseCard category="patrimonio" title="Patrimônio" icon={Truck} projectId={selectedProjectId} totalBudget={financas.find(f => f.categoria === "Equipamentos")?.orcamentado || 1000000} />
            <CategoryExpenseCard category="indireto" title="Custos Indiretos" icon={DollarSign} projectId={selectedProjectId} totalBudget={financas.find(f => f.categoria === "Custos Indiretos")?.orcamentado || 1000000} />
          </div>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="tasks" title="Custos e Performance por Tarefas" icon={Target} badge={taskAnalytics ? {
        text: `Score: ${taskAnalytics.efficiency_score.toFixed(0)}%`,
        variant: taskAnalytics.efficiency_score >= 80 ? "default" : taskAnalytics.efficiency_score >= 60 ? "secondary" : "destructive"
      } : undefined}>
          <div className="space-y-6">
            <TaskFinancialBreakdown projectId={selectedProjectId} />
            <TaskVsRealityAnalysis projectId={selectedProjectId} />
          </div>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="purchases" title="Análise de Compras e Requisições" icon={ShoppingCart} badge={{
        text: `${requisitions.filter(r => r.id_projeto === selectedProjectId).length} requisições`,
        variant: "outline"
      }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Gastos por Categoria de Compras
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingPurchases ? <div className="p-6">
                  <TableSkeleton />
                </div> : purchaseBreakdown.length === 0 ? <div className="text-center p-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Sem Dados de Compras</h3>
                  <p className="text-muted-foreground">
                    Não há requisições de compras cadastradas para este projeto.
                  </p>
                </div> : <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Total Requisições</TableHead>
                        <TableHead>Valor Pendente</TableHead>
                        <TableHead>Valor Aprovado</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>% Aprovação</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseBreakdown.map((item, index) => <TableRow key={index}>
                          <TableCell className="font-medium">{item.categoria}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.total_requisicoes}</Badge>
                          </TableCell>
                          <TableCell className="text-orange-600">
                            {formatCurrency(item.valor_pendente)}
                          </TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(item.valor_aprovado)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.valor_pendente + item.valor_aprovado)}
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${item.percentual_aprovacao >= 80 ? 'text-green-600' : item.percentual_aprovacao >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                              {item.percentual_aprovacao.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.percentual_aprovacao >= 80 ? 'default' : item.percentual_aprovacao >= 50 ? 'secondary' : 'destructive'}>
                              {item.percentual_aprovacao >= 80 ? 'Boa' : item.percentual_aprovacao >= 50 ? 'Média' : 'Baixa'}
                            </Badge>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>}
            </CardContent>
          </Card>
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="approvals" title="Aprovações Pendentes" icon={ClipboardCheck} badge={pendingApprovalsCount > 0 ? {
        text: `${pendingApprovalsCount}`,
        variant: "destructive"
      } : {
        text: "0",
        variant: "outline"
      }}>
          <OptimizedApprovalInterface projectId={selectedProjectId} />
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="audit" title="Auditoria e Discrepâncias" icon={Search} badge={discrepancies.length > 0 ? {
        text: `${discrepancies.length}`,
        variant: "destructive"
      } : undefined}>
          <DiscrepancyReport projectId={selectedProjectId} />
        </CollapsibleFinancialSection>

        <CollapsibleFinancialSection value="clientes" title="Contas Correntes - Clientes" icon={Users} badge={{
        text: `${clientes.length} clientes`,
        variant: "outline"
      }}>
          <ContasCorrentesSection projectId={selectedProjectId} mode="clientes" />
        </CollapsibleFinancialSection>
      </Accordion>
    </div>;
}