
# Plano: Corrigir Sistema de Auditoria e Discrepâncias Financeiras

## ✅ STATUS: COMPLETO

O sistema de **Auditoria e Discrepâncias** na pagina de Financas nao esta a funcionar correctamente devido a varios problemas tecnicos que identifiquei:

### Problemas Identificados

1. **Erro na funcao RPC `calculate_integrated_financial_progress`**: A funcao referencia a coluna `t.progresso` que nao existe na tabela `tarefas_lean`. O nome correcto e `percentual_conclusao`.

2. **Desalinhamento de Categorias**: Existem inconsistencias nos nomes de categorias entre tabelas:
   - `movimentos_financeiros`: "Materiais", "Mao de Obra", "Patrimonio", "Custos Indiretos"
   - `financas`: "Materiais de Construcao", "Mao de Obra"
   - `requisicoes`: "Material" (enum)
   - `gastos_detalhados`: "material", "indireto" (minusculas)

3. **Funcao de Mapeamento Duplicada**: Existem DUAS versoes da funcao `map_categoria_principal_to_financas` no banco com logicas diferentes, causando comportamento imprevisivel.

4. **Dados nao contabilizados**: A principal fonte de dados (`movimentos_financeiros`) tem ~60M Kz em gastos para o projeto 53, mas a funcao de discrepancias so considera `requisicoes` e ignora `movimentos_financeiros`.

---

## Solucao Proposta

### Fase 1: Corrigir Funcoes RPC no Supabase

#### 1.1 Recriar `calculate_integrated_financial_progress`

Corrigir a referencia a coluna inexistente:
- Substituir `t.progresso` por `t.percentual_conclusao`
- Adicionar normalizacao de categorias com ILIKE para ser mais flexivel

```text
+------------------------------------+
| ANTES: t.progresso                 |
| DEPOIS: t.percentual_conclusao     |
+------------------------------------+
```

#### 1.2 Unificar `map_categoria_principal_to_financas`

Dropar funcoes duplicadas e criar uma unica versao robusta que:
- Normalize todas as variacoes de categorias
- Suporte case-insensitive matching
- Mapeie para categorias padronizadas

```text
Mapeamento Normalizado:
+----------------------------------+------------------------+
| Entrada (qualquer formato)       | Saida Padronizada     |
+----------------------------------+------------------------+
| material, Material, Materiais,   | Materiais             |
| Materiais de Construcao          |                       |
+----------------------------------+------------------------+
| mao obra, Mao de Obra            | Mao de Obra           |
+----------------------------------+------------------------+
| patrimonio, Patrimonio,          | Patrimonio            |
| Equipamentos                     |                       |
+----------------------------------+------------------------+
| indireto, Custos Indiretos       | Custos Indiretos      |
+----------------------------------+------------------------+
```

#### 1.3 Recriar `detect_financial_discrepancies`

Nova logica que:
- Agrega dados de TODAS as fontes (movimentos_financeiros, requisicoes, gastos_detalhados)
- Compara com dados manuais da tabela `financas`
- Usa a funcao de mapeamento unificada

#### 1.4 Recriar `get_detailed_expense_breakdown`

Corrigir para:
- Chamar a funcao `calculate_integrated_financial_progress` corrigida
- Usar categorias normalizadas
- Incluir dados de movimentos_financeiros

---

### Fase 2: Actualizar Hook de Discrepancias

#### 2.1 Criar novo hook `useFinancialAudit`

Hook dedicado que:
- Busca dados de TODAS as fontes relevantes
- Calcula discrepancias no frontend como fallback
- Fornece tipos TypeScript correctos

```text
Fontes de Dados Agregadas:
+----------------------+     +-------------+     +-------------------+
| movimentos_         |     |             |     |                   |
| financeiros         | --> |   HOOK      | --> | Discrepancias     |
| (saidas)            |     |   useFinan  |     | por Categoria     |
+----------------------+     |   cialAudit |     +-------------------+
+----------------------+     |             |
| financas            | --> |             |
| (gasto manual)      |     |             |
+----------------------+     |             |
+----------------------+     |             |
| requisicoes         | --> |             |
| (aprovadas)         |     +-------------+
+----------------------+
```

