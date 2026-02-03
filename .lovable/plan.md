
## Ajustar Card de Finanças para Tamanho Similar ao Card de Tarefas

### Objetivo
Aumentar ligeiramente o card de Finanças para ficar com tamanho similar ao card de Tarefas, removendo a limitação de largura (`max-w-md`) e ajustando os espaçamentos internos para serem proporcionais, mantendo as barras do gráfico compactas.

### Comparação Atual

| Elemento | Card Tarefas | Card Finanças (atual) | Card Finanças (novo) |
|----------|--------------|----------------------|---------------------|
| Largura | 100% | max-w-md | 100% (sem limite) |
| Header padding | padrão | py-1 px-1.5 | py-2 px-3 |
| Content spacing | space-y-4 | space-y-1 | space-y-3 |
| Grid gap | gap-4 | gap-1 | gap-3 |
| Box padding | p-3 | p-1 | p-2 |
| Label font | text-xs | text-[10px] | text-xs |
| Value font | text-xl | text-sm | text-base |
| Título | text-responsive-xl | text-sm | text-lg |

### Alterações

**Ficheiro: `src/components/dashboard/DashboardFinancasSection.tsx`**

1. **Remover limitação de largura**: Eliminar `max-w-md` do Card
2. **Aumentar padding do header**: `py-2 px-3` (era py-1 px-1.5)
3. **Aumentar espaçamento do content**: `space-y-3 px-3 pb-3` (era space-y-1 px-1.5 pb-1.5)
4. **Aumentar gap do grid**: `gap-3` (era gap-1)
5. **Aumentar padding dos boxes**: `p-2` (era p-1)
6. **Aumentar tamanho das fontes**:
   - Título do card: `text-lg` (era text-sm)
   - Labels: `text-xs` (era text-[10px])
   - Valores: `text-base` (era text-sm)
   - Título "Top 5": `text-sm` (era text-xs)
7. **Ajustar margem do título do gráfico**: `mb-1.5` (era mb-0.5)

**Resultado esperado:**
- O card de Finanças ocupará a mesma largura do card de Tarefas
- Espaçamentos internos serão proporcionais e legíveis
- Barras do gráfico permanecem compactas (já estão com barHeight=14 e barGap=3)
- Tamanho geral similar ao card de Tarefas quando colapsável
