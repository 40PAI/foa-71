-- Fix get_dashboard_geral_data to calculate gasto_total from actual expense sources
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
  user_name TEXT;
BEGIN
  BEGIN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_id = user_id_param
    LIMIT 1;
    
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
    
    SELECT nome INTO user_name
    FROM profiles
    WHERE id = user_id_param;
    
    IF user_role IN ('diretor_tecnico', 'coordenacao_direcao') THEN
      visible_projects := ARRAY(SELECT id FROM projetos);
    ELSIF user_role = 'encarregado_obra' THEN
      visible_projects := ARRAY(
        SELECT DISTINCT cp.projeto_id
        FROM colaboradores_projetos cp
        JOIN colaboradores c ON c.id = cp.colaborador_id
        WHERE c.nome = user_name
      );
    ELSIF user_role IN ('assistente_compras', 'departamento_hst') THEN
      visible_projects := ARRAY(SELECT id FROM projetos);
    ELSE
      visible_projects := ARRAY[]::INTEGER[];
    END IF;
    
    IF array_length(visible_projects, 1) IS NULL THEN
      visible_projects := ARRAY[]::INTEGER[];
    END IF;
    
    -- Calculate total spending from actual expense sources
    WITH project_expenses AS (
      SELECT 
        p.id,
        p.nome,
        p.orcamento,
        p.status,
        p.data_inicio,
        p.data_fim_prevista,
        p.avanco_fisico,
        p.cliente,
        -- Calculate actual spending from multiple sources
        COALESCE((
          SELECT SUM(COALESCE(mf.valor, 0))
          FROM movimentos_financeiros mf
          WHERE mf.projeto_id = p.id
          AND mf.tipo_movimento IN ('saida', 'Saída')
        ), 0) + 
        COALESCE((
          SELECT SUM(COALESCE(f.gasto, 0))
          FROM financas f
          WHERE f.id_projeto = p.id
        ), 0) as gasto_calculado
      FROM projetos p
      WHERE p.id = ANY(visible_projects)
    )
    SELECT json_build_object(
      'user_role', user_role::text,
      'visible_project_count', COALESCE(array_length(visible_projects, 1), 0),
      'kpis_gerais', (
        SELECT json_build_object(
          'total_projetos', COUNT(*),
          'projetos_ativos', COUNT(*) FILTER (WHERE status::text IN ('Em Andamento', 'Pausado')),
          'orcamento_total', COALESCE(SUM(orcamento), 0),
          'gasto_total', COALESCE(SUM(gasto_calculado), 0),
          'saldo_disponivel', COALESCE(SUM(orcamento) - SUM(gasto_calculado), 0),
          'percentual_gasto', CASE 
            WHEN SUM(orcamento) > 0 THEN ROUND((SUM(gasto_calculado)::numeric / NULLIF(SUM(orcamento), 0)::numeric) * 100, 2)
            ELSE 0
          END
        )
        FROM project_expenses
      ),
      'top_projetos_gasto', COALESCE((
        SELECT json_agg(row_to_json(t))
        FROM (
          SELECT 
            id,
            nome,
            COALESCE(orcamento, 0) as orcamento,
            COALESCE(gasto_calculado, 0) as gasto,
            CASE 
              WHEN orcamento > 0 THEN ROUND((gasto_calculado::numeric / NULLIF(orcamento, 0)::numeric) * 100, 2)
              ELSE 0
            END as percentual_gasto,
            status::text as status
          FROM project_expenses
          WHERE gasto_calculado > 0
          ORDER BY gasto_calculado DESC NULLS LAST
          LIMIT 5
        ) t
      ), '[]'::json),
      'tarefas_resumo', (
        SELECT json_build_object(
          'total', COUNT(*),
          'concluidas', COUNT(*) FILTER (WHERE status::text = 'Concluído'),
          'em_andamento', COUNT(*) FILTER (WHERE status::text = 'Em Andamento'),
          'atrasadas', COUNT(*) FILTER (WHERE prazo::date < CURRENT_DATE AND status::text != 'Concluído'),
          'taxa_conclusao', CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status::text = 'Concluído')::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 2)
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
            COUNT(tl.id) FILTER (WHERE tl.status::text = 'Concluído') as concluidas,
            CASE 
              WHEN COUNT(tl.id) > 0 THEN ROUND((COUNT(tl.id) FILTER (WHERE tl.status::text = 'Concluído')::numeric / NULLIF(COUNT(tl.id), 0)::numeric) * 100, 2)
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
          'pendentes', COUNT(*) FILTER (WHERE status_fluxo::text = 'Pendente'),
          'aprovacao', COUNT(*) FILTER (WHERE status_fluxo::text IN ('Cotações', 'Aprovação Qualidade', 'Aprovação Direção')),
          'aprovadas', COUNT(*) FILTER (WHERE status_fluxo::text IN ('OC Gerada', 'Recepcionado', 'Liquidado')),
          'valor_total', COALESCE(SUM(valor), 0),
          'valor_pendente', COALESCE(SUM(valor) FILTER (WHERE status_fluxo::text IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')), 0),
          'taxa_aprovacao', CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status_fluxo::text IN ('OC Gerada', 'Recepcionado', 'Liquidado'))::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 2)
            ELSE 0
          END
        )
        FROM requisicoes
        WHERE id_projeto = ANY(visible_projects)
      ),
      'projetos_lista', COALESCE((
        SELECT json_agg(row_to_json(t))
        FROM (
          SELECT 
            id,
            nome,
            cliente,
            COALESCE(orcamento, 0) as orcamento,
            COALESCE(gasto_calculado, 0) as gasto,
            COALESCE(avanco_fisico, 0) as avanco_fisico,
            CASE 
              WHEN orcamento > 0 THEN ROUND((gasto_calculado::numeric / NULLIF(orcamento, 0)::numeric) * 100, 2)
              ELSE 0
            END as avanco_financeiro,
            CASE
              WHEN data_inicio IS NOT NULL AND data_fim_prevista IS NOT NULL THEN
                ROUND(
                  (EXTRACT(EPOCH FROM (CURRENT_DATE::timestamp - data_inicio::timestamp)) / 
                   NULLIF(EXTRACT(EPOCH FROM (data_fim_prevista::timestamp - data_inicio::timestamp)), 0)) * 100, 
                  2
                )
              ELSE 0
            END as avanco_tempo,
            status::text as status,
            data_inicio::text,
            data_fim_prevista::text as data_fim_prevista,
            CASE
              WHEN orcamento > 0 AND (gasto_calculado::numeric / NULLIF(orcamento, 0)::numeric) > 1.1 THEN 'vermelho'
              WHEN orcamento > 0 AND (gasto_calculado::numeric / NULLIF(orcamento, 0)::numeric) > 0.9 THEN 'amarelo'
              ELSE 'verde'
            END as status_financeiro
          FROM project_expenses
          ORDER BY nome
        ) t
      ), '[]'::json)
    ) INTO result;
    
    RETURN result;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro em get_dashboard_geral_data: %', SQLERRM;
      
      RETURN json_build_object(
        'error', SQLERRM,
        'user_role', COALESCE(user_role::text, 'unknown'),
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
  END;
END;
$function$;