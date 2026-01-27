-- Remover políticas RLS duplicadas da tabela user_roles
DROP POLICY IF EXISTS "Directors can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;