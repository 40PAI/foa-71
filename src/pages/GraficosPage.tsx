import { useState } from "react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  Shield, 
  Download,
  PieChart,
  LineChart,
  Activity,
  Settings,
  AlertTriangle
} from "lucide-react";
import { IntegratedFinancialDashboard } from "@/components/IntegratedFinancialDashboard";
import { ProjectSelector } from "@/components/ProjectSelector";
import { ProjectGuard } from "@/components/ProjectGuard";
import { DonutChart } from "@/components/charts/DonutChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { TimelineChart } from "@/components/charts/TimelineChart";
import { HeatmapTable } from "@/components/charts/HeatmapTable";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { SCurveChart } from "@/components/charts/SCurveChart";
import { BurndownChart } from "@/components/charts/BurndownChart";
import { CashFlowAreaChart } from "@/components/charts/CashFlowAreaChart";
import { CostCenterUtilizationChart } from "@/components/charts/CostCenterUtilizationChart";
import { SupplierBalanceTreemap } from "@/components/charts/SupplierBalanceTreemap";
import { MaterialFlowChart } from "@/components/charts/MaterialFlowChart";
import { TopMaterialsChart } from "@/components/charts/TopMaterialsChart";
import { ConsumptionByProjectChart } from "@/components/charts/ConsumptionByProjectChart";
import { CriticalStockChart } from "@/components/charts/CriticalStockChart";
import { useOptimizedPurchaseBreakdown } from "@/hooks/useOptimizedPurchaseBreakdown";
import { useIntegratedDashboard } from "@/hooks/useIntegratedDashboard";
import { useWarehouseAnalytics } from "@/hooks/useWarehouseAnalytics";
import { useHRAnalytics } from "@/hooks/useHRAnalytics";
import { useManagementDashboard } from "@/hooks/useManagementDashboard";
import { useProjectChartData } from "@/hooks/useProjectChartData";
import { SmartKPICard } from "@/components/charts/SmartKPICard";
import { formatCurrency } from "@/utils/formatters";

// Componentes de placeholder para os gráficos interativos
const InteractiveFinanceChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Análise Financeira Interativa
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center space-y-2">
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Gráfico interativo em desenvolvimento</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PurchaseFlowChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Fluxo de Compras
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center space-y-2">
          <PieChart className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Gráfico de compras em desenvolvimento</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const WarehouseChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Gestão de Armazém
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center space-y-2">
          <LineChart className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Gráficos de armazém em desenvolvimento</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const HRChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Recursos Humanos & Ponto
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center space-y-2">
          <Activity className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Gráficos de RH em desenvolvimento</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SafetyChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Segurança e Higiene
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center space-y-2">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Gráficos de segurança em desenvolvimento</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componentes de conteúdo para cada tab
const ProjectChartsContent = ({ projectId }: { projectId: number }) => {
  const { data: chartData, isLoading } = useProjectChartData(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Carregando gráficos do projeto...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <GaugeChart 
        value={chartData?.metrics.physicalProgress || 0} 
        title="Avanço Físico" 
      />
      <TimelineChart 
        data={chartData?.chartData.sCurve?.map(item => ({
          periodo: item.periodo,
          avanco_linear: item.tempo,
          avanco_real: item.fisico,
          ppc_semanal: item.financeiro,
        })) || []} 
        title="Avanço Temporal vs Linear" 
      />
      <SCurveChart data={chartData?.chartData.sCurve || []} />
      <BurndownChart data={chartData?.chartData.burndown || []} />
    </div>
  );
};

