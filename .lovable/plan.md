

## Correção dos Gastos por Categoria - Diagnóstico e Solução

### Problema Identificado

O modal "Gastos Detalhados - Materiais" (e outras categorias) mostra "Nenhum gasto registrado ainda" quando existem dados reais no banco de dados porque múltiplos componentes estão com erros de mapeamento de colunas e tabelas.

### Causa Raiz (3 problemas encontrados)

**1. Erro no RPC `get_consolidated_financial_data`**
A função SQL está referenciando `categoria_gasto` que não existe na tabela `movimentos_financeiros`. A coluna correta é `categoria`.

**Evidência do erro:**
```sql
SELECT * FROM get_consolidated_financial_data(54);
-- Retorna: {"error": "column \"categoria_gasto\" does not exist", "integrated_expenses": {}}
```

**Dados reais existentes (18.6M em Materiais):**
```sql
SELECT categoria, SUM(valor) FROM movimentos_financeiros WHERE projeto_id = 54 GROUP BY categoria;
-- Materiais: 18.616.556,81 Kz
-- Mão de Obra: 7.439.390,93 Kz
-- Custos Indiretos: 35.408.912,64 Kz
```

**2. Hook `useTaskExpensesByCategory.ts` usa tabela errada**
Linha 29: Busca de `tarefas` (não existe) em vez de `tarefas_lean`

**3. Hook `useUnifiedExpenses.ts` tem mapeamento incorreto**
O categoryMap usa valores que não correspondem exatamente aos da base de dados (ex: `'Material'` vs `'Materiais'`)

---

### Solução Técnica

#### Ficheiro 1: Nova migração SQL para corrigir RPC

Criar nova migração para atualizar a função `get_consolidated_financial_data`, substituindo todas as referências de `categoria_gasto` por `categoria`:

```sql
CREATE OR REPLACE FUNCTION get_consolidated_financial_data(p_projeto_id INTEGER)
...
-- Linha 78: categoria_gasto → categoria
-- Linha 123: categoria_gasto → categoria  
-- Linha 127: categoria_gasto → categoria
-- Linha 130: categoria_gasto → categoria
-- Linha 133: categoria_gasto → categoria
```

#### Ficheiro 2: `src/hooks/useTaskExpensesByCategory.ts`

Corrigir a tabela de origem (linha 29):
```typescript
// ANTES:
.from('tarefas' as any)

// DEPOIS:
.from('tarefas_lean' as any)
```

E ajustar os campos para corresponder à estrutura de `tarefas_lean`:
- `projeto_id` → `id_projeto`
- `nome_tarefa` → `descricao`

#### Ficheiro 3: `src/hooks/useUnifiedExpenses.ts`

Expandir o mapeamento de categorias para incluir todas as variantes existentes no banco:
```typescript
const categoryMap: Record<string, string[]> = {
  'material': ['Material', 'Materiais', 'material', 'Materia'],
  'mao_obra': ['Mão de Obra', 'Mao de Obra', 'mao_obra', 'Salário', 'Pessoal'],
  'patrimonio': ['Patrimônio', 'Patrimonio', 'Equipamento', 'patrimonio', 'Veículo'],
  'indireto': ['Custos Indiretos', 'Indireto', 'indireto', 'Segurança']
};
```

---

### Fluxo de Dados Corrigido

```text
┌─────────────────────────────────────────────────────────────────┐
│                     movimentos_financeiros                       │
│  (categoria: 'Materiais', 'Mão de Obra', 'Custos Indiretos')   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│         get_consolidated_financial_data (RPC corrigido)         │
│    → Usa coluna 'categoria' em vez de 'categoria_gasto'         │
│    → Retorna integrated_expenses com totais por categoria       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ConsolidatedFinancasPage.tsx                        │
│    → Passa fromTasks e fromCentroCusto para CategoryExpenseCard │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CategoryExpenseCard                           │
│    → Mostra totais nos cards                                    │
│    → Abre ExpenseManagement no modal                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           ExpenseManagement + useUnifiedExpenses                 │
│    → Lista todos os gastos detalhados da categoria              │
│    → Inclui dados de movimentos, requisições, tarefas, manuais  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| Nova migração SQL | Corrigir `categoria_gasto` → `categoria` no RPC |
| `src/hooks/useTaskExpensesByCategory.ts` | Mudar `tarefas` → `tarefas_lean` e ajustar campos |
| `src/hooks/useUnifiedExpenses.ts` | Expandir categoryMap com variantes do banco |

---

### Resultado Esperado

Após as correções:
1. Os cards de "Gestão de Gastos por Categoria" mostrarão os valores reais (18.6M para Materiais, 7.4M para Mão de Obra, etc.)
2. O modal "Gastos Detalhados" listará todos os movimentos financeiros correspondentes
3. A tabela unificada mostrará a origem de cada gasto (Centro de Custos, Requisição, Tarefa, Manual)

