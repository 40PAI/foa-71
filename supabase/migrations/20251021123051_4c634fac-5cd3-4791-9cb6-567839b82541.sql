-- Remover view existente e recriá-la com a estrutura correta
DROP VIEW IF EXISTS gastos_obra_view;

CREATE VIEW gastos_obra_view AS
SELECT 
  mf.id,
  mf.data_movimento,
  mf.descricao,
  mf.categoria,
  CASE 
    WHEN mf.fonte_financiamento = 'REC_FOA' AND mf.tipo_movimento = 'entrada' THEN mf.valor
    WHEN mf.fonte_financiamento IS NULL AND mf.tipo_movimento = 'entrada' THEN mf.valor
    ELSE 0 
  END AS recebimento_foa,
  CASE 
    WHEN mf.fonte_financiamento = 'FOF_FIN' AND mf.tipo_movimento = 'entrada' THEN mf.valor
    ELSE 0 
  END AS fof_financiamento,
  CASE 
    WHEN mf.fonte_financiamento = 'FOA_AUTO' AND mf.tipo_movimento = 'entrada' THEN mf.valor
    ELSE 0 
  END AS foa_auto,
  CASE 
    WHEN mf.tipo_movimento = 'saida' THEN mf.valor
    ELSE 0 
  END AS saida,
  mf.observacoes,
  mf.comprovante_url,
  mf.projeto_id,
  mf.centro_custo_id,
  mf.responsavel_id,
  mf.created_at,
  p.nome AS projeto_nome,
  cc.nome AS centro_custo_nome,
  prof.nome AS responsavel_nome
FROM movimentos_financeiros mf
LEFT JOIN projetos p ON p.id = mf.projeto_id
LEFT JOIN centros_custo cc ON cc.id = mf.centro_custo_id
LEFT JOIN profiles prof ON prof.id = mf.responsavel_id
ORDER BY mf.data_movimento DESC;

-- Corrigir a função get_gastos_obra_summary para considerar entradas sem fonte_financiamento
CREATE OR REPLACE FUNCTION public.get_gastos_obra_summary(p_projeto_id integer, p_mes integer DEFAULT NULL::integer, p_ano integer DEFAULT NULL::integer)
 RETURNS TABLE(total_recebimento_foa numeric, total_fof_financiamento numeric, total_foa_auto numeric, total_saidas numeric, saldo_atual numeric, total_movimentos bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE 
      WHEN (mf.fonte_financiamento = 'REC_FOA' OR mf.fonte_financiamento IS NULL) AND mf.tipo_movimento = 'entrada'
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
$function$;