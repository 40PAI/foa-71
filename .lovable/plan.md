

# Plano: Correção dos 6 Problemas Identificados

## 1. Lentidão a carregar módulos

**Causa**: `staleTime: 5min` + `refetchOnMount: false` + cache localStorage com 24h faz com que dados venham do disco; mas hooks pesados (`useRealtimeProjectMetrics`, `useFinancialIntegration`) re-subscrevem 8+ canais Realtime a cada navegação, bloqueando a thread.

**Ações**:
- Reduzir `staleTime` global para `60s` em `src/main.tsx` para refresh mais responsivo, mantendo `gcTime` em 10min.
- Activar `refetchOnMount: 'always'` apenas para queries de dashboard/listas críticas (manter `false` para o resto via override).
- Consolidar os 8 canais Realtime de `useRealtimeProjectMetrics.ts` num único canal `project-${id}-all` com filtros por tabela, eliminando overhead de múltiplas subscriptions.
- Adicionar `Suspense` com skeletons em `Index.tsx` lazy routes para feedback visual imediato.

## 2. Mudanças não refletem entre computadores

**Causa**: Tabelas críticas (`projetos`, `colaboradores`, `tarefas_lean`, `gastos_obra`, `movimentos_financeiros`, `materiais_armazem`) podem não estar na publicação `supabase_realtime`. Apenas `requisicoes`, `financas` e `notificacoes` aparecem nas migrations. Sem isso, Realtime não dispara e dados ficam stale até refresh manual.

**Ações** (migration SQL):
```sql
ALTER TABLE projetos REPLICA IDENTITY FULL;
ALTER TABLE tarefas_lean REPLICA IDENTITY FULL;
ALTER TABLE colaboradores REPLICA IDENTITY FULL;
ALTER TABLE gastos_obra REPLICA IDENTITY FULL;
ALTER TABLE movimentos_financeiros REPLICA IDENTITY FULL;
ALTER TABLE materiais_armazem REPLICA IDENTITY FULL;
ALTER TABLE etapas_projeto REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE projetos, tarefas_lean,
  colaboradores, gastos_obra, movimentos_financeiros,
  materiais_armazem, etapas_projeto;
```
- Adicionar `refetchOnReconnect: true` (já está) e `refetchOnWindowFocus: true` para invalidação ao trocar de aba.

## 3. Texto truncado nos cards (KPIs)

**Causa**: `KPICard.tsx` (linha 37) e múltiplos KPI cards usam `truncate` no título, cortando "Total de Tarefas" → "Total de Tar...".

**Ações**:
- Substituir `truncate` por `break-words leading-tight` nos títulos de:
  - `src/components/KPICard.tsx`
  - `src/components/charts/SmartKPICard.tsx` (já usa `line-clamp-2`, manter)
  - `src/components/financial/GastosObraKPICards.tsx` (5 ocorrências)
  - `src/components/financial/FornecedoresKPICards.tsx`
  - Demais `*KPICards.tsx` em `src/components/financial/`
- Adicionar `text-xs` dinâmico via `clamp()` CSS quando o texto é longo: tamanho da fonte ajusta entre `0.7rem` e `0.875rem` consoante o contentor.
- Aumentar `max-h-28` para `min-h-[6rem]` (auto-grow) para acomodar 2 linhas sem cortar valor numérico.

## 4. Convidar utilizador não funciona

**Causa provável**: edge function `send-invitation` chama Resend com domínio `noreply@waridu.plenuz.ao`. Se o domínio não estiver verificado em Resend, envio falha. Falta também criar registo em `public.invitations` (referenciado pela memória `mem://security/invitation-flow`) — atualmente apenas envia email sem token.

**Ações**:
- Verificar logs da edge function `send-invitation` para confirmar erro real.
- Atualizar a function para:
  1. Gerar token UUID seguro;
  2. Inserir em `public.invitations` com `expires_at = now() + 7 days`;
  3. Construir URL `register-invitation?token={uuid}` em vez de query params com email/role em texto claro;
  4. Capturar e propagar erro Resend específico (domain not verified, rate limit) em vez de mensagem genérica.
