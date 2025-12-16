-- Create enum for entry subtypes
CREATE TYPE subtipo_entrada_enum AS ENUM (
  'valor_inicial',           -- Capital inicial/Fundo de maneio do projeto
  'recebimento_cliente',     -- Pagamentos de clientes durante execução
  'financiamento_adicional', -- Injeções de capital extras
  'reembolso'                -- Devoluções/estornos
);

-- Add column to movimentos_financeiros table
ALTER TABLE movimentos_financeiros 
ADD COLUMN subtipo_entrada subtipo_entrada_enum;

-- Add comment for documentation
COMMENT ON COLUMN movimentos_financeiros.subtipo_entrada IS 'Subtipo de entrada: valor_inicial (capital arranque), recebimento_cliente (pagamentos durante execução), financiamento_adicional (injeções extras), reembolso (devoluções)';