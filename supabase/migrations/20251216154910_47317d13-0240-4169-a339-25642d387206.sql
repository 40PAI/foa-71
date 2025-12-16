-- Adicionar colunas à tabela notificacoes
ALTER TABLE public.notificacoes 
ADD COLUMN IF NOT EXISTS destinatario_role text[] DEFAULT ARRAY['diretor_tecnico', 'coordenacao_direcao'],
ADD COLUMN IF NOT EXISTS destinatario_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS som_ativado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS acao_url text,
ADD COLUMN IF NOT EXISTS entidade_tipo text,
ADD COLUMN IF NOT EXISTS entidade_id text;

-- Função para criar notificação de tarefa atrasada
CREATE OR REPLACE FUNCTION public.notify_tarefa_atrasada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  projeto_nome TEXT;
BEGIN
  -- Verificar se tarefa está atrasada (prazo passou e não está concluída)
  IF NEW.prazo < CURRENT_DATE AND NEW.status != 'Concluído' THEN
    -- Verificar se já existe notificação para esta tarefa hoje
    IF NOT EXISTS (
      SELECT 1 FROM notificacoes 
      WHERE entidade_tipo = 'tarefa' 
      AND entidade_id = NEW.id::text 
      AND tipo = 'tarefa_atrasada'
      AND created_at::date = CURRENT_DATE
    ) THEN
      -- Buscar nome do projeto
      SELECT nome INTO projeto_nome FROM projetos WHERE id = NEW.id_projeto;
      
      INSERT INTO notificacoes (
        tipo, titulo, mensagem, projeto_id, severidade, som_ativado,
        destinatario_role, acao_url, entidade_tipo, entidade_id
      ) VALUES (
        'tarefa_atrasada',
        '⚠️ Tarefa Atrasada',
        'A tarefa "' || NEW.nome_tarefa || '" do projeto ' || COALESCE(projeto_nome, 'N/A') || ' está atrasada desde ' || TO_CHAR(NEW.prazo, 'DD/MM/YYYY'),
        NEW.id_projeto,
        'warning',
        true,
        ARRAY['diretor_tecnico', 'coordenacao_direcao', 'encarregado_obra'],
        '/tarefas?projeto=' || NEW.id_projeto,
        'tarefa',
        NEW.id::text
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para tarefas atrasadas
DROP TRIGGER IF EXISTS trigger_notify_tarefa_atrasada ON tarefas_lean;
CREATE TRIGGER trigger_notify_tarefa_atrasada
AFTER INSERT OR UPDATE ON tarefas_lean
FOR EACH ROW
EXECUTE FUNCTION notify_tarefa_atrasada();

-- Função para criar notificação de novo incidente
CREATE OR REPLACE FUNCTION public.notify_novo_incidente()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  projeto_nome TEXT;
  sev_level TEXT;
BEGIN
  -- Buscar nome do projeto
  SELECT nome INTO projeto_nome FROM projetos WHERE id = NEW.id_projeto;
  
  -- Determinar severidade da notificação baseada na severidade do incidente
  sev_level := CASE 
    WHEN NEW.severidade::text = 'Alta' THEN 'error'
    WHEN NEW.severidade::text = 'Média' THEN 'warning'
    ELSE 'info'
  END;
  
  INSERT INTO notificacoes (
    tipo, titulo, mensagem, projeto_id, severidade, som_ativado,
    destinatario_role, acao_url, entidade_tipo, entidade_id
  ) VALUES (
    'novo_incidente',
    '🚨 Novo Incidente Registrado',
    'Incidente de ' || NEW.tipo::text || ' (' || NEW.severidade::text || ') registrado no projeto ' || COALESCE(projeto_nome, 'N/A') || ': ' || LEFT(NEW.descricao, 100),
    NEW.id_projeto,
    sev_level,
    NEW.severidade::text IN ('Alta', 'Média'),
    ARRAY['diretor_tecnico', 'coordenacao_direcao', 'departamento_hst'],
    '/seguranca?projeto=' || NEW.id_projeto,
    'incidente',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

-- Trigger para novos incidentes
DROP TRIGGER IF EXISTS trigger_notify_novo_incidente ON incidentes;
CREATE TRIGGER trigger_notify_novo_incidente
AFTER INSERT ON incidentes
FOR EACH ROW
EXECUTE FUNCTION notify_novo_incidente();

-- Função para criar notificação de nova requisição
CREATE OR REPLACE FUNCTION public.notify_nova_requisicao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  projeto_nome TEXT;
BEGIN
  -- Buscar nome do projeto
  SELECT nome INTO projeto_nome FROM projetos WHERE id = NEW.id_projeto;
  
  INSERT INTO notificacoes (
    tipo, titulo, mensagem, projeto_id, severidade, som_ativado,
    destinatario_role, acao_url, entidade_tipo, entidade_id
  ) VALUES (
    'nova_requisicao',
    '📦 Nova Requisição',
    'Nova requisição de ' || NEW.categoria_principal || ' (' || COALESCE(NEW.valor, 0)::money::text || ') criada por ' || COALESCE(NEW.requisitante, 'N/A') || ' no projeto ' || COALESCE(projeto_nome, 'N/A'),
    NEW.id_projeto,
    CASE WHEN NEW.urgencia_prioridade::text = 'Alta' THEN 'warning' ELSE 'info' END,
    NEW.urgencia_prioridade::text = 'Alta',
    ARRAY['diretor_tecnico', 'coordenacao_direcao', 'assistente_compras'],
    '/compras?projeto=' || NEW.id_projeto,
    'requisicao',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

-- Trigger para novas requisições
DROP TRIGGER IF EXISTS trigger_notify_nova_requisicao ON requisicoes;
CREATE TRIGGER trigger_notify_nova_requisicao
AFTER INSERT ON requisicoes
FOR EACH ROW
EXECUTE FUNCTION notify_nova_requisicao();

-- Função para verificar alerta de orçamento
CREATE OR REPLACE FUNCTION public.notify_alerta_orcamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  projeto_record RECORD;
  total_gasto NUMERIC;
  percentual NUMERIC;
  alerta_tipo TEXT;
BEGIN
  -- Buscar dados do projeto
  SELECT p.id, p.nome, p.orcamento INTO projeto_record
  FROM projetos p WHERE p.id = NEW.projeto_id;
  
  IF projeto_record.orcamento IS NULL OR projeto_record.orcamento = 0 THEN
    RETURN NEW;
  END IF;
  
  -- Calcular total gasto
  SELECT COALESCE(SUM(valor), 0) INTO total_gasto
  FROM movimentos_financeiros
  WHERE projeto_id = NEW.projeto_id AND tipo_movimento = 'saida';
  
  percentual := (total_gasto / projeto_record.orcamento) * 100;
  
  -- Verificar thresholds
  IF percentual >= 90 THEN
    alerta_tipo := 'orcamento_90';
  ELSIF percentual >= 80 THEN
    alerta_tipo := 'orcamento_80';
  ELSE
    RETURN NEW;
  END IF;
  
  -- Verificar se já existe notificação deste tipo hoje
  IF NOT EXISTS (
    SELECT 1 FROM notificacoes 
    WHERE tipo = alerta_tipo
    AND projeto_id = NEW.projeto_id
    AND created_at::date = CURRENT_DATE
  ) THEN
    INSERT INTO notificacoes (
      tipo, titulo, mensagem, projeto_id, severidade, som_ativado,
      destinatario_role, acao_url, entidade_tipo, entidade_id
    ) VALUES (
      alerta_tipo,
      CASE WHEN percentual >= 90 THEN '🔴 Orçamento Crítico' ELSE '🟡 Alerta de Orçamento' END,
      'O projeto ' || projeto_record.nome || ' atingiu ' || ROUND(percentual, 1) || '% do orçamento total',
      NEW.projeto_id,
      CASE WHEN percentual >= 90 THEN 'error' ELSE 'warning' END,
      true,
      ARRAY['diretor_tecnico', 'coordenacao_direcao'],
      '/centros-custo?projeto=' || NEW.projeto_id,
      'projeto',
      NEW.projeto_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para alertas de orçamento
DROP TRIGGER IF EXISTS trigger_notify_alerta_orcamento ON movimentos_financeiros;
CREATE TRIGGER trigger_notify_alerta_orcamento
AFTER INSERT ON movimentos_financeiros
FOR EACH ROW
WHEN (NEW.tipo_movimento = 'saida')
EXECUTE FUNCTION notify_alerta_orcamento();

-- Função RPC para verificar créditos prestes a expirar e outras condições periódicas
CREATE OR REPLACE FUNCTION public.verificar_notificacoes_periodicas()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notificacoes_criadas INTEGER := 0;
  conta_record RECORD;
  tarefa_record RECORD;
BEGIN
  -- Verificar créditos com prazo de pagamento próximo (≤ 7 dias)
  FOR conta_record IN 
    SELECT ccf.id, ccf.descricao, ccf.data_vencimento, ccf.projeto_id, f.nome as fornecedor_nome, p.nome as projeto_nome
    FROM contas_correntes_fornecedores ccf
    JOIN fornecedores f ON ccf.fornecedor_id = f.id
    LEFT JOIN projetos p ON ccf.projeto_id = p.id
    WHERE ccf.data_vencimento IS NOT NULL
    AND ccf.data_vencimento <= CURRENT_DATE + INTERVAL '7 days'
    AND ccf.data_vencimento >= CURRENT_DATE
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM notificacoes 
      WHERE tipo = 'credito_expirando'
      AND entidade_id = conta_record.id::text
      AND created_at::date = CURRENT_DATE
    ) THEN
      INSERT INTO notificacoes (
        tipo, titulo, mensagem, projeto_id, severidade, som_ativado,
        destinatario_role, acao_url, entidade_tipo, entidade_id
      ) VALUES (
        'credito_expirando',
        '💰 Crédito Prestes a Expirar',
        'Pagamento ao fornecedor ' || conta_record.fornecedor_nome || ' vence em ' || TO_CHAR(conta_record.data_vencimento, 'DD/MM/YYYY'),
        conta_record.projeto_id,
        CASE WHEN conta_record.data_vencimento <= CURRENT_DATE + INTERVAL '3 days' THEN 'error' ELSE 'warning' END,
        conta_record.data_vencimento <= CURRENT_DATE + INTERVAL '3 days',
        ARRAY['diretor_tecnico', 'coordenacao_direcao', 'assistente_compras'],
        '/contas-fornecedores',
        'conta_fornecedor',
        conta_record.id::text
      );
      notificacoes_criadas := notificacoes_criadas + 1;
    END IF;
  END LOOP;
  
  -- Verificar tarefas atrasadas que ainda não foram notificadas hoje
  FOR tarefa_record IN
    SELECT t.id, t.nome_tarefa, t.prazo, t.id_projeto, p.nome as projeto_nome
    FROM tarefas_lean t
    LEFT JOIN projetos p ON t.id_projeto = p.id
    WHERE t.prazo < CURRENT_DATE
    AND t.status != 'Concluído'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM notificacoes 
      WHERE tipo = 'tarefa_atrasada'
      AND entidade_id = tarefa_record.id::text
      AND created_at::date = CURRENT_DATE
    ) THEN
      INSERT INTO notificacoes (
        tipo, titulo, mensagem, projeto_id, severidade, som_ativado,
        destinatario_role, acao_url, entidade_tipo, entidade_id
      ) VALUES (
        'tarefa_atrasada',
        '⚠️ Tarefa Atrasada',
        'A tarefa "' || tarefa_record.nome_tarefa || '" do projeto ' || COALESCE(tarefa_record.projeto_nome, 'N/A') || ' está atrasada desde ' || TO_CHAR(tarefa_record.prazo, 'DD/MM/YYYY'),
        tarefa_record.id_projeto,
        'warning',
        true,
        ARRAY['diretor_tecnico', 'coordenacao_direcao', 'encarregado_obra'],
        '/tarefas?projeto=' || tarefa_record.id_projeto,
        'tarefa',
        tarefa_record.id::text
      );
      notificacoes_criadas := notificacoes_criadas + 1;
    END IF;
  END LOOP;
  
  RETURN json_build_object('success', true, 'notificacoes_criadas', notificacoes_criadas);
END;
$$;

-- Habilitar realtime na tabela notificacoes
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario_role ON notificacoes USING GIN(destinatario_role);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at DESC);