
## Ajustar Tamanho e Legibilidade do Card de Finanças no Dashboard

### Problema Identificado
O card de Finanças no Dashboard Geral apresenta dois problemas:
1. **Card muito grande quando expandido** - ocupa quase toda a tela, impedindo visualizar outros cards (Tarefas, Requisicoes)
2. **Informacoes muito pequenas** - texto em text-[9px] e text-[8px] nao e legivel

### Solucao Proposta

#### 1. Aumentar Tamanho das Fontes e Espacamento no DashboardFinancasSection

Atualizar os estilos para ficarem consistentes com os outros cards do dashboard:

| Elemento | Atual | Novo |
|----------|-------|------|
| Titulo do Card | text-xs | text-sm ou text-base |
| Labels (Orcamento, Gasto) | text-[9px] | text-xs |
| Valores numericos | text-xs | text-lg ou text-xl |
| Percentagem | text-[8px] | text-xs |
| Titulo "Top 5" | text-[9px] | text-sm |
| Padding do Card | py-1.5 px-2 | py-3 px-4 (padrao) |

#### 2. Limitar Altura Maxima do Grafico de Barras

O HorizontalBarChart nao deve crescer demasiado. Aplicar:
- Altura maxima do contentor do grafico: `max-h-[250px]`
- Scroll interno se necessario
- Manter barras legiveis mas compactas

#### 3. Layout Mais Compacto para Top 5 Projetos

Em vez de barras muito altas/espacadas, usar:
- Altura de barra reduzida mas mantendo legibilidade (barSize=24 em vez de 18)
- Fonte do eixo Y maior (fontSize: 10 em vez de 8)
- Espacamento entre barras reduzido

---

### Ficheiros a Alterar

#### `src/components/dashboard/DashboardFinancasSection.tsx`

Aumentar tamanhos de fonte e padding para consistencia:
- CardHeader: `py-3 px-4` (em vez de py-1.5 px-2)
- CardTitle: `text-base font-semibold` (em vez de text-xs)
- Labels: `text-xs` (em vez de text-[9px])
- Valores: `text-lg font-bold` (em vez de text-xs)
- Percentagem: `text-xs` (em vez de text-[8px])
- Container do grafico: `max-h-[280px] overflow-hidden`

#### `src/components/charts/HorizontalBarChart.tsx`

Melhorar legibilidade mantendo compacidade:
- Aumentar fontSize do eixo Y: 10 (em vez de 8)
- Aumentar fontSize do eixo X: 9 (em vez de 8)  
- Aumentar barSize: 22 (em vez de 18)
- Adicionar prop `maxHeight` para limitar crescimento
- Altura maxima calculada: `Math.min(calculatedHeight, 250)`

---

### Resultado Final

Apos as alteracoes:
- O card de Financas tera texto legivel (consistente com Tarefas e Requisicoes)
- O card nao ocupara toda a tela - altura limitada para permitir ver outros cards
- O grafico de barras sera compacto mas com fontes legiveis
- Possibilidade de ver card de Financas e Tarefas simultaneamente no ecra
