-- Adicionar coluna etapa_id à tabela centros_custo
ALTER TABLE centros_custo 
ADD COLUMN etapa_id integer REFERENCES etapas_projeto(id) ON DELETE SET NULL;

-- Adicionar índice para melhorar performance de consultas
CREATE INDEX idx_centros_custo_etapa_id ON centros_custo(etapa_id);

-- Comentário para documentação
COMMENT ON COLUMN centros_custo.etapa_id IS 'Referência à etapa do projeto à qual este centro de custo está alocado';