-- Corrigir função RPC usando valores corretos do enum status_fluxo
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
        -- Financas table data
        'financas', COALESCE((
            SELECT jsonb_agg(row_to_json(f))
            FROM financas f
            WHERE f.id_projeto = p_projeto_id
        ), '[]'::jsonb),
        
        -- Requisitions summary
        'requisitions_summary', (
            SELECT jsonb_build_object(
                'total_requisitions', COUNT(*),
                'pending_requisitions', COUNT(*) FILTER (WHERE status IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')),
                'approved_requisitions', COUNT(*) FILTER (WHERE status IN ('OC Gerada', 'Recepcionado', 'Liquidado')),
                'total_value', COALESCE(SUM(valor_total), 0),
                'pending_value', COALESCE(SUM(valor_total) FILTER (WHERE status IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')), 0),
                'pending_approvals', COUNT(*) FILTER (WHERE status IN ('Pendente', 'Aprovação Qualidade', 'Aprovação Direção'))
            )
            FROM requisicoes
            WHERE projeto_id = p_projeto_id
        ),
        
        -- Task analytics
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
        
        -- Integrated expenses from movimentos_financeiros (using 'categoria' column)
        'integrated_expenses', (
            SELECT jsonb_build_object(
                'material_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%material%' OR 
                    LOWER(categoria) LIKE '%materia%'
                ), 0),
                'mao_obra_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%m_o de obra%' OR 
                    LOWER(categoria) LIKE '%mao de obra%' OR 
                    LOWER(categoria) LIKE '%salario%' OR 
                    LOWER(categoria) LIKE '%pessoal%'
                ), 0),
                'patrimonio_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%patrimonio%' OR 
                    LOWER(categoria) LIKE '%equipamento%' OR 
                    LOWER(categoria) LIKE '%veiculo%'
                ), 0),
                'indireto_total', COALESCE(SUM(valor) FILTER (WHERE 
                    LOWER(categoria) LIKE '%indireto%' OR 
                    LOWER(categoria) LIKE '%seguranca%' OR 
                    LOWER(categoria) LIKE '%administrativo%'
                ), 0),
                'total_movements', COALESCE(SUM(valor), 0)
            )
            FROM movimentos_financeiros
            WHERE projeto_id = p_projeto_id
              AND tipo_movimento = 'Saída'
        ),
        
        -- Clientes
        'clientes', COALESCE((
            SELECT jsonb_agg(row_to_json(c))
            FROM clientes c
            WHERE c.projeto_id = p_projeto_id
        ), '[]'::jsonb),
        
        -- Discrepancies by category from movimentos_financeiros
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
                  AND tipo_movimento = 'Saída'
                GROUP BY categoria
            ) sub
        ), '[]'::jsonb)
    ) INTO result;
    
    RETURN result;
END;
$$;