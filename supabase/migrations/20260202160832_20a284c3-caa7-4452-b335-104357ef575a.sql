-- Criar policy abrangente para materiais_armazem
-- Já existente "materiais_armazem_select" pode estar a bloquear, remover primeiro
DROP POLICY IF EXISTS "materiais_armazem_select" ON public.materiais_armazem;

-- Criar nova policy que inclui departamento_hst
CREATE POLICY "materiais_armazem_select_all" ON public.materiais_armazem
FOR SELECT USING (
  public.has_role(auth.uid(), 'diretor_tecnico'::public.app_role) OR
  public.has_role(auth.uid(), 'coordenacao_direcao'::public.app_role) OR
  public.has_role(auth.uid(), 'encarregado_obra'::public.app_role) OR
  public.has_role(auth.uid(), 'assistente_compras'::public.app_role) OR
  public.has_role(auth.uid(), 'departamento_hst'::public.app_role)
);