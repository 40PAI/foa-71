
# Plano: Sistema de Tooltips Informativos (Ícone "i") em KPIs e Gráficos

## Objetivo
Adicionar um ícone de informação (`i`) discreto no canto superior direito de **todos os cards KPI, gráficos e secções analíticas** da plataforma. Ao passar o mouse (ou tocar, no mobile), mostra um tooltip explicando:
1. **O que o card/gráfico mostra**
2. **A fórmula ou lógica de cálculo usada**

## Análise da Plataforma

Identifiquei os seguintes componentes reutilizáveis que precisam ser estendidos:

### Componentes KPI (núcleo)
- `src/components/KPICard.tsx` — KPI base usado em quase todo lado
- `src/components/charts/SmartKPICard.tsx` — KPI estilizado (financeiro)
- `src/components/common/KPIGrid.tsx` — Grelha que distribui KPIs
- `src/components/mobile/MobileKPIGrid.tsx` — Versão mobile

### Componentes Gráficos (todos em `src/components/charts/`)
- BurndownChart, CashFlowAreaChart, ConsumptionByProjectChart, CostCenterUtilizationChart, CriticalStockChart, DonutChart, GaugeChart, GroupedBarChart, HeatmapTable, HorizontalBarChart, IncidentChart, MaterialFlowChart, RadarChart, SCurveChart, SparklineChart, StackedBarChart, StageComparisonChart, StageCostsPieChart, SupplierBalanceTreemap, TimelineChart, TimelineComparisonChart, TopMaterialsChart, PPCChart
- Wrapper: `ExpandableChartWrapper.tsx`

### Secções com KPIs/gráficos diretos
- `dashboard/*` (DashboardKPISection, DashboardFinancasSection, etc.)
- `financial/*` (CashFlowKPICards, FluxoCaixaKPICards, FornecedoresKPICards, GastosObraKPICards, ClientesKPICards, etc.)
- `projects/ProjectsKPISection.tsx`, `ProjectKPICards.tsx`

## Estratégia (centralizada, não repetitiva)

Em vez de tocar em centenas de ficheiros, criamos **componentes wrapper reutilizáveis** e adicionamos a prop `info` aos componentes base. Quem consome passa a info; quem não passa, nada muda.

### Passo 1 — Criar componente base `InfoTooltip`
**Novo ficheiro**: `src/components/common/InfoTooltip.tsx`

- Ícone `Info` (lucide-react), tamanho pequeno, cor `text-muted-foreground`
- Usa `Tooltip` do shadcn (`@/components/ui/tooltip`) — já existe
- Props: `title?`, `description`, `formula?`, `side?` (default: "left")
- No mobile, abre com tap (usar `onClick` + estado interno) já que hover não funciona em touch
- Conteúdo formatado com título em **bold**, descrição normal, e bloco "Fórmula:" em `font-mono` quando existir

### Passo 2 — Criar wrapper `ChartCardHeader`
**Novo ficheiro**: `src/components/common/ChartCardHeader.tsx`

- Header padronizado para gráficos: título + ícone `i` no canto direito
- Drop-in para qualquer gráfico embrulhado em `<Card>`

