Plano de melhoria profunda da plataforma

Objetivo: deixar a plataforma mais fluida, consistente e funcional, corrigindo os problemas reportados em UX/UI/layout, textos cortados, convite de utilizadores, criação de requisições e importação RH.

1. Auditoria e correção global de UX/UI/Layout
- Normalizar dimensões dos cards KPI para não ficarem excessivamente grandes ou pequenos entre páginas.
- Criar uma regra visual consistente para grids de KPIs: espaçamento equilibrado, altura mínima controlada e largura responsiva.
- Remover padrões que cortam texto em cards importantes (`truncate`, `line-clamp`, `overflow-hidden`) onde o conteúdo deve aparecer por completo.
- Aplicar tipografia dinâmica com `clamp()` e wrapping controlado para títulos, subtítulos e valores, evitando exemplos como “total de tar...”.
- Ajustar componentes comuns afetados:
  - `KPICard`
  - `SmartKPICard`
  - `KPIGrid`
  - `ResponsiveKPICard`
  - `MobileKPIGrid`
  - páginas com KPIs e cards principais, começando por Dashboard, Tarefas, Compras, Projetos, Finanças, Armazém e RH.

2. Melhorar suavidade e reduzir lag
- Rever a configuração global do React Query para reduzir refetches desnecessários que podem estar a causar lag.
- Ajustar invalidações realtime para invalidarem as query keys corretas. Foi detetado que `useRealtimeProjectMetrics` invalida `['requisitions', projectId]`, mas o hook atual usa `['requisitions']`; isto pode causar dados desatualizados e refetches pouco eficientes.
- Reduzir logs repetitivos de background prefetch/realtime na consola.
- Evitar efeitos visuais pesados em massa, como `hover:scale-105` em muitos cards, substituindo por transições mais subtis.
- Procurar renderizações e queries duplicadas em páginas principais, especialmente Dashboard e Compras.

3. Corrigir convite de utilizadores
- Substituir o fluxo antigo em `useInviteUser`, que tenta usar `supabase.auth.admin.createUser()` no frontend. Isto não funciona no browser e é inseguro.
- Unificar todos os convites para usarem a Edge Function `send-invitation`.
- Corrigir a Edge Function `send-invitation`:
  - validar input com segurança;
  - guardar o cargo técnico correto no enum `user_role`, e não o label visual “Diretor Técnico”;
  - manter o nome legível para o email;
  - não falhar silenciosamente quando a inserção do convite falhar;
  - melhorar mensagens de erro para o utilizador.
- Corrigir `RegisterInvitationPage`, porque atualmente lê `inv.invited_by`, mas a tabela usa também `invited_by_name`; isto pode mostrar dados incorretos.
- Validar que o convite cria registo em `invitations` e gera URL com token.

4. Corrigir criação de nova requisição
- Rever o submit do `RequisitionForm` para garantir que qualquer falha de validação aparece claramente ao utilizador.
- Garantir que a mutation insere todos os campos necessários e que o formulário não fica aparentemente “sem acontecer nada”.
- Corrigir query invalidation após criar/editar/eliminar requisições para atualizar imediatamente a lista e os KPIs.
- Verificar campos sensíveis da tabela `requisicoes`: `valor` é bigint e alguns campos são enums; vou normalizar os dados enviados para evitar erro silencioso de tipo/enum.
- Melhorar feedback visual no modal: loading, erro detalhado e sucesso antes de fechar.

5. Corrigir RH: baixar template e importar Excel
- Corrigir `EmployeeImportModal`: há um bug de estado assíncrono. Depois de `await importEmployees(previewData)`, o código verifica `importResult` antigo, então o modal pode não fechar nem mostrar sucesso corretamente.
- Corrigir importação para invalidar as queries corretas (`employees`, `colaboradores`, alocações RH) após sucesso.
- Melhorar o botão de baixar template para capturar erros do `XLSX.writeFile()` e mostrar toast de sucesso/erro.
- Validar compatibilidade entre o template gerado e o parser:
  - abas `Colaboradores` e `Alocações`;
  - cabeçalhos como `Nº Funcional`, `Hora Saída`, `Tipo Horário`;
  - tipos de dados esperados.
- Melhorar as mensagens de erro de importação para explicar exatamente qual linha/campo está errado.

6. Corrigir erro de notificações que aparece na rede
- Foi detetado um erro 404 em `verificar_notificacoes_periodicas`: a função existe, mas chama `criar_notificacoes_stock_critico()`, que não existe.
- Criar uma migração para repor ou corrigir a função `criar_notificacoes_stock_critico()` ou ajustar `verificar_notificacoes_periodicas()` para não chamar função inexistente.
- Isto deve remover erros repetidos de rede e ajudar na sensação de fluidez.

7. Verificações após implementação
- Executar build/lint para apanhar erros TypeScript/React.
- Testar fluxo de convite via Edge Function e logs.
- Testar criação de requisição com projeto selecionado.
- Testar download do template RH e importação com o próprio template gerado.
- Revisar visualmente páginas críticas com foco em:
  - textos completos;
  - cards equilibrados;
  - ausência de overflow horizontal desnecessário;
  - comportamento mobile/tablet/desktop.

Detalhes técnicos
- Será necessária uma migração Supabase pequena para corrigir a função de notificações em falta.
- Não vou mexer diretamente em `src/integrations/supabase/types.ts`.
- Não vou colocar roles em `profiles`; onde for preciso verificar permissões, será mantida a abordagem segura com `user_roles`/funções server-side já existente.
- A plataforma está ligada ao Supabase externo `ujhvdmvrhewwelxdducw`; todas as alterações de backend serão feitas via migração/Edge Function.