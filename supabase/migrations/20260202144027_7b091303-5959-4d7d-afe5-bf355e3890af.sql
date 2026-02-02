-- =============================================
-- FASE 1: Sistema de Ancoragem de Utilizadores a Projetos
-- e Dois Tipos de Requisição
-- =============================================

-- 1. Criar enum para tipos de requisição
CREATE TYPE public.tipo_requisicao_enum AS ENUM ('alocamento', 'compra');

-- 2. Adicionar campo tipo_requisicao à tabela requisicoes
ALTER TABLE public.requisicoes 
ADD COLUMN tipo_requisicao public.tipo_requisicao_enum DEFAULT 'compra'::public.tipo_requisicao_enum;

-- 3. Criar tabela de ancoragem de utilizadores a projetos
CREATE TABLE public.user_project_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  projeto_id integer NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  tipo_acesso text NOT NULL DEFAULT 'visualizacao',
  data_atribuicao date NOT NULL DEFAULT CURRENT_DATE,
  atribuido_por uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, projeto_id)
);

-- 4. Habilitar RLS na tabela user_project_access
ALTER TABLE public.user_project_access ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para user_project_access
CREATE POLICY "user_project_access_select_admin" ON public.user_project_access
FOR SELECT USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "user_project_access_insert_admin" ON public.user_project_access
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "user_project_access_update_admin" ON public.user_project_access
FOR UPDATE USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "user_project_access_delete_admin" ON public.user_project_access
FOR DELETE USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "user_project_access_select_own" ON public.user_project_access
FOR SELECT USING (
  user_id = auth.uid()
);

-- 6. Criar função helper para verificar acesso a projeto
CREATE OR REPLACE FUNCTION public.has_project_access(_user_id uuid, _projeto_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_project_access 
    WHERE user_id = _user_id 
      AND projeto_id = _projeto_id
  )
  OR EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = _user_id 
      AND cargo IN ('diretor_tecnico', 'coordenacao_direcao', 'assistente_compras')
  )
$$;

-- 7. Atualizar política de projetos para incluir ancoragem de encarregados
DROP POLICY IF EXISTS "projetos_select" ON public.projetos;
CREATE POLICY "projetos_select" ON public.projetos
FOR SELECT USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role) OR
  (
    has_role(auth.uid(), 'encarregado_obra'::app_role) AND 
    public.has_project_access(auth.uid(), id)
  )
);

-- 8. Atualizar políticas de tarefas_lean para ancoragem (usando id_projeto)
DROP POLICY IF EXISTS "tarefas_select" ON public.tarefas_lean;
CREATE POLICY "tarefas_select" ON public.tarefas_lean
FOR SELECT USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  (
    has_role(auth.uid(), 'encarregado_obra'::app_role) AND 
    public.has_project_access(auth.uid(), id_projeto)
  )
);

DROP POLICY IF EXISTS "tarefas_insert" ON public.tarefas_lean;
CREATE POLICY "tarefas_insert" ON public.tarefas_lean
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  (
    has_role(auth.uid(), 'encarregado_obra'::app_role) AND 
    public.has_project_access(auth.uid(), id_projeto)
  )
);

DROP POLICY IF EXISTS "tarefas_update" ON public.tarefas_lean;
CREATE POLICY "tarefas_update" ON public.tarefas_lean
FOR UPDATE USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  (
    has_role(auth.uid(), 'encarregado_obra'::app_role) AND 
    public.has_project_access(auth.uid(), id_projeto)
  )
);

DROP POLICY IF EXISTS "tarefas_delete" ON public.tarefas_lean;
CREATE POLICY "tarefas_delete" ON public.tarefas_lean
FOR DELETE USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- 9. Atualizar políticas de requisições para incluir tipo e ancoragem
DROP POLICY IF EXISTS "requisicoes_select" ON public.requisicoes;
CREATE POLICY "requisicoes_select" ON public.requisicoes
FOR SELECT USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role) OR
  has_role(auth.uid(), 'departamento_hst'::app_role) OR
  (
    has_role(auth.uid(), 'encarregado_obra'::app_role) AND 
    public.has_project_access(auth.uid(), id_projeto)
  )
);