- Atualizar `RegisterInvitationPage.tsx` para validar token via query do Supabase antes de criar conta.
- Caso domínio não esteja verificado, fallback para `onboarding@resend.dev` (apenas para testes).

## 5. Nova requisição não acontece nada

**Causa**: `<RequisitionModal projectId={selectedProjectId} />` — `selectedProjectId` é `number | null`. Quando é `null` (utilizador não escolheu projeto), o tipo TS aceita mas o form falha silenciosamente porque `id_projeto: projectId` envia `null` e o `INSERT` na BD viola NOT NULL ou RLS.

**Ações**:
- Em `ComprasPage.tsx`: desactivar visualmente o botão "Nova Requisição" quando `!selectedProjectId` e mostrar `<Alert>` "Selecione um projeto primeiro".
- Em `RequisitionForm.tsx onSubmit`: validar `projectId` antes do submit, mostrar toast de erro se ausente.
- Adicionar `console.error` detalhado no catch do `onSubmit` para expor erros Supabase (RLS, validation) no toast em vez de mensagem genérica "Erro ao salvar requisição".
- Verificar políticas RLS na tabela `requisicoes` para garantir que o utilizador autenticado tem permissão `INSERT`.

## 6. Template e import de RH não funcionam

**Causa**: `EmployeeImportModal.tsx` linha 56-59: `handleDownloadTemplate` apenas mostra toast "Template será baixado em breve" — **não está implementado**. Não existe `EmployeeTemplateDownloadButton` no codebase.

**Ações**:
- Criar `src/components/employees/EmployeeTemplateDownloadButton.tsx` análogo a `TemplateDownloadButton` (projetos) gerando workbook XLSX com 2 abas:
  - **Colaboradores**: Nome, Cargo, Categoria (Oficial/Auxiliar/Técnico Superior), Tipo (Fixo/Temporário), Custo/Hora, Número Funcional, Telefone, Email, Data Admissão.
  - **Alocações**: Número Funcional, ID Projeto, Data Início, Data Fim, Horas Diárias.
  - **Instruções**: regras de preenchimento.
- Substituir `handleDownloadTemplate` no `EmployeeImportModal` por chamada real à geração do XLSX.
- Verificar/corrigir `useEmployeeImport.parseExcelFile`: confirmar que o parser aceita o template gerado e que `EmployeeImportService.importEmployees` insere em `colaboradores` com RLS adequada.

## Detalhes Técnicos

| Arquivo | Mudança |
|---------|---------|
| `src/main.tsx` | `staleTime: 60_000`, `refetchOnWindowFocus: true` |
| `src/hooks/useRealtimeProjectMetrics.ts` | Consolidar canais |
| `supabase/migrations/<new>.sql` | `REPLICA IDENTITY FULL` + `ADD TABLE` para 7 tabelas |
| `src/components/KPICard.tsx` | Remover `truncate`, usar `break-words` + clamp font-size |
| `src/components/financial/*KPICards.tsx` | Idem |
| `supabase/functions/send-invitation/index.ts` | Token UUID + registo `invitations` + erro detalhado |
| `src/pages/RegisterInvitationPage.tsx` | Validar token |
| `src/pages/ComprasPage.tsx` | Disable botão sem projeto + alert |
| `src/components/forms/RequisitionForm.tsx` | Validação `projectId` + log de erros completo |
| `src/components/employees/EmployeeTemplateDownloadButton.tsx` | **Novo** componente |
| `src/components/modals/EmployeeImportModal.tsx` | Usar componente real de download |

## Resultado

- Performance: navegação 2-3× mais rápida; dados sincronizam entre máquinas em <2s via Realtime;
- UX: nenhum texto cortado em KPIs, fontes auto-ajustáveis;
- Funcionalidade: convites funcionam com tokens seguros, requisições e import de RH operacionais com mensagens de erro claras.

