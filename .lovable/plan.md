
# Plano de Correção: Tarefas, Burndown e Alocamento de Material

## ✅ CONCLUÍDO

### 1. ✅ Atualização de Tarefas
- Removidas políticas RLS duplicadas (`tarefas_update`, `tarefas_select`, `tarefas_insert`, `tarefas_delete`)
- Mantidas apenas as políticas `tarefas_lean_*` mais permissivas

### 2. ✅ Burndown de Tarefas 
- Corrigida a lógica em `useProjectTimelineData.ts`:
  - Calcula `effectiveStart` usando a data mais antiga entre as tarefas e o início do projeto
  - Usa `today` como `displayEndDate` para mostrar estado actual
  - Distribui corretamente as tarefas planejadas pelo período efetivo

### 3. ✅ Alocamento de Material
- Criada nova política RLS `materiais_armazem_select_all` que inclui todos os roles:
  - `diretor_tecnico`
  - `coordenacao_direcao`
  - `encarregado_obra`
  - `assistente_compras`
  - `departamento_hst`

## Ficheiros Modificados

| Ficheiro | Alteração |
|----------|-----------|
| `src/hooks/useProjectTimelineData.ts` | Corrigida lógica do burndown |
| Supabase Migration | Limpeza de policies duplicadas + nova policy para materiais |

## Notas
- Os avisos de segurança do linter são pré-existentes (funções sem search_path, políticas RLS permissivas em tabelas de sistema)
- O utilizador deve fazer refresh da página para ver as alterações
