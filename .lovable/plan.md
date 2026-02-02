
# Plano: Sistema Completo de Permissoes e Workflow de Requisicoes

## Resumo Executivo

Este plano implementa um sistema robusto de permissoes baseado em perfis, com ancoragem de utilizadores a projetos especificos e dois tipos distintos de requisicoes (alocamento vs compra), incluindo workflow de notificacoes automaticas.

---

## Fase 1: Tabela de Ancoragem de Utilizadores a Projetos

### Objetivo
Permitir que "Encarregados de Obra" vejam apenas os projetos aos quais estao atribuidos.

### Alteracoes na Base de Dados

```text
+----------------------------+
|   user_project_access      |
+----------------------------+
| id: uuid (PK)              |
| user_id: uuid (FK profiles)|
| projeto_id: integer (FK)   |
| tipo_acesso: text          |
| data_atribuicao: date      |
| atribuido_por: uuid        |
| created_at: timestamptz    |
+----------------------------+
```

**Politicas RLS:**
- Diretor/Coordenacao: Acesso total para gerir atribuicoes
- Encarregado: Ve apenas os seus projetos atribuidos
- Assistente Compras: Ve todos os projetos (para gestao de requisicoes)

---

## Fase 2: Atualizacao da Matriz de Permissoes

### Tabela de Permissoes por Perfil

| Modulo | Diretor Tecnico | Coordenacao/Direcao | Encarregado Obra | Assistente Compras | HST |
|--------|-----------------|---------------------|------------------|--------------------|-----|
| Dashboard | Total | Total | Ancorado | Parcial | Parcial |
| Projetos | Total | Total | Ancorado (leitura) | Leitura | - |
| Tarefas | Total | Total | Ancorado (gestao) | - | - |
| Requisicoes | Total | Total | Ancorado (criar) | Total | Criar |
| Compras | Total | Total | - | Total | Total |
| Armazem | Total | Total | Ancorado (leitura) | Total | - |
| Financas | Total | Total | - | - | - |
| RH | Total | Total | - | - | - |
| Seguranca | Total | Total | - | - | Total |
| Gestao Usuarios | Total | Total | - | - | - |

### Ficheiros a Modificar

1. **`src/contexts/AuthContext.tsx`**
   - Atualizar funcao `canAccessModule()` com novas regras
   - Adicionar funcao `canAccessProject(projectId)` para ancoragem

2. **`src/hooks/useUserPermissions.ts`**
   - Adicionar permissoes granulares: `canEdit`, `canCreate`, `canDelete` por modulo
   - Adicionar `isAnchored` e `getAnchoredProjects()`

3. **`src/components/AppSidebar.tsx`**
   - Atualizar filtros de menu baseados nas novas permissoes

---

## Fase 3: Dois Tipos de Requisicao

### Novo Campo na Tabela `requisicoes`

```sql
ALTER TABLE requisicoes 
ADD COLUMN tipo_requisicao tipo_requisicao_enum 
DEFAULT 'compra'::tipo_requisicao_enum;

CREATE TYPE tipo_requisicao_enum AS ENUM ('alocamento', 'compra');
```

### Workflow por Tipo

**Requisicao de Alocamento (material existente):**
```text
Encarregado cria requisicao
       |
       v
+------------------+
| Assistente       |
| Compras recebe   |
| notificacao      |
+------------------+
       |
       v
Material disponivel? --Sim--> Aloca ao projeto
       |
       No
       v
Converte para Requisicao de Compra
```

**Requisicao de Compra (material novo):**
```text
Assistente/Encarregado cria requisicao
       |
       v
Valor > limite aprovacao?
       |
       Sim --> Aprovacao Direcao
       |
       No --> Cotacoes
       |
       v
Processo normal de compra
```

### Alteracoes na UI

**`src/components/modals/RequisitionModal.tsx`**
- Adicionar selecao de tipo de requisicao
- Para "Alocamento": Mostrar apenas materiais disponiveis no armazem
- Para "Compra": Formulario completo de nova compra

**`src/components/forms/RequisitionForm.tsx`**
- Formulario dinamico baseado no tipo selecionado
- Para alocamento: Selector de materiais do armazem com stock disponivel
- Para compra: Campos completos de especificacao

---

## Fase 4: Sistema de Notificacoes Automaticas

### Triggers a Criar/Atualizar

1. **Requisicao de Alocamento Criada:**
   - Notificar: `assistente_compras`
   - Mensagem: "Nova requisicao de alocamento de [material] para projeto [nome]"

2. **Requisicao de Compra Criada:**
   - Notificar: `assistente_compras`, `coordenacao_direcao` (se valor > limite)
   - Mensagem: "Nova requisicao de compra de [material] - [valor]"

3. **Requisicao Pendente Aprovacao:**
   - Notificar: `diretor_tecnico`, `coordenacao_direcao`
   - Mensagem: "Requisicao [ID] aguarda aprovacao - [valor]"

