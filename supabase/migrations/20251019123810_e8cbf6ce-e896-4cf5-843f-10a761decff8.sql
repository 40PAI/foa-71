-- Fase 1: Ajustar Fontes de Financiamento FOA

-- Criar enum específico para fontes FOA
CREATE TYPE fonte_foa_enum AS ENUM (
  'REC_FOA',      -- Recebimento FOA
  'FOF_FIN',      -- FOF Financiamento
  'FOA_AUTO'      -- FOA Auto Financiamento
);

-- Alterar coluna fonte_financiamento em movimentos_financeiros para usar novo enum
ALTER TABLE movimentos_financeiros 
  DROP COLUMN IF EXISTS fonte_financiamento;

ALTER TABLE movimentos_financeiros 
  ADD COLUMN fonte_financiamento fonte_foa_enum;

-- Comentários explicativos
COMMENT ON TYPE fonte_foa_enum IS 'Fontes de financiamento específicas FOA: REC_FOA (Recebimento), FOF_FIN (Financiamento FOF), FOA_AUTO (Auto Financiamento)';
COMMENT ON COLUMN movimentos_financeiros.fonte_financiamento IS 'Fonte de financiamento do movimento: obrigatório para entradas (tipo_movimento = entrada)';