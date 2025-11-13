-- Corrigir função calcular_resumo_foa: resolver ambiguidade de colunas
-- Usar aliases únicos (pid) e casting explícito para eliminar conflitos

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
    -- Usar alias 'pid' para evitar ambiguidade com parâmetro p_projeto_id
    SELECT 
      mf.projeto_id AS pid,
      COALESCE(SUM(mf.valor), 0) AS total_utilizado
    FROM movimentos_financeiros mf
    WHERE mf.tipo_movimento = 'saida' 
      AND mf.fonte_financiamento = 'FOF_FIN'
      AND (p_projeto_id IS NULL OR mf.projeto_id = CAST(p_projeto_id AS INTEGER))
    GROUP BY mf.projeto_id
  ),
  amortizacoes_pagas AS (
    -- Usar alias 'pid' para evitar ambiguidade
    SELECT 
      r.projeto_id AS pid,
      COALESCE(SUM(r.valor), 0) AS total_amortizacao
    FROM reembolsos_foa_fof r
    WHERE r.tipo = 'amortizacao'
      AND (p_projeto_id IS NULL OR r.projeto_id = CAST(p_projeto_id AS INTEGER))
    GROUP BY r.projeto_id
  ),
  projetos_com_movimento AS (
    -- Usar 'pid' consistentemente
    SELECT DISTINCT pid FROM financiamento_utilizado
    UNION
    SELECT DISTINCT pid FROM amortizacoes_pagas
  )
  SELECT 
    p.id::INTEGER,
    p.nome::TEXT,
    COALESCE(f.total_utilizado, 0)::NUMERIC,
    COALESCE(a.total_amortizacao, 0)::NUMERIC,
    (COALESCE(f.total_utilizado, 0) - COALESCE(a.total_amortizacao, 0))::NUMERIC
  FROM projetos p
  INNER JOIN projetos_com_movimento pcm ON pcm.pid = p.id
  LEFT JOIN financiamento_utilizado f ON f.pid = p.id
  LEFT JOIN amortizacoes_pagas a ON a.pid = p.id
  WHERE (p_projeto_id IS NULL OR p.id = CAST(p_projeto_id AS INTEGER))
  ORDER BY p.nome;
END;
$$;