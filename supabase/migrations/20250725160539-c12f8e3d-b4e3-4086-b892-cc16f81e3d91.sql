-- Primeira migração: Adicionar nova categoria e estrutura
ALTER TYPE categoria_principal_enum ADD VALUE 'Segurança e Higiene no Trabalho';

-- Adicionar coluna para categoria secundária
ALTER TABLE subcategorias_compras 
ADD COLUMN categoria_secundaria TEXT NOT NULL DEFAULT '';