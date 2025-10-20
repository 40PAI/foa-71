-- Adicionar constraint única para permitir ON CONFLICT na tabela financas
ALTER TABLE public.financas 
ADD CONSTRAINT financas_projeto_categoria_unique 
UNIQUE (id_projeto, categoria);