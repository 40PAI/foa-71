-- Criar view agregada para gastos da obra
CREATE OR REPLACE VIEW gastos_obra_view AS
SELECT 
  mf.id,
  mf.data_movimento,
  mf.descricao,
  CASE 
    WHEN mf.fonte_financiamento = 'REC_FOA' AND mf.tipo_movimento = 'entrada'
    THEN mf.valor ELSE 0 
  END as recebimento_foa,
  
  CASE 
    WHEN mf.fonte_financiamento = 'FOF_FIN' AND mf.tipo_movimento = 'entrada'
    THEN mf.valor ELSE 0 
  END as fof_financiamento,
  
  CASE 
    WHEN mf.fonte_financiamento = 'FOA_AUTO' AND mf.tipo_movimento = 'entrada'
    THEN mf.valor ELSE 0 
  END as foa_auto,
  
  CASE 
    WHEN mf.tipo_movimento = 'saida'
    THEN mf.valor ELSE 0 
  END as saida,
  
  mf.observacoes,
  mf.comprovante_url,
  mf.projeto_id,
  mf.centro_custo_id,
  mf.responsavel_id,
  mf.created_at,
  p.nome as projeto_nome,
  cc.nome as centro_custo_nome,
  prof.nome as responsavel_nome
FROM movimentos_financeiros mf
LEFT JOIN projetos p ON p.id = mf.projeto_id
LEFT JOIN centros_custo cc ON cc.id = mf.centro_custo_id
LEFT JOIN profiles prof ON prof.id = mf.responsavel_id
ORDER BY mf.data_movimento DESC;

-- Criar função para obter resumo de gastos da obra
CREATE OR REPLACE FUNCTION get_gastos_obra_summary(p_projeto_id INTEGER, p_mes INTEGER DEFAULT NULL, p_ano INTEGER DEFAULT NULL)
RETURNS TABLE(
  total_recebimento_foa NUMERIC,
  total_fof_financiamento NUMERIC,
  total_foa_auto NUMERIC,
  total_saidas NUMERIC,
  saldo_atual NUMERIC,
  total_movimentos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE 
      WHEN mf.fonte_financiamento = 'REC_FOA' AND mf.tipo_movimento = 'entrada'
      THEN mf.valor ELSE 0 
    END), 0) as total_recebimento_foa,
    
    COALESCE(SUM(CASE 
      WHEN mf.fonte_financiamento = 'FOF_FIN' AND mf.tipo_movimento = 'entrada'
      THEN mf.valor ELSE 0 
    END), 0) as total_fof_financiamento,
    
    COALESCE(SUM(CASE 
      WHEN mf.fonte_financiamento = 'FOA_AUTO' AND mf.tipo_movimento = 'entrada'
      THEN mf.valor ELSE 0 
    END), 0) as total_foa_auto,
    
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida'
      THEN mf.valor ELSE 0 
    END), 0) as total_saidas,
    
    COALESCE(
      SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END) -
      SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END),
      0
    ) as saldo_atual,
    
    COUNT(*)::BIGINT as total_movimentos
  FROM movimentos_financeiros mf
  WHERE mf.projeto_id = p_projeto_id
    AND (p_mes IS NULL OR EXTRACT(MONTH FROM mf.data_movimento) = p_mes)
    AND (p_ano IS NULL OR EXTRACT(YEAR FROM mf.data_movimento) = p_ano);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON gastos_obra_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_gastos_obra_summary TO authenticated;