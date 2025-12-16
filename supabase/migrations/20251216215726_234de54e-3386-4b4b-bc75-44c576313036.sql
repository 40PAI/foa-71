-- Atualizar VIEW vw_resumo_foa para usar a mesma lógica da RPC calcular_resumo_foa
-- FOF Financiamento = SAÍDAS com fonte_financiamento='FOF_FIN' (custos financiados pela FOF)
-- Amortização = reembolsos tipo 'amortizacao'
-- Dívida = FOF Financiamento - Amortização

DROP VIEW IF EXISTS vw_resumo_foa;

CREATE VIEW vw_resumo_foa AS
WITH financiamento_utilizado AS (
  SELECT 
    mf.projeto_id AS pid,
    COALESCE(SUM(mf.valor), 0) AS total_utilizado
  FROM movimentos_financeiros mf
  WHERE mf.tipo_movimento = 'saida' 
    AND mf.fonte_financiamento = 'FOF_FIN'
  GROUP BY mf.projeto_id
),
amortizacoes_pagas AS (
  SELECT 
    r.projeto_id AS pid,
    COALESCE(SUM(r.valor), 0) AS total_amortizado
  FROM reembolsos_foa_fof r
  WHERE r.tipo = 'amortizacao'
  GROUP BY r.projeto_id
)
SELECT 
  p.id AS projeto_id,
  p.nome AS projeto_nome,
  COALESCE(f.total_utilizado, 0) AS fof_financiamento,
  COALESCE(a.total_amortizado, 0) AS amortizacao,
  COALESCE(f.total_utilizado, 0) AS custos_suportados,
  COALESCE(f.total_utilizado, 0) - COALESCE(a.total_amortizado, 0) AS divida_foa_com_fof
FROM projetos p
LEFT JOIN financiamento_utilizado f ON f.pid = p.id
LEFT JOIN amortizacoes_pagas a ON a.pid = p.id;