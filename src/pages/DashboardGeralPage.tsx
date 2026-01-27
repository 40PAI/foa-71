import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Wallet, CheckSquare, ShoppingCart, BarChart3, FileText, Building2, XCircle, Lightbulb, RefreshCw, TrendingUp, Package, PieChart } from "lucide-react";
import { useDashboardGeral } from "@/hooks/useDashboardGeral";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import SectionLoadingFallback, { KPILoadingFallback } from "@/components/loading/SectionLoadingFallback";

// Lazy load dashboard sections para melhor performance
const DashboardKPISection = lazy(() => import("@/components/dashboard/DashboardKPISection").then(m => ({ default: m.DashboardKPISection })));
const DashboardFinancasSection = lazy(() => import("@/components/dashboard/DashboardFinancasSection").then(m => ({ default: m.DashboardFinancasSection })));
const DashboardTarefasSection = lazy(() => import("@/components/dashboard/DashboardTarefasSection").then(m => ({ default: m.DashboardTarefasSection })));
const DashboardRequisicoesSection = lazy(() => import("@/components/dashboard/DashboardRequisicoesSection").then(m => ({ default: m.DashboardRequisicoesSection })));
const DashboardProjetosSection = lazy(() => import("@/components/dashboard/DashboardProjetosSection").then(m => ({ default: m.DashboardProjetosSection })));
const DashboardDRESection = lazy(() => import("@/components/dashboard/DashboardDRESection").then(m => ({ default: m.DashboardDRESection })));
const DashboardRelatoriosFOASection = lazy(() => import("@/components/dashboard/DashboardRelatoriosFOASection").then(m => ({ default: m.DashboardRelatoriosFOASection })));
const DashboardArmazemSection = lazy(() => import("@/components/dashboard/DashboardArmazemSection").then(m => ({ default: m.DashboardArmazemSection })));

// Lazy load analytics modals
const FinanceAnalyticsModal = lazy(() => import("@/components/modals/FinanceAnalyticsModal").then(m => ({ default: m.FinanceAnalyticsModal })));
const WarehouseAnalyticsModal = lazy(() => import("@/components/modals/WarehouseAnalyticsModal").then(m => ({ default: m.WarehouseAnalyticsModal })));

export function DashboardGeralPage() {
  return (
    <ErrorBoundary>
      <DashboardGeralContent />
    </ErrorBoundary>
  );
}

