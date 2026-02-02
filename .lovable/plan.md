
# Plano: Unificação das Entradas de Despesas Financeiras

## Contexto e Problema Identificado

Actualmente a plataforma tem **3 caminhos diferentes** para registar despesas:

| Caminho | Tabela | Formulário | Uso Real |
|---------|--------|------------|----------|
| 1. Botão "Nova Despesa" em Finanças | `financas` | FinanceForm.tsx | 2 registos (quase não usado) |
| 2. Botão "Novo Movimento" em Centros de Custo | `movimentos_financeiros` | GastoObraModal.tsx | 223 registos (principal) |
| 3. Requisições aprovadas | `requisicoes` | RequisitionForm.tsx | 0 registos (workflow separado) |

**Problema**: Esta duplicidade cria confusão e a "discrepância" tenta comparar dados de tabelas que representam conceitos diferentes.

## Análise dos Formulários

### Formulário de Finanças (FinanceForm.tsx)
**Campos disponíveis:**
- Categoria, Subcategoria
- Valor Orçamentado, Valor Gasto
- Tipo de despesa (fixa, variável, emergencial, planejada)
- Prioridade (baixa, média, alta, crítica)
- Etapa e Tarefa relacionadas
- Centro de custo (texto livre)
- Justificativa (obrigatória, 20-500 caracteres)
- Fornecedor, Forma de pagamento, Nº NF
- Prazo de pagamento, Data da despesa, Data do pagamento
- Requer aprovação da direcção
- Upload de comprovantes (múltiplos)
- Número de parcelas

### Formulário de Movimentos/Gastos de Obra (GastoObraModal.tsx)
**Campos disponíveis:**
- Data do movimento
- Tipo: Entrada ou Saída
- Fonte de financiamento (REC_FOA, FOF_FIN, FOA_AUTO)
- Subtipo de entrada (valor_inicial, recebimento_cliente, financiamento_adicional, reembolso)
- Descrição
- Valor
- Categoria (lista predefinida)
- Centro de custo (vinculado à BD)
- Responsável (selecção de utilizador ou texto)
- Observações

## Recomendação

**Manter e expandir o formulário de Movimentos Financeiros** (GastoObraModal) como único ponto de entrada de despesas, porque:

1. É o que já está a ser utilizado (223 registos vs 2)
2. Suporta Entradas E Saídas (mais flexível)
3. Tem fontes de financiamento diferenciadas (REC_FOA, FOF_FIN, FOA_AUTO)
4. Está vinculado aos Centros de Custo reais da BD
5. Suporta subtipos de entrada (capital inicial, recebimentos, etc.)

## Alterações Propostas

### 1. Expandir o Formulário de Movimentos Financeiros

Adicionar os campos úteis do FinanceForm que estão em falta:

```text
Novos campos a adicionar ao GastoObraModal:
- Etapa relacionada (select das etapas do projecto)
- Tarefa relacionada (select das tarefas da etapa)
- Fornecedor/Beneficiário
- Forma de pagamento
- Número do documento (NF, recibo, etc.)
- Upload de comprovante
```

### 2. Reorganizar o Formulário em Abas

Para não ficar demasiado longo, organizar em 2-3 abas:
- **Básico**: Data, Tipo, Fonte, Valor, Descrição, Categoria
- **Detalhes**: Etapa, Tarefa, Fornecedor, Centro de Custo
- **Pagamento**: Forma de pagamento, Nº documento, Comprovante, Observações

### 3. Remover o Botão "Nova Despesa" da Página de Finanças

- Remover o FinanceModal da ConsolidatedFinancasPage
- Manter a tabela `financas` para dados históricos (não apagar)
- Redirecionar utilizadores para Centros de Custo OU adicionar o novo formulário unificado na página de Finanças

### 4. Simplificar o Sistema de Discrepâncias

Com uma única fonte de dados (movimentos_financeiros), o conceito de "discrepância" muda:

**Nova lógica:**
- Comparar `Orçamentado` (do projecto/etapa) vs `Gasto Real` (movimentos_financeiros)
- Ou simplesmente remover a secção de discrepâncias e mostrar apenas análise de gastos

### 5. Manter as Requisições como Fluxo Separado

As requisições são um workflow de aprovação para compras:
1. Pedido de compra → 2. Aprovação → 3. OC Gerada → 4. Recepcionado → 5. Liquidado

Opcionalmente, ao liquidar uma requisição, criar automaticamente um movimento_financeiro.

## Resumo das Alterações por Ficheiro

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/modals/GastoObraModal.tsx` | Expandir com novos campos (etapa, tarefa, fornecedor, forma pagamento, upload) |
| `src/pages/ConsolidatedFinancasPage.tsx` | Substituir FinanceModal pelo novo formulário unificado |
| `src/components/DiscrepancyReport.tsx` | Simplificar para comparar orçamento vs gasto real |
| `src/hooks/useGastosObra.ts` | Adicionar suporte aos novos campos |
| BD: `movimentos_financeiros` | Verificar se já tem colunas necessárias (forma_pagamento, numero_documento, etc.) |

## Benefícios

1. **Simplicidade**: Um único caminho para registar despesas
2. **Consistência**: Todos os dados numa única tabela
3. **Elimina confusão**: Sem "discrepâncias" entre tabelas diferentes
4. **Mantém funcionalidades**: Nenhum campo útil é perdido
5. **Compatibilidade**: Dados históricos de `financas` permanecem intactos

## Secção Técnica

### Esquema da Tabela movimentos_financeiros

A tabela já possui a maioria dos campos necessários:
- `forma_pagamento` - já existe
- `numero_documento` - já existe  
- `comprovante_url` - já existe
- `etapa_id` - já existe
- `tarefa_id` - já existe
- `fornecedor_beneficiario` - pode precisar ser adicionado (verificar se `responsavel_nome` pode servir ou criar novo)

### Migração Sugerida

Não é necessária migração de dados. A tabela `financas` pode continuar a existir para consulta de dados históricos, mas novos registos serão apenas em `movimentos_financeiros`.
