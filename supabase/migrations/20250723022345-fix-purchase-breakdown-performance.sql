
-- Fix the get_purchase_breakdown function to match expected return types
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
    ca.valor_pendente::bigint,
    ca.valor_aprovado::bigint,
    ca.valor_total::bigint,
    ca.aprovadas_qualidade,
    ca.liquidadas,
    CASE 
      WHEN ca.total_requisicoes > 0 THEN 
        ROUND((ca.aprovadas_qualidade::numeric / ca.total_requisicoes::numeric) * 100, 2)
      ELSE 0::numeric
    END as percentual_aprovacao
  FROM compras_agregadas ca
  WHERE ca.id_projeto = project_id
  ORDER BY ca.valor_total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_requisicoes_projeto_status ON public.requisicoes(id_projeto, status_fluxo);
CREATE INDEX IF NOT EXISTS idx_requisicoes_categoria_status ON public.requisicoes(categoria_principal, status_fluxo);
CREATE INDEX IF NOT EXISTS idx_financas_projeto ON public.financas(id_projeto);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto ON public.tarefas_lean(id_projeto);
CREATE INDEX IF NOT EXISTS idx_patrimonio_projeto ON public.patrimonio(alocado_projeto_id);

-- Add a valid enum value for rejection if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Rejeitado' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_fluxo')) THEN
    ALTER TYPE status_fluxo ADD VALUE 'Rejeitado';
  END IF;
END
$$;
