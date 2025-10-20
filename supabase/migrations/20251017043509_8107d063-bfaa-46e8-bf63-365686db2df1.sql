-- ==========================================
-- SECURITY FIX: Complete database security overhaul
-- ==========================================

-- Step 1: Drop existing conflicting RLS policies on profiles
DROP POLICY IF EXISTS "Apenas diretor técnico pode atualizar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Apenas diretor técnico pode criar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Diretor técnico pode ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.profiles;

-- Step 2: Drop old functions
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_director() CASCADE;

-- Step 3: Create app_role type
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

-- Step 4: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 5: Migrate existing roles from profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, cargo::text::app_role
FROM public.profiles
WHERE cargo IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Create new has_role function with proper security
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

-- Step 7: Create is_director function
CREATE OR REPLACE FUNCTION public.is_director()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'diretor_tecnico'::app_role
  )
$$;

-- Step 8: Re-enable RLS on all critical tables
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_lean ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_armazem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponto_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_detalhados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias_consumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias_consumo_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semanas_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alocacao_mensal_colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projeto_status_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppc_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_projeto ENABLE ROW LEVEL SECURITY;

-- Step 9: RLS policies for user_roles table
CREATE POLICY "Directors can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('diretor_tecnico'::app_role, 'coordenacao_direcao'::app_role)
  )
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());