function DashboardGeralContent() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const permissions = useUserPermissions();
  useRealtimeDashboard(); // Atualização automática em tempo real
  const { data: dashboardData, isLoading, error, refetch } = useDashboardGeral();

  // Collapsible section states
  const [financasOpen, setFinancasOpen] = useState(true);
  const [tarefasOpen, setTarefasOpen] = useState(false);
  const [requisicoesOpen, setRequisicoesOpen] = useState(false);
  const [armazemOpen, setArmazemOpen] = useState(false);
  const [dreOpen, setDreOpen] = useState(false);
  const [relatoriosOpen, setRelatoriosOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);

  // Analytics modal states
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner text="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const isServerError = errorMessage.includes('extract') || 
                         errorMessage.includes('function') || 
                         errorMessage.includes('type');
    
    return (
      <div className="p-4 space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <strong>Erro ao carregar dashboard</strong>
              </div>
              <p className="text-sm mt-2">{errorMessage}</p>
              {isServerError && (
                <p className="text-xs text-muted-foreground mt-2 flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>Este erro indica um problema no cálculo de dados no servidor. Os dados básicos foram carregados como alternativa.</span>
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          <Button onClick={() => window.location.href = '/projetos'} variant="secondary">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ir para Projetos
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>
            Nenhum dado disponível no momento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { kpis_gerais, top_projetos_gasto, tarefas_resumo, top_projetos_tarefas, requisicoes_resumo, projetos_lista } = dashboardData;

  return (
    <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
      {/* Header with Analytics Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="Dashboard Geral FOA"
          description={`Bem-vindo, ${profile?.nome || 'Usuário'} - ${permissions.roleLabel}`}
        />
        <Button 
          onClick={() => navigate('/graficos')} 
          variant="outline"
          className="flex items-center gap-2 w-fit"
        >
          <PieChart className="h-4 w-4" />
          Analytics
        </Button>
      </div>

      {/* KPIs Principais */}
      <Suspense fallback={<KPILoadingFallback />}>
        <DashboardKPISection kpis={kpis_gerais} />
      </Suspense>

      {/* Seção de Finanças */}
      {permissions.canViewFinances && (
        <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Finanças
                  {financasOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
            {financasOpen && (
              <Button variant="outline" size="sm" onClick={() => setFinanceModalOpen(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Análise
              </Button>
            )}
          </div>
          <CollapsibleContent className="mt-4">
            <Suspense fallback={<SectionLoadingFallback rows={4} />}>
              <DashboardFinancasSection
                topProjetosGasto={top_projetos_gasto}
                orcamentoTotal={kpis_gerais.orcamento_total}
                gastoTotal={kpis_gerais.gasto_total}
              />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de Tarefas */}
      {permissions.canViewTasks && (
        <Collapsible open={tarefasOpen} onOpenChange={setTarefasOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Tarefas
                  {tarefasOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <Suspense fallback={<SectionLoadingFallback rows={4} />}>
              <DashboardTarefasSection
                tarefasResumo={tarefas_resumo}
                topProjetosTarefas={top_projetos_tarefas}
              />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de Requisições/Compras */}
      {permissions.canViewPurchases && (
        <Collapsible open={requisicoesOpen} onOpenChange={setRequisicoesOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Compras & Requisições
                  {requisicoesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <Suspense fallback={<SectionLoadingFallback rows={3} />}>
              <DashboardRequisicoesSection requisicoesResumo={requisicoes_resumo} />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de Armazém */}
      {permissions.canViewWarehouse && (
        <Collapsible open={armazemOpen} onOpenChange={setArmazemOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Armazém
                  {armazemOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <Suspense fallback={<SectionLoadingFallback rows={4} />}>
              <DashboardArmazemSection onOpenAnalytics={() => setWarehouseModalOpen(true)} />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de DRE */}
      {permissions.canViewFinances && (
        <Collapsible open={dreOpen} onOpenChange={setDreOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  DRE - Demonstração de Resultados
                  {dreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <Suspense fallback={<SectionLoadingFallback rows={5} />}>
              <DashboardDRESection />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de Relatórios FOA */}
      {permissions.canViewFinances && (
        <Collapsible open={relatoriosOpen} onOpenChange={setRelatoriosOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatórios FOA
                  {relatoriosOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <Suspense fallback={<SectionLoadingFallback rows={4} />}>
              <DashboardRelatoriosFOASection />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de Projetos */}
      <Collapsible open={projetosOpen} onOpenChange={setProjetosOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <span className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Projetos - Visão Rápida
                {projetosOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-4">
          <Suspense fallback={<SectionLoadingFallback rows={5} />}>
            <DashboardProjetosSection projetos={projetos_lista} />
          </Suspense>
        </CollapsibleContent>
      </Collapsible>

      {/* Mensagem informativa sobre visualização */}
      <Alert className="mt-6">
        <AlertDescription className="text-sm">
          <strong className="flex items-center gap-1.5">
            <span className="text-primary">ℹ️</span> Nota:
          </strong> Você está visualizando dados de {dashboardData.visible_project_count} projeto(s)
          baseado nas suas permissões de acesso ({permissions.roleLabel}).
        </AlertDescription>
      </Alert>

      {/* Analytics Modals */}
      <Suspense fallback={null}>
        <FinanceAnalyticsModal 
          open={financeModalOpen} 
          onOpenChange={setFinanceModalOpen} 
        />
      </Suspense>
      <Suspense fallback={null}>
        <WarehouseAnalyticsModal 
          open={warehouseModalOpen} 
          onOpenChange={setWarehouseModalOpen} 
        />
      </Suspense>
    </div>
  );
}
