-- Create RPC function to calculate FOA-FOF summary automatically from Centro de Custos
CREATE OR REPLACE FUNCTION calcular_resumo_foa(p_projeto_id INTEGER DEFAULT NULL)
RETURNS TABLE (
  projeto_id INTEGER,
  projeto_nome TEXT,
  fof_financiamento NUMERIC,
  amortizacao NUMERIC,
  custos_suportados NUMERIC,
  divida_foa_com_fof NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH financiamento_recebido AS (
    -- Total RECEBIDO de FOF (ENTRADAS com fonte FOF_FIN)
    SELECT 
      mf.projeto_id,
      COALESCE(SUM(mf.valor), 0) as total_financiamento
    FROM movimentos_financeiros mf
    WHERE mf.tipo_movimento = 'entrada' 
      AND mf.fonte_financiamento = 'FOF_FIN'
      AND (p_projeto_id IS NULL OR mf.projeto_id = p_projeto_id)
    GROUP BY mf.projeto_id
  ),
  custos_aplicados AS (
    -- Total de custos USANDO financiamento FOF (SAÍDAS com fonte FOF_FIN)
    SELECT 
      mf.projeto_id,
      COALESCE(SUM(mf.valor), 0) as total_custos
    FROM movimentos_financeiros mf
    WHERE mf.tipo_movimento = 'saida' 
      AND mf.fonte_financiamento = 'FOF_FIN'
      AND (p_projeto_id IS NULL OR mf.projeto_id = p_projeto_id)
    GROUP BY mf.projeto_id
  ),
  amortizacoes_pagas AS (
    -- Total AMORTIZADO/devolvido para FOF
    SELECT 
      r.projeto_id,
      COALESCE(SUM(r.valor), 0) as total_amortizacao
    FROM reembolsos_foa_fof r
    WHERE r.tipo = 'amortizacao'
      AND (p_projeto_id IS NULL OR r.projeto_id = p_projeto_id)
    GROUP BY r.projeto_id
  ),
  projetos_com_movimento AS (
    -- Apenas projetos que têm algum movimento FOF
    SELECT DISTINCT projeto_id FROM financiamento_recebido
    UNION
    SELECT DISTINCT projeto_id FROM custos_aplicados
    UNION
    SELECT DISTINCT projeto_id FROM amortizacoes_pagas
  )
  SELECT 
    p.id as projeto_id,
    p.nome as projeto_nome,
    COALESCE(f.total_financiamento, 0) as fof_financiamento,
    COALESCE(a.total_amortizacao, 0) as amortizacao,
    COALESCE(c.total_custos, 0) as custos_suportados,
    COALESCE(f.total_financiamento, 0) - COALESCE(a.total_amortizacao, 0) as divida_foa_com_fof
  FROM projetos p
  INNER JOIN projetos_com_movimento pcm ON pcm.projeto_id = p.id
  LEFT JOIN financiamento_recebido f ON f.projeto_id = p.id
  LEFT JOIN custos_aplicados c ON c.projeto_id = p.id
  LEFT JOIN amortizacoes_pagas a ON a.projeto_id = p.id
  WHERE (p_projeto_id IS NULL OR p.id = p_projeto_id)
  ORDER BY p.nome;
END;
$$;