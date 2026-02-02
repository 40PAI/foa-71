

# Plano de Melhoria da Secção de Alocações do Armazém

## Resumo do Pedido

O utilizador identificou dois problemas principais na visualização atual de Alocações:

1. **Visualização por cards não é intuitiva** - Quando uma obra tem 100+ materiais alocados, a lista de cards fica muito longa e difícil de navegar
2. **Falta de histórico detalhado** - Não existe uma forma fácil de ver a timeline completa de um material alocado numa obra específica

## Solução Proposta

### Parte 1: Nova Visualização em Tabela para Alocações

**Problema**: A visualização atual agrupa materiais por obra em cards, mas com muitos materiais fica difícil de navegar.

**Solução**: Adicionar toggle entre "Vista Cards" (atual) e "Vista Tabela" com:
- Tabela compacta com colunas: Obra | Material | Alocado | Consumido | Devolvido | Pendente | Status | Acções
- Filtros já existentes (projecto, status, pesquisa)
- Paginação para grandes volumes
- Ordenação por colunas

```text
+-------------------------------------------------------------+
|  Filtros: [Projecto ▼] [Status ▼] [Pesquisa...]   [Cards|Tabela]  |
+-------------------------------------------------------------+
| Obra       | Material         | Aloc | Cons | Dev | Pend | Status  |
|------------|------------------|------|------|-----|------|---------|
| CATETE     | Janelas Caix...  |   4  |   1  |  1  |   2  | Parcial |
| CATETE     | Cimento Port...  |  50  |  30  |  5  |  15  | Parcial |
| KIFANGONDO | Luvas Pedreiro   |  10  |   4  |  3  |   3  | Parcial |
+-------------------------------------------------------------+
```

### Parte 2: Modal de Histórico de Material Alocado

**Ao clicar numa linha da tabela ou material no card**, abre um modal com timeline visual mostrando:

- **Header**: Nome do material + Obra
- **Resumo**: Cards com totais (Alocado, Consumido, Devolvido, Pendente)
- **Timeline Visual** (ramificada):
  - Data de entrada no armazém
  - Data de alocação à obra
  - Cada consumo registado
  - Cada devolução registada
  - Estado actual

```text
+------------------------------------------+
| Histórico: Janelas de Caixilharia        |
| Obra: CATETE                             |
+------------------------------------------+
|  [Alocado: 4] [Consumido: 1] [Devolvido: 1] [Pendente: 2]  |
+------------------------------------------+
|                                          |
|  ● 15/01/2026 - Entrada no Armazém       |
|  |   Quantidade: 10 unidades             |
|  |   Fornecedor: ABC Materiais           |
|  |                                       |
|  ● 20/01/2026 - Alocado para CATETE      |
|  |   Quantidade: 4 unidades              |
|  |   Etapa: Fundação                     |
|  |   Responsável: João Silva             |
|  |                                       |
|  ● 25/01/2026 - Consumo Registado        |
|  |   Quantidade: 1 unidade               |
|  |   Frente: Estrutura Principal         |
|  |                                       |
|  ● 28/01/2026 - Devolução                |
|      Quantidade: 1 unidade               |
|      Motivo: Defeito de fabrico          |
|      Estado: Danificado                  |
|                                          |
+------------------------------------------+
```

### Parte 3: Modal de Guia de Consumo Geral da Obra

**Ao clicar no nome/header da obra**, abre um modal com:

- **Header**: Nome da obra + período de análise
- **Resumo Geral**: Total de materiais alocados, consumidos, devolvidos
- **Tabela de todos os materiais**: Com mini-timeline em cada linha
- **Exportação**: Para PDF/Excel

