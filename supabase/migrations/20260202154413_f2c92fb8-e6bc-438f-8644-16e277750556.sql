-- Adicionar campo para referenciar material do armazém em requisições de alocamento
ALTER TABLE public.requisicoes 
ADD COLUMN IF NOT EXISTS material_armazem_id uuid REFERENCES public.materiais_armazem(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_requisicoes_material_armazem 
ON public.requisicoes(material_armazem_id) 
WHERE material_armazem_id IS NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.requisicoes.material_armazem_id IS 'Referência ao material do armazém para requisições de tipo alocamento';