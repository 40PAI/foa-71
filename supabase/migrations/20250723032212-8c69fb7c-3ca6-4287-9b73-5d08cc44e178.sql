-- Drop existing functions first
DROP FUNCTION IF EXISTS get_purchase_breakdown(INTEGER);
DROP FUNCTION IF EXISTS detect_financial_discrepancies(INTEGER);
DROP FUNCTION IF EXISTS get_pending_approvals(INTEGER);

-- Recreate get_purchase_breakdown function with correct return types
CREATE OR REPLACE FUNCTION get_purchase_breakdown(project_id INTEGER)
RETURNS TABLE (
  categoria TEXT,
  total_requisicoes BIGINT,
  valor_pendente NUMERIC,
  valor_aprovado NUMERIC,
  percentual_aprovacao NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.categoria_principal::TEXT,
    COUNT(*)::BIGINT as total_requisicoes,
    COALESCE(SUM(CASE WHEN r.status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção') THEN r.valor ELSE 0 END), 0)::NUMERIC as valor_pendente,
    COALESCE(SUM(CASE WHEN r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN r.valor ELSE 0 END), 0)::NUMERIC as valor_aprovado,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100)
      ELSE 0 
    END::NUMERIC as percentual_aprovacao
  FROM requisicoes r
  WHERE r.id_projeto = project_id
  GROUP BY r.categoria_principal
  ORDER BY valor_aprovado DESC;
END;
$$ LANGUAGE plpgsql;

-- Recreate detect_financial_discrepancies function with correct return types  
CREATE OR REPLACE FUNCTION detect_financial_discrepancies(project_id INTEGER)
RETURNS TABLE (
  categoria TEXT,
  gasto_manual NUMERIC,
  gasto_calculado NUMERIC,
  discrepancia NUMERIC,
  percentual_discrepancia NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.categoria,
    COALESCE(f.gasto, 0)::NUMERIC as gasto_manual,
    COALESCE(r.total_gasto, 0)::NUMERIC as gasto_calculado,
    (COALESCE(f.gasto, 0) - COALESCE(r.total_gasto, 0))::NUMERIC as discrepancia,
    CASE 
      WHEN COALESCE(f.gasto, 0) > 0 THEN 
        (ABS(COALESCE(f.gasto, 0) - COALESCE(r.total_gasto, 0)) / COALESCE(f.gasto, 0) * 100)::NUMERIC
      ELSE 0 
    END as percentual_discrepancia
  FROM financas f
  FULL OUTER JOIN (
    SELECT 
      map_categoria_principal_to_financas(categoria_principal) as categoria,
      SUM(valor)::NUMERIC as total_gasto
    FROM requisicoes 
    WHERE id_projeto = project_id 
      AND status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
    GROUP BY map_categoria_principal_to_financas(categoria_principal)
  ) r ON f.categoria = r.categoria
  WHERE f.id_projeto = project_id OR r.categoria IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate get_pending_approvals function with correct return types
CREATE OR REPLACE FUNCTION get_pending_approvals(project_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  nome_comercial_produto TEXT,
  categoria_principal TEXT,
  valor NUMERIC,
  status_fluxo TEXT,
  data_requisicao DATE,
  requisitante TEXT,
  urgencia_prioridade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.nome_comercial_produto,
    r.categoria_principal::TEXT,
    r.valor::NUMERIC,
    r.status_fluxo::TEXT,
    r.data_requisicao,
    r.requisitante,
    r.urgencia_prioridade::TEXT
  FROM requisicoes r
  WHERE r.id_projeto = project_id 
    AND r.status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')
  ORDER BY 
    CASE r.urgencia_prioridade 
      WHEN 'Alta' THEN 1 
      WHEN 'Média' THEN 2 
      ELSE 3 
    END,
    r.data_requisicao ASC;
END;
$$ LANGUAGE plpgsql;