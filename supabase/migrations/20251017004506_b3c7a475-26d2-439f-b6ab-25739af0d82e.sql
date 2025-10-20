-- Adicionar campo para etapa relacionada na tabela guias_consumo
ALTER TABLE guias_consumo
ADD COLUMN IF NOT EXISTS etapa_id INTEGER REFERENCES etapas_projeto(id);

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_guias_consumo_etapa_id ON guias_consumo(etapa_id);

-- Adicionar comentário
COMMENT ON COLUMN guias_consumo.etapa_id IS 'Etapa do projeto relacionada com esta guia de consumo';