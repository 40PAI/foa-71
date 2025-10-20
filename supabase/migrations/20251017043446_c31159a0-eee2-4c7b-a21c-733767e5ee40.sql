-- ==========================================
-- SECURITY FIX: Complete role system migration with CASCADE
-- ==========================================

-- Drop old policies that depend on functions  
DROP POLICY IF EXISTS "Apenas diretor técnico pode atualizar perfis" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Apenas diretor técnico pode criar perfis" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Diretor técnico pode ver todos os perfis" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.profiles CASCADE;

-- Drop old functions with CASCADE
DROP FUNCTION IF EXISTS public.is_director() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role) CASCADE;

-- Create enum for roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'diretor_tecnico',
    'encarregado_obra', 
    'assistente_compras',
    'departamento_hst',
    'coordenacao_direcao'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table with proper audit trail
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing roles from profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, cargo::text::app_role
FROM public.profiles
WHERE cargo IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create security definer functions with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_director()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'diretor_tecnico'::app_role)
$$;

-- RLS policies for user_roles
CREATE POLICY "Directors manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'diretor_tecnico'::app_role) OR has_role(auth.uid(), 'coordenacao_direcao'::app_role));

CREATE POLICY "Users view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Recreate profiles policies
CREATE POLICY "Directors view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'diretor_tecnico'::app_role) OR has_role(auth.uid(), 'coordenacao_direcao'::app_role));

CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Directors update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'diretor_tecnico'::app_role) OR has_role(auth.uid(), 'coordenacao_direcao'::app_role));

CREATE POLICY "Directors insert profiles"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'diretor_tecnico'::app_role) OR has_role(auth.uid(), 'coordenacao_direcao'::app_role));