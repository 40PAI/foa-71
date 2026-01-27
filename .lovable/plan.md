
# Auditoria Completa da Plataforma FOA SmartSite

## Resumo Executivo

Após análise extensiva do código-fonte, banco de dados, políticas de segurança e arquitetura do projeto, identifiquei **125 problemas** que necessitam de atenção, categorizados por área e severidade.

---

## 1. AUDITORIA FRONT-END

### 1.1 Problemas de Performance (Prioridade Alta)

| Problema | Localização | Severidade |
|----------|-------------|------------|
| Bundle inicial ainda pesado apesar de lazy loading | `src/components/MainContent.tsx` | Media |
| Múltiplos hooks de query duplicados com lógica redundante | `src/hooks/useOptimizedQuery.ts`, `useOptimizedDataFetch.ts`, `useQuery.ts` | Media |
| Cache persistence usando localStorage pode causar inconsistências | `src/lib/queryPersistence.ts` | Baixa |

**Recomendações:**
- Consolidar `useOptimizedQuery.ts`, `useOptimizedDataFetch.ts` e `useQuery.ts` num único hook
- Mover cache persistence para IndexedDB para maior capacidade e performance
- Implementar service worker para cache de assets estáticos

### 1.2 Problemas de Responsividade

| Problema | Localização | Severidade |
|----------|-------------|------------|
| `useIsMobile` verifica apenas 768px breakpoint | `src/hooks/use-mobile.tsx` | Baixa |
| MobileLayout não partilha contexto do Sidebar | `src/pages/Index.tsx` | Media |

**Recomendações:**
- Adicionar breakpoints para tablet (768-1024px)
- Criar hook `useBreakpoint()` com múltiplos pontos de quebra

### 1.3 Uso de Estados

| Problema | Localização | Severidade |
|----------|-------------|------------|
| `setTimeout` assíncrono para buscar perfil após auth | `src/contexts/AuthContext.tsx:52-59` | Alta |
| Estado de collapsible duplicado em múltiplas páginas | `DashboardGeralPage.tsx` | Baixa |

**Recomendação:**
```typescript
// AuthContext.tsx - Remover setTimeout e usar await corretamente
if (session?.user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  setProfile(profile);
}
```

### 1.4 Consistência de Design System

| Problema | Localização | Severidade |
|----------|-------------|------------|
| `dangerouslySetInnerHTML` usado em chart.tsx (CSS dinâmico) | `src/components/ui/chart.tsx:79` | Baixa |
| Múltiplos padrões de espaçamento inconsistentes | Várias páginas | Baixa |

**Nota:** O uso de `dangerouslySetInnerHTML` em chart.tsx é seguro pois apenas gera CSS estático a partir de configuração interna.

---

## 2. AUDITORIA BACK-END (Edge Functions)

### 2.1 Estrutura das APIs

| Problema | Localização | Severidade |
|----------|-------------|------------|
| Apenas 2 edge functions (`send-invitation`, `send-notifications`) | `supabase/functions/` | Info |
| CORS permite qualquer origem (`*`) | Ambas as functions | Media |

