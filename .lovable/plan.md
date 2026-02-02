
# Plano: Corrigir Dados Zerados em Finanças, Centros de Custo e Compras

## Diagnóstico dos Problemas

Após análise detalhada da base de dados e código, identifiquei os seguintes problemas:

| Problema | Causa | Impacto |
|----------|-------|---------|
| 1. Função SQL com erro | `get_consolidated_financial_data` usa coluna `categoria_gasto` que não existe em `movimentos_financeiros` | Página de Finanças mostra tudo zerado |
| 2. View retorna zeros | `saldos_centros_custo` faz JOIN por `centro_custo_id`, mas 223 movimentos têm esse campo `NULL` | KPIs de Centros de Custo zerados |
| 3. Hook usa view incorreta | `useProjectFinancialTotals` não está a ser usado correctamente | Totais não aparecem |

**Dados na base de dados (confirmados)**:
- 223 movimentos financeiros para o projeto 53
- Total saídas: 59,578,497.76 Kz
- Total FOF Financiamento: 36,199,449.29 Kz  
- Total FOA Auto: 23,379,048.47 Kz
- Total Recebimentos FOA: 23,331,521.75 Kz

## Soluções Propostas

### 1. Corrigir a Função SQL `get_consolidated_financial_data`

Actualizar a função para usar `categoria` em vez de `categoria_gasto`:

```sql
-- Na CTE movimentos_financeiros_data e integrated_expenses
-- Substituir: categoria_gasto → categoria
```

### 2. Melhorar a Página de Centros de Custo

O hook `useProjectFinancialTotals` já existe e funciona correctamente. Precisa ser usado quando "Todos os Centros de Custo" está seleccionado para mostrar totais globais (incluindo movimentos sem centro de custo atribuído).

**Alterações em `CentrosCustoPage.tsx`:**
- Garantir que os KPIs usam `projectTotals` quando `selectedCentroCustoId === "all"`
- Isto já está implementado, mas os dados não estão a aparecer

### 3. Verificar View gastos_obra_view

A view está a funcionar correctamente quando consultada directamente. O problema pode ser de renderização no componente.

### 4. Actualizar MovimentacoesFinanceirasCard

Garantir que os dados são passados correctamente para os componentes filhos.

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| **Migração SQL** | Corrigir função `get_consolidated_financial_data` (substituir `categoria_gasto` por `categoria`) |
| `src/pages/CentrosCustoPage.tsx` | Verificar que os KPIs mostram dados de `projectTotals` |
| `src/components/financial/GastosObraKPICards.tsx` | Verificar renderização dos KPIs |
| `src/components/financial/GastosObraTable.tsx` | Verificar se a tabela renderiza os dados |

## Secção Técnica

### Migração SQL Necessária

```sql
CREATE OR REPLACE FUNCTION get_consolidated_financial_data(p_projeto_id INTEGER)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH 
  -- ... CTEs anteriores mantêm-se ...
  
  -- CTE 5: Movimentos financeiros (CORRIGIDO)
  movimentos_financeiros_data AS (
    SELECT 
      id,
      projeto_id,
      centro_custo_id,
      tipo_movimento,
      categoria,  -- ← CORRIGIDO: era categoria_gasto
      valor,
      data_movimento,
      descricao,
      fonte_financiamento,
      created_at
    FROM movimentos_financeiros
    WHERE projeto_id = p_projeto_id
    ORDER BY data_movimento DESC
    LIMIT 100
  ),
  
  -- CTE 8: Category integrated expenses (CORRIGIDO)
  integrated_expenses AS (
    SELECT 
      -- Material expenses - usar categoria em vez de categoria_gasto
      COALESCE(SUM(CASE WHEN t.custo_material > 0 ... END), 0) +
      COALESCE(SUM(CASE WHEN mf.categoria ILIKE '%material%' AND mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as material_total,
      -- ... resto mantém-se mas corrigir categoria_gasto → categoria
    ...
  )
  
  -- ... resto da função ...
$$;
```

### Fluxo de Dados Actual

```
Tabela: movimentos_financeiros (223 registos)
         ↓
    View: gastos_obra_view
         ↓
    Hook: useGastosObra
         ↓
Componente: MovimentacoesFinanceirasCard
         ↓
   Tabela: GastosObraTable
```

### Verificação Adicional

Se após a correcção SQL os dados continuarem a não aparecer, pode haver um problema de timing/cache. Recomendo:
1. Limpar cache do React Query
2. Verificar se a view `gastos_obra_view` tem `SECURITY INVOKER` configurado

## Resultado Esperado

Após as correcções:
- Página de **Finanças**: Mostrará os KPIs com valores correctos (Total Compras, Aprovado, etc.)
- Página de **Centros de Custo**: 
  - Com "Todos" seleccionado: Mostrará total de ~59.5M Kz em custos
  - KPIs reflectirão os dados reais
  - Tabela de movimentações mostrará os 223 registos
- Página de **Compras**: Funcionará correctamente (0 requisições é o valor real para este projeto)
