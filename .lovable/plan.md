
# Plano: Correcao da Sincronizacao de Dados e Graficos

## Resumo dos Problemas Identificados

Apos analise extensiva da base de dados e codigo frontend, identifiquei os seguintes problemas criticos:

### 1. Funcao RPC com Nome de Coluna Errado (CRITICO)
A funcao `calculate_integrated_financial_progress` usa `p.orcamento_total` mas a coluna real chama-se `orcamento`. Isto faz com que todos os calculos financeiros retornem 0% de progresso.

### 2. Hook `useProjectMetrics` Usa Tabela Legacy
O hook le dados da tabela `financas` (legacy) em vez de `movimentos_financeiros` (ledger atual). Resultado: gastos mostram 0 quando ha milhoes registados.

### 3. Funcao RPC com Nome de FK Errado
A funcao usa `t.projeto_id` na tabela `tarefas_lean` mas a coluna chama-se `id_projeto`.

### 4. Datas de Projeto Desatualizadas
O projeto VALODIA (id=52) tem `data_fim_prevista: 2025-12-31` (passado!) causando atraso de 100%.

### 5. Loop Infinito no UserProjectAssignmentModal
O `useEffect` esta a causar re-renders infinitos por dependencias mal configuradas.

---

## Fase 1: Corrigir Funcoes RPC no Supabase

### Migracao SQL para Corrigir `calculate_integrated_financial_progress`

```text
Alteracoes:
- p.orcamento_total -> p.orcamento
- t.projeto_id -> t.id_projeto
```

A funcao corrigida ira:
1. Ler corretamente o orcamento do projeto
2. Agregar gastos de `movimentos_financeiros`
3. Incluir requisicoes aprovadas
4. Incluir gastos detalhados aprovados
5. Retornar progresso financeiro correto

---

## Fase 2: Corrigir Hook useProjectMetrics

### Problema Atual
```javascript
// Le da tabela legacy
const { data: finances } = await supabase
  .from("financas")
  .select("*")
  .eq("id_projeto", projectId);

const totalSpent = finances?.reduce((acc, f) => acc + f.gasto, 0) || 0;
```

### Solucao
```javascript
// Ler de movimentos_financeiros (ledger atual)
const { data: movements } = await supabase
  .from("movimentos_financeiros")
  .select("valor")
  .eq("projeto_id", projectId)
  .eq("tipo_movimento", "saida");

const totalSpent = movements?.reduce((acc, m) => acc + m.valor, 0) || 0;
```

---

## Fase 3: Corrigir Loop Infinito no Modal

### Problema Atual
```javascript
useEffect(() => {
  if (userAccess.length > 0) {
    setSelectedProjects(userAccess.map(a => a.projeto_id));
  } else {
    setSelectedProjects([]);
  }
}, [userAccess]); // userAccess muda -> setState -> re-render -> loop
```

### Solucao
Usar `useMemo` para derivar o estado inicial em vez de `useEffect`:
```javascript
const initialSelection = useMemo(() => 
  userAccess.map(a => a.projeto_id), 
  [userAccess]
);

const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

// Sincronizar apenas quando userAccess muda E ha dados
useEffect(() => {
  if (userAccess && userAccess.length >= 0 && !loadingAccess) {
    setSelectedProjects(userAccess.map(a => a.projeto_id));
  }
}, [userAccess, loadingAccess]);
```

---

## Fase 4: Sincronizar Dados do Projeto

### Criar Funcao de Sincronizacao em Massa

Uma funcao RPC que atualiza todos os projetos de uma vez:

```sql
CREATE OR REPLACE FUNCTION sync_all_project_metrics()
RETURNS void AS $$
DECLARE
  p_rec RECORD;
BEGIN
  FOR p_rec IN SELECT id FROM projetos LOOP
    PERFORM update_project_metrics_with_integrated_finance(p_rec.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Fase 5: Melhorar Graficos de Armazem

### MaterialFlowChart
- Aumentar periodo padrao de 30 para 90 dias
- Filtrar movimentacoes por projeto quando selecionado
- Mostrar mensagem informativa quando sem dados

### Verificar Tipos de Movimentacao
A consulta filtra por `tipo_movimentacao` em ['entrada', 'saida', 'consumo', 'devolucao'] mas os dados mostram 'transferencia'. Corrigir para incluir todos os tipos.

---

## Fase 6: Importacao Excel Robusta

### Ficheiros a Verificar/Atualizar

1. **src/utils/excelParser.ts** - Parser atual
2. **src/services/projectImport.ts** - Servico de importacao

### Template Excel Estruturado
Garantir que o template tem as abas:
- Dados do Projeto (informacoes basicas)
- Etapas (fases do projeto)
- Tarefas (tarefas por etapa)

---

## Ordem de Implementacao

1. **Migracao DB** - Corrigir funcoes RPC com nomes de colunas corretos
2. **useProjectMetrics** - Ler de movimentos_financeiros
3. **UserProjectAssignmentModal** - Corrigir loop infinito
4. **Sincronizar Projetos** - Executar update em massa
5. **Graficos de Materiais** - Expandir tipos de movimentacao
6. **Testar** - Validar calculos e graficos

---

## Detalhes Tecnicos

### Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `supabase/migrations/nova.sql` | Corrigir funcoes RPC |
| `src/hooks/useProjectMetrics.ts` | Usar movimentos_financeiros |
| `src/components/modals/UserProjectAssignmentModal.tsx` | Corrigir useEffect |
| `src/hooks/useMaterialChartData.ts` | Incluir tipo 'transferencia' |

### Validacao Esperada

Apos implementacao:
- Projeto VALODIA mostrara gasto real de ~57M Kz
- Progresso financeiro sera calculado corretamente (gasto/orcamento * 100)
- Graficos de materiais mostrarao movimentacoes de transferencia
- Modal de atribuicao de projetos funcionara sem loops

---

## Impacto

Esta correcao afeta:
- Dashboard Geral (KPIs consolidados)
- Pagina de Graficos (todas as areas)
- Pagina de Financas (totais e progressos)
- Detalhes de Projeto (metricas)
- Sistema de Permissoes (modal de atribuicao)
