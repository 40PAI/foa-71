
-- Corrigir política SELECT de movimentos_financeiros para incluir mais roles
DROP POLICY IF EXISTS "movimentos_select" ON public.movimentos_financeiros;

CREATE POLICY "movimentos_select" 
ON public.movimentos_financeiros 
FOR SELECT 
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

-- Também precisamos dar acesso à view para estes roles
-- Recriar a view com SECURITY INVOKER (default) para respeitar RLS
DROP VIEW IF EXISTS public.gastos_obra_view;

CREATE VIEW public.gastos_obra_view WITH (security_invoker = true) AS
SELECT 
  mf.id,
  mf.data_movimento,
  mf.descricao,
  mf.categoria,
  mf.tipo_movimento,
  mf.fonte_financiamento,
  mf.subtipo_entrada,
  CASE WHEN mf.tipo_movimento = 'entrada' AND (mf.fonte_financiamento IS NULL OR mf.fonte_financiamento = 'REC_FOA') 
       THEN mf.valor ELSE 0 END AS recebimento_foa,
  CASE WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOF_FIN' 
       THEN mf.valor ELSE 0 END AS fof_financiamento,
  CASE WHEN mf.tipo_movimento = 'saida' AND mf.fonte_financiamento = 'FOA_AUTO' 
       THEN mf.valor ELSE 0 END AS foa_auto,
  CASE WHEN mf.tipo_movimento = 'saida' 
       THEN mf.valor ELSE 0 END AS saida,
  mf.observacoes,
  mf.comprovante_url,
  mf.projeto_id,
  mf.centro_custo_id,
  cc.nome AS centro_custo_nome,
  mf.responsavel_id,
  p.nome AS responsavel_nome,
  mf.created_at
FROM public.movimentos_financeiros mf
LEFT JOIN public.centros_custo cc ON mf.centro_custo_id = cc.id
LEFT JOIN public.profiles p ON mf.responsavel_id = p.id
ORDER BY mf.data_movimento DESC, mf.created_at DESC;

-- Garantir que centros_custo também permite SELECT para assistente_compras
DROP POLICY IF EXISTS "centros_custo_select" ON public.centros_custo;

CREATE POLICY "centros_custo_select" 
ON public.centros_custo 
FOR SELECT 
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);
