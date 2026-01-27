

# Guia Completo da Gestão de Utilizadores

## 1. Visão Geral do Sistema de Autenticação

### 1.1 Arquitetura de Segurança
O sistema utiliza uma arquitetura de segurança em três camadas:

1. **Supabase Auth (`auth.users`)**: Gestão de credenciais e sessões
2. **Tabela `profiles`**: Dados pessoais e cargo funcional do utilizador
3. **Tabela `user_roles`**: Papéis de segurança (separada para evitar escalação de privilégios)

### 1.2 Função de Verificação de Papéis
Uma função `has_role()` com `SECURITY DEFINER` permite verificar papéis sem recursão RLS:
```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 2. Papéis e Permissões

### 2.1 Papéis Disponíveis

| Papel | Código | Cor na UI |
|-------|--------|-----------|
| Diretor Técnico | `diretor_tecnico` | Vermelho |
| Coordenação/Direção | `coordenacao_direcao` | Roxo |
| Encarregado de Obra | `encarregado_obra` | Azul |
| Assistente de Compras | `assistente_compras` | Verde |
| Departamento de HST | `departamento_hst` | Amarelo |

### 2.2 Matriz de Permissões por Módulo

| Módulo | Dir. Técnico | Coordenação | Encarregado | Compras | HST |
|--------|:------------:|:-----------:|:-----------:|:-------:|:---:|
| Projetos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Requisições | ✅ | ❌ | ✅ | ❌ | ✅ |
| Armazém | ✅ | ✅ | ❌ | ✅ | ❌ |
| RH | ✅ | ✅ | ❌ | ❌ | ❌ |
| Segurança | ✅ | ✅ | ❌ | ❌ | ✅ |
| Tarefas | ✅ | ✅ | ✅ | ❌ | ❌ |
| Finanças | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gráficos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Compras | ✅ | ✅ | ❌ | ✅ | ❌ |
| Gestão Utilizadores | ✅ | ✅ | ❌ | ❌ | ❌ |

### 2.3 Permissões Especiais

- **Gestão de Utilizadores**: Apenas Diretor Técnico e Coordenação/Direção
- **Ativar/Desativar Utilizadores**: Apenas Diretor Técnico e Coordenação
- **Alterar Cargos**: Apenas Diretor Técnico e Coordenação

---

## 3. Acesso à Gestão de Utilizadores

### 3.1 Localização
**Caminho**: Menu do utilizador (canto superior direito) > Configurações > Aba "Gestão de Usuários"

### 3.2 Componentes de Interface
- **Botão "Convidar Usuário"**: Abre modal de convite
- **Lista de Utilizadores**: Cards com avatar, nome, email, cargo e status
- **Toggle de Status**: Ativar/desativar utilizadores instantaneamente
- **Botão Editar**: Alterar cargo e status de cada utilizador
- **Matriz de Permissões**: Documentação visual das permissões por cargo

---

## 4. Fluxo de Convite de Novos Utilizadores

### 4.1 Passos para Convidar
1. Aceder a **Configurações > Gestão de Usuários**
2. Clicar em **"Convidar Usuário"**
3. Preencher:
   - Nome Completo
   - Email
   - Cargo/Perfil (selecionar da lista)
4. Clicar **"Enviar Convite"**

### 4.2 O Que Acontece no Backend
1. Edge Function `send-invitation` é invocada
2. Email enviado via Resend API com:
   - Detalhes do convite (cargo, quem convidou)
   - Link para página de registro: `/register-invitation?email=...&role=...&invitedBy=...`
3. Utilizador recebe email com botão "Criar Conta e Acessar Plataforma"

### 4.3 Registro do Novo Utilizador
Na página `/register-invitation`:
1. Email já preenchido (somente leitura)
2. Utilizador preenche:
   - Nome Completo
   - Senha (mínimo 6 caracteres)
   - Confirmação de Senha
3. Ao submeter:
   - Conta criada via `supabase.auth.signUp()`
   - Perfil criado automaticamente via trigger
   - Redireciona para login

---

## 5. Gestão de Utilizadores Existentes

### 5.1 Alterar Cargo de Utilizador
1. Localizar utilizador na lista
2. Clicar no ícone de **Editar** (lápis)
3. Selecionar novo cargo no dropdown
4. Alteração aplicada imediatamente

### 5.2 Ativar/Desativar Utilizador
- **Via Toggle na Lista**: Usar switch de Ativo/Inativo diretamente
- **Via Modal de Edição**: Secção "Status do Usuário" com switch

**Efeito**: Utilizadores inativos (`ativo = false`) não podem aceder ao sistema mesmo com credenciais válidas.

---

## 6. Políticas de Segurança (RLS)

### 6.1 Tabela `profiles`

| Política | Operação | Quem Pode | Condição |
|----------|----------|-----------|----------|
| Directors view all profiles | SELECT | authenticated | `has_role(auth.uid(), 'diretor_tecnico') OR has_role(auth.uid(), 'coordenacao_direcao')` |
| Users view own profile | SELECT | authenticated | `id = auth.uid()` |
| Directors update profiles | UPDATE | authenticated | Apenas diretores e coordenação |
| Directors insert profiles | INSERT | authenticated | Apenas diretores e coordenação |

### 6.2 Tabela `user_roles`

| Política | Operação | Quem Pode |
|----------|----------|-----------|
| Directors manage all roles | ALL | Diretores e Coordenação |
| Users view own roles | SELECT | Próprio utilizador |

---

## 7. Verificação de Permissões no Código

### 7.1 Contexto de Autenticação
```typescript
const { hasRole, isDirector, canAccessModule } = useAuth();