---

### Fase 3: Melhorar Componente DiscrepancyReport

#### 3.1 Refactoring do Componente

- Usar o novo hook `useFinancialAudit`
- Adicionar tratamento de erro mais robusto
- Mostrar mensagem informativa quando nao ha dados
- Adicionar tooltips explicativos

#### 3.2 Melhorias de UX

- Adicionar indicador de ultima actualizacao
- Botao para forcar recalculo
- Expandir detalhes por categoria
- Mostrar fontes de dados incluidas

---

## Ficheiros a Modificar

| Ficheiro | Accao |
|----------|-------|
| Migration SQL | Recriar 4 funcoes RPC |
| `src/hooks/useFinancialAudit.ts` | Criar (NOVO) |
| `src/hooks/useIntegratedFinances.ts` | Actualizar tipos |
| `src/components/DiscrepancyReport.tsx` | Refactoring completo |
| `src/hooks/financial/index.ts` | Exportar novo hook |

---

## Detalhes Tecnicos

### Migracao SQL a Executar

```sql
-- 1. Dropar funcoes existentes com problemas
DROP FUNCTION IF EXISTS calculate_integrated_financial_progress(integer);
DROP FUNCTION IF EXISTS map_categoria_principal_to_financas(text);
DROP FUNCTION IF EXISTS detect_financial_discrepancies(integer);
DROP FUNCTION IF EXISTS get_detailed_expense_breakdown(integer);

-- 2. Criar funcao de normalizacao de categorias
CREATE OR REPLACE FUNCTION normalize_financial_category(categoria TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN categoria ILIKE '%material%' THEN 'Materiais'
    WHEN categoria ILIKE '%mao%' OR categoria ILIKE '%mão%' 
         OR categoria ILIKE '%obra%' THEN 'Mao de Obra'
    WHEN categoria ILIKE '%patrimonio%' OR categoria ILIKE '%patrimônio%'
         OR categoria ILIKE '%equipamento%' THEN 'Patrimonio'
    WHEN categoria ILIKE '%indireto%' OR categoria ILIKE '%custo%' 
         THEN 'Custos Indiretos'
    WHEN categoria ILIKE '%seguranca%' OR categoria ILIKE '%segurança%'
         OR categoria ILIKE '%higiene%' THEN 'Seguranca e Higiene'
    ELSE 'Outros'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Recriar calculate_integrated_financial_progress 
--    (usar percentual_conclusao em vez de progresso)

-- 4. Recriar detect_financial_discrepancies 
--    (agregar movimentos_financeiros + requisicoes + gastos_detalhados)

-- 5. Recriar get_detailed_expense_breakdown
--    (usar funcoes corrigidas)
```

### Novo Hook useFinancialAudit

```typescript
// Estrutura do hook
interface FinancialAuditData {
  discrepancies: {
    categoria: string;
    gasto_manual: number;      // Da tabela financas
    gasto_calculado: number;   // Agregado de todas as fontes
    discrepancia: number;
    percentual: number;
    fontes: string[];          // Quais fontes contribuiram
    status: 'ok' | 'atencao' | 'critico';
  }[];
  summary: {
    total_manual: number;
    total_calculado: number;
    discrepancia_total: number;
    data_calculo: string;
  };
  isConsistent: boolean;
}
```

---

## Resultado Esperado

Apos implementacao:
1. Funcao RPC executa sem erros
2. Discrepancias reflectem dados REAIS de todas as fontes
3. Categorias normalizadas e compativeis
4. UI mostra comparacao precisa entre gastos manuais vs calculados
5. Sistema identifica correctamente inconsistencias nos dados

---

## Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|-----------|
| Funcoes RPC existentes podem ter dependencias | Verificar todas as referencias antes de dropar |
| Dados historicos podem usar categorias antigas | Normalizacao case-insensitive cobre variacoes |
| Performance com muitos dados | Indices ja existem nas colunas relevantes |
