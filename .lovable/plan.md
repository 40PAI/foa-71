

# Plano: Completar tooltips "i" em gráficos e módulos restantes

## Diagnóstico

A primeira passagem só tocou **componentes-base** (`KPICard`, `SmartKPICard`) e algumas secções financeiras. Ficou em falta:

1. **Os 22 gráficos** em `src/components/charts/*` — cada um renderiza o seu próprio `<Card><CardHeader><CardTitle>` (não usam `ChartCardHeader` nem `ExpandableChartWrapper`), por isso o ícone `i` nunca aparece.
2. **Módulos com KPIs/cards próprios** que não passam por `KPICard`:
   - `pages/RhPage.tsx` — KPIs Total/Fixos/Temporários/Oficiais/Técnicos (divs simples)
   - `components/warehouse/WarehouseReportSection.tsx` — KPIs Entradas/Saídas/Consumos/Devoluções
   - `dashboard/DashboardTarefasSection.tsx` — KPIs Total/Concluídas/Em Andamento/Atrasadas
   - `dashboard/DashboardArmazemSection.tsx`, `DashboardRequisicoesSection.tsx`, `DashboardDRESection.tsx`, `DashboardProjetosSection.tsx`, `DashboardFinancasSection.tsx`, `DashboardRelatoriosFOASection.tsx`
   - `modals/ProjectChartsModal.tsx` (KPIs do tab "Compras", "RH", "Segurança")
   - `modals/RequisitionsAnalyticsModal.tsx`, `WarehouseAnalyticsModal.tsx`, `FinanceAnalyticsModal.tsx`

## Estratégia

Manter o que já existe e adicionar `<InfoTooltip>` em **dois sítios padronizados**:

### A) Para cada chart em `src/components/charts/*`
Adicionar prop opcional `info?: InfoTooltipContent` e renderizar o ícone ao lado do botão `Maximize2`. Também passar para o `<DialogTitle>` do modal expandido.

```tsx
<CardTitle className="flex items-center gap-2 ...">
  <Icon /> {title}
  {info && <InfoTooltip {...info} title={info.title || title} />}  // novo
</CardTitle>
```

Os 22 ficheiros: `SCurveChart`, `BurndownChart`, `GaugeChart`, `IncidentChart`, `StackedBarChart`, `GroupedBarChart`, `HorizontalBarChart`, `DonutChart`, `RadarChart`, `TimelineChart`, `TimelineComparisonChart`, `HeatmapTable`, `MaterialFlowChart`, `CashFlowAreaChart`, `ConsumptionByProjectChart`, `CostCenterUtilizationChart`, `CriticalStockChart`, `StageComparisonChart`, `StageCostsPieChart`, `SupplierBalanceTreemap`, `TopMaterialsChart`, `SparklineChart`.

Cada um recebe um default sensato a partir de `KPI_INFO` (ex.: `SCurveChart` → `KPI_INFO.graficoSCurve`), aplicado no consumidor.

### B) Para KPIs "manuais" (divs em vez de `KPICard`)
Substituir o `<div>` solto por `<KPICard ... info={KPI_INFO.xxx} />` quando faz sentido, OU adicionar o ícone manualmente no header da secção/card.

Ficheiros a tocar:
- `RhPage.tsx` (5 KPIs RH)
- `WarehouseReportSection.tsx` (4 KPIs movimentos)
- `DashboardTarefasSection.tsx`, `DashboardArmazemSection.tsx`, `DashboardRequisicoesSection.tsx`, `DashboardDRESection.tsx`, `DashboardProjetosSection.tsx`, `DashboardFinancasSection.tsx`, `DashboardRelatoriosFOASection.tsx`
- `ProjectChartsModal.tsx` (KPIs nos tabs Compras/RH/Segurança usam `<KPICard>` — basta passar `info`)
- `RequisitionsAnalyticsModal.tsx`, `WarehouseAnalyticsModal.tsx`, `FinanceAnalyticsModal.tsx`

### C) Acrescentar entradas em falta a `kpiDescriptions.ts`
Adicionar chaves para: `funcionariosFixos`, `funcionariosTemporarios`, `funcionariosOficiais`, `funcionariosTecnicos`, `entradasMaterial`, `saidasMaterial`, `consumosMaterial`, `devolucoesMaterial`, `tarefasEmAndamento`, `taxaConclusaoTarefas`, `requisicoesEmProcesso`, `taxaAprovacaoCompras`, `valorTotalRequisicoes`, `pendentesAprovacao`, `leadTimeMedio`, `taxaUtilizacao`, `ppcProjeto`.

## Resultado por imagem do utilizador

| Imagem | Onde ficará o ícone "i" |
|--------|--------------------------|
| Tarefas (8/Taxa/Atrasadas/Em Andamento) | em cada KPICard do topo |
| RH (Total/Fixos/Temporários/Oficiais/Técnicos) | em cada KPI |
| Armazém - Relatórios (Entradas/Saídas/Consumos/Devoluções) | em cada KPI |
| Modal Gráficos > Compras (6 KPIs) | em cada KPICard |
| Modal Gráficos > Visão Geral (PPC/Lead-time/Taxa Utilização + S-Curve + PPC + Burndown) | nos KPIs e no header de cada chart |

## Execução
1. Estender os 22 charts com prop `info` + render do ícone
2. Estender `kpiDescriptions.ts` com ~15 entradas novas
3. Wirar `info={KPI_INFO.xxx}` em cada consumidor (modais + dashboard sections + RhPage + WarehouseReportSection + ProjectChartsModal)

Estimativa: ~30 ficheiros, alterações pequenas e mecânicas.

