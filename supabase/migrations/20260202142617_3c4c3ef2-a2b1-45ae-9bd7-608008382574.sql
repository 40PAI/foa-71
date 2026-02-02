
-- Recriar a view saldos_centros_custo como VIEW regular com security_invoker
-- Primeiro dropar a materialized view existente
DROP MATERIALIZED VIEW IF EXISTS public.saldos_centros_custo;

-- Criar como view regular com security_invoker para respeitar RLS
CREATE VIEW public.saldos_centros_custo 
WITH (security_invoker = true) AS
SELECT 
  cc.id AS centro_custo_id,
  cc.codigo,
  cc.nome,
  cc.tipo,
  cc.projeto_id,
  cc.orcamento_mensal,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END), 0) AS total_entradas,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) AS total_saidas,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE -mf.valor END), 0) AS saldo,
  COUNT(mf.id) AS total_movimentos,
  CASE 
    WHEN cc.orcamento_mensal > 0 
    THEN COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) / cc.orcamento_mensal * 100
    ELSE 0 
  END AS percentual_utilizado
FROM centros_custo cc
LEFT JOIN movimentos_financeiros mf ON cc.id = mf.centro_custo_id
WHERE cc.ativo = true
GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, cc.projeto_id, cc.orcamento_mensal;

-- Comentário explicativo
COMMENT ON VIEW public.saldos_centros_custo IS 'View que calcula saldos por centro de custo, respeitando RLS das tabelas base';
