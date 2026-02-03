
## Correção: KPI "Total Compras" Exibindo Requisições Pendentes

### Problema Identificado

O KPI "Total Compras" mostra **60.250,00 Kz**, que é a soma de TODAS as requisições (Multímetro 30.000 + Madeira 30.250). Porém, estas requisições ainda estão "Aprovação Direção" - ou seja, **não foram aprovadas**.

**Comportamento Atual (Incorreto):**
- Total Compras: 60.250,00 Kz (inclui pendentes)
- Aprovado: 0,00 Kz
- Pendente: 60.250,00 Kz

**Comportamento Esperado (Correto):**
- Total Compras: **0,00 Kz** (apenas compras efetivamente aprovadas)
- Aprovado: 0,00 Kz
- Pendente: 60.250,00 Kz

### Regra de Negócio

Uma requisição só é considerada "compra efetiva" quando atinge um dos seguintes estados:
- **OC Gerada** (Ordem de Compra emitida)
- **Recepcionado** (Material recebido)
- **Liquidado** (Pagamento efetuado)

Estados pendentes (Pendente, Cotações, Aprovação Qualidade, Aprovação Direção) **não contam** como compras.

---

### Solução Técnica

#### 1. Migração SQL - Adicionar Campo `approved_value`

Atualizar a RPC `get_consolidated_financial_data` para incluir um novo campo que soma apenas o valor das requisições aprovadas:

```sql
'requisitions_summary', (
    SELECT jsonb_build_object(
        'total_requisitions', COUNT(*),
        'pending_requisitions', COUNT(*) FILTER (...),
        'approved_requisitions', COUNT(*) FILTER (...),
        'total_value', COALESCE(SUM(COALESCE(valor_liquido, valor)), 0),
        
        -- NOVO: Valor apenas das requisições aprovadas
        'approved_value', COALESCE(SUM(COALESCE(valor_liquido, valor)) FILTER (
            WHERE status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
        ), 0),
        
        'pending_value', COALESCE(SUM(...) FILTER (
            WHERE status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')
        ), 0),
        'pending_approvals', COUNT(*) FILTER (...)
    )
    FROM requisicoes
    WHERE id_projeto = p_projeto_id
)
```

#### 2. Frontend - Usar `approved_value` para "Total Compras"

Atualizar o cálculo no `ConsolidatedFinancasPage.tsx`:

```typescript
// Antes (incorreto)
totalPurchaseValue: total_value,

// Depois (correto) 
totalPurchaseValue: approved_value,  // Apenas compras efetivas
totalApprovedValue: approved_value,  // Valor aprovado
totalPendingValue: pending_value,    // Valor pendente
```

---

### Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| Nova migração SQL | Adicionar campo `approved_value` na RPC |
| `src/pages/ConsolidatedFinancasPage.tsx` | Usar `approved_value` para KPI "Total Compras" |
| `src/hooks/useConsolidatedFinancialData.ts` | Atualizar tipo para incluir `approved_value` |

---

### Resultado Esperado

Após as alterações:

| KPI | Valor | Explicação |
|-----|-------|------------|
| **Total Compras** | 0,00 Kz | Nenhuma requisição foi aprovada ainda |
| **Aprovado** | 0,00 Kz | Mesmo valor (compras efetivas) |
| **Pendente** | 60.250,00 Kz | Multímetro + Madeira aguardando aprovação |
| **Taxa Aprovação** | 0% | 0 de 2 requisições aprovadas |

Quando as requisições forem aprovadas (status → OC Gerada), os valores migrarão automaticamente para "Total Compras" e "Aprovado".
