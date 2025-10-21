-- Adicionar colunas à tabela contas_correntes_fornecedores
ALTER TABLE contas_correntes_fornecedores
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS data_vencimento DATE,
ADD COLUMN IF NOT EXISTS categoria TEXT;