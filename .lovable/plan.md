
# Plano: Correcao do Grafico Burndown de Tarefas

## Problema Identificado

### Dados Reais na Base de Dados

**Projeto KIFANGONDO (id=53):**
- Inicio: 2025-01-15
- Fim Previsto: 2025-12-31
- 8 tarefas (todas Pendentes, 0%)

**Projeto CATETE (id=54):**
- Inicio: 2025-05-01
- Fim Previsto: 2026-01-01
- 8 tarefas (1 Concluida, 3 Em Andamento, 4 Pendentes)

### Causa Raiz

O problema esta na logica de geracao de meses em `useProjectTimelineData.ts`:

1. O intervalo de meses usa `data_inicio` do projeto (Mai/2025 para CATETE)
2. A funcao `eachMonthOfInterval` gera: Mai/25, Jun/25, Jul/25... Jan/26
3. PROBLEMA: A data atual e Fev/2026, que esta DEPOIS da data_fim_prevista (Jan/26)
4. A logica `lastDisplayDate = isAfter(today, endDate) ? endDate : today` limita a Jan/26
5. Mas se `startDate > lastDisplayDate` (impossivel neste caso), retorna array vazio

**Problema Real**: Para KIFANGONDO, o intervalo deveria funcionar (Jan/25 a Dez/25), mas estamos em Fev/2026 - o periodo ja terminou! O grafico mostra ate `endDate` que e Dez/25, mas todos os calculos estao no passado.

O burndown so mostra dados se o projeto esta em andamento dentro do intervalo de datas. Para projectos com datas passadas, a logica falha.

---

## Solucao

### 1. Ajustar Logica de Intervalo de Meses

Modificar `useProjectTimelineData.ts` para:
- Sempre mostrar o historico completo do projeto (inicio ate fim previsto OU ate hoje, o que for maior)
- Nao limitar pelo `today` se quisermos ver historico passado

### 2. Corrigir Calculo de Tarefas Restantes

A logica atual em `burndownData` (linhas 191-204) conta tarefas restantes de forma ESTATICA:
```javascript
// Problema: Isto retorna o mesmo valor para TODOS os meses
const tarefasRestantes = tasks.filter(task => {
  if (task.status === 'Concluido') return false;
  return true; // Sempre retorna true se nao concluida
}).length;
```

Deve calcular DINAMICAMENTE para cada mes baseado no prazo:
```text
Para cada mes M:
  tarefasRestantes = contar tarefas onde:
    - prazo > fim_do_mes_M (ainda nao deveria estar concluida)
    - OU prazo <= fim_do_mes_M E nao esta 100% concluida (atrasada)
```

### 3. Melhorar Fallback em useProjectChartData.ts

Garantir que sempre ha dados validos para o grafico, mesmo com fallback simplificado.

---

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| src/hooks/useProjectTimelineData.ts | Corrigir intervalo de datas e logica de calculo dinamico |
| src/hooks/useProjectChartData.ts | Melhorar fallback com dados validos |

---

## Implementacao Detalhada

### useProjectTimelineData.ts

**Alteracoes na funcao `burndownData`:**

1. **Corrigir intervalo de meses (linhas 157-167):**
```javascript
// ANTES: Limita ao menor entre hoje e data_fim
const lastDisplayDate = isAfter(today, endDate) ? endDate : today;

// DEPOIS: Sempre mostra ate data_fim para ver historico completo
// Usar a data maior entre hoje e data_fim para projectos em curso
const displayEndDate = isAfter(endDate, today) ? today : endDate;
```

2. **Calcular tarefas restantes DINAMICAMENTE para cada mes (linhas 191-204):**
```javascript
// ANTES (estatico - mesmo valor para todos os meses):
const tarefasRestantes = tasks.filter(task => {
  if (task.status === 'Concluido') return false;
  return true;
}).length;

// DEPOIS (dinamico - diferente para cada mes):
const tarefasRestantes = tasks.filter(task => {
  // Tarefa 100% concluida nao conta como restante
  if (task.status === 'Concluido' || task.percentual_conclusao >= 100) {
    return false;
  }
  
  // Se nao tem prazo, conta como restante
  if (!task.prazo) return true;
  
  const taskDeadline = parseISO(task.prazo);
  
  // Tarefa com prazo DEPOIS deste mes = ainda restante (normal)
  if (isAfter(taskDeadline, monthEnd)) {
    return true;
  }
  
  // Tarefa com prazo ANTES/IGUAL a este mes mas nao concluida = restante (atrasada)
  return true;
}).length;
```

3. **Adicionar ponto inicial e final para garantir visualizacao:**
```javascript
// Garantir pelo menos: ponto inicial (todas tarefas) e ponto atual
if (months.length === 0) {
  // Fallback: criar 2 pontos minimos
  return [
    { periodo: "Inicio", planejado: totalTasks, real: totalTasks, ... },
    { periodo: "Atual", planejado: 0, real: remainingNow, ... }
  ];
}
```

### useProjectChartData.ts

**Melhorar fallback (linhas 146-158):**

```javascript
// ANTES: Fallback gera dados por tarefa individual (confuso)
const burndownData = hasEnoughData && timelineBurndownData.length >= 2
  ? timelineBurndownData.map(...)
  : tasks.map((task, index) => (...)); // Gera 1 ponto por tarefa

// DEPOIS: Fallback gera 3 pontos temporais claros
const burndownData = timelineBurndownData.length >= 2
  ? timelineBurndownData.map(...)
  : generateSimpleBurndown(tasks); // Inicio, Atual, Meta
```

---

## Resultado Esperado

Apos implementacao, o grafico Burndown mostrara:

**Para KIFANGONDO (8 tarefas, todas pendentes):**
| Mes | Planejado | Real | Status |
|-----|-----------|------|--------|
| Jan/25 | 8 | 8 | Normal |
| Mar/25 | 6 | 8 | Atrasado |
| Jun/25 | 4 | 8 | Atrasado |
| Set/25 | 2 | 8 | Atrasado |
| Dez/25 | 0 | 8 | Muito Atrasado |

**Para CATETE (8 tarefas, 1 concluida, 7 restantes):**
| Mes | Planejado | Real | Status |
|-----|-----------|------|--------|
| Mai/25 | 8 | 8 | Normal |
| Jul/25 | 6 | 7 | Ligeiro Atraso |
| Out/25 | 3 | 7 | Atrasado |
| Jan/26 | 0 | 7 | Muito Atrasado |

O grafico mostrara claramente:
- Linha Azul (Ideal): Decrescimo linear de 8 para 0
- Linha Laranja (Real): Evolucao real baseada em conclusoes
- Badge: "Atrasado" se real > planejado no ultimo ponto
- Cards: Total (8), Concluidas (X), Restantes (Y)
