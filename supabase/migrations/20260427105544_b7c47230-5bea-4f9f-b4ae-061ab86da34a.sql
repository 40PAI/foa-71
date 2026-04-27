CREATE OR REPLACE FUNCTION public.criar_notificacoes_stock_critico()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notificacoes (
    tipo,
    titulo,
    mensagem,
    severidade,
    destinatario_role,
    som_ativado,
    acao_url,
    entidade_tipo,
    entidade_id
  )
  SELECT
    'stock_critico',
    'Stock crítico',
    'O material ' || COALESCE(m.nome_material, 'sem nome') || ' está com stock crítico (' || COALESCE(m.quantidade_stock, 0)::text || ' ' || COALESCE(m.unidade_medida::text, 'unidades') || ').',
    'warning',
    ARRAY['diretor_tecnico', 'coordenacao_direcao', 'assistente_compras']::text[],
    true,
    '/armazem',
    'material_armazem',
    m.id::text
  FROM public.materiais_armazem m
  WHERE COALESCE(m.quantidade_stock, 0) < 10
    AND NOT EXISTS (
      SELECT 1
      FROM public.notificacoes n
      WHERE n.tipo = 'stock_critico'
        AND n.entidade_tipo = 'material_armazem'
        AND n.entidade_id = m.id::text
        AND n.created_at > now() - interval '24 hours'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.verificar_notificacoes_periodicas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.criar_notificacoes_stock_critico();
END;
$$;