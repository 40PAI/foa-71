-- Refactor calcular_dre_consolidado to eliminate column ambiguity and improve receita_cliente calculation
DROP FUNCTION IF EXISTS public.calcular_dre_consolidado();

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
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      cc.id AS centro_custo_id,
      cc.nome AS centro_nome,
      p.nome AS projeto_nome,
      -- Receita Cliente: entradas SEM fonte ou com REC_FOA
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'entrada' 
        AND (mf.fonte_financiamento IS NULL OR mf.fonte_financiamento = 'REC_FOA') 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS receita_cliente,
      -- FOF Financiamento: entradas com FOF_FIN
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'entrada' 
        AND mf.fonte_financiamento = 'FOF_FIN' 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS fof_financiamento,
      -- FOA Auto: entradas com FOA_AUTO
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'entrada' 
        AND mf.fonte_financiamento = 'FOA_AUTO' 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS foa_auto,
      -- Custos Totais: todas as saídas
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'saida' 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS custos_totais,
      -- Soma total de movimentos para filtro
      COALESCE(SUM(mf.valor), 0) AS total_movimentos
    FROM centros_custo cc
    INNER JOIN projetos p ON p.id = cc.projeto_id
    LEFT JOIN movimentos_financeiros mf ON mf.centro_custo_id = cc.id
    WHERE cc.ativo = true
    GROUP BY cc.id, cc.nome, p.nome
    HAVING COALESCE(SUM(mf.valor), 0) > 0
  ),
  enumerado AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY b.projeto_nome, b.centro_nome)::INTEGER AS numero,
      b.centro_custo_id,
      b.centro_nome,
      b.projeto_nome,
      b.receita_cliente,
      b.fof_financiamento,
      b.foa_auto,
      b.custos_totais
    FROM base b
  )
  SELECT
    e.numero,
    e.centro_custo_id,
    e.centro_nome,
    e.projeto_nome,
    e.receita_cliente,
    e.fof_financiamento,
    e.foa_auto,
    e.custos_totais,
    (e.receita_cliente + e.fof_financiamento + e.foa_auto) - e.custos_totais AS resultado
  FROM enumerado e
  ORDER BY e.projeto_nome, e.centro_nome;
END;
$$;