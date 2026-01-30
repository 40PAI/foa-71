

# Plano de Otimizacao de Performance - Mobile e Desktop

## Resumo Executivo

Este plano visa resolver os problemas de lentidao na navegacao entre paginas atraves de:
1. **Prefetch na navegacao mobile** (atualmente inexistente)
2. **Otimizacao do sistema de cache**
3. **Correcao de erros 404 nas funcoes RPC do Supabase**
4. **Melhoria do feedback visual durante carregamentos**

---

## Problema Identificado

### Situacao Atual

**Desktop (Sidebar):**
- Prefetch funciona no hover dos itens do menu (`onMouseEnter`)
- Dados sao pre-carregados antes do utilizador clicar

**Mobile (MobileBottomNav):**
- NAO tem prefetch implementado
- Cada navegacao carrega dados do zero
- Resultado: demora perceptivel ao mudar de pagina

**Erros de Backend:**
- Funcao `get_dashboard_geral_data` nao existe (404)
- Funcao `criar_notificacoes_stock_critico` nao existe (404)
- Estes erros causam retries desnecessarios

---

## Solucoes Propostas

### Fase 1: Prefetch na Navegacao Mobile

**1.1 - Adicionar prefetch ao MobileBottomNav**

Modificar `src/components/layout/MobileBottomNav.tsx`:
- Importar `usePrefetchPage`
- Adicionar `onTouchStart` ou `onPointerDown` para iniciar prefetch
- Mapear cada rota para a funcao de prefetch correspondente

```text
+------------------+     +------------------+
| Utilizador toca  | --> | Prefetch inicia  |
| no icone         |     | imediatamente    |
+------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +------------------+
| Navegacao        | --> | Dados ja em      |
| completa         |     | cache (instant)  |
+------------------+     +------------------+
```

**1.2 - Adicionar prefetch ao MobileMoreMenu**

Modificar `src/components/layout/MobileMoreMenu.tsx`:
- Adicionar prefetch no toque/hover dos itens do menu
- Pre-carregar dados quando o menu abrir (para itens visiveis)

---

### Fase 2: Otimizacao do Sistema de Cache

**2.1 - Ajustar tempos de staleTime**

Atualmente:
- Dashboard: 30 segundos (muito curto)
- Projetos: 60 segundos

Proposto:
- Dashboard: 2 minutos
- Projetos: 3 minutos
- Dados financeiros: 2 minutos
- Dados estaticos (materiais, colaboradores): 5 minutos

**2.2 - Implementar prefetch mais agressivo no BackgroundPrefetch**

Modificar `src/contexts/AllProviders.tsx`:
- Reduzir delay inicial de 1000ms para 500ms
- Adicionar prefetch de Armazem e RH mesmo sem projeto selecionado (sao dados globais)

---

### Fase 3: Melhorar Feedback Visual

**3.1 - Loading Skeleton especifico para Mobile**

Criar `src/components/loading/MobilePageLoadingFallback.tsx`:
- Layout otimizado para ecras pequenos
- Skeleton mais compacto
- Animacao mais rapida para parecer mais responsivo

**3.2 - Indicador de navegacao no bottom nav**

Adicionar micro-animacao no MobileBottomNav quando navegacao esta em progresso.

---

### Fase 4: Correcao de Erros de Backend

**4.1 - Tratar erro 404 graciosamente**

O hook `useDashboardGeral` precisa de fallback quando a RPC nao existe.

**4.2 - Desabilitar verificacao de notificacoes periodicas se RPC nao existir**

Evitar calls repetidas para funcoes inexistentes.

---

## Detalhes Tecnicos

### Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/layout/MobileBottomNav.tsx` | Adicionar prefetch |
| `src/components/layout/MobileMoreMenu.tsx` | Adicionar prefetch |
| `src/hooks/usePrefetchPage.ts` | Ajustar staleTime |
| `src/contexts/AllProviders.tsx` | Prefetch mais agressivo |
| `src/components/loading/MobilePageLoadingFallback.tsx` | NOVO: Loading mobile |
| `src/hooks/useDashboardGeral.ts` | Fallback para erro 404 |

### Codigo Exemplo - MobileBottomNav com Prefetch

```typescript
// Adicionar ao MobileBottomNav
const prefetch = usePrefetchPage();

const prefetchMap: Record<string, () => void> = {
  "/": prefetch.prefetchDashboard,
  "/projetos": prefetch.prefetchProjetos,
  "/financas": prefetch.prefetchFinancas,
};

// Em cada NavLink:
onPointerDown={() => prefetchMap[item.path]?.()}
```

---

## Resultados Esperados

### Antes
- Navegacao mobile: 1-3 segundos de espera
- Loading spinner visivel em cada mudanca de pagina
- Erros 404 repetidos no console

### Depois
- Navegacao mobile: < 500ms (dados ja em cache)
- Transicoes quase instantaneas
- Zero erros 404 desnecessarios
- Melhor experiencia de utilizador

---

## Ordem de Implementacao

1. **Prefetch no MobileBottomNav** (maior impacto)
2. **Prefetch no MobileMoreMenu**
3. **Ajustar staleTime nos prefetches**
4. **Melhorar BackgroundPrefetch**
5. **Criar MobilePageLoadingFallback**
6. **Tratar erros 404 graciosamente**

---

## Notas Importantes

- As funcoes RPC `get_dashboard_geral_data` e `verificar_notificacoes_periodicas` precisam ser criadas no Supabase ou o codigo frontend precisa de fallback
- O prefetch em mobile usa `onPointerDown` em vez de `onMouseEnter` porque em touch nao ha hover
- O sistema de cache em localStorage ja esta funcionando corretamente

