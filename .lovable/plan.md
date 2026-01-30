# Plano de Otimização de Performance - Mobile e Desktop

## ✅ IMPLEMENTADO

### Fase 1: Prefetch na Navegação Mobile ✅
- [x] MobileBottomNav: prefetch via `onPointerDown` e `onTouchStart`
- [x] MobileMoreMenu: prefetch em todos os itens do menu

### Fase 2: Otimização do Sistema de Cache ✅
- [x] Dashboard: 2 minutos (era 30s)
- [x] Projetos: 3 minutos (era 1min)
- [x] Dados financeiros: 2 minutos
- [x] Dados estáticos (materiais, colaboradores): 5 minutos
- [x] BackgroundPrefetch: delay reduzido de 1000ms para 500ms
- [x] Prefetch global de Armazém e RH (independente de projeto)

### Fase 3: Melhorar Feedback Visual ✅
- [x] Criado MobilePageLoadingFallback.tsx com skeleton compacto

### Fase 4: Correção de Erros de Backend ✅
- [x] useDashboardGeral: fallback gracioso para RPC inexistente (404)
- [x] usePrefetchPage: removida dependência de colunas inexistentes

## Arquivos Modificados
- `src/components/layout/MobileBottomNav.tsx`
- `src/components/layout/MobileMoreMenu.tsx`
- `src/hooks/usePrefetchPage.ts`
- `src/contexts/AllProviders.tsx`
- `src/hooks/useDashboardGeral.ts`
- `src/components/loading/MobilePageLoadingFallback.tsx` (NOVO)

