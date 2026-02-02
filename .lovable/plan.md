
# Plano de Correção: Tarefas, Burndown e Alocamento de Material

## Problemas Identificados

### 1. Atualização de Tarefas Não Funciona
**Causa**: A política RLS de UPDATE na tabela `tarefas_lean` tem duas versões conflitantes:
- `tarefas_update` - requer `has_project_access()` para `encarregado_obra`
- `tarefas_lean_update` - permite UPDATE direto para os roles

O problema é que quando existem múltiplas políticas, PostgreSQL usa OR entre elas, mas a presença de policies duplicadas pode causar comportamentos inesperados. Além disso, a policy `tarefas_update` exige que o `encarregado_obra` tenha acesso explícito ao projeto via `has_project_access()`, mas este pode não estar configurado corretamente para o `diretor_tecnico`.

**Verificação**: O projeto CATETE (id=54) tem 8 tarefas com dados corretos na base de dados. O `diretor_tecnico` deve conseguir atualizar.

### 2. Burndown de Tarefas Mostra 0
**Causa**: O hook `useProjectTimelineData` está a calcular `burndownData` baseado em `data_inicio` e `data_fim_prevista` do projeto. Para o projeto CATETE:
- `data_inicio`: 2025-05-01
- `data_fim_prevista`: 2026-01-01

O problema está no cálculo temporal - a função `eachMonthOfInterval` está a gerar intervalos que excluem os dados das tarefas porque:
1. As tarefas têm prazos em 2025 (Jan a Nov)
2. O `data_inicio` do projeto é Maio 2025
3. Há uma discrepância entre datas do projeto e datas das tarefas

O gráfico mostra "0" porque o `displayEndDate` está a ser calculado incorretamente quando a data atual (Fev 2026) é posterior à `data_fim_prevista` (Jan 2026).

### 3. Alocamento de Material Não Responde ao Click
**Causa**: O componente `RequisitionTypeSelector` usa `RadioGroup` com `onClick` nos containers div, mas o RadioGroup pode estar a interceptar os eventos. Além disso, a query de `useMaterialsArmazem()` pode estar a falhar silenciosamente devido a RLS, retornando array vazio, o que faz aparecer a mensagem "Não há materiais disponíveis".

**Verificação**: Existem materiais no armazém com stock disponível (confirmei via query directa).

---

## Soluções Propostas

### Correção 1: Limpar Policies RLS Duplicadas nas Tarefas
Criar migração para:
- Remover policies antigas duplicadas (`tarefas_update`, `tarefas_select`)
- Manter apenas as políticas `tarefas_lean_*` que são mais permissivas

```sql
DROP POLICY IF EXISTS "tarefas_update" ON tarefas_lean;
DROP POLICY IF EXISTS "tarefas_select" ON tarefas_lean;
DROP POLICY IF EXISTS "tarefas_insert" ON tarefas_lean;
DROP POLICY IF EXISTS "tarefas_delete" ON tarefas_lean;
```

### Correção 2: Ajustar Cálculo do Burndown
No ficheiro `src/hooks/useProjectTimelineData.ts`:
- Corrigir a lógica de `displayEndDate` para usar `today` quando estamos a visualizar o estado actual
- Ajustar o cálculo para considerar que tarefas podem ter prazos anteriores ao `data_inicio` do projeto
- Garantir que o fallback funciona correctamente quando `eachMonthOfInterval` retorna poucos pontos

```typescript
// Corrigir displayEndDate - mostrar sempre até hoje para projectos em curso
const displayEndDate = isAfter(today, endDate) ? today : today;

// Usar intervalo que inclua todas as tarefas
const earliestTaskDeadline = tasks
  .filter(t => t.prazo)
  .reduce((min, t) => {
    const d = parseISO(t.prazo!);
    return !min || isBefore(d, min) ? d : min;
  }, null as Date | null);

const effectiveStart = earliestTaskDeadline && isBefore(earliestTaskDeadline, startDate) 
  ? startOfMonth(earliestTaskDeadline) 
  : startOfMonth(startDate);
```

### Correção 3: Corrigir Políticas RLS para materiais_armazem
Verificar e adicionar políticas que permitam SELECT para os roles relevantes:

```sql
CREATE POLICY "materiais_armazem_select" ON materiais_armazem
FOR SELECT USING (
  has_role(auth.uid(), 'diretor_tecnico') OR
  has_role(auth.uid(), 'coordenacao_direcao') OR
  has_role(auth.uid(), 'encarregado_obra') OR
  has_role(auth.uid(), 'assistente_compras') OR
  has_role(auth.uid(), 'gestor_qualidade')
);
```

---

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/migrations/[timestamp]_fix_tasks_rls_and_warehouse.sql` | Nova migração para limpar policies duplicadas e adicionar policies ao armazém |
| `src/hooks/useProjectTimelineData.ts` | Corrigir lógica do burndown para considerar tarefas com prazos anteriores ao início do projeto |

---

## Detalhes Técnicos

### Migração SQL Proposta
```sql
-- 1. Limpar policies duplicadas de tarefas_lean
DROP POLICY IF EXISTS "tarefas_update" ON public.tarefas_lean;
DROP POLICY IF EXISTS "tarefas_select" ON public.tarefas_lean;
DROP POLICY IF EXISTS "tarefas_insert" ON public.tarefas_lean;
DROP POLICY IF EXISTS "tarefas_delete" ON public.tarefas_lean;

-- 2. Garantir que materiais_armazem tem SELECT policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'materiais_armazem' 
    AND policyname = 'materiais_armazem_select_all_roles'
  ) THEN
    CREATE POLICY "materiais_armazem_select_all_roles" ON public.materiais_armazem
    FOR SELECT USING (
      public.has_role(auth.uid(), 'diretor_tecnico'::public.app_role) OR
      public.has_role(auth.uid(), 'coordenacao_direcao'::public.app_role) OR
      public.has_role(auth.uid(), 'encarregado_obra'::public.app_role) OR
      public.has_role(auth.uid(), 'assistente_compras'::public.app_role) OR
      public.has_role(auth.uid(), 'gestor_qualidade'::public.app_role)
    );
  END IF;
END $$;
```

### Correção do Burndown (useProjectTimelineData.ts)
A lógica será ajustada para:
1. Encontrar a data mais antiga entre as tarefas e o início do projeto
2. Usar `today` como endpoint mesmo para projectos "concluídos" para mostrar estado actual
3. Recalcular `planejado` baseado em todas as tarefas distribuídas pelo período efectivo
