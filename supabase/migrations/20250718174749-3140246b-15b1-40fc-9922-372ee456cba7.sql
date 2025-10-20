-- Remove a constraint atual
ALTER TABLE ponto_diario DROP CONSTRAINT ponto_diario_status_check;

-- Adiciona a nova constraint com mais valores de status
ALTER TABLE ponto_diario ADD CONSTRAINT ponto_diario_status_check 
CHECK (status = ANY (ARRAY['presente'::text, 'ausente'::text, 'atraso'::text, 'falta'::text, 'ausencia_justificada'::text]));