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
  const { data: dashboardData, isLoading, error } = useDashboardGeral();

  const [financasOpen, setFinancasOpen] = useState(true);
  const [tarefasOpen, setTarefasOpen] = useState(false);
  const [requisicoesOpen, setRequisicoesOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner text="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Erro ao carregar dashboard:</strong> {error instanceof Error ? error.message : 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar novamente
        </Button>
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