4. **Requisicao Aprovada/Rejeitada:**
   - Notificar: Requisitante original
   - Mensagem: "Sua requisicao [ID] foi [aprovada/rejeitada]"

### Funcao Atualizada

```sql
CREATE OR REPLACE FUNCTION notify_requisicao()
RETURNS trigger AS $$
BEGIN
  -- Logica baseada em tipo_requisicao e estado
  IF NEW.tipo_requisicao = 'alocamento' THEN
    -- Notificar assistente de compras
    INSERT INTO notificacoes (...)
    VALUES ('alocamento', ..., ARRAY['assistente_compras']);
  ELSIF NEW.tipo_requisicao = 'compra' THEN
    -- Notificar com base no valor
    INSERT INTO notificacoes (...)
    VALUES ('compra', ..., 
      CASE WHEN NEW.valor > limite THEN 
        ARRAY['diretor_tecnico', 'coordenacao_direcao', 'assistente_compras']
      ELSE 
        ARRAY['assistente_compras']
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Fase 5: Atualizacao de Politicas RLS

### Projetos (com ancoragem)

```sql
-- Encarregados veeem apenas projetos atribuidos
CREATE POLICY projetos_select_encarregado ON projetos
FOR SELECT USING (
  has_role(auth.uid(), 'encarregado_obra') AND 
  EXISTS (
    SELECT 1 FROM user_project_access 
    WHERE user_id = auth.uid() AND projeto_id = projetos.id
  )
  OR has_role(auth.uid(), 'diretor_tecnico')
  OR has_role(auth.uid(), 'coordenacao_direcao')
  OR has_role(auth.uid(), 'assistente_compras')
);
```

### Tarefas (com ancoragem)

```sql
CREATE POLICY tarefas_select_encarregado ON tarefas_lean
FOR SELECT USING (
  has_role(auth.uid(), 'encarregado_obra') AND 
  EXISTS (
    SELECT 1 FROM user_project_access 
    WHERE user_id = auth.uid() AND projeto_id = tarefas_lean.projeto_id
  )
  -- ... outras roles
);
```

---

## Fase 6: Interface de Gestao de Atribuicoes

### Novo Componente

**`src/components/modals/UserProjectAssignmentModal.tsx`**
- Lista de utilizadores com role `encarregado_obra`
- Para cada utilizador: Checkbox list de projetos
- Botao de guardar atribuicoes

### Integracao

**`src/pages/UserManagementPage.tsx`**
- Adicionar coluna "Projetos Atribuidos"
- Botao para gerir atribuicoes

---

## Detalhes Tecnicos

### Migracao SQL Completa

A migracao incluira:
1. Criacao do enum `tipo_requisicao_enum`
2. Alteracao da tabela `requisicoes` com novo campo
3. Criacao da tabela `user_project_access`
4. Politicas RLS para a nova tabela
5. Atualizacao das politicas existentes
6. Atualizacao do trigger de notificacoes

### Ficheiros Frontend a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `AuthContext.tsx` | Funcoes de ancoragem e permissoes |
| `useUserPermissions.ts` | Hook com permissoes granulares |
| `AppSidebar.tsx` | Filtros de menu atualizados |
| `RequisitionModal.tsx` | Selector de tipo de requisicao |
| `RequisitionForm.tsx` | Formulario dinamico |
| `ComprasPage.tsx` | Filtros por tipo de requisicao |
| `ArmazemPage.tsx` | Modo leitura para encarregados |
| `UserManagementPage.tsx` | Gestao de atribuicoes |

### Novo Hook

**`src/hooks/useUserProjectAccess.ts`**
- Query para projetos atribuidos ao utilizador
- Mutation para atribuir/remover acesso
- Cache com React Query

---

## Ordem de Implementacao

1. **Migracao DB**: Criar estruturas de dados
2. **AuthContext**: Logica de ancoragem
3. **Hook de permissoes**: Permissoes granulares
4. **Sidebar**: Filtros de menu
5. **Requisicoes**: Dois tipos + formularios
6. **Triggers**: Notificacoes automaticas
7. **Gestao de atribuicoes**: UI para diretores
8. **Testes**: Validar fluxos por perfil

---

## Resultado Esperado

Apos implementacao:

- **HST**: Ve apenas Compras e Seguranca, pode criar requisicoes
- **Encarregado**: Ve apenas projetos atribuidos, gere tarefas e cria requisicoes de alocamento
- **Assistente Compras**: Acesso total a Compras e Armazem, recebe notificacoes de alocamento
- **Coordenador**: Acesso total de visualizacao e gestao de utilizadores
- **Diretor**: Acesso completo a tudo, incluindo alteracao de permissoes

O workflow de requisicoes seguira o fluxo: Pedido -> Verificacao de stock -> Alocamento ou Compra -> Aprovacao (se necessario) -> Execucao, com notificacoes automaticas em cada etapa.
