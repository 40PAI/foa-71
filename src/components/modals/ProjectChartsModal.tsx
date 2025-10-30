
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
import { Accordion } from "@/components/ui/accordion";
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
  DollarSign,
  CheckCircle,
  ShoppingCart
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="finance">Finanças</TabsTrigger>
              <TabsTrigger value="purchases">Compras</TabsTrigger>
              <TabsTrigger value="warehouse">Armazém</TabsTrigger>
              <TabsTrigger value="hr">RH</TabsTrigger>
              <TabsTrigger value="safety">Segurança</TabsTrigger>
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
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <KPICard
                  title="Gasto Total"
                  value={formatCurrency(chartData.project.gasto)}
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert={(chartData.project.gasto / chartData.project.orcamento) > 0.9 ? "red" : "green"}
                />
                <KPICard
                  title="Saldo Disponível"
                  value={formatCurrency(chartData.project.orcamento - chartData.project.gasto)}
                  icon={<DollarSign className="h-4 w-4" />}
                  alert={(chartData.project.orcamento - chartData.project.gasto) < (chartData.project.orcamento * 0.2) ? "red" : "green"}
                />
                <KPICard
                  title="Desvio Orçamental"
                  value={`${((chartData.project.gasto / chartData.project.orcamento - 1) * 100).toFixed(1)}%`}
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert={(chartData.project.gasto / chartData.project.orcamento - 1) > 0.1 ? "red" : "green"}
                />
              </div>

              <StackedBarChart
                data={chartData.chartData.finance}
                title="Orçado vs Real por Categoria"
              />

              {/* Seções Colapsáveis */}
              {financialData && (
                <Accordion type="multiple" className="space-y-4">
                  <CollapsibleFinancialSection title="Centros de Custo" value="centros" icon={DollarSign} defaultOpen={false}>
                    <CentrosCustoChartSection data={financialData.centrosCusto} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Etapas do Projeto" value="etapas" icon={Package} defaultOpen={false}>
                    <StageFinancialSection data={financialData.etapas} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Requisições" value="requisicoes" icon={Package} defaultOpen={false}>
                    <RequisitionsFinancialSection data={financialData.requisicoes} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Fornecedores" value="fornecedores" icon={Users} defaultOpen={false}>
                    <FornecedoresFinancialSection data={financialData.fornecedores} />
                  </CollapsibleFinancialSection>

                  <CollapsibleFinancialSection title="Análise de Tarefas" value="tarefas" icon={TrendingUp} defaultOpen={false}>
                    <TasksFinancialSection data={financialData.tarefas} />
                  </CollapsibleFinancialSection>
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="purchases" className="space-y-6 mt-6">
              {/* KPIs Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                  title="Total de Requisições"
                  value={chartData.kpis.purchases.total}
                  subtitle="Nesta obra"
                  icon={<Package className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Requisições Aprovadas"
                  value={chartData.kpis.purchases.aprovadas}
                  subtitle="OC geradas ou recepcionadas"
                  icon={<CheckCircle className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Taxa de Aprovação"
                  value={`${chartData.kpis.purchases.taxaAprovacao.toFixed(1)}%`}
                  subtitle="Do total de requisições"
                  icon={<TrendingUp className="h-4 w-4" />}
                  alert={chartData.kpis.purchases.taxaAprovacao >= 80 ? "green" : chartData.kpis.purchases.taxaAprovacao >= 60 ? "yellow" : "red"}
                />
              </div>

              {/* KPIs Secundários */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                  title="Valor Total das Requisições"
                  value={formatCurrency(chartData.kpis.purchases.valorTotal)}
                  subtitle="Todas as requisições"
                  icon={<DollarSign className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Pendentes de Aprovação"
                  value={chartData.kpis.purchases.pendentes}
                  subtitle="Aguardando decisão"
                  icon={<Clock className="h-4 w-4" />}
                  alert={chartData.kpis.purchases.pendentes > 5 ? "yellow" : "green"}
                />
                <KPICard
                  title="Em Processo de Compra"
                  value={chartData.kpis.purchases.emProcesso}
                  subtitle="Cotações e aprovações"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  alert="yellow"
                />
              </div>

              {/* Distribuição por Status */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Distribuição por Status</h3>
                <div className="space-y-3">
                  {Object.entries(
                    chartData.chartData.requisitions.reduce((acc, req) => {
                      acc[req.status_fluxo] = (acc[req.status_fluxo] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{status}</p>
                        <p className="text-sm text-muted-foreground">
                          {((count / chartData.chartData.requisitions.length) * 100).toFixed(1)}% do total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground">requisições</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Últimas Requisições */}
              {chartData.chartData.requisitions.length > 0 && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Últimas Requisições</h3>
                  <div className="space-y-2">
                    {chartData.chartData.requisitions.slice(0, 10).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{req.nome_comercial_produto || 'Sem descrição'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(req.data_requisicao).toLocaleDateString('pt-PT')} • {req.requisitante}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="font-semibold">{formatCurrency(req.valor || 0)}</p>
                            <p className="text-xs text-muted-foreground">{req.status_fluxo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="warehouse" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                  title="Materiais Alocados"
                  value={chartData.chartData.warehouseMaterials?.total || 0}
                  subtitle="Total no projeto"
                  icon={<Package className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Materiais Disponíveis"
                  value={chartData.chartData.warehouseMaterials?.disponivel || 0}
                  subtitle="Prontos para uso"
                  icon={<Package className="h-4 w-4" />}
                  alert="green"
                />
                <KPICard
                  title="Em Uso no Projeto"
                  value={chartData.chartData.warehouseMaterials?.emUso || 0}
                  subtitle="Atualmente utilizados"
                  icon={<Package className="h-4 w-4" />}
                  alert="yellow"
                />
                <KPICard
                  title="Reservados"
                  value={chartData.chartData.warehouseMaterials?.reservado || 0}
                  subtitle="Aguardando uso"
                  icon={<Clock className="h-4 w-4" />}
                  alert="yellow"
                />
              </div>

              {/* Distribuição por Categoria */}
              {chartData.chartData.warehouseMaterials?.byCategory && chartData.chartData.warehouseMaterials.byCategory.length > 0 && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Distribuição de Materiais por Categoria</h3>
                  <div className="space-y-3">
                    {chartData.chartData.warehouseMaterials.byCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.categoria}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantidade} {item.quantidade === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.quantidadeStock.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">em stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
