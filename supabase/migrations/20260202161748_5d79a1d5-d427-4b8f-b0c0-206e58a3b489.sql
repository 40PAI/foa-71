-- Corrigir função notify_tarefa_atrasada que referencia coluna inexistente
CREATE OR REPLACE FUNCTION public.notify_tarefa_atrasada()
RETURNS TRIGGER
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
        'A tarefa "' || COALESCE(NEW.descricao, 'Sem descrição') || '" do projeto ' || COALESCE(projeto_nome, 'N/A') || ' está atrasada desde ' || TO_CHAR(NEW.prazo, 'DD/MM/YYYY'),
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