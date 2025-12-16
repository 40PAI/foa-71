
-- Adicionar campo para imagem/foto do material
ALTER TABLE materiais_armazem 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN materiais_armazem.imagem_url IS 'URL da imagem/foto do material';
