Vou fazer uma auditoria funcional completa dos botões e ações dos módulos antes de afirmar se “está tudo a funcionar”. Pela análise inicial, existem mais de 1000 ocorrências de botões/ações no código, por isso a resposta correta é: ainda não dá para garantir sem testar módulo a módulo. Já encontrei alguns sinais de risco, incluindo logs excessivos, botões de exportação/importação, navegação por `window.location.href`, ações de Segurança ainda com `console.log`, e um ponto recorrente no `BackgroundPrefetch` que ainda usa `useProjectContext` diretamente.

## Objetivo
Garantir que os botões principais de todos os módulos:
- Abrem modais corretamente.
- Submetem formulários até ao fim.
- Guardam dados na base de dados quando esperado.
- Atualizam a interface após criar/editar/apagar.
- Mostram feedback claro: loading, sucesso e erro.
- Não deixam a página em branco.
- Não parecem “clicáveis” quando a função ainda não está implementada.
- Funcionam em desktop e mobile.

## Módulos a auditar
- Dashboard Geral
- Projetos
- Finanças
- Centros de Custo
- Contas de Fornecedores
- Gastos de Obra
- Dívida FOA/FOF
- Compras/Requisições
- Armazém
- Recursos Humanos
- Segurança
- Tarefas
- Gráficos/Relatórios
- Gestão de Utilizadores
- Navegação mobile e menu lateral
- Assistente FOA quando aplicável

## Plano de execução

### 1. Criar uma matriz de botões por módulo
Vou mapear cada botão/ação importante por página:
- Nome visível do botão.
- Local onde aparece.
- O que deveria fazer.
- Hook/modal/função chamada.
- Dependências de permissões ou projeto selecionado.
- Estado esperado após concluir.

Exemplo:
```text
Módulo: RH
Botão: Importar Excel
Esperado: abrir modal, aceitar ficheiro, validar linhas, importar colaboradores, fechar modal, atualizar tabela
Status: testar e corrigir
```

### 2. Corrigir riscos globais que podem quebrar vários botões
Antes dos testes módulo a módulo, vou estabilizar pontos transversais:
- Remover/ajustar `useProjectContext` direto em componentes de background quando houver risco de render fora do provider.
- Reduzir logs repetitivos que causam lag e poluem a consola.
- Garantir que botões com ações assíncronas têm `disabled` e estado de loading.
- Uniformizar tratamento de erro/sucesso com toast.
- Substituir navegação por `window.location.href` por `navigate()` onde fizer sentido, para evitar reloads desnecessários.

### 3. Testar e corrigir ações de CRUD
Para cada módulo, validar:
- Criar.
- Editar.
- Eliminar.
- Visualizar detalhes.
- Pesquisar/filtrar.
- Exportar/importar.
- Aprovar/rejeitar, quando existir workflow.

Ações que já aparecem como suspeitas pela análise inicial:
- `SegurancaPage`: funções de visualizar/eliminar incidente parecem estar apenas em `console.log`.
- `GraficosPage`: botão de exportação tem indício de função incompleta/placeholder.
- `ContasFornecedoresPage`: há warning de DOM em tabela que deve ser corrigido, pois pode causar comportamento instável em linhas/botões.
- `BackgroundPrefetch`: continua a fazer prefetch agressivo e pode contribuir para lag.
- Botões de exportação/importação em RH, Armazém, Gastos e Movimentos Financeiros precisam de teste real.

### 4. Testar fluxos críticos já mencionados por ti
Vou dar prioridade a estes pontos:
- Convidar utilizador para a plataforma.
- Criar nova requisição.
- Baixar template de RH.
- Importar Excel de RH.
- Exportar relatórios/dados.
- Ações de aprovação de requisição.

### 5. Melhorar feedback visual dos botões
Onde estiver fraco, aplicar padrão consistente:
- Loading spinner enquanto processa.
- Botão desativado durante submissão.
- Toast de sucesso com mensagem útil.
- Toast de erro com causa real.
- Validação antes de enviar.
- Fecho de modal apenas após sucesso.
- Atualização automática das listas/KPIs após sucesso.

### 6. Verificação final
Depois das correções:
- Executar build TypeScript.
- Fazer varredura de erros de consola.
- Validar que os módulos principais não têm tela branca.
- Confirmar que botões incompletos foram implementados ou escondidos/desativados com explicação.
- Entregar um resumo com:
  - O que estava funcional.
  - O que estava quebrado.
  - O que foi corrigido.
  - O que ainda depende de dados/permissões reais.

## Resultado esperado
No fim, a plataforma deve ter botões mais confiáveis, fluxos completos e feedback claro. Se algum botão depender de permissão, dados obrigatórios ou configuração externa, isso ficará explícito para o utilizador em vez de “não acontecer nada”.

## Detalhes técnicos
- Usar `rg` para mapear todos os handlers (`onClick`, `onSubmit`, `mutate`, export/import).
- Rever hooks de mutação e invalidação de cache React Query.
- Corrigir ações placeholder (`console.log`) e handlers incompletos.
- Rever modais e formulários mais críticos.
- Validar integrações Supabase/Edge Functions quando forem chamadas por botões.
- Usar `navigate()` do React Router em vez de reloads quando aplicável.
- Reduzir prefetch agressivo se estiver a causar lag ou ações duplicadas.