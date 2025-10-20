# 🚀 Performance Optimization Guide

## Sistema de Otimização Consolidado

Este documento explica as melhorias de performance implementadas no projeto.

---

## 📦 Sistema Consolidado de Hooks

### ✅ Hooks Legados Removidos:
- ~~`useOptimizedQuery.ts`~~ ❌ REMOVIDO
- ~~`useOptimizedDataFetch.ts`~~ ❌ REMOVIDO  
- ~~`useOptimizedHooks.ts`~~ ❌ REMOVIDO

### ✅ Sistema Moderno Implementado:
- **Hooks específicos por domínio** - Cada entidade tem seu próprio hook
- **Sistema unificado de queries** - `src/hooks/useQuery.ts`
- **Performance utilities** - `useOptimizedState.ts`, `useMemoizedCallback.ts`
- **Integração financeira** - `src/hooks/financial/`

### 🎯 Benefícios:
- **Configuração única de cache** - 4 perfis otimizados
- **Invalidação inteligente** - Sistema centralizado
- **Project-aware** - Adiciona automaticamente projectId às queries
- **Type-safe** - TypeScript completo

### 📝 Como usar:

```typescript
import { useOptimizedQuery, useOptimizedMutation } from "@/hooks";

// Query simples
const { data, isLoading } = useOptimizedQuery({
  queryKey: ['my-data'],
  queryFn: async () => fetchMyData(),
});

// Query específica de projeto (adiciona projectId automaticamente)
const { data } = useOptimizedQuery({
  queryKey: ['project-finances'],
  queryFn: async () => fetchFinances(projectId),
  projectSpecific: true,
  cacheProfile: 'financial', // 2 min stale
});

// Mutation com invalidação automática
const mutation = useOptimizedMutation({
  mutationFn: async (data) => updateProject(data),
  invalidateKeys: [
    ['projects'],
    ['project-details'],
  ],
  projectSpecific: true,
});
```

### 🎚️ Perfis de Cache:

| Perfil | Stale Time | Uso |
|--------|-----------|-----|
| `standard` | 5 min | Dados gerais |
| `financial` | 2 min | Dados financeiros |
| `realtime` | 30 seg | Dados em tempo real |
| `static` | 15 min | Dados estáticos |

---

## 🔄 Contextos Otimizados (`src/hooks/useContextHooks.ts`)

### ✅ Mudanças:
- Todos os retornos usam `useMemo()` 
- Previne re-renders desnecessários
- Mantém referências estáveis

### 📝 Antes vs Depois:

```typescript
// ❌ ANTES - Criava novo objeto a cada render
export function useAppState() {
  const app = useApp();
  return { ...app, ...theme }; // Novo objeto toda vez!
}

// ✅ DEPOIS - Objeto memoizado
export function useAppState() {
  const app = useApp();
  return useMemo(() => ({ 
    ...app, 
    ...theme 
  }), [app, theme]); // Só recria quando deps mudam
}
```

---

## 🎯 Sistema de Invalidação Inteligente

### 📝 Como usar:

```typescript
import { useSmartInvalidation } from "@/hooks";

const {
  invalidateProject,
  invalidateFinancial,
  invalidateTasks,
  invalidateHR,
  invalidateWarehouse,
  invalidateAll,
} = useSmartInvalidation();

// Invalida todas queries relacionadas a finanças
invalidateFinancial(projectId);

// Invalida queries de projeto específico
invalidateProject(18);

// Invalida tudo (cuidado!)
invalidateAll();
```

---

## 🧰 Utilitários de Performance

### `useMemoizedCallback.ts` - Novos hooks:

```typescript
import { 
  useDeepCallback, 
  useDeepMemo,
  useDebouncedValue,
  useThrottledValue 
} from "@/hooks";

// Deep comparison de dependencies
const callback = useDeepCallback(
  () => console.log(data),
  [data] // Só recria se data realmente mudar
);

// Debounce para inputs de busca
const debouncedSearch = useDebouncedValue(searchTerm, 500);

// Throttle para scroll/resize
const throttledScroll = useThrottledValue(scrollY, 100);
```

---

## 📊 Monitoramento de Performance

```typescript
import { usePerformanceMonitor } from "@/hooks";

function MyComponent() {
  const { measure } = usePerformanceMonitor('MyComponent');
  
  const handleClick = () => {
    const end = measure('click-handler');
    // ... código pesado
    end(); // Loga se > 16ms
  };
}
```

---

## 🔧 Migração de Código Legado

### ✅ Migração Completa!

Todos os hooks legados foram **removidos** com sucesso. O projeto agora usa:

```typescript
// ✅ NOVO SISTEMA - Hooks específicos por domínio
import { 
  useProjects,      // Lista projetos
  useProject,       // Busca projeto específico
  useCreateProject, // Cria projeto
  useUpdateProject, // Atualiza projeto
  useDeleteProject  // Deleta projeto
} from "@/hooks";

// ✅ Hooks financeiros consolidados
import { 
  useIntegratedFinances,
  useFinancialDiscrepancies 
} from "@/hooks/financial";

// ✅ Sistema de performance utilities
import {
  useDeepCallback,
  useDebouncedValue,
  useThrottledValue
} from "@/hooks";
```

### 📚 Documentação Completa

Para detalhes completos da migração, consulte:
- [Guia de Migração de Código Legado](./LEGACY_CODE_MIGRATION.md)

---

## 📈 Resultados Esperados

### Antes:
- 🐌 Re-renders desnecessários em contextos
- 🔄 Queries duplicadas sem cache
- ⚠️ Configurações inconsistentes
- 📦 Código espalhado em 3 arquivos

### Depois:
- ⚡ Memoização adequada
- 🎯 Cache inteligente e consistente
- 📊 Sistema centralizado
- 🧹 Código limpo e organizado

---

## 🎯 Próximos Passos

1. ✅ ~~Migrar hooks legados para novo sistema~~ - **COMPLETO**
2. ⏭️ Adicionar lazy loading em rotas
3. ⏭️ Implementar virtual scrolling em listas grandes
4. ⏭️ Code splitting por módulo

---

## 📚 Documentação Relacionada

- [Arquitetura do Sistema](./ARCHITECTURE.md)
- [Guia de Migração de Código Legado](./LEGACY_CODE_MIGRATION.md)
- [Integração Financeira](./FINANCIAL_INTEGRATION.md)
- [Design System](./DESIGN_SYSTEM.md)
- React Query: https://tanstack.com/query/latest
- React Performance: https://react.dev/learn/render-and-commit
- Memoization: https://react.dev/reference/react/useMemo
