-- =====================================================
-- Fix Security Definer Views - Add security_invoker=on
-- This ensures RLS policies of the querying user apply
-- =====================================================

-- 1. Drop and recreate gastos_obra_view with security_invoker
DROP VIEW IF EXISTS public.gastos_obra_view;

CREATE VIEW public.gastos_obra_view
WITH (security_invoker=on) AS
SELECT 
    mf.id,
    mf.data_movimento,
    mf.descricao,
    mf.categoria,
    mf.tipo_movimento,
    mf.fonte_financiamento,
    mf.subtipo_entrada,
    CASE
        WHEN mf.tipo_movimento = 'entrada' AND (mf.fonte_financiamento IS NULL OR mf.fonte_financiamento = 'REC_FOA'::fonte_foa_enum) THEN mf.valor
        ELSE 0::numeric
    END AS recebimento_foa,
    CASE
        WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOF_FIN'::fonte_foa_enum THEN mf.valor
        ELSE 0::numeric
    END AS fof_financiamento,
    CASE
        WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOA_AUTO'::fonte_foa_enum THEN mf.valor
        ELSE 0::numeric
    END AS foa_auto,
    CASE
        WHEN mf.tipo_movimento = 'saida' THEN mf.valor
        ELSE 0::numeric
    END AS saida,
    mf.observacoes,
    mf.comprovante_url,
    mf.projeto_id,
    mf.centro_custo_id,
    cc.nome AS centro_custo_nome,
    mf.responsavel_id,
    p.nome AS responsavel_nome,
    mf.created_at
FROM movimentos_financeiros mf
LEFT JOIN centros_custo cc ON mf.centro_custo_id = cc.id
LEFT JOIN profiles p ON mf.responsavel_id = p.id
ORDER BY mf.data_movimento DESC, mf.created_at DESC;

-- 2. Drop and recreate vw_cost_center_balances_extended with security_invoker
DROP VIEW IF EXISTS public.vw_cost_center_balances_extended;

CREATE VIEW public.vw_cost_center_balances_extended
WITH (security_invoker=on) AS
SELECT 
    cc.id AS centro_custo_id,
    cc.codigo,
    cc.nome,
    cc.tipo,
    cc.projeto_id,
    cc.orcamento_mensal,
    COALESCE(sum(
        CASE
            WHEN mf.tipo_movimento = 'entrada' THEN mf.valor
            ELSE 0::numeric
        END), 0::numeric) AS total_entradas,
    COALESCE(sum(
        CASE
            WHEN mf.tipo_movimento = 'saida' THEN mf.valor
            ELSE 0::numeric
        END), 0::numeric) AS total_saidas,
    COALESCE(sum(
        CASE
            WHEN mf.tipo_movimento = 'entrada' THEN mf.valor
            ELSE 0::numeric
        END) - sum(
        CASE
            WHEN mf.tipo_movimento = 'saida' THEN mf.valor
            ELSE 0::numeric
        END), 0::numeric) AS saldo,
    count(mf.id) AS total_movimentos,
    CASE
        WHEN cc.orcamento_mensal > 0::numeric THEN round(COALESCE(sum(
        CASE
            WHEN mf.tipo_movimento = 'saida' THEN mf.valor
            ELSE 0::numeric
        END), 0::numeric) / cc.orcamento_mensal * 100::numeric, 2)
        ELSE 0::numeric
    END AS percentual_utilizado,
    (SELECT mf2.fonte_financiamento
       FROM movimentos_financeiros mf2
      WHERE mf2.centro_custo_id = cc.id 
        AND mf2.tipo_movimento = 'entrada'
        AND mf2.fonte_financiamento IS NOT NULL
      GROUP BY mf2.fonte_financiamento
      ORDER BY sum(mf2.valor) DESC
      LIMIT 1) AS fonte_predominante
FROM centros_custo cc
LEFT JOIN movimentos_financeiros mf ON cc.id = mf.centro_custo_id
WHERE cc.ativo = true
GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, cc.projeto_id, cc.orcamento_mensal;

-- 3. Drop and recreate vw_funding_breakdown with security_invoker
DROP VIEW IF EXISTS public.vw_funding_breakdown;

CREATE VIEW public.vw_funding_breakdown
WITH (security_invoker=on) AS
SELECT 
    mf.projeto_id,
    p.nome AS projeto_nome,
    mf.fonte_financiamento,
    CASE mf.fonte_financiamento
        WHEN 'REC_FOA'::fonte_foa_enum THEN 'Rec. FOA - Recebimento'
        WHEN 'FOF_FIN'::fonte_foa_enum THEN 'FOF Financiamento'
        WHEN 'FOA_AUTO'::fonte_foa_enum THEN 'FOA Auto Financiamento'
        ELSE 'Sem Fonte'
    END AS fonte_label,
    count(*) AS total_movimentos,
    sum(mf.valor) AS total_valor,
    round(sum(mf.valor) / NULLIF((
        SELECT sum(movimentos_financeiros.valor)
        FROM movimentos_financeiros
        WHERE movimentos_financeiros.projeto_id = mf.projeto_id 
          AND movimentos_financeiros.tipo_movimento = 'entrada'
    ), 0::numeric) * 100::numeric, 2) AS percentual_total
FROM movimentos_financeiros mf
JOIN projetos p ON p.id = mf.projeto_id
WHERE mf.tipo_movimento = 'entrada' 
  AND mf.fonte_financiamento IS NOT NULL
GROUP BY mf.projeto_id, p.nome, mf.fonte_financiamento;

-- 4. Drop and recreate vw_resumo_foa with security_invoker
DROP VIEW IF EXISTS public.vw_resumo_foa;

CREATE VIEW public.vw_resumo_foa
WITH (security_invoker=on) AS
WITH financiamento_utilizado AS (
    SELECT 
        mf.projeto_id AS pid,
        COALESCE(sum(mf.valor), 0::numeric) AS total_utilizado
    FROM movimentos_financeiros mf
    WHERE mf.tipo_movimento = 'saida' 
      AND mf.fonte_financiamento = 'FOF_FIN'::fonte_foa_enum
    GROUP BY mf.projeto_id
), amortizacoes_pagas AS (
    SELECT 
        r.projeto_id AS pid,
        COALESCE(sum(r.valor), 0::numeric) AS total_amortizado
    FROM reembolsos_foa_fof r
    WHERE r.tipo = 'amortizacao'
    GROUP BY r.projeto_id
)
SELECT 
    p.id AS projeto_id,
    p.nome AS projeto_nome,
    COALESCE(f.total_utilizado, 0::numeric) AS fof_financiamento,
    COALESCE(a.total_amortizado, 0::numeric) AS amortizacao,
    COALESCE(f.total_utilizado, 0::numeric) AS custos_suportados,
    COALESCE(f.total_utilizado, 0::numeric) - COALESCE(a.total_amortizado, 0::numeric) AS divida_foa_com_fof
FROM projetos p
LEFT JOIN financiamento_utilizado f ON f.pid = p.id
LEFT JOIN amortizacoes_pagas a ON a.pid = p.id;

-- Grant permissions on views
GRANT SELECT ON public.gastos_obra_view TO authenticated;
GRANT SELECT ON public.vw_cost_center_balances_extended TO authenticated;
GRANT SELECT ON public.vw_funding_breakdown TO authenticated;
GRANT SELECT ON public.vw_resumo_foa TO authenticated;