import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useDashboardGeral } from "@/hooks/useDashboardGeral";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardKPISection } from "@/components/dashboard/DashboardKPISection";
import { DashboardFinancasSection } from "@/components/dashboard/DashboardFinancasSection";
import { DashboardTarefasSection } from "@/components/dashboard/DashboardTarefasSection";
import { DashboardRequisicoesSection } from "@/components/dashboard/DashboardRequisicoesSection";
import { DashboardProjetosSection } from "@/components/dashboard/DashboardProjetosSection";
import { DashboardDRESection } from "@/components/dashboard/DashboardDRESection";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export function DashboardGeralPage() {
  return (
    <ErrorBoundary>
      <DashboardGeralContent />
    </ErrorBoundary>
  );
}

function DashboardGeralContent() {
  const { profile } = useAuth();
  const permissions = useUserPermissions();
  const { data: dashboardData, isLoading, error, refetch } = useDashboardGeral();

  const [financasOpen, setFinancasOpen] = useState(true);
  const [tarefasOpen, setTarefasOpen] = useState(false);
  const [requisicoesOpen, setRequisicoesOpen] = useState(false);
  const [dreOpen, setDreOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);

  if (isLoading) {
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
              <strong>❌ Erro ao carregar dashboard</strong>
              <p className="text-sm mt-2">{errorMessage}</p>
              {isServerError && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Este erro indica um problema no cálculo de dados no servidor. 
                  Os dados básicos foram carregados como alternativa.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            🔄 Tentar novamente
          </Button>
          <Button onClick={() => window.location.href = '/projetos'} variant="secondary">
            📊 Ir para Projetos
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Dashboard Geral FOA"
        description={`Bem-vindo, ${profile?.nome || 'Usuário'} - ${permissions.roleLabel}`}
      />

      {/* KPIs Principais */}
      <DashboardKPISection kpis={kpis_gerais} />

      {/* Seção de Finanças */}
      {permissions.canViewFinances && (
        <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <span className="text-lg font-semibold flex items-center gap-2">
                  💰 Finanças
                  {financasOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <DashboardFinancasSection
              topProjetosGasto={top_projetos_gasto}
              orcamentoTotal={kpis_gerais.orcamento_total}
              gastoTotal={kpis_gerais.gasto_total}
            />
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
                  ✅ Tarefas
                  {tarefasOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <DashboardTarefasSection
              tarefasResumo={tarefas_resumo}
              topProjetosTarefas={top_projetos_tarefas}
            />
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
                  🛒 Compras & Requisições
                  {requisicoesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <DashboardRequisicoesSection requisicoesResumo={requisicoes_resumo} />
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
                  📊 DRE - Demonstração de Resultados
                  {dreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <DashboardDRESection />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de Projetos */}
      <Collapsible open={projetosOpen} onOpenChange={setProjetosOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <span className="text-lg font-semibold flex items-center gap-2">
                🏗️ Projetos - Visão Rápida
                {projetosOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-4">
          <DashboardProjetosSection projetos={projetos_lista} />
        </CollapsibleContent>
      </Collapsible>

      {/* Mensagem informativa sobre visualização */}
      <Alert className="mt-6">
        <AlertDescription className="text-sm">
          <strong>ℹ️ Nota:</strong> Você está visualizando dados de {dashboardData.visible_project_count} projeto(s) 
          baseado nas suas permissões de acesso ({permissions.roleLabel}).
        </AlertDescription>
      </Alert>
    </div>
  );
}
