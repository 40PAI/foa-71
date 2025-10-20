# Arquitetura de Integração Financeira

## Visão Geral

O sistema de integração financeira consolida dados de múltiplas fontes (requisições, colaboradores, patrimônio) para fornecer uma visão unificada e precisa do status financeiro dos projetos.

## Estrutura

```
src/
├── services/financial/          # Lógica de negócio financeira
│   ├── calculations.ts          # Cálculos financeiros
│   ├── integration.ts           # Integração de dados
│   └── index.ts                 # Barrel export
├── hooks/financial/             # Hooks consolidados
│   └── index.ts                 # Barrel export de todos os hooks
├── components/financial/        # Componentes UI
│   ├── FinancialOverview.tsx
│   ├── CategoryBreakdown.tsx
│   ├── DetailedBreakdown.tsx
│   └── index.ts
└── types/finance.ts            # Tipos TypeScript
```

## Camadas de Integração

### 1. Camada de Serviços (`services/financial/`)

**Responsabilidades:**
- Lógica de cálculos financeiros pura
- Integração e reconciliação de dados
- Validação de consistência
- Mapeamento de categorias

**Funções Principais:**

#### `calculations.ts`
- `calculateFinancialProgress()` - Calcula progresso financeiro
- `calculateCategoryPercentage()` - Percentual por categoria
- `calculateDiscrepancy()` - Detecta discrepâncias
- `checkBudgetLimit()` - Verifica limites orçamentais
- `getFinancialStatus()` - Status baseado em progresso

#### `integration.ts`
- `mergeFinancialData()` - Mescla dados calculados e manuais
- `reconcileExpenses()` - Reconcilia gastos detalhados
- `validateFinancialConsistency()` - Valida consistência
- `generateFinancialSummary()` - Gera resumo financeiro

### 2. Camada de Hooks (`hooks/financial/`)

**Hooks Disponíveis:**

#### Hooks Base
- `useFinances()` - Lista todas as finanças
- `useFinancesByProject()` - Finanças por projeto
- `useCreateFinance()` - Criar registro financeiro
- `useUpdateFinance()` - Atualizar registro

#### Hooks de Integração
- `useIntegratedFinancialProgress()` - Progresso integrado
- `useDetailedExpenseBreakdown()` - Breakdown detalhado
- `usePendingApprovals()` - Aprovações pendentes
- `useFinancialDiscrepancies()` - Detectar discrepâncias

#### Hooks Otimizados
- `useOptimizedPendingApprovals()` - Aprovações (otimizado)
- `useOptimizedFinancialDiscrepancies()` - Discrepâncias (otimizado)
- `useOptimizedPurchaseBreakdown()` - Compras (otimizado)
- `useOptimizedRealtimeSync()` - Sincronização em tempo real

### 3. Camada de Componentes (`components/financial/`)

#### `FinancialOverview`
Exibe visão geral financeira consolidada:
- Orçamento total
- Total executado
- Progresso financeiro
- Alertas de discrepâncias

#### `CategoryBreakdown`
Breakdown por categoria com cards visuais:
- Materiais
- Mão de Obra
- Patrimônio
- Custos Indiretos

