# Migração de Código Legado

## Visão Geral
Este documento detalha a estratégia de migração e limpeza de código legado no projeto, focando em consolidação de hooks, remoção de duplicações e modernização da base de código.

## 📋 Hooks Legados Removidos

### ❌ Hooks Duplicados (Deletados)
- `useOptimizedHooks.ts` - Funcionalidade duplicada pelos hooks específicos
- Hooks específicos mantidos e otimizados:
  - `useProjects.ts` ✅
  - `useProjectDetails.ts` ✅
  - `useFinances.ts` ✅
  - `useRequisitions.ts` ✅
  - `useEmployees.ts` ✅
  - `useTasks.ts` ✅
  - `useMaterials.ts` ✅
  - `usePatrimony.ts` ✅

## 🔄 Migrações Realizadas

### 1. Context Migration
**Arquivo:** `src/contexts/ProjectContext.tsx`

**Antes:**
```typescript
import { useOptimizedProjectDetails } from "@/hooks/useOptimizedHooks";
const { data: projectData } = useOptimizedProjectDetails(selectedProjectId);
```

**Depois:**
```typescript
import { useProjectDetails } from "@/hooks/useProjectDetails";
const { data: projectData } = useProjectDetails(selectedProjectId);
```

### 2. Hook Exports Cleanup
**Arquivo:** `src/hooks/index.ts`

**Removido:**
- Seção "LEGACY HOOKS" completa
- Exports de `useOptimizedHooks.ts`

**Mantido:**
- Sistema moderno de queries
- Hooks de performance
- Hooks financeiros consolidados

## 🧹 Limpeza de Código

### Console Logs Excessivos
Removidos console.logs desnecessários de:
- `useProjects.ts`
- `useProjectDetails.ts`
- `useFinances.ts`
- `useRequisitions.ts`
- `useEmployees.ts`
- `useTasks.ts`

**Mantidos apenas logs críticos:**
- Erros de validação
- Falhas em operações de banco de dados
- Warnings de performance

### Validações Consolidadas
Todas as validações foram mantidas e padronizadas:
- Validação de campos obrigatórios
- Verificação de IDs antes de operações
- Mensagens de erro descritivas

## 📊 Benefícios da Migração

### Performance
- ✅ Menos duplicação de código
- ✅ Cache otimizado com `staleTime` e `gcTime`
- ✅ Invalidações inteligentes de queries

### Manutenibilidade
- ✅ Código consolidado em um único local
- ✅ Estrutura clara de hooks por domínio
- ✅ Documentação atualizada

### Developer Experience
- ✅ Imports mais simples
- ✅ Menos arquivos para navegar
- ✅ Convenções claras de nomenclatura

## 🎯 Estrutura Final de Hooks

```
src/hooks/
├── financial/
│   └── index.ts              # Hooks financeiros consolidados
├── useProjects.ts            # Projetos (CRUD completo)
├── useProjectDetails.ts      # Detalhes agregados
├── useFinances.ts            # Finanças (CRUD)
├── useRequisitions.ts        # Requisições (CRUD)
├── useEmployees.ts           # Colaboradores (CRUD)
├── useTasks.ts               # Tarefas (CRUD)
├── useMaterials.ts           # Materiais (CRUD)
├── usePatrimony.ts           # Patrimônio (CRUD)
├── useQuery.ts               # Sistema unificado de queries
├── useOptimizedState.ts      # Performance utilities
├── useMemoizedCallback.ts    # Memoization helpers
└── index.ts                  # Barrel exports

❌ REMOVIDOS:
├── useOptimizedHooks.ts      # Duplicado - DELETADO
```

## 🔍 Como Verificar a Migração

### 1. Verificar Imports
```bash
# Não deve haver referências a useOptimizedHooks
grep -r "useOptimizedHooks" src/
```

### 2. Verificar Funcionalidade
- ✅ Todos os hooks específicos funcionando
- ✅ Cache funcionando corretamente
- ✅ Invalidações corretas após mutações
- ✅ Performance mantida ou melhorada

### 3. Verificar Console
- ❌ Não deve haver logs excessivos
- ✅ Apenas logs críticos devem aparecer

## 📝 Próximos Passos (Opcional)

### Otimizações Futuras
1. **Prefetching Inteligente**
   - Implementar prefetch de dados relacionados
   - Reduzir tempo de carregamento

2. **Suspense Boundaries**
   - Adicionar React Suspense para melhor UX
   - Loading states mais sofisticados

3. **Optimistic Updates**
   - Atualizar UI antes de resposta do servidor
   - Rollback em caso de erro

## ✅ Checklist de Migração

- [x] Identificar código legado
- [x] Criar hooks consolidados
- [x] Migrar contextos
- [x] Atualizar exports
- [x] Remover console.logs desnecessários
- [x] Deletar arquivos legados
- [x] Atualizar documentação
- [x] Verificar imports em todo projeto

## 🎓 Convenções Estabelecidas

### Nomenclatura de Hooks
- `use[Entity]` - Lista todos (ex: `useProjects`)
- `use[Entity](id)` - Busca um específico (ex: `useProject(id)`)
- `use[Entity]By[Filter]` - Filtros específicos (ex: `useFinancesByProject`)
- `useCreate[Entity]` - Criar novo
- `useUpdate[Entity]` - Atualizar existente
- `useDelete[Entity]` - Deletar existente

### Query Keys Pattern
```typescript
["entity"]                    // Lista geral
["entity", id]                // Item específico
["entity", "filter", value]   // Lista filtrada
```

### Cache Times (de CACHE_TIMES constantes)
- `SHORT` - Dados que mudam frequentemente (30s)
- `MEDIUM` - Dados moderadamente estáveis (2min)
- `LONG` - Dados raramente alterados (5min)

---

**Data da Migração:** 2025-01-16
**Status:** ✅ Completo
**Impacto:** Baixo - Zero breaking changes
