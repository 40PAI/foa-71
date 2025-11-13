-- Corrigir função calcular_resumo_foa: calcular dívida baseada em SAÍDAS FOF_FIN
DROP FUNCTION IF EXISTS calcular_resumo_foa(INTEGER);

CREATE OR REPLACE FUNCTION calcular_resumo_foa(p_projeto_id INTEGER DEFAULT NULL)
RETURNS TABLE (
  projeto_id INTEGER,
  projeto_nome TEXT,
  fof_financiamento NUMERIC,
  amortizacao NUMERIC,
  divida_foa_com_fof NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH financiamento_utilizado AS (
    SELECT 
      mf.projeto_id,
      COALESCE(SUM(mf.valor), 0) as total_utilizado
    FROM movimentos_financeiros mf
    WHERE mf.tipo_movimento = 'saida' 
      AND mf.fonte_financiamento = 'FOF_FIN'
      AND (p_projeto_id IS NULL OR mf.projeto_id = p_projeto_id)
    GROUP BY mf.projeto_id
  ),
  amortizacoes_pagas AS (
    SELECT 
      r.projeto_id,
      COALESCE(SUM(r.valor), 0) as total_amortizacao
    FROM reembolsos_foa_fof r
    WHERE r.tipo = 'amortizacao'
      AND (p_projeto_id IS NULL OR r.projeto_id = p_projeto_id)
    GROUP BY r.projeto_id
  ),
  projetos_com_movimento AS (
    SELECT DISTINCT projeto_id FROM financiamento_utilizado
    UNION
    SELECT DISTINCT projeto_id FROM amortizacoes_pagas
  )
  SELECT 
    p.id,
    p.nome,
    COALESCE(f.total_utilizado, 0),
    COALESCE(a.total_amortizacao, 0),
    COALESCE(f.total_utilizado, 0) - COALESCE(a.total_amortizacao, 0)
  FROM projetos p
  INNER JOIN projetos_com_movimento pcm ON pcm.projeto_id = p.id
  LEFT JOIN financiamento_utilizado f ON f.projeto_id = p.id
  LEFT JOIN amortizacoes_pagas a ON a.projeto_id = p.id
  WHERE (p_projeto_id IS NULL OR p.id = p_projeto_id)
  ORDER BY p.nome;
END;
$$;