```text
+------------------------------------------+
| Guia de Consumo: CATETE                  |
| Período: Janeiro 2026                    |
+------------------------------------------+
|  [Total Alocado: 15] [Consumido: 8] [Devolvido: 3]  |
+------------------------------------------+
|                                          |
| Material           | Aloc | Cons | Dev | Timeline         |
|-------------------|------|------|-----|------------------|
| Janelas Caixilh.  |   4  |   1  |  1  | ●--●--●          |
| Cimento Portland  |  50  |  30  |  5  | ●--●--●--●--●    |
| Luvas Pedreiro    |  10  |   4  |  3  | ●--●--●--●       |
|                                          |
| [Exportar PDF] [Exportar Excel]          |
+------------------------------------------+
```

## Ficheiros a Criar/Modificar

| Ficheiro | Acção | Descrição |
|----------|-------|-----------|
| `src/components/warehouse/MaterialAllocationsSection.tsx` | Modificar | Adicionar toggle Cards/Tabela + vista em tabela |
| `src/components/modals/AllocationHistoryModal.tsx` | Criar | Modal com timeline do material na obra |
| `src/components/modals/ProjectConsumptionGuideModal.tsx` | Criar | Modal com guia geral de consumo da obra |
| `src/hooks/useAllocationHistory.ts` | Criar | Hook para buscar histórico completo de uma alocação |
| `src/hooks/useProjectConsumptionSummary.ts` | Criar | Hook para resumo de consumo por obra |

## Detalhes Técnicos

### Hook: useAllocationHistory

Busca todas as movimentações relacionadas com uma alocação específica:

- Material ID + Projecto ID como parâmetros
- Join com `materiais_movimentacoes` filtrado por material e projecto
- Ordenado por data (cronológico)
- Inclui dados enriquecidos (nomes, responsáveis, documentos)

### Hook: useProjectConsumptionSummary

Resumo agregado de todos os materiais de uma obra:

- Projecto ID como parâmetro
- Agrupa por material
- Calcula totais de consumo/devolução
- Inclui timeline compacta por material

### Componente: MaterialAllocationsSection (Modificado)

Adições:
- Estado `viewMode: 'cards' | 'table'`
- Botões de toggle no header dos filtros
- Componente `Table` quando em modo tabela
- Linhas clicáveis que abrem `AllocationHistoryModal`
- Headers de projecto clicáveis que abrem `ProjectConsumptionGuideModal`

### Componente: AllocationHistoryModal

- Props: `allocation: MaterialAllocationWithDetails`
- Timeline visual com ícones coloridos por tipo de movimentação
- Scroll se muitas movimentações
- Botões para consumir/devolver se pendente > 0

### Componente: ProjectConsumptionGuideModal

- Props: `projectId: number, projectName: string`
- Tabela com todos os materiais alocados
- Mini-timeline visual por linha
- Exportação para Excel com detalhes completos

## Fluxo de Interacção

```text
Alocações
    |
    +-- Toggle [Cards | Tabela]
    |       |
    |       +-- Cards (actual) --> Clicar no material --> AllocationHistoryModal
    |       |                  --> Clicar na obra header --> ProjectConsumptionGuideModal
    |       |
    |       +-- Tabela (nova) --> Clicar numa linha --> AllocationHistoryModal
    |                        --> Clicar nome da obra --> ProjectConsumptionGuideModal
    |
    +-- Filtros [Projecto] [Status] [Pesquisa]
```

## Ordem de Implementação

1. Criar `useAllocationHistory.ts` - Hook para timeline individual
2. Criar `useProjectConsumptionSummary.ts` - Hook para resumo da obra
3. Criar `AllocationHistoryModal.tsx` - Modal com timeline visual
4. Criar `ProjectConsumptionGuideModal.tsx` - Modal com guia geral
5. Modificar `MaterialAllocationsSection.tsx` - Adicionar vista em tabela e integrar modais

## Resultado Esperado

- Navegação mais rápida com vista em tabela quando há muitos materiais
- Visibilidade completa do ciclo de vida de cada material por obra
- Guia de consumo consolidado por obra para o gestor
- Melhor rastreabilidade e auditoria de materiais

