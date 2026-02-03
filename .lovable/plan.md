
## Correção Definitiva - Gastos por Categoria

### Problema Identificado

A RPC `get_consolidated_financial_data` falha completamente com o erro:
```
column "custo_patrimonio" does not exist
```

Isto faz com que TODOS os campos retornem zero, incluindo os gastos por categoria que deveriam mostrar:
- **Materiais**: 18.616.556,81 Kz (projeto 54)
- **Mão de Obra**: 7.439.390,93 Kz
- **Patrimônio**: 120.000 Kz
- **Custos Indiretos**: 35.408.912,64 Kz

### Causa Raiz

A migração atual referencia colunas inexistentes na tabela `tarefas_lean`:

| Coluna Referenciada | Existe? | Solução |
|---------------------|---------|---------|
| `custo_material` | Sim | Manter |
| `custo_mao_obra` | Sim | Manter |
| `custo_patrimonio` | **Não** | Remover |
| `custo_indireto` | **Não** | Remover |

### Dados Reais no Banco

A tabela `movimentos_financeiros` contém os dados corretos:

```text
┌─────────────────────────┬──────────────────┐
│ categoria               │ total (saida)    │
├─────────────────────────┼──────────────────┤
│ Materiais               │ 92.850.300,16 Kz │
│ Mão de Obra             │ 24.287.634,12 Kz │
│ Patrimônio              │ 15.494.923,94 Kz │
│ Custos Indiretos        │ 162.263.431,68 Kz│
└─────────────────────────┴──────────────────┘
```

---

### Solução Técnica

#### Ficheiro: Nova Migração SQL

Corrigir a função RPC removendo as referências às colunas inexistentes:

```sql
DROP FUNCTION IF EXISTS get_consolidated_financial_data(INTEGER);

CREATE OR REPLACE FUNCTION get_consolidated_financial_data(p_projeto_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'financas', COALESCE((
            SELECT jsonb_agg(row_to_json(f))
            FROM financas f
            WHERE f.id_projeto = p_projeto_id
        ), '[]'::jsonb),
        
        'requisitions_summary', (
            SELECT jsonb_build_object(
                'total_requisitions', COUNT(*),
                'pending_requisitions', COUNT(*) FILTER (
                    WHERE status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')
                ),
                'approved_requisitions', COUNT(*) FILTER (
                    WHERE status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
                ),
                'total_value', COALESCE(SUM(COALESCE(valor_liquido, valor)), 0),
                'pending_value', COALESCE(SUM(COALESCE(valor_liquido, valor)) FILTER (
                    WHERE status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')
                ), 0),
                'pending_approvals', COUNT(*) FILTER (
                    WHERE status_fluxo IN ('Pendente', 'Aprovação Qualidade', 'Aprovação Direção')
                )
            )
            FROM requisicoes
            WHERE id_projeto = p_projeto_id
        ),
        
        -- CORRIGIDO: Removidas colunas inexistentes custo_patrimonio e custo_indireto
        'task_analytics', (
            SELECT jsonb_build_object(
                'total_tasks', COUNT(*),
                'completed_tasks', COUNT(*) FILTER (WHERE COALESCE(percentual_conclusao, 0) >= 100),
                'in_progress_tasks', COUNT(*) FILTER (WHERE COALESCE(percentual_conclusao, 0) > 0 AND COALESCE(percentual_conclusao, 0) < 100),
                'total_budget', COALESCE(SUM(
                    COALESCE(custo_material, 0) + 
                    COALESCE(custo_mao_obra, 0)
                ), 0),
                'executed_budget', COALESCE(SUM(
                    CASE WHEN COALESCE(percentual_conclusao, 0) >= 1 THEN
                        (COALESCE(custo_material, 0) + 
                         COALESCE(custo_mao_obra, 0)) * (COALESCE(percentual_conclusao, 0) / 100.0)
                    ELSE 0 END
                ), 0),
                'efficiency_score', CASE 
                    WHEN COUNT(*) > 0 THEN 
                        (COUNT(*) FILTER (WHERE COALESCE(percentual_conclusao, 0) >= 100)::NUMERIC / COUNT(*)::NUMERIC) * 100
                    ELSE 0 
                END
            )
            FROM tarefas_lean
            WHERE id_projeto = p_projeto_id
        ),
        
        -- Gastos por categoria da tabela movimentos_financeiros
        'integrated_expenses', (
            SELECT jsonb_build_object(
                'material_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%material%'
                ), 0),
                'mao_obra_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%mão de obra%' OR 
                    LOWER(categoria) LIKE '%mao de obra%'
                ), 0),
                'patrimonio_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%patrimônio%' OR 
                    LOWER(categoria) LIKE '%patrimonio%' OR
                    LOWER(categoria) LIKE '%equipamento%'
                ), 0),
                'indireto_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%indireto%' OR 
                    LOWER(categoria) LIKE '%segurança%' OR
                    LOWER(categoria) LIKE '%seguranca%'
                ), 0),
                'total_movements', COALESCE(SUM(valor), 0)
            )
            FROM movimentos_financeiros
            WHERE projeto_id = p_projeto_id
              AND tipo_movimento = 'saida'
        ),
        
        'clientes', COALESCE((
            SELECT jsonb_agg(row_to_json(c))
            FROM clientes c
            WHERE c.projeto_id = p_projeto_id
        ), '[]'::jsonb),
        
        'discrepancies', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'categoria', categoria,
                'gasto_real', total_gasto
            ))
            FROM (
                SELECT 
                    categoria,
                    SUM(valor) as total_gasto
                FROM movimentos_financeiros
                WHERE projeto_id = p_projeto_id
                  AND tipo_movimento = 'saida'
                GROUP BY categoria
            ) sub
        ), '[]'::jsonb)
    ) INTO result;
    
    RETURN result;
END;
$$;
```

---

### Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| Nova migração SQL | Remover referências a `custo_patrimonio` e `custo_indireto` |

### Resumo das Correções

| Linha | Antes | Depois |
|-------|-------|--------|
| 49-50 | `COALESCE(custo_patrimonio, 0) + COALESCE(custo_indireto, 0)` | Removido |
| 56-57 | `COALESCE(custo_patrimonio, 0) + COALESCE(custo_indireto, 0)` | Removido |

### Resultado Esperado

Após aplicar esta migração, a RPC executará sem erros e os cards mostrarão:
- **Materiais**: 18.616.556,81 Kz
- **Mão de Obra**: 7.439.390,93 Kz
- **Patrimônio**: 120.000 Kz  
- **Custos Indiretos**: 35.408.912,64 Kz

Os dados vêm diretamente da tabela `movimentos_financeiros` (a mesma fonte que alimenta os Centros de Custo).
