
-- Criar tabela etapas_projeto que estava em falta
CREATE TABLE IF NOT EXISTS public.etapas_projeto (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  numero_etapa INTEGER NOT NULL,
  nome_etapa TEXT NOT NULL,
  tipo_etapa tipo_etapa_enum NOT NULL DEFAULT 'Fundação',
  responsavel_etapa TEXT NOT NULL,
  data_inicio_etapa DATE,
  data_fim_prevista_etapa DATE,
  status_etapa status_etapa_enum NOT NULL DEFAULT 'Não Iniciada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar enums necessários se não existirem
DO $$ BEGIN
    CREATE TYPE tipo_etapa_enum AS ENUM ('Fundação', 'Estrutura', 'Alvenaria', 'Acabamento', 'Instalações', 'Entrega');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_etapa_enum AS ENUM ('Não Iniciada', 'Em Curso', 'Concluída', 'Atrasada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Recriar a tabela com os tipos corretos
DROP TABLE IF EXISTS public.etapas_projeto CASCADE;
CREATE TABLE public.etapas_projeto (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  numero_etapa INTEGER NOT NULL,
  nome_etapa TEXT NOT NULL,
  tipo_etapa tipo_etapa_enum NOT NULL DEFAULT 'Fundação',
  responsavel_etapa TEXT NOT NULL,
  data_inicio_etapa DATE,
  data_fim_prevista_etapa DATE,
  status_etapa status_etapa_enum NOT NULL DEFAULT 'Não Iniciada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ativar RLS e criar políticas
ALTER TABLE public.etapas_projeto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on etapas_projeto" ON public.etapas_projeto
  FOR ALL USING (true) WITH CHECK (true);

-- Adicionar trigger para updated_at
DROP TRIGGER IF EXISTS update_etapas_projeto_updated_at ON public.etapas_projeto;
CREATE TRIGGER update_etapas_projeto_updated_at
    BEFORE UPDATE ON public.etapas_projeto
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar constraint para evitar etapas duplicadas no mesmo projeto
ALTER TABLE public.etapas_projeto 
ADD CONSTRAINT unique_projeto_numero_etapa 
UNIQUE (projeto_id, numero_etapa);
