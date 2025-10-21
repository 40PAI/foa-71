
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Download } from "lucide-react";
import { useProjectChartData } from "@/hooks/useProjectChartData";
import { useEnhancedFinancialChartData } from "@/hooks/useEnhancedFinancialChartData";
import { LoadingSpinner } from "../LoadingSpinner";
import { SCurveChart } from "../charts/SCurveChart";
import { GaugeChart } from "../charts/GaugeChart";
import { StackedBarChart } from "../charts/StackedBarChart";
import { BurndownChart } from "../charts/BurndownChart";
import { IncidentChart } from "../charts/IncidentChart";
import { KPICard } from "../KPICard";
import { formatCurrency } from "@/utils/formatters";
import { CentrosCustoChartSection } from "@/components/financial/CentrosCustoChartSection";
import { StageFinancialSection } from "@/components/financial/StageFinancialSection";
import { RequisitionsFinancialSection } from "@/components/financial/RequisitionsFinancialSection";
import { FornecedoresFinancialSection } from "@/components/financial/FornecedoresFinancialSection";
import { TasksFinancialSection } from "@/components/financial/TasksFinancialSection";
import { CollapsibleFinancialSection } from "@/components/financial/CollapsibleFinancialSection";
import { 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Package, 
  Users,
  AlertTriangle,
  DollarSign
} from "lucide-react";

interface ProjectChartsModalProps {
  projectId: number;
  projectName: string;
}

