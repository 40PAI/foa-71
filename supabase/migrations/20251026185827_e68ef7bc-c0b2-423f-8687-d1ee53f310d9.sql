-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_dashboard_geral_data(uuid);

-- Recreate with all corrections
CREATE OR REPLACE FUNCTION public.get_dashboard_geral_data(user_id_param uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  user_role app_role;
  visible_projects INTEGER[];
BEGIN
  -- Buscar role do usuário
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = user_id_param
  LIMIT 1;
  
  -- Se não encontrar role, retornar vazio
  IF user_role IS NULL THEN
    RETURN json_build_object(
      'user_role', 'unknown',
      'visible_project_count', 0,
      'kpis_gerais', json_build_object(
        'total_projetos', 0,
        'projetos_ativos', 0,
        'orcamento_total', 0,
        'gasto_total', 0,
        'saldo_disponivel', 0,
        'percentual_gasto', 0
      ),
      'top_projetos_gasto', '[]'::json,
      'tarefas_resumo', json_build_object(
        'total', 0,
        'concluidas', 0,
        'em_andamento', 0,
        'atrasadas', 0,
        'taxa_conclusao', 0
      ),
      'top_projetos_tarefas', '[]'::json,
      'requisicoes_resumo', json_build_object(
        'total', 0,
        'pendentes', 0,
        'aprovacao', 0,
        'aprovadas', 0,
        'valor_total', 0,
        'valor_pendente', 0,
        'taxa_aprovacao', 0
      ),
      'projetos_lista', '[]'::json
    );
  END IF;
  
  -- Definir projetos visíveis baseado no role
  IF user_role IN ('diretor_tecnico', 'coordenacao_direcao') THEN
    visible_projects := ARRAY(SELECT id FROM projetos);
  ELSIF user_role = 'encarregado_obra' THEN
    visible_projects := ARRAY(
      SELECT DISTINCT projeto_id 
      FROM alocacao_colaboradores 
      WHERE colaborador_id IN (
        SELECT id FROM colaboradores WHERE user_id = user_id_param
      )
    );
  ELSIF user_role = 'assistente_compras' THEN
    visible_projects := ARRAY(SELECT id FROM projetos);
  ELSIF user_role = 'departamento_hst' THEN
    visible_projects := ARRAY(SELECT id FROM projetos);
  ELSE
    visible_projects := ARRAY[]::INTEGER[];
  END IF;
  
  IF array_length(visible_projects, 1) IS NULL THEN
    visible_projects := ARRAY[]::INTEGER[];
  END IF;
  
  -- Agregar dados
  SELECT json_build_object(
    'user_role', user_role::text,
    'visible_project_count', COALESCE(array_length(visible_projects, 1), 0),
    'kpis_gerais', (
      SELECT json_build_object(
        'total_projetos', COUNT(*),
        'projetos_ativos', COUNT(*) FILTER (WHERE status IN ('Em Andamento', 'Planeado')),
        'orcamento_total', COALESCE(SUM(orcamento), 0),
        'gasto_total', COALESCE(SUM(gasto), 0),
        'saldo_disponivel', COALESCE(SUM(orcamento) - SUM(gasto), 0),
        'percentual_gasto', CASE 
          WHEN SUM(orcamento) > 0 THEN ROUND((SUM(gasto)::numeric / NULLIF(SUM(orcamento), 0)::numeric) * 100, 2)
          ELSE 0
        END
      )
      FROM projetos
      WHERE id = ANY(visible_projects)
    ),
    'top_projetos_gasto', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          id,
          nome,
          COALESCE(orcamento, 0) as orcamento,
          COALESCE(gasto, 0) as gasto,
          CASE 
            WHEN orcamento > 0 THEN ROUND((gasto::numeric / NULLIF(orcamento, 0)::numeric) * 100, 2)
            ELSE 0
          END as percentual_gasto,
          status
        FROM projetos
        WHERE id = ANY(visible_projects)
        ORDER BY gasto DESC NULLS LAST
        LIMIT 5
      ) t
    ), '[]'::json),
    'tarefas_resumo', (
      SELECT json_build_object(
        'total', COUNT(*),
        'concluidas', COUNT(*) FILTER (WHERE status = 'Concluído'),
        'em_andamento', COUNT(*) FILTER (WHERE status = 'Em Andamento'),
        'atrasadas', COUNT(*) FILTER (WHERE prazo < CURRENT_DATE AND status != 'Concluído'),
        'taxa_conclusao', CASE 
          WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'Concluído')::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 2)
          ELSE 0
        END
      )
      FROM tarefas_lean
      WHERE id_projeto = ANY(visible_projects)
    ),
    'top_projetos_tarefas', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          p.nome as projeto_nome,
          COUNT(tl.id) as total_tarefas,
          COUNT(tl.id) FILTER (WHERE tl.status = 'Concluído') as concluidas,
          CASE 
            WHEN COUNT(tl.id) > 0 THEN ROUND((COUNT(tl.id) FILTER (WHERE tl.status = 'Concluído')::numeric / NULLIF(COUNT(tl.id), 0)::numeric) * 100, 2)
            ELSE 0
          END as percentual
        FROM projetos p
        LEFT JOIN tarefas_lean tl ON tl.id_projeto = p.id
        WHERE p.id = ANY(visible_projects)
        GROUP BY p.id, p.nome
        HAVING COUNT(tl.id) > 0
        ORDER BY concluidas DESC, percentual DESC
        LIMIT 5
      ) t
    ), '[]'::json),
    'requisicoes_resumo', (
      SELECT json_build_object(
        'total', COUNT(*),
        'pendentes', COUNT(*) FILTER (WHERE status_fluxo IN ('Pendente')),
        'aprovacao', COUNT(*) FILTER (WHERE status_fluxo IN ('Cotações', 'Aprovação Qualidade', 'Aprovação Direção')),
        'aprovadas', COUNT(*) FILTER (WHERE status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')),
        'valor_total', COALESCE(SUM(valor), 0),
        'valor_pendente', COALESCE(SUM(valor) FILTER (WHERE status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')), 0),
        'taxa_aprovacao', CASE 
          WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado'))::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 2)
          ELSE 0
        END
      )
      FROM requisicoes
      WHERE projeto_id = ANY(visible_projects)
    ),
    'projetos_lista', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          p.id,
          p.nome,
          p.cliente,
          COALESCE(p.orcamento, 0) as orcamento,
          COALESCE(p.gasto, 0) as gasto,
          COALESCE(p.avanco_fisico, 0) as avanco_fisico,
          CASE 
            WHEN p.orcamento > 0 THEN ROUND((p.gasto::numeric / NULLIF(p.orcamento, 0)::numeric) * 100, 2)
            ELSE 0
          END as avanco_financeiro,
          CASE
            WHEN p.data_inicio IS NOT NULL AND p.data_fim_prevista IS NOT NULL THEN
              ROUND((EXTRACT(EPOCH FROM (CURRENT_DATE - p.data_inicio)) / 
                     NULLIF(EXTRACT(EPOCH FROM (p.data_fim_prevista - p.data_inicio)), 0)) * 100, 2)
            ELSE 0
          END as avanco_tempo,
          p.status,
          p.data_inicio::text,
          p.data_fim_prevista::text as data_fim_prevista,
          CASE
            WHEN p.orcamento > 0 AND (p.gasto::numeric / NULLIF(p.orcamento, 0)::numeric) > 1.1 THEN 'vermelho'
            WHEN p.orcamento > 0 AND (p.gasto::numeric / NULLIF(p.orcamento, 0)::numeric) > 0.9 THEN 'amarelo'
            ELSE 'verde'
          END as status_financeiro
        FROM projetos p
        WHERE p.id = ANY(visible_projects)
        ORDER BY p.nome
      ) t
    ), '[]'::json)
  ) INTO result;
  
  RETURN result;
END;
$function$;