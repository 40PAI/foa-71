
-- =====================================================
-- SECURITY FIX: Make storage buckets private and fix RLS
-- =====================================================

-- Step 1: Make sensitive storage buckets private
UPDATE storage.buckets 
SET public = false
WHERE id IN (
  'comprovantes', 
  'comprovantes-caixa', 
  'cvs', 
  'documentos-projetos'
);

-- Step 2: Remove anonymous access policies for comprovantes
DROP POLICY IF EXISTS "Público pode ler comprovantes" ON storage.objects;

-- Step 3: Keep only authenticated user policies for comprovantes
-- First remove all duplicate/conflicting policies for comprovantes
DROP POLICY IF EXISTS "Users can view comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de comprovantes para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização de comprovantes próprios" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de comprovantes próprios" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de comprovantes próprios" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem visualizar comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem fazer upload de comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem atualizar comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem deletar comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios comprovantes" ON storage.objects;

-- Create clean authenticated-only policies for comprovantes
CREATE POLICY "auth_users_read_comprovantes" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'comprovantes');

CREATE POLICY "auth_users_write_comprovantes" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'comprovantes' AND auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_update_comprovantes" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'comprovantes' AND auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_delete_comprovantes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'comprovantes' AND auth.uid() IS NOT NULL);

-- Step 4: Fix clientes table - restrict to authenticated users with role-based access
DROP POLICY IF EXISTS "Allow all operations on clientes" ON public.clientes;

CREATE POLICY "clientes_select_auth" ON public.clientes
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "clientes_insert_directors" ON public.clientes
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "clientes_update_directors" ON public.clientes
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "clientes_delete_directors" ON public.clientes
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- Step 5: Fix contratos_clientes table - restrict to authenticated users with role-based access
DROP POLICY IF EXISTS "Allow all operations on contratos_clientes" ON public.contratos_clientes;

CREATE POLICY "contratos_clientes_select_auth" ON public.contratos_clientes
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contratos_clientes_insert_directors" ON public.contratos_clientes
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contratos_clientes_update_directors" ON public.contratos_clientes
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contratos_clientes_delete_directors" ON public.contratos_clientes
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- Step 6: Create invitations table for secure invite flow (replaces hardcoded password)
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nome text NOT NULL,
  cargo app_role NOT NULL,
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_by_name text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Only directors can create invitations
CREATE POLICY "directors_manage_invitations" ON public.invitations
FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- Public can select invitations by token (for registration page)
CREATE POLICY "public_read_valid_invitation" ON public.invitations
FOR SELECT TO anon
USING (
  used_at IS NULL AND 
  expires_at > now()
);
