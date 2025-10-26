-- Função RPC para buscar dados consolidados do Dashboard Geral FOA
-- com controle de acesso baseado em roles

CREATE OR REPLACE FUNCTION public.get_dashboard_geral_data(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Definir projetos visíveis baseado no role
  IF user_role IN ('diretor_tecnico', 'coordenacao_direcao') THEN
    -- Diretores e coordenação veem todos os projetos
    visible_projects := ARRAY(SELECT id FROM projetos);
  ELSIF user_role = 'encarregado_obra' THEN
    -- Encarregados veem apenas seus projetos
    visible_projects := ARRAY(
      SELECT DISTINCT cp.projeto_id 
      FROM colaboradores_projetos cp
      INNER JOIN colaboradores c ON cp.colaborador_id = c.id
      WHERE c.user_id = user_id_param
    );
  ELSIF user_role = 'assistente_compras' THEN
    -- Assistentes de compras veem projetos com requisições
    visible_projects := ARRAY(
      SELECT DISTINCT id_projeto 
      FROM requisicoes
    );
  ELSIF user_role = 'departamento_hst' THEN
    -- HST vê projetos com incidentes
    visible_projects := ARRAY(
      SELECT DISTINCT projeto_id 
      FROM incidentes_seguranca
    );
  ELSE
    -- Por padrão, sem acesso
    visible_projects := ARRAY[]::INTEGER[];
  END IF;
  
  -- Agregar dados do dashboard
  SELECT json_build_object(
    'user_role', user_role,
    'visible_project_count', COALESCE(array_length(visible_projects, 1), 0),
    
    -- KPIs Gerais
    'kpis_gerais', (
      SELECT json_build_object(
        'total_projetos', COUNT(*),
        'projetos_ativos', COUNT(*) FILTER (WHERE status = 'Em Andamento'),
        'orcamento_total', COALESCE(SUM(orcamento), 0),
        'gasto_total', COALESCE(SUM(gasto), 0),
        'saldo_disponivel', COALESCE(SUM(orcamento - gasto), 0),
        'percentual_gasto', CASE 
          WHEN SUM(orcamento) > 0 THEN ROUND((SUM(gasto)::NUMERIC / SUM(orcamento)::NUMERIC) * 100, 2)
          ELSE 0 
        END
      )
      FROM projetos
      WHERE id = ANY(visible_projects)
    ),
    
    -- Top 5 Projetos por Gasto
    'top_projetos_gasto', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          id,
          nome,
          orcamento,
          gasto,
          ROUND((gasto::NUMERIC / NULLIF(orcamento, 0)) * 100, 2) as percentual_gasto,
          status
        FROM projetos
        WHERE id = ANY(visible_projects)
        ORDER BY gasto DESC
        LIMIT 5
      ) t
    ),
    
    -- Resumo de Tarefas
    'tarefas_resumo', (
      SELECT json_build_object(
        'total', COUNT(*),
        'concluidas', COUNT(*) FILTER (WHERE status = 'Concluído'),
        'em_andamento', COUNT(*) FILTER (WHERE status IN ('Em Andamento', 'Iniciado')),
        'atrasadas', COUNT(*) FILTER (WHERE prazo < CURRENT_DATE AND status != 'Concluído'),
        'taxa_conclusao', CASE 
          WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'Concluído')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
          ELSE 0 
        END
      )
      FROM tarefas_lean
      WHERE id_projeto = ANY(visible_projects)
    ),
    
    -- Top 5 Projetos por Tarefas Concluídas
    'top_projetos_tarefas', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          p.nome as projeto_nome,
          COUNT(*) as total_tarefas,
          COUNT(*) FILTER (WHERE tl.status = 'Concluído') as concluidas,
          ROUND((COUNT(*) FILTER (WHERE tl.status = 'Concluído')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) as percentual
        FROM projetos p
        LEFT JOIN tarefas_lean tl ON p.id = tl.id_projeto
        WHERE p.id = ANY(visible_projects)
        GROUP BY p.id, p.nome
        HAVING COUNT(*) > 0
        ORDER BY concluidas DESC
        LIMIT 5
      ) t
    ),
    
    -- Resumo de Requisições/Compras
    'requisicoes_resumo', (
      SELECT json_build_object(
        'total', COUNT(*),
        'pendentes', COUNT(*) FILTER (WHERE status_fluxo IN ('Pendente', 'Cotações')),
        'aprovacao', COUNT(*) FILTER (WHERE status_fluxo IN ('Aprovação Qualidade', 'Aprovação Direção')),
        'aprovadas', COUNT(*) FILTER (WHERE status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')),
        'valor_total', COALESCE(SUM(valor), 0),
        'valor_pendente', COALESCE(SUM(valor) FILTER (WHERE status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')), 0),
        'taxa_aprovacao', CASE 
          WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
          ELSE 0 
        END
      )
      FROM requisicoes
      WHERE id_projeto = ANY(visible_projects)
    ),
    
    -- Lista de Todos os Projetos Visíveis
    'projetos_lista', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT 
          id,
          nome,
          cliente,
          orcamento,
          gasto,
          avanco_fisico,
          avanco_financeiro,
          avanco_tempo,
          status,
          data_inicio,
          data_fim_prevista,
          CASE 
            WHEN gasto > orcamento * 1.1 THEN 'vermelho'
            WHEN gasto > orcamento * 0.9 THEN 'amarelo'
            ELSE 'verde'
          END as status_financeiro
        FROM projetos
        WHERE id = ANY(visible_projects)
        ORDER BY nome
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$;