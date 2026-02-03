
## Correção Definitiva - Gastos por Categoria

### Problema Identificado

Os cards de "Gestão de Gastos por Categoria" ainda mostram 0,00 Kz apesar de existirem dados reais:
- Materiais: **18.616.556,81 Kz**
- Mão de Obra: **7.439.390,93 Kz**  
- Patrimônio: **120.000 Kz**
- Custos Indiretos: **35.408.912,64 Kz**

O erro no console confirma: `column "status" does not exist`

### Causas Raiz na RPC `get_consolidated_financial_data`

A última migração aplicada ainda contém erros de mapeamento:

| Problema | Linha | Valor Errado | Valor Correto |
|----------|-------|--------------|---------------|
| Coluna status | 25-29 | `status` | `status_fluxo` |
| Coluna valor | 27-28 | `valor_total` | `valor_liquido` |
| Coluna projeto | 32 | `projeto_id` | `id_projeto` |
| Tipo movimento | 92 | `'Saída'` (maiúscula) | `'saida'` (minúscula) |

---

### Solução Técnica

#### Ficheiro: Nova Migração SQL

Criar migração para corrigir a função RPC com todos os nomes de colunas corretos:

```sql
-- Corrigir função RPC com nomes de colunas validados no schema real
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
        
        -- CORRIGIDO: status_fluxo, valor_liquido, id_projeto
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
            WHERE id_projeto = p_projeto_id  -- CORRIGIDO
        ),
        
        'task_analytics', (
            SELECT jsonb_build_object(
                'total_tasks', COUNT(*),
                'completed_tasks', COUNT(*) FILTER (WHERE COALESCE(percentual_conclusao, 0) >= 100),
                'in_progress_tasks', COUNT(*) FILTER (WHERE COALESCE(percentual_conclusao, 0) > 0 AND COALESCE(percentual_conclusao, 0) < 100),
                'total_budget', COALESCE(SUM(
                    COALESCE(custo_material, 0) + 
                    COALESCE(custo_mao_obra, 0) + 
                    COALESCE(custo_patrimonio, 0) + 
                    COALESCE(custo_indireto, 0)
                ), 0),
                'executed_budget', COALESCE(SUM(
                    CASE WHEN COALESCE(percentual_conclusao, 0) >= 1 THEN
                        (COALESCE(custo_material, 0) + 
                         COALESCE(custo_mao_obra, 0) + 
                         COALESCE(custo_patrimonio, 0) + 
                         COALESCE(custo_indireto, 0)) * (COALESCE(percentual_conclusao, 0) / 100.0)
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
        
        -- CORRIGIDO: tipo_movimento = 'saida' (minúscula)
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
              AND tipo_movimento = 'saida'  -- CORRIGIDO: minúscula
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
                  AND tipo_movimento = 'saida'  -- CORRIGIDO: minúscula
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
| Nova migração SQL | Corrigir todos os nomes de colunas na RPC |

### Resumo das Correções

1. `status` → `status_fluxo` (tabela requisicoes)
2. `valor_total` → `COALESCE(valor_liquido, valor)` (tabela requisicoes)
3. `projeto_id` → `id_projeto` (tabela requisicoes)
4. `'Saída'` → `'saida'` (tabela movimentos_financeiros)

### Resultado Esperado

Após aplicar esta migração:
- Os cards de Materiais mostrarão **18.616.556,81 Kz**
- Os cards de Mão de Obra mostrarão **7.439.390,93 Kz**
- Os cards de Patrimônio mostrarão **120.000 Kz**
- Os cards de Custos Indiretos mostrarão **35.408.912,64 Kz**
