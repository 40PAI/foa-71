# Plano: Correção da Sincronização de Dados e Gráficos

## ✅ STATUS: IMPLEMENTADO (02/02/2026)

Todas as fases foram implementadas com sucesso.

---

## Resumo das Correções Implementadas

### ✅ Fase 1: Funções RPC Corrigidas
- Migração aplicada para corrigir `calculate_integrated_financial_progress`
- Corrigido `p.orcamento_total` → `p.orcamento`
- Corrigido `t.projeto_id` → `t.id_projeto`
- Criada função `sync_all_project_metrics()` para sincronização em massa

### ✅ Fase 2: Hook useProjectMetrics Atualizado
- Agora lê de `movimentos_financeiros` (ledger atual) em vez de `financas` (legacy)
- Calcula gastos corretamente agregando movimentos de saída

### ✅ Fase 3: Loop Infinito Corrigido
- `UserProjectAssignmentModal` agora usa refs para controlar inicialização
- Evita re-renders infinitos com flag `hasInitialized`

### ✅ Fase 4: Métricas Sincronizadas
- Executada sincronização em massa de todos os projetos
- Dashboard KPIs atualizados com dados reais

### ✅ Fase 5: Gráficos de Materiais Melhorados
- Período padrão aumentado para 90 dias
- Tipo 'transferencia' agora incluído como saída
- Mapeamento case-insensitive para tipos de movimentação

### ✅ Fase 6: Hooks de Finanças Atualizados
- Corrigidos parâmetros RPC: `p_project_id` → `p_projeto_id`
- Mapeamento atualizado para nova resposta da RPC

---

## Verificação de Resultados

**Projeto VALODIA (id=52):**
- ✅ Total de gastos: 57.4M Kz (283 movimentos)
- ✅ Avanço financeiro calculado: 5743% (indica orçamento desatualizado)
- ✅ Métricas atualizadas em `dashboard_kpis`

---

## Ficheiros Modificados

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/migrations/` | Funções RPC corrigidas |
| `src/hooks/useProjectMetrics.ts` | Usar movimentos_financeiros |
| `src/hooks/useCategoryIntegratedExpenses.ts` | Parâmetro p_projeto_id |
| `src/hooks/useFinancialAudit.ts` | Mapeamento nova RPC |
| `src/hooks/useIntegratedFinances.ts` | Parâmetro p_projeto_id |
| `src/hooks/useUpdateProjectMetrics.ts` | Parâmetro p_projeto_id |
| `src/services/projectImport.ts` | Parâmetro p_projeto_id |
| `src/components/modals/UserProjectAssignmentModal.tsx` | Fix loop infinito |
| `src/hooks/useMaterialChartData.ts` | Incluir transferencia |
| `src/components/charts/MaterialFlowChart.tsx` | 90 dias default |

---

## Observações

- O projeto VALODIA mostra 5743% de avanço financeiro porque o orçamento (1M Kz) está muito abaixo do gasto real (57M Kz). O utilizador deve atualizar o orçamento do projeto.
- Os avisos de segurança do linter são pré-existentes e não relacionados com esta correção.
