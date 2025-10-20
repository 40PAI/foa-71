-- Criar enum para os tipos de cargo/perfil
CREATE TYPE public.user_role AS ENUM (
  'diretor_tecnico',
  'encarregado_obra', 
  'assistente_compras',
  'departamento_hst',
  'coordenacao_direcao'
);

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo user_role NOT NULL DEFAULT 'encarregado_obra',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  PRIMARY KEY (id)
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND cargo = role_name
      AND ativo = true
  )
$$;

-- Função para verificar se usuário é diretor técnico (único que pode gerenciar usuários)
CREATE OR REPLACE FUNCTION public.is_director()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'diretor_tecnico')
$$;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver próprio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Diretor técnico pode ver todos os perfis"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_director());

CREATE POLICY "Apenas diretor técnico pode criar perfis"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (is_director());

CREATE POLICY "Apenas diretor técnico pode atualizar perfis"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_director());

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, cargo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome', new.email),
    new.email,
    'encarregado_obra'
  );
  RETURN new;
END;
$$;

-- Trigger para executar função quando novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();