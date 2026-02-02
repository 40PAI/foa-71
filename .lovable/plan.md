
# Plano: Corrigir Agregação de Dados quando "Todos os Centros de Custo" está Selecionado

## Problema Identificado

Quando o utilizador seleciona "Todos os Centros de Custo" na página de Centros de Custo ou na Análise Financeira, os KPIs mostram valores zerados porque:

1. A view `saldos_centros_custo` só contabiliza movimentos **com centro_custo_id atribuído**
2. Muitos movimentos financeiros não têm centro de custo associado (ex: Kifangondo tem 59M Kz em saídas sem centro de custo)
3. Quando "Todos" está selecionado, o sistema deveria agregar **todos os movimentos do projeto**, incluindo os sem centro de custo

```text
COMPORTAMENTO ATUAL:
┌─────────────────────────┐
│ Todos os Centros        │
│ Orçamento: 0,00         │  ← Só soma centros com dados
│ Total Custo: 0,00       │  ← Ignora movimentos sem CC
└─────────────────────────┘

COMPORTAMENTO DESEJADO:
┌─────────────────────────┐
│ Todos os Centros        │
│ Orçamento: 700.000      │  ← Soma de todos os centros
│ Total Custo: 59.578.497 │  ← TODOS os movimentos
└─────────────────────────┘
```

## Solução Proposta

Criar um novo hook `useProjectFinancialSummary` que calcula os totais directamente de `movimentos_financeiros` (como o `useGastosObraSummary` já faz), e usar este hook quando "Todos" estiver selecionado.

## Componentes a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/pages/CentrosCustoPage.tsx` | Usar dados de movimentos quando "Todos" está selecionado |
| `src/hooks/useCentrosCusto.ts` | Adicionar hook `useProjectFinancialTotals` para calcular totais globais |
| `src/components/charts/CostCenterUtilizationChart.tsx` | Incluir movimentos sem centro de custo na visualização |

## Detalhes Técnicos

### 1. Novo Hook: `useProjectFinancialTotals`

Será adicionado ao ficheiro `useCentrosCusto.ts`:

```typescript
export function useProjectFinancialTotals(projectId?: number) {
  return useQuery({
    queryKey: ["project-financial-totals", projectId],
    queryFn: async () => {
      // Buscar orçamento total dos centros de custo
      const { data: centros } = await supabase
        .from("centros_custo")
        .select("orcamento_mensal")
        .eq("ativo", true)
        .eq("projeto_id", projectId);
      
      // Buscar todos os movimentos (COM e SEM centro de custo)
      const { data: movimentos } = await supabase
        .from("movimentos_financeiros")
        .select("tipo_movimento, valor")
        .eq("projeto_id", projectId);
      
      const totalOrcamento = centros?.reduce((acc, c) => acc + (c.orcamento_mensal || 0), 0) || 0;
      const totalSaidas = movimentos?.filter(m => m.tipo_movimento === 'saida')
        .reduce((acc, m) => acc + (m.valor || 0), 0) || 0;
      const totalEntradas = movimentos?.filter(m => m.tipo_movimento === 'entrada')
        .reduce((acc, m) => acc + (m.valor || 0), 0) || 0;
      
      return {
        totalOrcamento,
        totalGasto: totalSaidas,
        totalSaldo: totalEntradas - totalSaidas,
        totalMovimentos: movimentos?.length || 0,
      };
    },
    enabled: !!projectId,
  });
}
```

### 2. Actualizar CentrosCustoPage

Lógica condicional para usar os totais do projeto quando "Todos" está selecionado:

```typescript
// Quando "all" está selecionado, usar totais do projeto
const { data: projectTotals } = useProjectFinancialTotals(
  selectedCentroCustoId === "all" ? selectedProjectId || undefined : undefined
);

// KPIs baseados na seleção
const totalOrcamento = selectedCentroCustoId === "all" && projectTotals
  ? projectTotals.totalOrcamento
  : filteredSaldos?.reduce((acc, s) => acc + s.orcamento_mensal, 0) || 0;

const totalGasto = selectedCentroCustoId === "all" && projectTotals
  ? projectTotals.totalGasto
  : filteredSaldos?.reduce((acc, s) => acc + s.total_saidas, 0) || 0;
```

### 3. Actualizar CostCenterUtilizationChart

Adicionar uma barra para "Movimentos sem Centro de Custo":

```typescript
// Calcular movimentos sem centro de custo atribuído
const { data: unassignedMovements } = useQuery({
  queryKey: ["unassigned-movements", projectId],
  queryFn: async () => {
    const { data } = await supabase
      .from("movimentos_financeiros")
      .select("tipo_movimento, valor")
      .eq("projeto_id", projectId)
      .is("centro_custo_id", null);
    
    const totalSaidas = data?.filter(m => m.tipo_movimento === 'saida')
      .reduce((acc, m) => acc + (m.valor || 0), 0) || 0;
    
    return { totalSaidas };
  },
});

// Adicionar ao gráfico se existirem movimentos não atribuídos
if (unassignedMovements?.totalSaidas > 0) {
  chartData.push({
    nome: "Sem Centro de Custo",
    codigo: "N/A",
    gasto: unassignedMovements.totalSaidas,
    orcamento: 0,
    percentual: 100, // Sem orçamento = excedido
    status: 'critico'
  });
}
```

## Fluxo de Dados Corrigido

```text
Utilizador seleciona "Todos os Centros de Custo"
                  │
                  ▼
┌─────────────────────────────────────────┐
│ useProjectFinancialTotals()             │
│ ┌─────────────────────────────────────┐ │
│ │ SELECT * FROM movimentos_financeiros│ │
│ │ WHERE projeto_id = X                │ │
│ │ (Inclui movimentos COM e SEM CC)    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  │
                  ▼
         KPIs mostram totais REAIS
         do projeto completo
```

## Resultado Esperado

1. **Quando "Todos os Centros"**: KPIs mostram totais de **TODOS** os movimentos do projeto
2. **Quando centro específico selecionado**: KPIs mostram apenas movimentos desse centro
3. **Gráfico de Utilização**: Inclui barra para movimentos não atribuídos
4. **Consistência**: Dados coincidem com os valores mostrados na página de Gastos da Obra

## Impacto

Esta alteração afecta apenas a agregação quando "Todos" está selecionado, mantendo o comportamento actual para centros específicos.
