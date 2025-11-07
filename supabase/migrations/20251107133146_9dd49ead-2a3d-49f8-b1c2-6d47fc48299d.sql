-- Função para calcular evolução mensal do DRE (últimos 12 meses)
CREATE OR REPLACE FUNCTION public.calcular_dre_evolucao_mensal(p_projeto_id INTEGER)
RETURNS TABLE(
  mes INTEGER,
  ano INTEGER,
  periodo TEXT,
  receita_cliente NUMERIC,
  fof_financiamento NUMERIC,
  foa_auto NUMERIC,
  custos_totais NUMERIC,
  resultado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH meses_12 AS (
    SELECT 
      EXTRACT(MONTH FROM data_mes)::INTEGER as mes,
      EXTRACT(YEAR FROM data_mes)::INTEGER as ano,
      data_mes
    FROM generate_series(
      CURRENT_DATE - INTERVAL '11 months',
      CURRENT_DATE,
      INTERVAL '1 month'
    ) AS data_mes
  )
  SELECT 
    m.mes,
    m.ano,
    TO_CHAR(m.data_mes, 'Mon/YYYY') as periodo,
    -- Receita Cliente: ENTRADAS com fonte REC_FOA
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'REC_FOA' 
      THEN mf.valor ELSE 0 
    END), 0) as receita_cliente,
    -- FOF Financiamento: SAÍDAS com fonte FOF_FIN
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOF_FIN' 
      THEN mf.valor ELSE 0 
    END), 0) as fof_financiamento,
    -- FOA Auto: SAÍDAS com fonte FOA_AUTO
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOA_AUTO' 
      THEN mf.valor ELSE 0 
    END), 0) as foa_auto,
    -- Custos Totais: TODAS as saídas
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' 
      THEN mf.valor ELSE 0 
    END), 0) as custos_totais,
    -- Resultado: Receita - Custos
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'REC_FOA' 
      THEN mf.valor ELSE 0 
    END), 0) - 
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' 
      THEN mf.valor ELSE 0 
    END), 0) as resultado
  FROM meses_12 m
  LEFT JOIN movimentos_financeiros mf ON 
    mf.projeto_id = p_projeto_id
    AND EXTRACT(MONTH FROM mf.data_movimento) = m.mes
    AND EXTRACT(YEAR FROM mf.data_movimento) = m.ano
  GROUP BY m.mes, m.ano, m.data_mes
  ORDER BY m.ano, m.mes;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular DRE por período customizado
CREATE OR REPLACE FUNCTION public.calcular_dre_por_periodo(
  p_projeto_id INTEGER,
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE(
  receita_cliente NUMERIC,
  fof_financiamento NUMERIC,
  foa_auto NUMERIC,
  custos_totais NUMERIC,
  resultado NUMERIC,
  total_entradas NUMERIC,
  total_saidas NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Receita Cliente: ENTRADAS com fonte REC_FOA
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'REC_FOA' 
      THEN mf.valor ELSE 0 
    END), 0) as receita_cliente,
    -- FOF Financiamento: SAÍDAS com fonte FOF_FIN
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOF_FIN' 
      THEN mf.valor ELSE 0 
    END), 0) as fof_financiamento,
    -- FOA Auto: SAÍDAS com fonte FOA_AUTO
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOA_AUTO' 
      THEN mf.valor ELSE 0 
    END), 0) as foa_auto,
    -- Custos Totais: TODAS as saídas
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' 
      THEN mf.valor ELSE 0 
    END), 0) as custos_totais,
    -- Resultado: Receita - Custos
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'REC_FOA' 
      THEN mf.valor ELSE 0 
    END), 0) - 
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' 
      THEN mf.valor ELSE 0 
    END), 0) as resultado,
    -- Total de todas as entradas
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'entrada' 
      THEN mf.valor ELSE 0 
    END), 0) as total_entradas,
    -- Total de todas as saídas
    COALESCE(SUM(CASE 
      WHEN mf.tipo_movimento = 'saida' 
      THEN mf.valor ELSE 0 
    END), 0) as total_saidas
  FROM movimentos_financeiros mf
  WHERE mf.projeto_id = p_projeto_id
    AND mf.data_movimento >= p_data_inicio
    AND mf.data_movimento <= p_data_fim;
END;
$$ LANGUAGE plpgsql;