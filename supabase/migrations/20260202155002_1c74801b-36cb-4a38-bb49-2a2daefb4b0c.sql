-- Adicionar política de SELECT para tarefas_lean
-- Permitir que diretor_tecnico, coordenacao_direcao e encarregado_obra vejam as tarefas

CREATE POLICY "tarefas_lean_select" 
ON public.tarefas_lean 
FOR SELECT 
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR 
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

-- Adicionar política de INSERT para tarefas_lean
CREATE POLICY "tarefas_lean_insert" 
ON public.tarefas_lean 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR 
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

-- Adicionar política de UPDATE para tarefas_lean
CREATE POLICY "tarefas_lean_update" 
ON public.tarefas_lean 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR 
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

-- Adicionar política de DELETE para tarefas_lean
CREATE POLICY "tarefas_lean_delete" 
ON public.tarefas_lean 
FOR DELETE 
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);