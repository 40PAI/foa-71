
-- Atualizar o enum de status do projeto para incluir 'Planeado' e 'Cancelado'
DROP TYPE IF EXISTS projeto_status CASCADE;
CREATE TYPE projeto_status AS ENUM ('Em Andamento', 'Atrasado', 'Concluído', 'Pausado', 'Planeado', 'Cancelado');

-- Criar enum para tipos de etapa
CREATE TYPE tipo_etapa AS ENUM ('Fundação', 'Estrutura', 'Alvenaria', 'Acabamento', 'Instalações', 'Entrega');

-- Criar enum para status de etapa
CREATE TYPE status_etapa AS ENUM ('Não Iniciada', 'Em Curso', 'Concluída', 'Atrasada');

-- Criar enum para tipo de projeto
CREATE TYPE tipo_projeto AS ENUM ('Residencial', 'Comercial', 'Industrial', 'Infraestrutura', 'Reforma');

-- Adicionar novos campos à tabela projetos
ALTER TABLE public.projetos 
ADD COLUMN provincia TEXT,
ADD COLUMN municipio TEXT,
ADD COLUMN zona_bairro TEXT,
ADD COLUMN tipo_projeto tipo_projeto,
ADD COLUMN numero_etapas INTEGER DEFAULT 1;

-- Atualizar a coluna status para usar o novo enum
ALTER TABLE public.projetos 
ALTER COLUMN status TYPE projeto_status USING status::text::projeto_status;

-- Criar tabela para etapas do projeto
CREATE TABLE public.projeto_etapas (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  numero_etapa INTEGER NOT NULL,
  nome_etapa TEXT NOT NULL,
  tipo_etapa tipo_etapa NOT NULL,
  responsavel_etapa TEXT NOT NULL,
  data_inicio_etapa DATE,
  data_fim_prevista_etapa DATE,
  status_etapa status_etapa NOT NULL DEFAULT 'Não Iniciada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(projeto_id, numero_etapa)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.projeto_etapas ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações na tabela projeto_etapas
CREATE POLICY "Allow all operations for authenticated users" ON public.projeto_etapas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Atualizar projetos existentes com valores padrão
UPDATE public.projetos SET numero_etapas = 1 WHERE numero_etapas IS NULL;