#### `DetailedBreakdown`
Análise detalhada comparando valores calculados vs manuais:
- Discrepâncias por categoria
- Percentual do orçamento
- Indicadores visuais

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                     Fontes de Dados                         │
├─────────────────────────────────────────────────────────────┤
│  • Requisições (materiais)                                  │
│  • Colaboradores (mão de obra)                              │
│  • Patrimônio (equipamentos)                                │
│  • Financas (dados manuais)                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Database Functions (Supabase)                  │
├─────────────────────────────────────────────────────────────┤
│  • calculate_integrated_financial_progress()                │
│  • get_detailed_expense_breakdown()                         │
│  • detect_financial_discrepancies()                         │
│  • get_purchase_breakdown()                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Hooks Layer                                │
├─────────────────────────────────────────────────────────────┤
│  • Query optimization (React Query)                         │
│  • Cache management                                         │
│  • Realtime sync                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│               Services Layer                                │
├─────────────────────────────────────────────────────────────┤
│  • Financial calculations                                   │
│  • Data integration & validation                            │
│  • Business logic                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                Components Layer                             │
├─────────────────────────────────────────────────────────────┤
│  • FinancialOverview                                        │
│  • CategoryBreakdown                                        │
│  • DetailedBreakdown                                        │
└─────────────────────────────────────────────────────────────┘
```

## Integração com Database Functions

### Principais Functions Supabase

1. **`calculate_integrated_financial_progress(project_id)`**
   - Calcula gastos por categoria automaticamente
   - Retorna: material, payroll, patrimony, indirect expenses
   - Usa: requisições, colaboradores_projetos, patrimonio

2. **`get_detailed_expense_breakdown(project_id)`**
   - Compara valores calculados vs manuais
   - Detecta discrepâncias por categoria
   - Calcula percentual do orçamento

3. **`detect_financial_discrepancies(project_id)`**
   - Identifica inconsistências
   - Calcula percentual de discrepância
   - Útil para auditoria

## Padrões de Uso

### 1. Consulta de Dados Integrados

```typescript
import { useIntegratedFinancialProgress } from "@/hooks/financial";

function MyComponent({ projectId }: { projectId: number }) {
  const { data, isLoading } = useIntegratedFinancialProgress(projectId);
  
  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <FinancialOverview 
      data={data}
      hasDiscrepancies={/* check logic */}
    />
  );
}
```

### 2. Validação de Consistência

```typescript
import { validateFinancialConsistency } from "@/services/financial";

const validation = validateFinancialConsistency(financialData);

if (!validation.isValid) {
  console.error("Errors:", validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn("Warnings:", validation.warnings);
}
```

### 3. Cálculo de Discrepâncias

```typescript
import { calculateDiscrepancy } from "@/services/financial";

const result = calculateDiscrepancy(calculatedValue, manualValue);

if (result.isSignificant) {
  // Alert user about significant discrepancy
  console.log(`Discrepância: ${result.absolute} (${result.percentage}%)`);
}
```

## Otimizações

### Cache Strategy

- **Dados Financeiros**: 5 minutos de staleTime
- **Aprovações Pendentes**: 30 segundos
- **Discrepâncias**: 1 minuto
- **Sincronização Realtime**: Debounced (1 segundo)

### Performance

1. **Selective Invalidation**: Apenas queries específicas são invalidadas
2. **Optimistic Updates**: Cache atualizado imediatamente para UX responsiva
3. **Debounced Realtime**: Evita invalidações excessivas
4. **Memoization**: Cálculos caros são memoizados

## Segurança

### RLS Policies

Todas as tabelas financeiras têm Row-Level Security (RLS) ativo:
- `financas`: Acesso baseado em projeto
- `gastos_detalhados`: Apenas usuários autenticados
- `requisicoes`: Validação de limites

### Validações

- Limites de gastos do projeto
- Aprovações por nível hierárquico
- Consistência entre dados calculados e manuais

## Debugging

### Logs Úteis

```typescript
// Ativar logs detalhados
import { logger } from "@/lib/logger";

logger.apiCall('RPC', 'calculate_integrated_financial_progress', { project_id });
logger.apiResponse('RPC', 'calculate_integrated_financial_progress', data);
```

### Common Issues

1. **Discrepâncias não detectadas**: Verificar triggers na tabela `requisicoes`
2. **Cache desatualizado**: Usar `invalidateQueries` manualmente
3. **Performance lenta**: Verificar índices no database

## Roadmap

### Próximos Passos

- [ ] Implementar forecasting financeiro
- [ ] Dashboard de análise de tendências
- [ ] Exportação de relatórios financeiros
- [ ] Integração com sistemas contábeis externos
- [ ] Alertas automáticos de desvios orçamentais

## Referências

- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Financial Integration Patterns](./ARCHITECTURE.md)
