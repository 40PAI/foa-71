Vou corrigir o fluxo de convites em duas frentes: convites enviados pela própria plataforma e links enviados diretamente pelo Supabase, para que ambos levem o utilizador para o local certo e deixem a conta pronta para usar.

## Problemas identificados

1. Os emails enviados pelo Supabase estão a redirecionar para `localhost:3000`, por isso o utilizador cai numa página inacessível quando clica no convite ou magic link.
2. O fluxo interno da plataforma usa uma função `send-invitation` com dependência de email externa e não há registos recentes de execução, indicando que o envio pode nem estar a ser chamado/deployado corretamente ou pode estar bloqueado por configuração.
3. A página `/register-invitation` valida o token diretamente no frontend e depois faz `signUp`, mas isso não garante de forma robusta que:
   - o convite só seja usado uma vez;
   - o perfil receba o cargo correto;
   - o registo funcione quando a pessoa já existe no Auth;
   - o utilizador seja encaminhado corretamente após aceitar o convite.
4. O trigger atual de criação de perfil cria todos os novos utilizadores como `encarregado_obra` por padrão, mesmo quando o convite definiu outro cargo.
5. O sistema já tem `profiles`, `user_roles` e `invitations`, mas o fluxo de convite precisa de ser consolidado para usar estas tabelas de forma consistente e segura.

## Fluxo final pretendido

```text
Administrador convida utilizador na plataforma
        |
        v
Sistema cria/atualiza convite seguro no banco
        |
        v
Email enviado com link para /register-invitation?token=...
        |
        v
Pessoa abre link
        |
        +-- se ainda não tem conta: cria senha e ativa perfil/cargo
        |
        +-- se já tem conta: convite é associado à conta existente e entra normalmente
        |
        v
Convite fica marcado como usado e não pode ser reutilizado
```

Para links enviados diretamente pelo Supabase:

```text
Convite / magic link do Supabase
        |
        v
Redireciona para o domínio correto da app, não localhost
        |
        v
App reconhece sessão/token
        |
        v
Se for convite: mostra ecrã para completar registo/senha
Se for magic link: entra na plataforma
```

## Plano de implementação

### 1. Corrigir URLs de autenticação do Supabase
- Ajustar a configuração de autenticação para usar o domínio real da plataforma: `https://foa-gest.plenuz.ao`.
- Garantir que os redirects permitidos incluem:
  - `https://foa-gest.plenuz.ao/*`
  - `https://foa-71.lovable.app/*`
  - a URL de preview, se necessário para testes.
- Evitar qualquer redirect final para `localhost:3000` nos emails reais.

### 2. Reforçar a tabela e lógica de convites
- Criar/atualizar funções seguras no banco para:
  - validar convite por token;
  - aceitar convite de forma atómica;
  - marcar `used_at` apenas uma vez;
  - impedir uso de convite expirado ou já utilizado;
  - associar convite ao email correto.
- Preservar o padrão seguro já existente: cargos continuam na tabela `user_roles`, não apenas no perfil.

### 3. Corrigir criação de perfil e cargo no registo
- Atualizar `handle_new_user` para procurar convite válido pelo email do novo utilizador.
- Criar o perfil com o nome/cargo do convite quando existir.
- Inserir também o cargo correto em `user_roles`.
- Se não existir convite, manter fallback seguro com cargo padrão.

### 4. Refatorar a função de convite da plataforma
- Atualizar `send-invitation` para:
  - exigir utilizador autenticado com permissão de gestão;
  - criar convite no banco com token único;
  - reutilizar/substituir convite pendente para o mesmo email quando fizer sentido;
  - devolver mensagens claras ao frontend.
- Remover dependência frágil de remetente de teste e deixar o envio preparado para o domínio/configuração correta disponível no projeto.
- Garantir que o link enviado é sempre para `/register-invitation?token=...` no domínio real.

### 5. Melhorar a página `/register-invitation`
- Trocar a leitura direta da tabela por chamadas seguras a funções RPC.
- Estados esperados:
  - convite válido: mostra email, nome, cargo e formulário de senha;
  - convite expirado: mostra mensagem e orientação para pedir novo convite;
  - convite já usado: mostra botão para login;
  - conta já existente: permite ir para login/magic link em vez de tentar criar conta duplicada.
- Ao concluir o registo, marcar o convite como usado no servidor e redirecionar para login ou entrar automaticamente, conforme o comportamento suportado pelo Supabase.

### 6. Melhorar login/magic link na aplicação
- Fazer a app lidar corretamente com tokens no hash da URL após clique em email do Supabase.
- Se o utilizador chegar autenticado via magic link, redirecionar para `/`.
- Se chegar por convite e ainda faltar completar perfil/senha, mandar para `/register-invitation`.
- Adicionar mensagens claras em português quando o link expirou ou já foi usado.

### 7. Ajustar a gestão de utilizadores na plataforma
- Unificar os dois pontos de convite existentes (`UserManagementPage` e `UserManagementSection`) para usarem o mesmo hook/serviço.
- Mostrar erro real quando o envio falhar.
- Após convite enviado, atualizar a lista de utilizadores/convites.
- Opcionalmente, mostrar estado do convite: pendente, expirado, aceite.

### 8. Testes e validação
- Testar convite interno para email novo.
- Testar convite interno para email que já existe no Auth.
- Testar convite expirado/usado.
- Testar magic link enviado pelo Supabase e confirmar que não vai para localhost.
- Confirmar que `profiles` e `user_roles` ficam coerentes com o cargo selecionado.
- Verificar logs da função de convite e logs de Auth para confirmar que não há erro silencioso.

## Resultado esperado

Depois da implementação:

- Convites enviados dentro da plataforma funcionam corretamente.
- Convites/magic links enviados pelo Supabase deixam de abrir `localhost` e passam a abrir a plataforma real.
- Um convite só pode ser usado uma vez.
- Se o utilizador já existir, ele consegue entrar normalmente e fica associado ao perfil/cargo correto.
- Se o utilizador ainda não existir, ele consegue concluir o registo pela página correta.
- O administrador passa a ver erros claros em vez de o sistema “não fazer nada”.

## Observação importante

A parte de redirecionamento dos emails nativos do Supabase depende também da configuração de URL no painel do Supabase. Vou deixar a aplicação e as funções preparadas, e também indicar exatamente quais URLs devem ficar autorizadas para que os emails enviados diretamente pelo Supabase funcionem no domínio final.