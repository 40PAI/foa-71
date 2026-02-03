-- Atualizar CHECK constraint para aceitar todos os tipos de movimento de dívida
ALTER TABLE reembolsos_foa_fof DROP CONSTRAINT IF EXISTS reembolsos_foa_fof_tipo_check;

ALTER TABLE reembolsos_foa_fof ADD CONSTRAINT reembolsos_foa_fof_tipo_check 
CHECK (tipo = ANY (ARRAY['credito'::text, 'amortizacao'::text, 'juro'::text, 'aporte'::text]));