### Passo 3 — Estender componentes base com prop `info`

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/KPICard.tsx` | Adicionar prop opcional `info?: { description: string; formula?: string }` e renderizar `<InfoTooltip>` no header |
| `src/components/charts/SmartKPICard.tsx` | Mesmo tratamento |
| `src/components/common/KPIGrid.tsx` | Repassar `info` do item para `KPICard` |
| `src/components/mobile/MobileKPIGrid.tsx` | Repassar `info` |
| `src/components/charts/ExpandableChartWrapper.tsx` | Adicionar prop `info` e mostrar ícone ao lado do título |

### Passo 4 — Preencher conteúdo de info em todos os consumidores

Criar um **dicionário central de descrições** para evitar duplicação e facilitar manutenção:

**Novo ficheiro**: `src/lib/kpiDescriptions.ts`

```ts
export const KPI_INFO = {
  projetosAtivos: {
    description: "Número de projetos com status diferente de 'Concluído' ou 'Cancelado'.",
    formula: "COUNT(projetos WHERE status NOT IN ('Concluído','Cancelado'))"
  },
  projetosAtrasados: {
    description: "Projetos ativos cuja data fim prevista já passou.",
    formula: "COUNT(projetos ativos WHERE data_fim_prevista < hoje)"
  },
  avancoMedio: {
    description: "Média aritmética do avanço físico de todos os projetos ativos.",
    formula: "SUM(avanco_fisico) / COUNT(projetos ativos)"
  },
  // ... + ~50 entradas cobrindo todos os KPIs/gráficos
};
```

Depois, em cada secção que monta KPIs (ex.: `ProjectsKPISection`, `DashboardKPISection`, `FluxoCaixaKPICards`, etc.), adiciona-se `info: KPI_INFO.xxx` ao item correspondente.

### Passo 5 — Aplicar nos gráficos

Para cada gráfico em `src/components/charts/*`, substituir o `CardHeader` atual por `<ChartCardHeader title="..." info={...} />` quando o gráfico estiver dentro de um Card próprio. Para gráficos sem Card (usados como filhos), adicionar o ícone ao lado do título no componente pai.

## Ficheiros a Criar
1. `src/components/common/InfoTooltip.tsx`
2. `src/components/common/ChartCardHeader.tsx`
3. `src/lib/kpiDescriptions.ts`

## Ficheiros a Modificar (resumo)
- **Base (5)**: `KPICard.tsx`, `SmartKPICard.tsx`, `KPIGrid.tsx`, `MobileKPIGrid.tsx`, `ExpandableChartWrapper.tsx`
- **Secções de KPIs (~12)**: `ProjectsKPISection`, `ProjectKPICards`, `DashboardKPISection`, `DashboardFinancasSection`, `DashboardProjetosSection`, `DashboardArmazemSection`, `DashboardTarefasSection`, `DashboardRequisicoesSection`, `DashboardDRESection`, `DashboardRelatoriosFOASection`, `CashFlowKPICards`, `FluxoCaixaKPICards`, `FornecedoresKPICards`, `GastosObraKPICards`, `ClientesKPICards`
- **Gráficos (~22)**: todos em `src/components/charts/` que tenham Card próprio
- **Outros**: `IntegratedFinancialDashboard`, `EnhancedFinancialDashboard`, `ExpandedFinancialDashboard`, `ExecutiveFOADashboard`, `FinancialOverview`, `DiscrepancyReport`, `StageProgressCard`

## Comportamento UX

- **Desktop**: hover no ícone → tooltip aparece após ~150ms, fica visível enquanto o mouse estiver sobre o ícone ou tooltip
- **Mobile/Touch**: tap no ícone → popover aparece, fecha ao tocar fora
- **Posição**: `side="left"` por defeito para não sair do card; `align="start"`
- **Estilo**: largura máxima `max-w-xs` (288px), padding confortável, fórmula em bloco `<code>` com fundo subtil

## Resultado Visual

```text
┌─────────────────────────────────┐
│ Projetos Ativos          📊  ⓘ  │ ← ícone "i" aqui
├─────────────────────────────────┤
│ 12                              │
│ 3 concluídos, 1 cancelado       │
└─────────────────────────────────┘

   Hover →  ┌──────────────────────────────┐
            │ Projetos Ativos              │
            │                              │
            │ Número de projetos com       │
            │ status diferente de          │
            │ 'Concluído' ou 'Cancelado'.  │
            │                              │
            │ Fórmula:                     │
            │ COUNT(projetos WHERE         │
            │ status NOT IN (...))         │
            └──────────────────────────────┘
```

## Estimativa de Esforço
~40 ficheiros tocados, mas a maioria são alterações de 1-3 linhas (adicionar `info={KPI_INFO.xxx}`). O grosso do trabalho é escrever o conteúdo das descrições/fórmulas em `kpiDescriptions.ts`.
