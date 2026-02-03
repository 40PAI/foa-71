-- First drop the existing function, then recreate with correct column names
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
    -- Financas data
    'financas', COALESCE((
      SELECT jsonb_agg(row_to_json(f))
      FROM financas f
      WHERE f.id_projeto = p_projeto_id
    ), '[]'::jsonb),
    
    -- Purchase breakdown by category
    'purchase_breakdown', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'categoria', r.categoria_principal,
        'total_requisicoes', COUNT(*),
        'valor_pendente', SUM(CASE WHEN r.status_fluxo IN ('Pendente', 'Em Análise') THEN COALESCE(r.valor_liquido, r.valor) ELSE 0 END),
        'valor_aprovado', SUM(CASE WHEN r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN COALESCE(r.valor_liquido, r.valor) ELSE 0 END),
        'valor_total', SUM(COALESCE(r.valor_liquido, r.valor)),
        'percentual_aprovacao', CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(*) FILTER (WHERE r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado'))::numeric / COUNT(*)::numeric) * 100, 2)
          ELSE 0 
        END
      ))
      FROM requisicoes r
      WHERE r.id_projeto = p_projeto_id
      GROUP BY r.categoria_principal
    ), '[]'::jsonb),
    
    -- Task analytics
    'task_analytics', COALESCE((
      SELECT jsonb_build_object(
        'total_tasks', COUNT(*),
        'total_spent', SUM(COALESCE(t.gasto_real, 0)),
        'efficiency_score', CASE 
          WHEN SUM(COALESCE(t.custo_estimado, 0)) > 0 THEN 
            ROUND((SUM(COALESCE(t.gasto_real, 0)) / SUM(COALESCE(t.custo_estimado, 1))) * 100, 2)
          ELSE 100 
        END,
        'overbudget_tasks', COUNT(*) FILTER (WHERE t.gasto_real > t.custo_estimado)
      )
      FROM tarefas_lean t
      WHERE t.id_projeto = p_projeto_id
    ), '{"total_tasks": 0, "total_spent": 0, "efficiency_score": 100, "overbudget_tasks": 0}'::jsonb),
    
    -- Requisitions summary
    'requisitions_summary', COALESCE((
      SELECT jsonb_build_object(
        'total_requisitions', COUNT(*),
        'pending_approvals', COUNT(*) FILTER (WHERE r.status_fluxo IN ('Pendente', 'Em Análise')),
        'approved_requisitions', COUNT(*) FILTER (WHERE r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')),
        'total_value', SUM(COALESCE(r.valor_liquido, r.valor)),
        'pending_value', SUM(CASE WHEN r.status_fluxo IN ('Pendente', 'Em Análise') THEN COALESCE(r.valor_liquido, r.valor) ELSE 0 END)
      )
      FROM requisicoes r
      WHERE r.id_projeto = p_projeto_id
    ), '{"total_requisitions": 0, "pending_approvals": 0, "approved_requisitions": 0, "total_value": 0, "pending_value": 0}'::jsonb),
    
    -- Movimentos financeiros (latest 100)
    'movimentos_financeiros', COALESCE((
      SELECT jsonb_agg(row_to_json(m))
      FROM (
        SELECT id, projeto_id, tipo_movimento, categoria, valor, data_movimento, descricao, status_aprovacao
        FROM movimentos_financeiros
        WHERE projeto_id = p_projeto_id
        ORDER BY data_movimento DESC
        LIMIT 100
      ) m
    ), '[]'::jsonb),
    
    -- Saldos centros de custo
    'saldos_centros_custo', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'centro_custo_id', cc.id,
        'centro_custo_nome', cc.nome,
        'orcamento_mensal', COALESCE(cc.orcamento_mensal, 0),
        'total_entradas', COALESCE(entradas.total, 0),
        'total_saidas', COALESCE(saidas.total, 0),
        'saldo_disponivel', COALESCE(cc.orcamento_mensal, 0) + COALESCE(entradas.total, 0) - COALESCE(saidas.total, 0)
      ))
      FROM centros_custo cc
      LEFT JOIN (
        SELECT centro_custo_id, SUM(valor) as total
        FROM movimentos_financeiros
        WHERE projeto_id = p_projeto_id AND tipo_movimento = 'entrada'
        GROUP BY centro_custo_id
      ) entradas ON entradas.centro_custo_id = cc.id
      LEFT JOIN (
        SELECT centro_custo_id, SUM(valor) as total
        FROM movimentos_financeiros
        WHERE projeto_id = p_projeto_id AND tipo_movimento = 'saida'
        GROUP BY centro_custo_id
      ) saidas ON saidas.centro_custo_id = cc.id
      WHERE cc.projeto_id = p_projeto_id
    ), '[]'::jsonb),
    
    -- Clientes
    'clientes', COALESCE((
      SELECT jsonb_agg(row_to_json(c))
      FROM clientes c
      WHERE c.projeto_id = p_projeto_id
    ), '[]'::jsonb),
    
    -- Integrated expenses by category (FIXED: using 'categoria' instead of 'categoria_gasto')
    'integrated_expenses', COALESCE((
      SELECT jsonb_build_object(
        'material_total', SUM(CASE WHEN m.categoria IN ('Material', 'Materiais', 'material') THEN m.valor ELSE 0 END),
        'mao_obra_total', SUM(CASE WHEN m.categoria IN ('Mão de Obra', 'Mao de Obra', 'mao_obra', 'Salário', 'Pessoal') THEN m.valor ELSE 0 END),
        'patrimonio_total', SUM(CASE WHEN m.categoria IN ('Patrimônio', 'Patrimonio', 'Equipamento', 'patrimonio', 'Veículo') THEN m.valor ELSE 0 END),
        'indireto_total', SUM(CASE WHEN m.categoria IN ('Custos Indiretos', 'Indireto', 'indireto', 'Segurança') THEN m.valor ELSE 0 END)
      )
      FROM movimentos_financeiros m
      WHERE m.projeto_id = p_projeto_id AND m.tipo_movimento = 'saida'
    ), '{"material_total": 0, "mao_obra_total": 0, "patrimonio_total": 0, "indireto_total": 0}'::jsonb),
    
    -- Discrepancies (FIXED: using 'categoria' instead of 'categoria_gasto')
    'discrepancies', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'categoria', categoria,
        'gasto_manual', gasto_manual,
        'gasto_calculado', gasto_calculado,
        'discrepancia', ABS(gasto_manual - gasto_calculado),
        'percentual_discrepancia', CASE 
          WHEN gasto_manual > 0 THEN ROUND((ABS(gasto_manual - gasto_calculado) / gasto_manual) * 100, 2)
          ELSE 0 
        END
      ))
      FROM (
        SELECT 
          m.categoria,
          SUM(m.valor) as gasto_manual,
          COALESCE((
            SELECT SUM(COALESCE(valor_liquido, valor))
            FROM requisicoes r
            WHERE r.id_projeto = p_projeto_id 
              AND r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
              AND r.categoria_principal = m.categoria
          ), 0) as gasto_calculado
        FROM movimentos_financeiros m
        WHERE m.projeto_id = p_projeto_id AND m.tipo_movimento = 'saida'
        GROUP BY m.categoria
      ) calc
      WHERE ABS(gasto_manual - gasto_calculado) > 0
    ), '[]'::jsonb)
  ) INTO result;
  
  RETURN result;
END;
$$;