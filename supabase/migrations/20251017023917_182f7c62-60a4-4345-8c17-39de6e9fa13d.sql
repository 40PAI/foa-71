-- Alterar a coluna para TEXT temporariamente
ALTER TABLE tarefas_lean 
  ALTER COLUMN tipo TYPE TEXT;

-- Dropar o enum antigo
DROP TYPE IF EXISTS tipo_tarefa_lean CASCADE;

-- Criar novo enum com os tipos corretos
CREATE TYPE tipo_tarefa_lean AS ENUM (
  'Residencial',
  'Comercial', 
  'Industrial',
  'Infraestrutura',
  'Reforma'
);

-- Atualizar valores existentes para o novo formato
UPDATE tarefas_lean 
SET tipo = 'Residencial' 
WHERE tipo IN ('PDCA', '5S', 'Melhoria', 'Corretiva');

-- Alterar a coluna de volta para o novo enum
ALTER TABLE tarefas_lean 
  ALTER COLUMN tipo TYPE tipo_tarefa_lean USING tipo::tipo_tarefa_lean,
  ALTER COLUMN tipo SET DEFAULT 'Residencial'::tipo_tarefa_lean;

COMMENT ON TYPE tipo_tarefa_lean IS 'Tipos de projeto: Residencial, Comercial, Industrial, Infraestrutura, Reforma';