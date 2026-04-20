

# Plano: Adicionar ícone "i" nos módulos restantes

## Módulos identificados sem tooltips

1. **Submódulos de Finanças** (cada página tem KPIs e cards próprios sem `info`):
   - `src/pages/CentrosCustoPage.tsx` — 4 KPIs (Orçamento Total, Total Custo, Saldo Disponível, Em Alerta) + 2 gráficos (Evolução Temporal, Despesas por Categoria)
   - `src/pages/ComprasPage.tsx` — 4 `<KPICard>` (Total Requisições, Pendentes, Valor Total, Lead-time) + cards "Fluxo de Requisições", "Limites de Aprovação", "Observações"
   - `src/pages/ContasFornecedoresPage.tsx` — 4 KPIs (Total Contas, Crédito Total, Débito Total, Saldo Líquido) + card "Contas Correntes por Fornecedor"
   - `src/pages/DividaFOAPage.tsx` — 4 KPIs (Total Créditos, Total Amortizado, Dívida Total, Próx. Vencimento) + card "Dívidas por Fonte" + "Histórico de Movimentos"

2. **Tarefas** — `src/pages/TarefasPage.tsx`: 4 `<KPICard>` no topo (já passam por `KPICard`, basta adicionar `info`)

3. **Dashboard → Analytics (botão "Ver Analytics")**: 
   - `FinanceAnalyticsModal`, `RequisitionsAnalyticsModal`, `WarehouseAnalyticsModal` — gráficos internos sem `info` em alguns charts (ex.: `CashFlowAreaChart`, `CostCenterUtilizationChart`, `SupplierBalanceTreemap`). Verificar e completar.

4. **Modal "Ver Gráficos do Projeto"** — `src/components/modals/ProjectChartsModal.tsx`:
   - Tabs **Visão Geral**, **Finanças**, **Compras**, **Armazém**, **RH**, **Segurança**.
   - 3 KPIs de topo em Visão Geral já têm "i" (PPC, Lead-time, Taxa Utilização). Falta garantir que **todos os charts internos** dos restantes tabs recebam `info={KPI_INFO.xxx}`. Pela imagem, "S-Curve" e "PPC - Programação Cumprida" não mostram ícone — confirmar e ligar.

5. **Página `GraficosPage.tsx`** (acedida via Projetos → "Gráficos por Área"): vários `<Card>` com gráficos diretos (não usam `ExpandableChartWrapper`) — adicionar ícone `i` no `CardTitle`.

## Estratégia de execução

Para cada KPI/chart sem `info`, adicionar **uma linha** com `<InfoTooltip>` no `CardTitle` (ou prop `info` quando o componente já a aceita).

### Padrão para KPIs em `<Card>` direto (Centros de Custo, Contas Fornecedores, Dívida FOA)

```tsx
<CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
  <CardTitle className="text-xs sm:text-sm font-medium">Total Contas</CardTitle>
  <InfoTooltip {...KPI_INFO.totalContasFornecedores} title="Total Contas" />
</CardHeader>
```

### Padrão para `<KPICard>` (Compras, Tarefas)

```tsx
<KPICard title="Total Requisições" ... info={KPI_INFO.totalRequisicoes} />
```

### Padrão para gráficos em `<Card>` com `<CardTitle>` próprio (GraficosPage, Centros de Custo, Compras)

```tsx
<CardTitle className="flex items-center gap-2">
  Fluxo de Requisições de Compra
  <InfoTooltip {...KPI_INFO.graficoTimeline} title="Fluxo de Requisições" />
</CardTitle>
```

### Padrão para charts já estendidos (S-Curve, PPC, Burndown, etc.)

Apenas passar a prop `info={KPI_INFO.xxx}` no consumidor (ProjectChartsModal e equivalentes).

## Novas entradas em `src/lib/kpiDescriptions.ts`

Adicionar chaves em falta:
- `orcamentoCentroCusto`, `gastoCentroCusto`, `saldoCentroCusto`, `centrosEmAlerta`
- `totalContasFornecedores`, `creditoTotalFornecedores`, `debitoTotalFornecedores`, `saldoLiquidoFornecedores`
- `totalCreditosDivida`, `totalAmortizado`, `dividaTotal`, `proximoVencimento`, `dividaFOF`, `dividaBancos`, `dividaFornecedoresFonte`, `dividaOutros`
- `valorTotalRequisicoesCompra`, `leadTimeRequisicoes`, `pendentesCompras`
- `graficoEvolucaoTemporalCC`, `graficoDespesasCategoriaCC`, `graficoFluxoRequisicoes`, `graficoHistoricoMovimentosDivida`, `graficoDividasPorFonte`
- `tarefasMetaSemanal`, `tarefasResumoTipoProjeto`

## Ficheiros a modificar (~12 ficheiros, mudanças de 1-3 linhas cada)

| Ficheiro | Alteração |
|----------|-----------|
| `src/lib/kpiDescriptions.ts` | +20 novas entradas |
| `src/pages/CentrosCustoPage.tsx` | 4 KPIs + 2 charts → adicionar `<InfoTooltip>` |
| `src/pages/ComprasPage.tsx` | 4 `<KPICard>` → prop `info`; 3 cards → `<InfoTooltip>` no título |
| `src/pages/ContasFornecedoresPage.tsx` | 4 KPIs + 1 card título |
| `src/pages/DividaFOAPage.tsx` | 4 KPIs + 4 cards "Dívidas por Fonte" + "Histórico" |
| `src/pages/TarefasPage.tsx` | 4 `<KPICard>` → prop `info` |
| `src/pages/GraficosPage.tsx` | ~8 `<CardTitle>` → adicionar `<InfoTooltip>` |
| `src/components/modals/ProjectChartsModal.tsx` | Verificar e ligar `info={KPI_INFO.xxx}` em todos os charts dos tabs (S-Curve, PPC, Burndown, e tabs Finanças/Compras/Armazém/RH/Segurança) |
| `src/components/modals/FinanceAnalyticsModal.tsx`, `RequisitionsAnalyticsModal.tsx`, `WarehouseAnalyticsModal.tsx` | Verificar charts internos e adicionar `info` onde faltar |

## Resultado

Após esta atualização, **100% dos KPIs e gráficos da plataforma** terão o ícone `i` com descrição do que mostram e fórmula de cálculo, eliminando os pontos cegos identificados pelo utilizador (submódulos de Finanças, Tarefas, Analytics do Dashboard e modal de Gráficos do Projeto).

