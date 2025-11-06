-- Drop existing view
DROP VIEW IF EXISTS gastos_obra_view;

-- Recreate view with proper entrada/saida handling for FOF_FIN and FOA_AUTO
CREATE OR REPLACE VIEW gastos_obra_view AS
SELECT 
  mf.id,
  mf.data_movimento,
  mf.descricao,
  mf.categoria,
  mf.tipo_movimento,
  mf.fonte_financiamento,
  
  -- REC_FOA (normally only entrada)
  CASE 
    WHEN mf.fonte_financiamento = 'REC_FOA' AND mf.tipo_movimento = 'entrada' 
    THEN mf.valor 
    ELSE 0 
  END AS recebimento_foa,
  
  -- FOF_FIN can be entrada (+) or saida (-)
  CASE 
    WHEN mf.fonte_financiamento = 'FOF_FIN' AND mf.tipo_movimento = 'entrada' 
    THEN mf.valor
    WHEN mf.fonte_financiamento = 'FOF_FIN' AND mf.tipo_movimento = 'saida'
    THEN -mf.valor  -- Negative to indicate saida
    ELSE 0 
  END AS fof_financiamento,
  
  -- FOA_AUTO can be entrada (+) or saida (-)
  CASE 
    WHEN mf.fonte_financiamento = 'FOA_AUTO' AND mf.tipo_movimento = 'entrada' 
    THEN mf.valor
    WHEN mf.fonte_financiamento = 'FOA_AUTO' AND mf.tipo_movimento = 'saida'
    THEN -mf.valor  -- Negative to indicate saida
    ELSE 0 
  END AS foa_auto,
  
  -- Other saidas without specific funding source
  CASE 
    WHEN mf.tipo_movimento = 'saida' 
         AND (mf.fonte_financiamento IS NULL 
              OR mf.fonte_financiamento NOT IN ('REC_FOA', 'FOF_FIN', 'FOA_AUTO'))
    THEN mf.valor 
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