DROP POLICY IF EXISTS "requisicoes_insert" ON public.requisicoes;
CREATE POLICY "requisicoes_insert" ON public.requisicoes
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role) OR
  has_role(auth.uid(), 'departamento_hst'::app_role) OR
  (
    has_role(auth.uid(), 'encarregado_obra'::app_role) AND 
    public.has_project_access(auth.uid(), id_projeto)
  )
);

DROP POLICY IF EXISTS "requisicoes_update" ON public.requisicoes;
CREATE POLICY "requisicoes_update" ON public.requisicoes
FOR UPDATE USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

DROP POLICY IF EXISTS "requisicoes_delete" ON public.requisicoes;
CREATE POLICY "requisicoes_delete" ON public.requisicoes
FOR DELETE USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- 10. Atualizar política de materiais_armazem para encarregados (somente leitura)
DROP POLICY IF EXISTS "materiais_armazem_select" ON public.materiais_armazem;
CREATE POLICY "materiais_armazem_select" ON public.materiais_armazem
FOR SELECT USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR 
  has_role(auth.uid(), 'assistente_compras'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

-- 11. Criar trigger para notificações de requisições
CREATE OR REPLACE FUNCTION public.notify_requisicao_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_projeto_nome text;
  v_limite_aprovacao numeric;
  v_titulo text;
  v_mensagem text;
  v_severity text;
  v_roles text[];
BEGIN
  SELECT nome INTO v_projeto_nome FROM public.projetos WHERE id = NEW.id_projeto;
  
  SELECT valor_numerico INTO v_limite_aprovacao 
  FROM public.configuracoes_foa 
  WHERE chave = 'limite_aprovacao_automatica';
  
  IF v_limite_aprovacao IS NULL THEN
    v_limite_aprovacao := 50000;
  END IF;

  IF NEW.tipo_requisicao = 'alocamento' THEN
    v_titulo := 'Nova Requisição de Alocamento';
    v_mensagem := format('Requisição de alocamento de "%s" para o projeto %s', 
                         COALESCE(NEW.nome_comercial_produto, 'Material'), 
                         COALESCE(v_projeto_nome, 'N/A'));
    v_severity := 'medium';
    v_roles := ARRAY['assistente_compras'];
  ELSE
    IF NEW.valor > v_limite_aprovacao THEN
      v_titulo := 'Nova Requisição de Compra (Requer Aprovação)';
      v_mensagem := format('Requisição de compra de "%s" no valor de %s para o projeto %s', 
                           COALESCE(NEW.nome_comercial_produto, 'Material'),
                           to_char(NEW.valor, 'FM999G999G999D00'),
                           COALESCE(v_projeto_nome, 'N/A'));
      v_severity := 'high';
      v_roles := ARRAY['diretor_tecnico', 'coordenacao_direcao', 'assistente_compras'];
    ELSE
      v_titulo := 'Nova Requisição de Compra';
      v_mensagem := format('Requisição de compra de "%s" no valor de %s para o projeto %s', 
                           COALESCE(NEW.nome_comercial_produto, 'Material'),
                           to_char(NEW.valor, 'FM999G999G999D00'),
                           COALESCE(v_projeto_nome, 'N/A'));
      v_severity := 'medium';
      v_roles := ARRAY['assistente_compras'];
    END IF;
  END IF;

  INSERT INTO public.notificacoes (
    titulo,
    mensagem,
    tipo,
    severidade,
    projeto_id,
    roles_destino,
    lida,
    created_at
  ) VALUES (
    v_titulo,
    v_mensagem,
    'requisicao',
    v_severity,
    NEW.id_projeto,
    v_roles,
    false,
    now()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_requisicao_created ON public.requisicoes;
CREATE TRIGGER trigger_notify_requisicao_created
AFTER INSERT ON public.requisicoes
FOR EACH ROW
EXECUTE FUNCTION public.notify_requisicao_created();

-- 12. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_user_project_access_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_user_project_access_updated_at
BEFORE UPDATE ON public.user_project_access
FOR EACH ROW
EXECUTE FUNCTION public.update_user_project_access_updated_at();