export function ProjectChartsModal({ projectId, projectName }: ProjectChartsModalProps) {
  const { data: chartData, isLoading, error } = useProjectChartData(projectId);
  const { data: financialData, isLoading: isLoadingFinancial } = useEnhancedFinancialChartData(projectId);

  if (isLoading || isLoadingFinancial) return <LoadingSpinner />;
  if (error || !chartData) return null;

  const handleExport = () => {
    // Implementar exportação futura
    console.log("Exportar gráficos");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Ver gráficos do projeto">
          <BarChart3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Gráficos do Projeto: {projectName}</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[80vh]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="finance">Finanças</TabsTrigger>
              <TabsTrigger value="purchases">Compras</TabsTrigger>
              <TabsTrigger value="warehouse">Armazém</TabsTrigger>
              <TabsTrigger value="hr">RH</TabsTrigger>
              <TabsTrigger value="safety">Segurança</TabsTrigger>
              <TabsTrigger value="lean">Lean</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* KPIs Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                  title="PPC (Programação Cumprida)"
                  value={`${chartData.kpis.ppc.toFixed(1)}%`}
                  subtitle="Meta: ≥ 85%"
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert={chartData.kpis.ppc >= 85 ? "green" : chartData.kpis.ppc >= 70 ? "yellow" : "red"}
                />
                <KPICard
                  title="Lead-time Médio"
                  value={`${chartData.kpis.leadTime.toFixed(1)} dias`}
                  subtitle="Compras"
                  icon={<Clock className="h-4 w-4" />}
                  alert={chartData.kpis.leadTime <= 7 ? "green" : chartData.kpis.leadTime <= 14 ? "yellow" : "red"}
                />
                <KPICard
                  title="Taxa de Utilização"
                  value={`${chartData.kpis.utilizationRate.toFixed(1)}%`}
                  subtitle="Equipamentos"
                  icon={<Package className="h-4 w-4" />}
                  alert={chartData.kpis.utilizationRate >= 75 ? "green" : chartData.kpis.utilizationRate >= 50 ? "yellow" : "red"}
                />
              </div>

              {/* Gráficos principais */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SCurveChart data={chartData.chartData.sCurve} />
                <GaugeChart 
                  value={chartData.kpis.ppc} 
                  title="PPC - Programação Cumprida" 
                />
              </div>

              <BurndownChart data={chartData.chartData.burndown} />
            </TabsContent>

            <TabsContent value="finance" className="space-y-6 mt-6">
              {/* Visão Geral Financeira */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                  title="Orçamento Total"
                  value={formatCurrency(chartData.project.orcamento)}
                  icon={TrendingUp}
                  variant="default"
                />
                <KPICard
                  title="Gasto Total"
                  value={formatCurrency(chartData.project.gasto)}
                  icon={TrendingUp}
                  variant={(chartData.project.gasto / chartData.project.orcamento) > 0.9 ? "warning" : "default"}
                />
                <KPICard
                  title="Saldo Disponível"
                  value={formatCurrency(chartData.project.orcamento - chartData.project.gasto)}
                  icon={DollarSign}
                  variant={(chartData.project.orcamento - chartData.project.gasto) < (chartData.project.orcamento * 0.2) ? "danger" : "default"}
                />
                <KPICard
                  title="Desvio Orçamental"
                  value={`${((chartData.project.gasto / chartData.project.orcamento - 1) * 100).toFixed(1)}%`}
                  icon={TrendingUp}
                  variant={(chartData.project.gasto / chartData.project.orcamento - 1) > 0.1 ? "danger" : "default"}
                />
              </div>

              <StackedBarChart
                data={chartData.chartData.finance}
                title="Orçado vs Real por Categoria"
              />

              {/* Seções Colapsáveis */}
              {financialData && (
                <>
                  <CollapsibleFinancialSection title="Centros de Custo" value="centros" icon={<DollarSign className="h-4 w-4" />} defaultOpen={false}>
                    <CentrosCustoChartSection data={financialData.centrosCusto} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Etapas do Projeto" value="etapas" icon={<Package className="h-4 w-4" />} defaultOpen={false}>
                    <StageFinancialSection data={financialData.etapas} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Requisições" value="requisicoes" icon={<Package className="h-4 w-4" />} defaultOpen={false}>
                    <RequisitionsFinancialSection data={financialData.requisicoes} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Fornecedores" value="fornecedores" icon={<Users className="h-4 w-4" />} defaultOpen={false}>
                    <FornecedoresFinancialSection data={financialData.fornecedores} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Análise de Tarefas" value="tarefas" icon={<TrendingUp className="h-4 w-4" />} defaultOpen={false}>
                    <TasksFinancialSection data={financialData.tarefas} />
                  </CollapsibleFinancialSection>
                </>
              )}
            </TabsContent>

            <TabsContent value="purchases" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                  title="Requisições Pendentes"
                  value={chartData.chartData.requisitions.filter(r => r.status_fluxo === "Pendente").length}
                  subtitle="Aguardando aprovação"
                  icon={<Clock className="h-4 w-4" />}
                  alert="yellow"
                />
                <KPICard
                  title="Em Cotação"
                  value={chartData.chartData.requisitions.filter(r => r.status_fluxo === "Cotações").length}
                  subtitle="Aguardando orçamentos"
                  icon={<Package className="h-4 w-4" />}
                  alert="yellow"
                />
                <KPICard
                  title="Recepcionadas"
                  value={chartData.chartData.requisitions.filter(r => r.status_fluxo === "Recepcionado").length}
                  subtitle="Materiais recebidos"
                  icon={<Package className="h-4 w-4" />}
                  alert="green"
                />
              </div>
            </TabsContent>

            <TabsContent value="warehouse" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                  title="Equipamentos Disponíveis"
                  value={chartData.chartData.patrimony.filter(p => p.status === "Disponível").length}
                  subtitle="Prontos para uso"
                  icon={<Package className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Em Uso"
                  value={chartData.chartData.patrimony.filter(p => p.status === "Em Uso").length}
                  subtitle="Ativos no projeto"
                  icon={<Package className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Em Manutenção"
                  value={chartData.chartData.patrimony.filter(p => p.status === "Manutenção").length}
                  subtitle="Indisponíveis"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  alert="yellow"
                />
                <KPICard
                  title="Taxa de Utilização"
                  value={`${chartData.kpis.utilizationRate.toFixed(1)}%`}
                  subtitle="Eficiência da frota"
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert={chartData.kpis.utilizationRate >= 75 ? "green" : "yellow"}
                />
              </div>
            </TabsContent>

            <TabsContent value="hr" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                  title="Total de Colaboradores"
                  value={chartData.chartData.employees.length}
                  subtitle="Alocados ao projeto"
                  icon={<Users className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Custo Hora Médio"
                  value={formatCurrency(chartData.chartData.employees.reduce((acc, emp) => acc + emp.custo_hora, 0) / Math.max(chartData.chartData.employees.length, 1))}
                  subtitle="Por colaborador"
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Categorias"
                  value={new Set(chartData.chartData.employees.map(emp => emp.categoria)).size}
                  subtitle="Diferentes perfis"
                  icon={<Users className="h-4 w-4" />}
                  alert="green"
                />
              </div>
            </TabsContent>

            <TabsContent value="safety" className="space-y-6 mt-6">
              <IncidentChart data={chartData.chartData.incidents} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                  title="Total de Incidentes"
                  value={chartData.chartData.incidents.reduce((acc, item) => acc + item.total, 0)}
                  subtitle="No período"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  alert={chartData.chartData.incidents.length === 0 ? "green" : "red"}
                />
                <KPICard
                  title="Média Mensal"
                  value={(chartData.chartData.incidents.reduce((acc, item) => acc + item.total, 0) / Math.max(chartData.chartData.incidents.length, 1)).toFixed(1)}
                  subtitle="Incidentes por mês"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  alert="yellow"
                />
                <KPICard
                  title="Índice de Segurança"
                  value={chartData.chartData.incidents.length === 0 ? "100%" : "Precisa Melhorar"}
                  subtitle="Status geral"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  alert={chartData.chartData.incidents.length === 0 ? "green" : "red"}
                />
              </div>
            </TabsContent>

            <TabsContent value="lean" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                  title="Residencial"
                  value={chartData.chartData.tasks.filter(t => t.tipo === "Residencial").length}
                  subtitle="Projetos residenciais"
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Comercial"
                  value={chartData.chartData.tasks.filter(t => t.tipo === "Comercial").length}
                  subtitle="Projetos comerciais"
                  icon={<Package className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Industrial"
                  value={chartData.chartData.tasks.filter(t => t.tipo === "Industrial").length}
                  subtitle="Projetos industriais"
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Taxa de Conclusão"
                  value={`${((chartData.chartData.tasks.filter(t => t.status === "Concluído").length / Math.max(chartData.chartData.tasks.length, 1)) * 100).toFixed(1)}%`}
                  subtitle="Tarefas concluídas"
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert="green"
                />
              </div>

              <BurndownChart data={chartData.chartData.burndown} />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
