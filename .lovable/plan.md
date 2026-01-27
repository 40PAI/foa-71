
# Plano de Correção: Loading Infinito e Erros de Plataforma

## Diagnóstico Completo

Após análise extensiva, identifiquei **4 problemas críticos** que estão a causar o loading infinito e mau funcionamento da plataforma:

### Problema 1: Nomes de Colunas Incorretos (CRÍTICO)
Os logs do Postgres mostram erros repetidos:
- `column colaboradores.nome_completo does not exist` - A coluna correta é `nome`
- `column materiais_armazem.nome does not exist` - A coluna correta é `nome_material`
- `column incidentes.data_incidente does not exist` - A coluna correta é `data`

**Arquivo afetado:** `src/hooks/usePrefetchPage.ts`
- Linha 114: `.order("nome", ...)` → deve ser `.order("nome_material", ...)`
- Linha 129: `.order("nome_completo", ...)` → deve ser `.order("nome", ...)`
- Linha 147: `.order("data_incidente", ...)` → deve ser `.order("data", ...)`

### Problema 2: Políticas RLS Duplicadas (MÉDIO)
A tabela `user_roles` tem 4 políticas mas apenas 2 são necessárias:
- "Directors manage all roles" (duplicada com "Directors can manage all roles")
- "Users view own roles" (duplicada com "Users can view their own roles")

### Problema 3: BackgroundPrefetch Executa com Erros (MÉDIO)
O `BackgroundPrefetch` em `AllProviders.tsx` executa 1 segundo após login, disparando queries com nomes de colunas incorretos que falham silenciosamente e podem afetar o estado da aplicação.

### Problema 4: AuthContext - Robustez de Tratamento de Erros (BAIXO)
O `AuthContext` atual trata erros corretamente com `try/catch/finally`, mas pode beneficiar de tratamento mais robusto para cenários edge-case.

---

## Plano de Implementação

### Fase 1: Corrigir Nomes de Colunas (Impacto Imediato)

**Arquivo:** `src/hooks/usePrefetchPage.ts`

```text
Alterações:
- Linha 113-114: Mudar de .order("nome", ...) para .order("nome_material", ...)
- Linha 127-129: Mudar de .order("nome_completo", ...) para .order("nome", ...)  
- Linha 145-147: Mudar de .order("data_incidente", ...) para .order("data", ...)
```

### Fase 2: Adicionar Tratamento de Erros ao BackgroundPrefetch

**Arquivo:** `src/contexts/AllProviders.tsx`

Envolver cada chamada de prefetch em try/catch para evitar que erros silenciosos afetem o funcionamento:

```typescript
useEffect(() => {
  if (user) {
    const timer = setTimeout(() => {
      console.log("🚀 Background prefetch started...");
      
      // Wrap each prefetch in try/catch to prevent cascading failures
      try { prefetch.prefetchDashboard(); } catch (e) { console.warn('Dashboard prefetch failed:', e); }
      try { prefetch.prefetchProjetos(); } catch (e) { console.warn('Projetos prefetch failed:', e); }
      
      if (selectedProjectId) {
        try { prefetch.prefetchFinancas(); } catch (e) { console.warn('Financas prefetch failed:', e); }
        // ... outros prefetch com try/catch
      }
    }, 1000);

    return () => clearTimeout(timer);
  }
}, [user, selectedProjectId, prefetch]);
```

### Fase 3: Limpar Políticas RLS Duplicadas (Banco de Dados)

**Migração SQL:**
```sql
-- Remover políticas duplicadas
DROP POLICY IF EXISTS "Directors can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
```

### Fase 4: Incrementar Versão do Cache

**Arquivo:** `src/lib/queryPersistence.ts`

Incrementar `CACHE_VERSION` de "v3" para "v4" para forçar limpeza de cache corrompido:

```typescript
const CACHE_VERSION = "v4"; // Incrementado para limpar cache com dados inválidos
```

---

## Resumo das Alterações

| Arquivo | Tipo de Alteração | Prioridade |
|---------|-------------------|------------|
| `src/hooks/usePrefetchPage.ts` | Corrigir 3 nomes de colunas | CRÍTICA |
| `src/contexts/AllProviders.tsx` | Adicionar try/catch ao prefetch | ALTA |
| `src/lib/queryPersistence.ts` | Incrementar CACHE_VERSION | ALTA |
| Banco de Dados | Remover políticas duplicadas | MÉDIA |

---

## Resultado Esperado

Após implementação:
1. O loading inicial completará em <1 segundo
2. Não haverá erros de colunas inexistentes nos logs
3. O prefetch em background funcionará sem falhas silenciosas
4. O cache local será limpo e reconstruído corretamente
5. A navegação funcionará sem travamentos

---

## Detalhes Técnicos

### usePrefetchPage.ts - Correções Específicas

**prefetchArmazem (linhas 107-119):**
```typescript
// ANTES:
.order("nome", { ascending: true });

// DEPOIS:
.order("nome_material", { ascending: true });
```

**prefetchRH (linhas 122-135):**
```typescript
// ANTES:
.order("nome_completo", { ascending: true });

// DEPOIS:
.order("nome", { ascending: true });
```

**prefetchSeguranca (linhas 137-153):**
```typescript
// ANTES:
.order("data_incidente", { ascending: false });

// DEPOIS:
.order("data", { ascending: false });
```

### AllProviders.tsx - BackgroundPrefetch Robusto

```typescript
function BackgroundPrefetch() {
  const prefetch = usePrefetchPage();
  const { user } = useAuth();
  const { selectedProjectId } = useProjectContext();

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        console.log("🚀 Background prefetch started...");
        
        // Safe prefetch with error handling
        const safePrefetch = (fn: () => void, name: string) => {
          try { fn(); } 
          catch (e) { console.warn(`Prefetch ${name} failed:`, e); }
        };
        
        safePrefetch(prefetch.prefetchDashboard, 'dashboard');
        safePrefetch(prefetch.prefetchProjetos, 'projetos');
        
        if (selectedProjectId) {
          safePrefetch(prefetch.prefetchFinancas, 'financas');
          safePrefetch(prefetch.prefetchCentrosCusto, 'centros-custo');
          safePrefetch(prefetch.prefetchCompras, 'compras');
          safePrefetch(prefetch.prefetchArmazem, 'armazem');
          safePrefetch(prefetch.prefetchRH, 'rh');
          safePrefetch(prefetch.prefetchSeguranca, 'seguranca');
          safePrefetch(prefetch.prefetchTarefas, 'tarefas');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, selectedProjectId, prefetch]);

  return null;
}
```
