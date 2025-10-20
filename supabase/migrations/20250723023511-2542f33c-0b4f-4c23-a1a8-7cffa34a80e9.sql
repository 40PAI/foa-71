
-- Corrigir função get_purchase_breakdown para tipos corretos
CREATE OR REPLACE FUNCTION get_purchase_breakdown(project_id INTEGER)
RETURNS TABLE (
  categoria text,
  total_requisicoes BIGINT,
  valor_pendente BIGINT,
  valor_aprovado BIGINT,
  valor_total BIGINT,
  aprovadas_qualidade BIGINT,
  liquidadas BIGINT,
  percentual_aprovacao BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.categoria_principal::text,
    ca.total_requisicoes::BIGINT,
    ca.valor_pendente::BIGINT,
    ca.valor_aprovado::BIGINT,
    ca.valor_total::BIGINT,
    ca.aprovadas_qualidade::BIGINT,
    ca.liquidadas::BIGINT,
    CASE 
      WHEN ca.total_requisicoes > 0 THEN 
        ((ca.aprovadas_qualidade::BIGINT * 100) / ca.total_requisicoes::BIGINT)
      ELSE 0 
    END as percentual_aprovacao
  FROM compras_agregadas ca
  WHERE ca.id_projeto = project_id
  ORDER BY ca.valor_total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir função detect_financial_discrepancies para tipos corretos
CREATE OR REPLACE FUNCTION detect_financial_discrepancies(project_id INTEGER)
RETURNS TABLE (
  categoria TEXT,
  gasto_manual BIGINT,
  gasto_calculado BIGINT,
  discrepancia BIGINT,
  percentual_discrepancia BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.categoria,
    f.gasto::BIGINT as gasto_manual,
    COALESCE(calc.gasto_calculado, 0)::BIGINT as gasto_calculado,
    (f.gasto - COALESCE(calc.gasto_calculado, 0))::BIGINT as discrepancia,
    CASE 
      WHEN COALESCE(calc.gasto_calculado, 0) > 0 THEN
        (((f.gasto - COALESCE(calc.gasto_calculado, 0)) * 100) / calc.gasto_calculado)::BIGINT
      ELSE 0
    END as percentual_discrepancia
  FROM financas f
  LEFT JOIN (
    SELECT 
      map_categoria_principal_to_financas(categoria_principal) as categoria,
      SUM(valor)::BIGINT as gasto_calculado
    FROM requisicoes 
    WHERE id_projeto = project_id 
      AND status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
    GROUP BY map_categoria_principal_to_financas(categoria_principal)
  ) calc ON f.categoria = calc.categoria
  WHERE f.id_projeto = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
