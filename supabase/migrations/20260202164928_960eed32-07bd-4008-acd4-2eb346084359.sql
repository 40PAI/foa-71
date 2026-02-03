-- Adicionar coluna projeto_destino_id para alocamentos de materiais
-- Esta coluna indica para qual projeto o material será alocado (diferente do projeto de origem)

ALTER TABLE public.requisicoes
ADD COLUMN projeto_destino_id INTEGER NULL REFERENCES public.projetos(id);

-- Criar índice para performance em consultas
CREATE INDEX idx_requisicoes_projeto_destino ON public.requisicoes(projeto_destino_id);

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.requisicoes.projeto_destino_id IS 'Projeto de destino para alocamentos de materiais. Usado quando tipo_requisicao = alocamento';