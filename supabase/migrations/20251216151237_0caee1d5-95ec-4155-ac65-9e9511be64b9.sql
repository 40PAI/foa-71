-- Update the gastos_obra_view to include subtipo_entrada
DROP VIEW IF EXISTS gastos_obra_view;

CREATE OR REPLACE VIEW gastos_obra_view AS
SELECT 
  mf.id,
  mf.data_movimento,
  mf.descricao,
  mf.categoria,
  mf.tipo_movimento,
  mf.fonte_financiamento,
  mf.subtipo_entrada,
  -- Entrada values based on fonte_financiamento
  CASE 
    WHEN mf.tipo_movimento = 'entrada' AND (mf.fonte_financiamento IS NULL OR mf.fonte_financiamento = 'REC_FOA') 
    THEN mf.valor ELSE 0 
  END as recebimento_foa,
  CASE 
    WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOF_FIN' 
    THEN mf.valor ELSE 0 
  END as fof_financiamento,
  CASE 
    WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOA_AUTO' 
    THEN mf.valor ELSE 0 
  END as foa_auto,
  -- Saída total (for backward compatibility)
  CASE 
    WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 
  END as saida,
  mf.observacoes,
  mf.comprovante_url,
  mf.projeto_id,
  mf.centro_custo_id,
  cc.nome as centro_custo_nome,
  mf.responsavel_id,
  p.nome as responsavel_nome,
  mf.created_at
FROM movimentos_financeiros mf
LEFT JOIN centros_custo cc ON mf.centro_custo_id = cc.id
LEFT JOIN profiles p ON mf.responsavel_id = p.id
ORDER BY mf.data_movimento DESC, mf.created_at DESC;