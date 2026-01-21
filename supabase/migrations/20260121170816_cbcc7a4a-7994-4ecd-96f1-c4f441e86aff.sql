-- Expandir tabela de reembolsos para suportar múltiplas fontes de crédito
ALTER TABLE reembolsos_foa_fof ADD COLUMN IF NOT EXISTS fonte_credito TEXT DEFAULT 'FOF';
ALTER TABLE reembolsos_foa_fof ADD COLUMN IF NOT EXISTS credor_nome TEXT;
ALTER TABLE reembolsos_foa_fof ADD COLUMN IF NOT EXISTS fornecedor_id UUID REFERENCES fornecedores(id);
ALTER TABLE reembolsos_foa_fof ADD COLUMN IF NOT EXISTS taxa_juro NUMERIC;
ALTER TABLE reembolsos_foa_fof ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE reembolsos_foa_fof ADD COLUMN IF NOT EXISTS numero_contrato TEXT;
ALTER TABLE reembolsos_foa_fof ADD COLUMN IF NOT EXISTS status_divida TEXT DEFAULT 'ativo';

-- Comentários para documentação
COMMENT ON COLUMN reembolsos_foa_fof.fonte_credito IS 'Fonte do crédito: FOF, BANCO, FORNECEDOR, OUTRO';
COMMENT ON COLUMN reembolsos_foa_fof.credor_nome IS 'Nome do banco ou credor quando fonte não é FOF ou Fornecedor';
COMMENT ON COLUMN reembolsos_foa_fof.fornecedor_id IS 'ID do fornecedor quando fonte é FORNECEDOR';
COMMENT ON COLUMN reembolsos_foa_fof.taxa_juro IS 'Taxa de juro anual em percentagem';
COMMENT ON COLUMN reembolsos_foa_fof.data_vencimento IS 'Data de vencimento do crédito';
COMMENT ON COLUMN reembolsos_foa_fof.numero_contrato IS 'Número do contrato ou referência';
COMMENT ON COLUMN reembolsos_foa_fof.status_divida IS 'Status: ativo, quitado, em_atraso';

-- Actualizar registos existentes para ter fonte_credito = FOF
UPDATE reembolsos_foa_fof SET fonte_credito = 'FOF' WHERE fonte_credito IS NULL;