const FinanceChartsContent = ({ projectId }: { projectId: number }) => {
  return (
    <div className="space-y-6">
      {/* New Financial Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <CashFlowAreaChart projectId={projectId} />
        <CostCenterUtilizationChart projectId={projectId} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <SupplierBalanceTreemap projectId={projectId} />
        <div>
          <IntegratedFinancialDashboard projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

const PurchaseChartsContent = ({ projectId }: { projectId: number }) => {
  const { data: purchaseData, isLoading } = useOptimizedPurchaseBreakdown(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Carregando gráficos de compras...
      </div>
    );
  }

  // Usar dados reais para o gráfico donut
  const donutData = purchaseData?.map(item => ({
    name: item.categoria,
    value: item.total_requisicoes,
    status: item.percentual_aprovacao > 80 ? 'aprovado' as const : 
           item.percentual_aprovacao > 50 ? 'cotacoes' as const : 'pendente' as const
  })) || [];

  // Transformar dados reais para heatmap por categoria
  const heatmapData = purchaseData?.map((item, index) => ({
    frente: item.categoria,
    categories: {
      "Pendente": { 
        value: Math.round((100 - item.percentual_aprovacao) / 100 * item.total_requisicoes), 
        intensity: item.percentual_aprovacao < 50 ? 'high' as const : 'low' as const 
      },
      "Aprovado": { 
        value: Math.round(item.percentual_aprovacao / 100 * item.total_requisicoes), 
        intensity: item.percentual_aprovacao > 80 ? 'high' as const : 'medium' as const 
      },
      "Valor (k€)": { 
        value: Math.round(item.valor_aprovado / 1000), 
        intensity: item.valor_aprovado > 50000 ? 'high' as const : 'medium' as const 
      },
    }
  })) || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      <div className="xl:col-span-1">
        <DonutChart data={donutData} title="Requisições por Categoria" />
      </div>
      <div className="xl:col-span-1">
        <HeatmapTable 
          data={heatmapData} 
          title="Breakdown por Categoria"
          categories={["Pendente", "Aprovado", "Valor (k€)"]}
        />
      </div>
    </div>
  );
};

const WarehouseChartsContent = ({ projectId }: { projectId: number }) => {
  return (
    <div className="space-y-6">
      {/* New Material Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <MaterialFlowChart projectId={projectId} />
        <TopMaterialsChart projectId={projectId} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <ConsumptionByProjectChart />
        <CriticalStockChart />
      </div>
    </div>
  );
};

const HRChartsContent = ({ projectId }: { projectId: number }) => {
  const { data: hrData, isLoading } = useHRAnalytics(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Carregando gráficos de RH...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards Grid - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <SmartKPICard
          title="Total de Atrasos"
          value={hrData?.hr_kpis.total_atrasos || 0}
          type="alert"
          trend={hrData?.hr_kpis.variacao_semanal_atrasos && hrData.hr_kpis.variacao_semanal_atrasos > 0 ? 'up' : 'down'}
          trendValue={`${hrData?.hr_kpis.variacao_semanal_atrasos || 0} esta semana`}
          subtitle="Colaboradores atrasados"
        />
        
        <SmartKPICard
          title="Total de Faltas"
          value={hrData?.hr_kpis.total_faltas || 0}
          type="warning"
          trend={hrData?.hr_kpis.variacao_semanal_faltas && hrData.hr_kpis.variacao_semanal_faltas > 0 ? 'up' : 'down'}
          trendValue={`${hrData?.hr_kpis.variacao_semanal_faltas || 0} esta semana`}
          subtitle="Ausências registradas"
        />
        
        <SmartKPICard
          title="Horas Extras"
          value={`${hrData?.hr_kpis.horas_extras || 0}h`}
          type="financial"
          subtitle="Horas adicionais trabalhadas"
        />
        
        <SmartKPICard
          title="Taxa de Absentismo"
          value={`${(hrData?.hr_kpis?.absentismo_percentual ?? 0).toFixed(1)}%`}
          type={(hrData?.hr_kpis?.absentismo_percentual ?? 0) > 10 ? 'alert' : 'success'}
          subtitle="Percentual de ausências"
        />
      </div>

      {/* Chart - Ocupa toda a largura em mobile, 2 colunas em desktop */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Horas por Tipo de Colaborador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {hrData?.work_hours_by_type.map((tipo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-sm">
                  <span className="font-medium">{tipo.tipo_colaborador}</span>
                  <div className="flex items-center gap-2">
                    <span>{tipo.horas_trabalhadas}h</span>
                    <Badge variant="outline" className="text-xs">{formatCurrency(tipo.custo_total)}</Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 sm:h-3">
                  <div 
                    className={`rounded-full h-2 sm:h-3 transition-all duration-500 ${
                      index === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      index === 1 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      'bg-gradient-to-r from-purple-400 to-purple-600'
                    }`}
                    style={{ width: `${Math.min((tipo.horas_trabalhadas / 300) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ManagementChartsContent = () => {
  const { data: managementData, isLoading } = useManagementDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Carregando painel de direção...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPIs Consolidados - Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <SmartKPICard
          title="Total Projetos"
          value={managementData?.consolidated_kpis.total_projetos || 0}
          type="performance"
          subtitle="Projetos ativos"
        />
        <SmartKPICard
          title="No Prazo"
          value={managementData?.consolidated_kpis.projetos_no_prazo || 0}
          type="success"
          subtitle="Projetos em dia"
        />
        <SmartKPICard
          title="Atrasados"
          value={managementData?.consolidated_kpis.projetos_atrasados || 0}
          type="alert"
          subtitle="Precisam de atenção"
        />
        <SmartKPICard
          title="PPC Médio"
          value={`${managementData?.consolidated_kpis.ppc_medio_geral || 0}%`}
          type="financial"
          subtitle="Performance geral"
        />
      </div>

      {/* Heatmap de Performance - Layout responsivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            Performance por Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {managementData?.performance_heatmap.map((projeto) => (
              <div 
                key={projeto.projeto_id}
                className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  projeto.status_alerta === 'verde' ? 
                    'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-green-200/50 hover:shadow-lg' :
                  projeto.status_alerta === 'amarelo' ? 
                    'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-yellow-200/50 hover:shadow-lg' :
                    'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-red-200/50 hover:shadow-lg'
                }`}
              >
                <div className="font-semibold text-sm truncate" title={projeto.projeto_nome}>
                  {projeto.projeto_nome}
                </div>
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <div>
                    <span className="font-medium">Físico:</span> {projeto.avanco_fisico}%
                  </div>
                  <div>
                    <span className="font-medium">Financeiro:</span> {projeto.avanco_financeiro}%
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Score:</span> {projeto.produtividade_score}%
                  </div>
                  <Badge 
                    variant={projeto.status_alerta === 'verde' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {projeto.status_alerta === 'verde' ? '✓' : '⚠'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ranking de Produtividade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Ranking de Produtividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {managementData?.productivity_ranking.slice(0, 10).map((projeto) => (
              <div key={projeto.projeto_id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded text-sm">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className="w-6 sm:w-8 text-center text-xs flex-shrink-0">
                    {projeto.ranking_position}
                  </Badge>
                  <span className="font-medium truncate" title={projeto.projeto_nome}>
                    {projeto.projeto_nome}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold">
                    {projeto.produtividade_percentual}%
                  </span>
                  {projeto.tendencia === 'up' ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : projeto.tendencia === 'down' ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 rotate-180" />
                  ) : (
                    <div className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function GraficosPage() {
  const { selectedProjectId, setSelectedProjectId } = useProjectContext();
  const [activeTab, setActiveTab] = useState("projetos");

  const exportData = () => {
    // Implementar exportação de dados
    console.log("Exportando dados...");
  };

  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value ? parseInt(value) : null);
  };

  if (!selectedProjectId) {
    return (
      <div className="w-full space-y-4 sm:space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Gráficos por Área</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Selecione um projeto para visualizar os gráficos detalhados
          </p>
          <ProjectSelector 
            value=""
            onValueChange={handleProjectChange}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 layout-full-width">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Gráficos por Área</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Análise visual detalhada por área funcional
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Badge variant="outline" className="text-center py-2 sm:py-1">
            Projeto #{selectedProjectId}
          </Badge>
          <Button onClick={exportData} variant="outline" size="sm" className="min-h-[44px] sm:min-h-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* Tabs responsivas com scroll horizontal em mobile */}
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-6 w-max min-w-full sm:w-full gap-1 p-1">
            <TabsTrigger 
              value="projetos" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-[80px] sm:min-w-auto"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Projetos</span>
              <span className="sm:hidden">Proj</span>
            </TabsTrigger>
            <TabsTrigger 
              value="financas" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-[80px] sm:min-w-auto"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Finanças</span>
              <span className="sm:hidden">Fin</span>
            </TabsTrigger>
            <TabsTrigger 
              value="compras" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-[80px] sm:min-w-auto"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Compras</span>
              <span className="sm:hidden">Comp</span>
            </TabsTrigger>
            <TabsTrigger 
              value="armazem" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-[80px] sm:min-w-auto"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Armazém</span>
              <span className="sm:hidden">Arm</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rh" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-[80px] sm:min-w-auto"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">RH & Ponto</span>
              <span className="sm:hidden">RH</span>
            </TabsTrigger>
            <TabsTrigger 
              value="direcao" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-[80px] sm:min-w-auto"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Direção</span>
              <span className="sm:hidden">Dir</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="projetos" className="w-full layout-content-spacing">
          <ProjectChartsContent projectId={selectedProjectId} />
        </TabsContent>

        <TabsContent value="financas" className="w-full layout-content-spacing">
          <FinanceChartsContent projectId={selectedProjectId} />
        </TabsContent>

        <TabsContent value="compras" className="w-full layout-content-spacing">
          <PurchaseChartsContent projectId={selectedProjectId} />
        </TabsContent>

        <TabsContent value="armazem" className="w-full layout-content-spacing">
          <WarehouseChartsContent projectId={selectedProjectId} />
        </TabsContent>

        <TabsContent value="rh" className="w-full layout-content-spacing">
          <HRChartsContent projectId={selectedProjectId} />
        </TabsContent>

        <TabsContent value="direcao" className="w-full layout-content-spacing">
          <ManagementChartsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}