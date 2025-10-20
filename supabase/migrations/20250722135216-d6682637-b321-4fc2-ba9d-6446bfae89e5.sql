
-- Create a view to aggregate purchase data by category and project
CREATE OR REPLACE VIEW public.compras_agregadas AS
SELECT 
  r.id_projeto,
  r.categoria_principal,
  COUNT(*) as total_requisicoes,
  SUM(CASE WHEN r.status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção') THEN r.valor ELSE 0 END) as valor_pendente,
  SUM(CASE WHEN r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN r.valor ELSE 0 END) as valor_aprovado,
  SUM(r.valor) as valor_total,
  COUNT(CASE WHEN r.aprovacao_qualidade = true THEN 1 END) as aprovadas_qualidade,
  COUNT(CASE WHEN r.status_fluxo = 'Liquidado' THEN 1 END) as liquidadas
FROM requisicoes r
WHERE r.categoria_principal IS NOT NULL
GROUP BY r.id_projeto, r.categoria_principal;

-- Enable RLS on the view
ALTER VIEW public.compras_agregadas SET (security_invoker = on);

-- Create a function to get detailed purchase breakdown for a project
CREATE OR REPLACE FUNCTION public.get_purchase_breakdown(project_id INTEGER)
RETURNS TABLE (
  categoria text,
  total_requisicoes bigint,
  valor_pendente bigint,
  valor_aprovado bigint,
  valor_total bigint,
  aprovadas_qualidade bigint,
  liquidadas bigint,
  percentual_aprovacao numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.categoria_principal::text,
    ca.total_requisicoes,
    ca.valor_pendente,
    ca.valor_aprovado,
    ca.valor_total,
    ca.aprovadas_qualidade,
    ca.liquidadas,
    CASE 
      WHEN ca.total_requisicoes > 0 THEN 
        ROUND((ca.aprovadas_qualidade::numeric / ca.total_requisicoes::numeric) * 100, 2)
      ELSE 0 
    END as percentual_aprovacao
  FROM compras_agregadas ca
  WHERE ca.id_projeto = project_id
  ORDER BY ca.valor_total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requisicoes_projeto_categoria ON public.requisicoes(id_projeto, categoria_principal);
CREATE INDEX IF NOT EXISTS idx_requisicoes_status_fluxo ON public.requisicoes(status_fluxo);
