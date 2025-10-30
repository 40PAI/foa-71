-- Adicionar "Cancelado" ao enum projeto_status
ALTER TYPE projeto_status ADD VALUE IF NOT EXISTS 'Cancelado';

-- Comentário: Esta migração adiciona a opção "Cancelado" ao enum projeto_status
-- para permitir que obras sejam marcadas como canceladas