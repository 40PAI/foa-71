
# Plano de Optimização: Eliminação do Delay de Carregamento Entre Páginas

## Problema Identificado

Quando o utilizador navega entre páginas, aparece um skeleton loading (placeholders cinzentos pulsantes) durante alguns segundos antes do conteúdo real aparecer. Isso acontece porque:

1. **Lazy Loading de Componentes**: Todas as páginas usam `React.lazy()` com `Suspense`, o que mostra um fallback enquanto carrega o código JavaScript da página
2. **Lazy Loading de Dados**: Cada página faz queries ao Supabase que também têm os seus próprios estados de loading
3. **Duplo Loading**: O utilizador vê primeiro o skeleton do `Suspense` (código JS) e depois potencialmente outro skeleton enquanto os dados carregam

## Análise Técnica

### Fluxo Actual (com delay visível):
```text
Clique → Suspense Fallback (skeleton) → Código JS carrega → Query inicia → Loading de dados → Conteúdo
         |_____________________________|                    |__________________|
                  ~500-1500ms                                    ~200-800ms
```

### Fluxo Optimizado (quase instantâneo):
```text
Clique → Código já em cache → Dados já em cache (placeholderData) → Conteúdo imediato
         |____________________________|________________________________|
                                     ~50-100ms
```

## Causas Identificadas

| Problema | Localização | Impacto |
|----------|-------------|---------|
| **Suspense fallback visível** | `MainContent.tsx` + `MobileMainContent.tsx` | Skeleton aparece a cada navegação |
| **Prefetch apenas no hover (desktop)** | `AppSidebar.tsx` | Dados não estão prontos ao clicar |
| **Prefetch só inicia aos 500ms** | `AllProviders.tsx` (BackgroundPrefetch) | Delay inicial muito longo |
| **Não há prefetch do código JS** | Sem implementação | Lazy components não são preloaded |
| **staleTime muito alto** | Hooks com `staleTime: 10min` | Dados antigos mas não re-fetched |

---

## Solução Proposta (6 Partes)

### Parte 1: Prefetch do Código JavaScript no Hover

Adicionar preload dos chunks de código JavaScript quando o utilizador passa o mouse sobre os links do sidebar. Isso carrega o código antes do clique.

**Ficheiro**: `src/hooks/usePrefetchPage.ts`

**Alteração**:
```typescript
// Adicionar preload de componentes lazy
const preloadDashboard = () => import("@/pages/DashboardGeralPage");
const preloadProjetos = () => import("@/pages/ProjetosPage");
// ... etc

// Expor funções de preload
return {
  prefetchDashboard: () => {
    preloadDashboard(); // Preload do código JS
    // Prefetch dos dados (já existe)
    queryClient.prefetchQuery({...});
  },
  // ...
};
```

### Parte 2: Background Prefetch Mais Agressivo

Reduzir o delay do prefetch em background e preload de todas as rotas principais.

**Ficheiro**: `src/contexts/AllProviders.tsx`

**Alteração**:
```typescript
useEffect(() => {
  if (user) {
    // Iniciar prefetch IMEDIATAMENTE (sem delay)
    // Preload código JS de todas as rotas principais
    import("@/pages/DashboardGeralPage");
    import("@/pages/ProjetosPage");
    import("@/pages/ConsolidatedFinancasPage");
    // etc...

    // Prefetch dados após 100ms (muito mais rápido)
    const timer = setTimeout(() => {
      prefetch.prefetchDashboard();
      prefetch.prefetchProjetos();
      // ...
    }, 100);
    
    return () => clearTimeout(timer);
  }
}, [user, selectedProjectId, prefetch]);
```

### Parte 3: Minimizar Suspense Fallback

Usar um fallback mais minimalista e rápido (ou nenhum) para o Suspense principal, já que os dados vão ter `placeholderData`.

**Ficheiro**: `src/components/MainContent.tsx`

**Alteração**:
```typescript
// Usar fallback minimalista ou nenhum
<Suspense fallback={null}>
  <Routes>
    {/* ... */}
  </Routes>
</Suspense>
```

**OU** criar um fallback muito mais leve:
```typescript
<Suspense fallback={<MinimalLoadingIndicator />}>
```

### Parte 4: Prefetch no Mobile com Touch Optimizado

Garantir que o prefetch mobile inicia no `onTouchStart` (já implementado) mas também fazer preload do código.

**Ficheiro**: `src/components/layout/MobileBottomNav.tsx`

**Alteração**:
- Adicionar preload do código JS junto com prefetch dos dados

### Parte 5: Usar staleTime Dinâmico

Implementar lógica para mostrar dados cached imediatamente enquanto faz refetch em background.

**Alteração nos hooks de dados**:
```typescript
return useQuery({
  queryKey: [...],
  placeholderData: (previousData) => previousData, // Já existe!
  staleTime: 2 * 60 * 1000, // Reduzir de 10min para 2min
  refetchOnMount: 'always', // Refetch em background mas mostrar cached
});
```

### Parte 6: Preload de Chunks Críticos no Index

Adicionar preload hints no HTML para chunks críticos.

**Ficheiro**: `index.html`

**Alteração**:
```html
<!-- Preload critical chunks -->
<link rel="modulepreload" href="/src/pages/DashboardGeralPage.tsx">
```

---

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/hooks/usePrefetchPage.ts` | Adicionar preload de código JS |
| `src/contexts/AllProviders.tsx` | Prefetch imediato ao login |
| `src/components/MainContent.tsx` | Fallback minimalista |
| `src/components/layout/MobileMainContent.tsx` | Fallback minimalista |
| `src/components/AppSidebar.tsx` | Adicionar preload no hover |
| `src/components/layout/MobileBottomNav.tsx` | Preload no touch |
| `src/pages/DashboardGeralPage.tsx` | Ajustar loading condition |
| `src/hooks/useDashboardGeral.ts` | Reduzir staleTime |
| `src/hooks/useConsolidatedFinancialData.ts` | Reduzir staleTime |
| `src/components/loading/PageLoadingFallback.tsx` | Versão mais minimalista opcional |

---

## Resultado Esperado

### Antes (Actual):
```text
Clique → Skeleton (1-2s) → Conteúdo
```

### Depois (Optimizado):
```text
Clique → Conteúdo (quase instantâneo, ~100-200ms)
         ou
Clique → Spinner mínimo (100ms) → Conteúdo
```

---

## Prioridades de Implementação

1. **Alta Prioridade**: Preload de código JS no hover/touch
2. **Alta Prioridade**: Background prefetch mais agressivo
3. **Média Prioridade**: Reduzir staleTime dos hooks
4. **Média Prioridade**: Fallback minimalista do Suspense
5. **Baixa Prioridade**: Preload hints no HTML

A combinação destas optimizações vai fazer com que a navegação entre páginas seja praticamente instantânea, similar a sites que carregam "no instante".
