-- Update calcular_dre_consolidado to show totals across all time periods
DROP FUNCTION IF EXISTS public.calcular_dre_consolidado(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.calcular_dre_consolidado()
RETURNS TABLE(
  numero INTEGER,
  centro_custo_id UUID,
  centro_nome TEXT,
  projeto_nome TEXT,
  receita_cliente NUMERIC,
  fof_financiamento NUMERIC,
  foa_auto NUMERIC,
  custos_totais NUMERIC,
  resultado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH centros_com_movimentos AS (
    SELECT 
      ROW_NUMBER() OVER (ORDER BY p.nome, cc.nome)::INTEGER as numero,
      cc.id as centro_custo_id,
      cc.nome as centro_nome,
      p.nome as projeto_nome,
      COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' AND (mf.fonte_financiamento IS NULL OR mf.fonte_financiamento = '') THEN mf.valor ELSE 0 END), 0) as receita_cliente,
      COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'FOF_FIN' THEN mf.valor ELSE 0 END), 0) as fof_financiamento,
      COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'FOA_AUTO' THEN mf.valor ELSE 0 END), 0) as foa_auto,
      COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as custos_totais,
      COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END), 0) - 
      COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as resultado
    FROM centros_custo cc
    INNER JOIN projetos p ON p.id = cc.projeto_id
    LEFT JOIN movimentos_financeiros mf ON mf.centro_custo_id = cc.id
    WHERE cc.ativo = true
    GROUP BY cc.id, cc.nome, p.nome
    HAVING COALESCE(SUM(mf.valor), 0) > 0
  )
  SELECT 
    numero,
    centro_custo_id,
    centro_nome,
    projeto_nome,
    receita_cliente,
    fof_financiamento,
    foa_auto,
    custos_totais,
    resultado
  FROM centros_com_movimentos
  ORDER BY projeto_nome, centro_nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;