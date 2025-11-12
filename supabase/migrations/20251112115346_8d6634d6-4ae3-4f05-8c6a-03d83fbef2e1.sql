-- Corrigir calcular_dre_consolidado: FOF e FOA Auto são SAÍDAS, não ENTRADAS
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
  WITH projeto_agregado AS (
    SELECT
      p.id AS projeto_id,
      p.nome AS projeto_nome,
      -- Receita Cliente: ENTRADAS sem fonte ou com REC_FOA
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'entrada' 
        AND (mf.fonte_financiamento IS NULL OR mf.fonte_financiamento = 'REC_FOA') 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS receita_cliente,
      -- FOF Financiamento: SAÍDAS com fonte FOF_FIN
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'saida' 
        AND mf.fonte_financiamento = 'FOF_FIN' 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS fof_financiamento,
      -- FOA Auto: SAÍDAS com fonte FOA_AUTO
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'saida' 
        AND mf.fonte_financiamento = 'FOA_AUTO' 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS foa_auto,
      -- Custos Totais: TODAS as saídas
      COALESCE(SUM(CASE 
        WHEN mf.tipo_movimento = 'saida' 
        THEN mf.valor 
        ELSE 0 
      END), 0) AS custos_totais
    FROM projetos p
    LEFT JOIN centros_custo cc ON cc.projeto_id = p.id AND cc.ativo = true
    LEFT JOIN movimentos_financeiros mf ON mf.centro_custo_id = cc.id
    GROUP BY p.id, p.nome
  ),
  enumerado AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY pa.projeto_nome)::INTEGER AS numero,
      NULL::UUID AS centro_custo_id,
      pa.projeto_nome AS centro_nome,
      pa.projeto_nome,
      pa.receita_cliente,
      pa.fof_financiamento,
      pa.foa_auto,
      pa.custos_totais
    FROM projeto_agregado pa
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
    -- Resultado: Receitas - Custos Totais
    e.receita_cliente - e.custos_totais AS resultado
  FROM enumerado e
  ORDER BY e.projeto_nome;
END;
$$;