
-- Primeiro, vamos ver qual constraint está causando o problema e removê-la
ALTER TABLE colaboradores_projetos DROP CONSTRAINT IF EXISTS colaboradores_projetos_horario_tipo_check;

-- Agora vamos criar uma nova constraint que permita os valores corretos
ALTER TABLE colaboradores_projetos 
ADD CONSTRAINT colaboradores_projetos_horario_tipo_check 
CHECK (horario_tipo IN ('Integral', 'Meio Período', 'Flexível', 'Integral (8h)', 'Meio Período (4h)'));
