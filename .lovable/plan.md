
# Plano: Padronizacao de Cores e Correcao de Graficos

## Resumo dos Problemas Identificados

### 1. Burndown de Tarefas Vazio (0 tarefas)
O projeto CATETE (#54) tem 8 tarefas reais com dados, mas o Burndown mostra 0. O problema esta na logica de calculo em `useProjectTimelineData.ts`:
- As tarefas existem (prazo de 2025-01-20 a 2025-11-15)
- O projeto vai de 2025-05-01 a 2026-01-01
- A logica de `burndownData` conta tarefas "restantes" baseado em `updated_at`, mas isso nao reflete corretamente o estado ao longo do tempo

### 2. Inconsistencia de Cores entre Graficos
Sistema atual de cores CSS definido em `index.css`:
```text
--chart-1: Azul (210 100% 50%)    - Usado para Planejado/Orcado
--chart-2: Laranja (25 100% 50%) - Usado para Real/Gasto
--chart-3: Verde (142 76% 36%)   - Usado para Concluido/Aprovado
```

Problema: Os graficos nao seguem este padrao:
- S-Curve: chart-1=fisico, chart-2=financeiro, chart-3=baseline (ERRADO)
- TimelineChart: chart-1=linear, chart-2=fisico, chart-3=financeiro (ERRADO)
- Burndown: chart-1=ideal, chart-2=real (CORRETO)

### 3. Cards de Categoria com Valores Zero
Na "Visao Geral Financeira Integrada", os cards mostram 0,00 Kz porque:
- `useIntegratedFinances.ts` retorna valores fixos de 0 para `material_expenses`, `payroll_expenses`, etc.
- A RPC `calculate_integrated_financial_progress` nao calcula por categoria
- Os dados existem em `movimentos_financeiros` com campo `categoria`

### 4. Grafico "Top Materiais" Pouco Intuitivo
- Usa apenas uma cor azul solida para todas as barras
- Nao agrupa por categoria de material
- Layout horizontal dificulta leitura de nomes longos

---

## Fase 1: Padronizar Sistema de Cores

### Definicao do Padrao Semantico

| Variavel | Cor | Uso Semantico |
|----------|-----|---------------|
| chart-1 | Azul | Baseline/Planejado/Orcado/Linear |
| chart-2 | Laranja | Avanco Fisico/Real |
| chart-3 | Verde | Avanco Financeiro/Aprovado |
| chart-4 | Amarelo | Em Andamento/Atencao |
| chart-5 | Vermelho | Atrasado/Critico |

### Ficheiros a Atualizar

1. **SCurveChart.tsx** (linhas 20-33)
   - chart-1 -> Baseline Linear (manter)
   - chart-2 -> Avanco Fisico (era financeiro)
   - chart-3 -> Avanco Financeiro (era tempo)

2. **TimelineChart.tsx** (linhas 21-34)
   - chart-1 -> Baseline Linear
   - chart-2 -> Avanco Fisico 
   - chart-3 -> Avanco Financeiro

3. **BurndownChart.tsx** (linhas 20-29)
   - chart-1 -> Ideal (Azul - CORRETO)
   - chart-2 -> Real (Laranja - CORRETO)

---

## Fase 2: Corrigir Dados do Burndown

### Problema Identificado
A funcao `burndownData` em `useProjectTimelineData.ts` conta incorretamente tarefas restantes:
```javascript
// Logica atual (linha 181-192):
const tarefasRestantes = tasks.filter(task => {
  if (task.status !== 'Concluido' && task.percentual_conclusao < 100) {
    return true; // Sempre conta como restante
  }
  // Verifica updated_at - mas isso nao indica quando foi concluida
});
```

### Solucao
Melhorar a logica para calcular burndown baseado em:
1. Tarefas que deveriam estar concluidas ate cada mes (por prazo)
2. Tarefas efetivamente concluidas ate cada mes
3. Usar `percentual_conclusao` para interpolacao

---

## Fase 3: Corrigir Cards de Categoria Financeira

### Problema
O hook `useIntegratedFinances.ts` mapeia a resposta RPC mas define zeros:
```javascript
// Linha 42-47:
material_expenses: 0,
payroll_expenses: 0,
patrimony_expenses: 0,
indirect_expenses: 0,
```

### Solucao
Buscar dados de `movimentos_financeiros` agrupados por categoria:
1. Criar nova query que agrupa por `categoria`
2. Mapear categorias para as 4 categorias principais:
   - "Material" / "Materiais" -> material_expenses
   - "Mao de Obra" -> payroll_expenses
   - "Patrimonio" / "Equipamento" -> patrimony_expenses
   - Outros -> indirect_expenses

---

## Fase 4: Melhorar Grafico de Materiais

### Alteracoes no TopMaterialsChart.tsx

1. **Cores por Categoria de Material**
   - Usar cores consistentes baseadas na categoria_principal do material
   - Verde para materiais de construcao
   - Azul para equipamentos
   - Laranja para consumiveis

2. **Layout Melhorado**
   - Aumentar largura do label Y-axis
   - Adicionar tooltip com detalhes do material
   - Mostrar categoria no tooltip

3. **Agrupamento Opcional**
   - Adicionar toggle para ver por categoria vs por material individual

---

## Ordem de Implementacao

1. **CSS/Config** - Documentar padrao de cores no index.css
2. **SCurveChart.tsx** - Trocar chart-2 e chart-3
3. **TimelineChart.tsx** - Alinhar com S-Curve
4. **useProjectTimelineData.ts** - Corrigir logica de burndown
5. **useIntegratedFinances.ts** - Adicionar query de categorias
6. **TopMaterialsChart.tsx** - Melhorar visualizacao

---

## Detalhes Tecnicos

### Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| src/index.css | Adicionar comentarios do padrao semantico |
| src/components/charts/SCurveChart.tsx | Trocar assignacao de cores |
| src/components/charts/TimelineChart.tsx | Alinhar cores com S-Curve |
| src/hooks/useProjectTimelineData.ts | Refatorar logica burndown |
| src/hooks/useIntegratedFinances.ts | Adicionar query de categorias |
| src/components/financial/CategoryBreakdown.tsx | Usar dados reais |
| src/components/charts/TopMaterialsChart.tsx | Cores por categoria |

### Mapeamento de Cores Final

```text
Todos os Graficos de Projeto:
- Azul (chart-1): Baseline/Planejado/Orcado/Ideal
- Laranja (chart-2): Fisico/Real/Executado
- Verde (chart-3): Financeiro/Aprovado/Concluido

Graficos de Armazem:
- Verde: Entradas/Devolucoes
- Vermelho: Saidas/Consumos
- Azul: Transferencias

Cards de Categoria:
- Azul: Materiais
- Verde: Mao de Obra
- Roxo: Patrimonio
- Laranja: Custos Indiretos
```

---

## Resultado Esperado

Apos implementacao:
1. S-Curve e TimelineChart usarao cores consistentes
2. Burndown mostrara dados reais das 8 tarefas do projeto
3. Cards de categoria mostrarao valores reais agregados de movimentos
4. Grafico de materiais sera mais intuitivo com cores por categoria