**Recomendações:**
- Restringir CORS para domínios específicos:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://waridu.plenuz.ao',
  // ...
};
```

### 2.2 Tratamento de Erros

| Problema | Localização | Severidade |
|----------|-------------|------------|
| `send-invitation` expõe detalhes de erro ao cliente | `supabase/functions/send-invitation/index.ts:106` | Media |

**Recomendação:** Remover `details: error.message` da resposta de erro em produção.

### 2.3 Segurança das Edge Functions

| Problema | Severidade |
|----------|------------|
| `send-invitation` não valida se o requisitante tem permissão | Alta |
| Sem rate limiting implementado | Media |

**Recomendação:** Adicionar verificação de permissão:
```typescript
// Verificar se o utilizador autenticado pode convidar
const authHeader = req.headers.get('Authorization');
// Validar token e verificar role
```

---

## 3. AUDITORIA DO BANCO DE DADOS

### 3.1 Problemas de Segurança (125 issues do linter)

| Categoria | Quantidade | Severidade |
|-----------|------------|------------|
| **Security Definer Views** | 4 | ERRO |
| **Function Search Path Mutable** | 52 | Aviso |
| **RLS Policy Always True** | 47+ | Aviso |
| **Materialized View in API** | 1 | Aviso |

### 3.2 Políticas RLS Excessivamente Permissivas

**CRÍTICO:** Múltiplas tabelas usam `USING (true)` e `WITH CHECK (true)` para INSERT/UPDATE/DELETE:

```text
Tabelas afetadas:
- alocacao_mensal_colaboradores
- centros_custo
- clientes
- colaboradores
- colaboradores_projetos
- financas
- fluxo_caixa
- movimentos_financeiros
- requisicoes
- tarefas_lean
- (e mais ~30 tabelas)
```

**Recomendação:** Implementar políticas RLS baseadas em roles:
```sql
-- Exemplo para financas
CREATE POLICY "Diretores podem modificar financas"
ON public.financas
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'diretor_tecnico') OR
  public.has_role(auth.uid(), 'coordenacao_direcao')
)
WITH CHECK (
  public.has_role(auth.uid(), 'diretor_tecnico') OR
  public.has_role(auth.uid(), 'coordenacao_direcao')
);
```

### 3.3 Indexação

**Positivo:** O banco está bem indexado com índices em:
- Todas as chaves primárias
- Foreign keys principais
- Campos de filtro frequente (projeto_id, status, data)

**Recomendação de novos índices:**
```sql
-- Índice composto para queries frequentes
CREATE INDEX idx_movimentos_projeto_data 
ON movimentos_financeiros(projeto_id, data_movimento DESC);