// Verificar papel específico
if (hasRole('diretor_tecnico')) { ... }

// Verificar se é diretor
if (isDirector()) { ... }

// Verificar acesso a módulo
if (canAccessModule('financas')) { ... }
```

### 7.2 Componente ProtectedRoute
```tsx
<ProtectedRoute module="user_management">
  <UserManagementPage />
</ProtectedRoute>
```

### 7.3 Hook useUserPermissions
```typescript
const { 
  canViewAllProjects,
  canViewFinances,
  canViewPurchases,
  canViewTasks,
  canViewHR,
  canViewSecurity,
  canViewWarehouse,
  role,
  roleLabel
} = useUserPermissions();
```

---

## 8. Ficheiros Principais

| Ficheiro | Descrição |
|----------|-----------|
| `src/contexts/AuthContext.tsx` | Contexto de autenticação, funções `hasRole()`, `canAccessModule()` |
| `src/hooks/useProfiles.ts` | CRUD de perfis, mutations para atualização |
| `src/hooks/useUserPermissions.ts` | Hook para verificação de permissões na UI |
| `src/components/ProtectedRoute.tsx` | HOC para proteção de rotas |
| `src/components/modals/SettingsModal.tsx` | Modal de configurações com abas |
| `src/components/modals/settings/UserManagementSection.tsx` | Secção de gestão de utilizadores |
| `src/pages/RegisterInvitationPage.tsx` | Página de registro via convite |
| `src/pages/AuthPage.tsx` | Página de login |
| `supabase/functions/send-invitation/index.ts` | Edge function para envio de emails |

---

## 9. Requisitos Técnicos

### 9.1 Secret Necessário
- **RESEND_API_KEY**: Chave da API Resend para envio de emails

### 9.2 Domínio Configurado
- O email é enviado de `noreply@waridu.plenuz.ao`
- O link de registro aponta para `https://waridu.plenuz.ao/register-invitation`

---

## 10. Boas Práticas

1. **Princípio do Menor Privilégio**: Atribuir apenas as permissões necessárias
2. **Desativar em vez de Eliminar**: Manter histórico desativando utilizadores
3. **Auditoria**: Campo `granted_by` regista quem atribuiu cada papel
4. **Segregação de Funções**: Tabela `user_roles` separada evita escalação de privilégios
5. **Verificação em Camadas**: RLS no banco + verificação no frontend

