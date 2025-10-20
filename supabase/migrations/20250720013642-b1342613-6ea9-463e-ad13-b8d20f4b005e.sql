-- Add foreign key constraints to the new tables
ALTER TABLE public.alocacao_mensal_colaboradores 
ADD CONSTRAINT fk_alocacao_mensal_colaborador 
FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id);

ALTER TABLE public.alocacao_mensal_colaboradores 
ADD CONSTRAINT fk_alocacao_mensal_projeto 
FOREIGN KEY (projeto_id) REFERENCES public.projetos(id);

ALTER TABLE public.projeto_status_mensal 
ADD CONSTRAINT fk_status_mensal_projeto 
FOREIGN KEY (projeto_id) REFERENCES public.projetos(id);