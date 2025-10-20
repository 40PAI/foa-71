-- Remover a constraint existente que está causando o problema
ALTER TABLE public.tarefas_lean 
DROP CONSTRAINT IF EXISTS fk_tarefas_etapa;

-- Recriar a constraint com CASCADE DELETE para permitir deleção das etapas
-- mesmo quando há tarefas vinculadas
ALTER TABLE public.tarefas_lean 
ADD CONSTRAINT fk_tarefas_etapa 
FOREIGN KEY (id_etapa) REFERENCES public.etapas_projeto(id) ON DELETE SET NULL;

-- Recriar o índice
DROP INDEX IF EXISTS idx_tarefas_lean_etapa;
CREATE INDEX idx_tarefas_lean_etapa ON public.tarefas_lean(id_etapa);