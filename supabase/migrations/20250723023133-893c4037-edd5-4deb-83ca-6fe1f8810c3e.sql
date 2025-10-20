
-- Adicionar o valor 'Rejeitado' ao enum status_fluxo se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Rejeitado' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_fluxo')) THEN
    ALTER TYPE status_fluxo ADD VALUE 'Rejeitado';
  END IF;
END
$$;
