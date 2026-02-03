
# Plano de Correção: Sincronização do Fluxo de Requisições

## Problema Identificado

O utilizador aprovou uma requisição na página de Finanças (status passou para "OC Gerada"), porém:
1. **Dashboard Geral**: Secção "Compras & Requisições" ainda mostra valores como "pendentes"
2. **Dados inconsistentes**: O KPI de "Total Compras" mostra 30.000 Kz (correto), mas "Valor Pendente" ainda exibe 60.250 Kz quando deveria ser 30.250 Kz

### Causa Raiz (Análise Técnica)

Foram identificados **3 problemas críticos** de sincronização:

---

## Problema 1: Falta de Invalidação de Cache Após Aprovação

**Localização**: `src/hooks/useOptimizedFinancialIntegration.ts`

O hook `useOptimizedApproveRequisition` só invalida queries locais da página de Finanças:
- `pending-approvals-optimized`
- `purchase-breakdown-optimized`
- `financial-discrepancies-optimized`

**Queries que NÃO estão a ser invalidadas**:
- `dashboard-geral` (usada no Dashboard Geral)
- `consolidated-financial-data` (usada na página de Finanças)
- `requisitions` (usada no modal de análise de requisições)

---

## Problema 2: Realtime Incompleto no Dashboard

**Localização**: `src/hooks/useRealtimeDashboard.ts`

O hook de sincronização em tempo real apenas escuta mudanças nas tabelas:
- `projetos`
- `tarefas_lean`

**Tabela que NÃO está a ser monitorizada**:
- `requisicoes` - mudanças de status não disparam actualização do dashboard

---

## Problema 3: Cache Muito Agressivo

**Localização**: `src/hooks/useConsolidatedFinancialData.ts` e `src/hooks/useDashboardGeral.ts`

Ambos os hooks têm `staleTime: 10 * 60 * 1000` (10 minutos), o que significa que mesmo após invalidação, os dados podem não ser actualizados se ainda forem considerados "frescos".

---

## Solução Proposta

### Parte 1: Corrigir Invalidação de Cache na Aprovação

Modificar `useOptimizedApproveRequisition` para invalidar **todas** as queries afectadas:

```text
Ficheiro: src/hooks/useOptimizedFinancialIntegration.ts

Adicionar invalidações:
- dashboard-geral
- consolidated-financial-data
- requisitions
```

### Parte 2: Adicionar Listener de Requisições no Dashboard

Modificar `useRealtimeDashboard` para também escutar a tabela `requisicoes`:

```text
Ficheiro: src/hooks/useRealtimeDashboard.ts

Adicionar canal para tabela "requisicoes"
Invalidar "dashboard-geral" quando requisições mudarem
```

### Parte 3: Garantir Refetch Imediato

Após aprovação, forçar um refetch em vez de depender apenas de invalidação para garantir que os dados são actualizados imediatamente na UI.

---

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/hooks/useOptimizedFinancialIntegration.ts` | Adicionar invalidação de `dashboard-geral`, `consolidated-financial-data`, `requisitions` |
| `src/hooks/useRealtimeDashboard.ts` | Adicionar escuta de mudanças na tabela `requisicoes` |
| `src/components/OptimizedApprovalInterface.tsx` | Garantir refetch após aprovação |

---

## Fluxo Corrigido

```text
1. Utilizador clica "Aprovar" na requisição
2. Status muda de "Aprovação Direção" para "OC Gerada"
3. Mutação bem-sucedida dispara:
   ├── Invalidar "pending-approvals-optimized" (Finanças)
   ├── Invalidar "purchase-breakdown-optimized" (Finanças)
   ├── Invalidar "financial-discrepancies-optimized" (Finanças)
   ├── Invalidar "dashboard-geral" (Dashboard Geral) [NOVO]
   ├── Invalidar "consolidated-financial-data" (Finanças) [NOVO]
   └── Invalidar "requisitions" (Modal Analytics) [NOVO]
4. Realtime listener em "requisicoes" também dispara actualização [NOVO]
5. Dashboard e Modal mostram dados actualizados
```

---

## Resultado Esperado

Após implementar estas correcções:
- Aprovar requisição na página de Finanças actualiza imediatamente todos os KPIs
- Secção "Compras & Requisições" no Dashboard reflecte o novo status
- Modal de análise detalhada mostra requisição no "Histórico" em vez de "Em Processo"
- Valores de "Pendente" e "Aprovado" são calculados correctamente