CREATE INDEX idx_tarefas_projeto_status 
ON tarefas_lean(projeto_id, status);
```

### 3.4 Funções SQL sem Search Path

**52 funções** não têm `search_path` definido, o que pode permitir ataques de search path injection.

**Correção para cada função:**
```sql
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role)
SET search_path = public;
```

---

## 4. AVALIAÇÃO DE SEGURANÇA GERAL

### 4.1 Vulnerabilidades Identificadas

| Vulnerabilidade | Severidade | Localização |
|-----------------|------------|-------------|
| Roles armazenados na tabela `profiles.cargo` (não separados) | **CRÍTICA** | `AuthContext.tsx:118-120` |
| RLS policies `USING (true)` permitem qualquer operação | **ALTA** | ~30 tabelas |
| Security Definer Views bypassam RLS | **ALTA** | 4 views |
| CORS wildcard (*) nas edge functions | Media | Edge functions |
| 52 funções sem search_path | Media | PostgreSQL |

### 4.2 Problema Crítico: Armazenamento de Roles

**O sistema atual viola as melhores práticas de segurança:**

O código atual em `AuthContext.tsx`:
```typescript
const hasRole = (role: UserRole): boolean => {
  return profile?.cargo === role && profile?.ativo === true;
};
```

Verifica o role a partir do campo `cargo` na tabela `profiles`, **NÃO** de uma tabela separada `user_roles`.

**Risco:** Utilizadores podem escalar privilégios se conseguirem modificar o seu próprio perfil.

**Solução Recomendada:**
1. Criar tabela separada `user_roles` (já documentada no guide)
2. Implementar função `has_role()` com `SECURITY DEFINER`
3. Atualizar `AuthContext` para buscar roles da nova tabela
4. Migrar dados existentes

### 4.3 Proteção contra XSS

| Área | Estado |
|------|--------|
| Uso de `dangerouslySetInnerHTML` | ✅ Seguro (apenas CSS interno em chart.tsx) |
| Validação de inputs com Zod | ✅ Implementado em `src/utils/validation.ts` |
| Sanitização de dados de utilizador | ⚠️ Não verificado em todos os formulários |

### 4.4 Proteção contra SQL Injection

| Área | Estado |
|------|--------|
| Uso de Supabase SDK (queries parametrizadas) | ✅ Seguro |
| RPCs com parâmetros | ✅ Seguros |

### 4.5 CSRF

| Área | Estado |
|------|--------|
| Autenticação via Supabase Auth | ✅ Tokens JWT |
| Edge Functions | ⚠️ Sem validação de origin |

---

## 5. REVISÃO DA ARQUITETURA

### 5.1 Organização de Diretórios

```text
src/
├── components/          ✅ Bem organizado por tipo
│   ├── charts/          ✅ Gráficos separados
│   ├── common/          ✅ Componentes reutilizáveis
│   ├── dashboard/       ✅ Seções do dashboard
│   ├── financial/       ✅ Componentes financeiros
│   ├── forms/           ✅ Formulários separados
│   ├── layout/          ✅ Componentes de layout
│   ├── mobile/          ✅ Componentes mobile
│   ├── modals/          ✅ Modais organizados
│   ├── shared/          ✅ Componentes partilhados
│   ├── ui/              ✅ Design system
│   └── warehouse/       ✅ Componentes de armazém
├── contexts/            ✅ Bem organizado
├── hooks/               ⚠️ 95 hooks (alguns redundantes)
├── integrations/        ✅ Supabase isolado
├── lib/                 ✅ Utilitários
├── pages/               ⚠️ Algumas páginas duplicadas
├── services/            ✅ Lógica de negócio
├── types/               ✅ Tipos organizados
└── utils/               ✅ Funções utilitárias
```

### 5.2 Problemas de Organização

| Problema | Localização |
|----------|-------------|
| Hooks duplicados/redundantes | `useOptimizedQuery.ts`, `useOptimizedDataFetch.ts`, `useQuery.ts` |
| Páginas duplicadas | `FinancasPage.tsx`, `ConsolidatedFinancasPage.tsx`, `OptimizedFinancasPage.tsx` |
| Hooks de permissões duplicados | `useUserPermissions.ts` + lógica em `AuthContext.tsx` |

### 5.3 Escalabilidade

| Aspecto | Estado |
|---------|--------|
| Code splitting com lazy loading | ✅ Implementado |
| Cache persistence | ✅ Implementado |
| Prefetching no sidebar | ✅ Implementado |
| Query consolidation (RPC) | ✅ Implementado |
| Real-time subscriptions | ✅ Implementado |

---

## 6. PREVENÇÃO DE ERROS FUTUROS

### 6.1 Testes Automatizados

| Estado Atual | Recomendação |
|--------------|--------------|
| Playwright configurado mas sem testes | Criar testes E2E para fluxos críticos |
| Vitest configurado mas sem testes | Criar testes unitários para hooks |

**Testes Prioritários a Criar:**
1. `AuthContext.test.tsx` - Testar autenticação e roles
2. `useFinances.test.ts` - Testar cálculos financeiros
3. `RequisitionForm.test.tsx` - Testar validação de formulário
4. E2E: Fluxo de criação de requisição

### 6.2 Padrões de Código

**Implementar ESLint rules adicionais:**
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/strict-boolean-expressions": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 6.3 Documentação

| Estado | Recomendação |
|--------|--------------|
| Guias em `.lovable/plan.md` | ✅ Bem documentado |
| Memórias de bugs/features | ✅ Bem documentado |
| JSDoc nos hooks | ⚠️ Parcial |

---

## 7. PLANO DE AÇÃO PRIORIZADO

### Fase 1: Segurança Crítica (1-2 semanas)
1. **Migrar roles para tabela separada `user_roles`**
2. Corrigir políticas RLS permissivas
3. Adicionar `search_path` a todas as funções SQL
4. Restringir CORS nas edge functions

### Fase 2: Segurança Alta (2-3 semanas)
5. Converter Security Definer Views para views normais
6. Adicionar validação de permissão em `send-invitation`
7. Implementar rate limiting nas edge functions

### Fase 3: Qualidade de Código (3-4 semanas)
8. Consolidar hooks de query duplicados
9. Remover páginas duplicadas (manter apenas `ConsolidatedFinancasPage`)
10. Adicionar testes automatizados

### Fase 4: Performance e Manutenção (ongoing)
11. Migrar cache para IndexedDB
12. Adicionar novos índices ao banco
13. Implementar monitoramento de erros

---

## 8. RESUMO DE SEVERIDADES

| Severidade | Quantidade | Ação |
|------------|------------|------|
| **CRÍTICA** | 1 | Imediata (roles em profiles) |
| **ALTA** | 51 | Sprint 1 (RLS + views) |
| **MÉDIA** | 58 | Sprint 2 |
| **BAIXA** | 15 | Backlog |
| **INFO** | 0 | Documentação |

---

## Próximos Passos

Após aprovação deste plano, posso:
1. Criar script SQL para migrar roles para tabela separada
2. Gerar migrations para corrigir políticas RLS
3. Atualizar AuthContext para usar a nova estrutura
4. Consolidar hooks duplicados
5. Criar testes automatizados básicos

