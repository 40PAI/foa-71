
-- Adicionar as colunas em falta à tabela projetos
ALTER TABLE public.projetos 
ADD COLUMN provincia TEXT,
ADD COLUMN municipio TEXT,
ADD COLUMN zona_bairro TEXT,
ADD COLUMN tipo_projeto tipo_projeto,
ADD COLUMN numero_etapas INTEGER DEFAULT 1;

-- Atualizar projetos existentes com valores padrão onde necessário
UPDATE public.projetos SET numero_etapas = 1 WHERE numero_etapas IS NULL;
