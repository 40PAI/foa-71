-- Adicionar campo semana_programada à tabela tarefas_lean se não existir
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'tarefas_lean' 
                   AND column_name = 'semana_programada') THEN
        ALTER TABLE public.tarefas_lean ADD COLUMN semana_programada INTEGER;
    END IF;
END $$;

-- Criar tabela semanas_projeto se não existir
CREATE TABLE IF NOT EXISTS public.semanas_projeto (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  numero_semana INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(projeto_id, numero_semana)
);

-- Habilitar RLS na tabela semanas_projeto se não estiver habilitado
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c 
                   JOIN pg_namespace n ON n.oid = c.relnamespace 
                   WHERE c.relname = 'semanas_projeto' 
                   AND n.nspname = 'public' 
                   AND c.relrowsecurity = true) THEN
        ALTER TABLE public.semanas_projeto ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Criar política RLS se não existir
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'semanas_projeto' 
                   AND policyname = 'Allow all operations on semanas_projeto') THEN
        CREATE POLICY "Allow all operations on semanas_projeto" ON public.semanas_projeto
          FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Função para calcular total de semanas num projeto (corrigida)
CREATE OR REPLACE FUNCTION public.calculate_project_weeks(project_id INTEGER)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    project_record RECORD;
    total_weeks INTEGER;
    days_diff INTEGER;
BEGIN
    -- Buscar datas do projeto
    SELECT data_inicio, data_fim_prevista INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calcular diferença em dias
    days_diff := (project_record.data_fim_prevista - project_record.data_inicio) + 1;
    
    -- Calcular semanas
    total_weeks := CEIL(days_diff::FLOAT / 7);
    
    RETURN GREATEST(1, total_weeks);
END;
$$;

-- Função para obter a semana atual do projeto
CREATE OR REPLACE FUNCTION public.get_current_project_week(project_id INTEGER)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_week INTEGER;
BEGIN
    SELECT numero_semana INTO current_week
    FROM semanas_projeto
    WHERE projeto_id = project_id
    AND CURRENT_DATE >= data_inicio
    AND CURRENT_DATE <= data_fim
    LIMIT 1;
    
    RETURN COALESCE(current_week, 1);
END;
$$;

-- Função para gerar semanas do projeto
CREATE OR REPLACE FUNCTION public.generate_project_weeks(project_id INTEGER)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    project_record RECORD;
    week_start DATE;
    week_end DATE;
    week_number INTEGER := 1;
    total_weeks INTEGER;
BEGIN
    -- Buscar datas do projeto
    SELECT data_inicio, data_fim_prevista INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Limpar semanas existentes deste projeto
    DELETE FROM semanas_projeto WHERE projeto_id = project_id;
    
    -- Calcular total de semanas
    total_weeks := calculate_project_weeks(project_id);
    
    -- Começar na data de início do projeto
    week_start := project_record.data_inicio;
    
    -- Gerar semanas
    WHILE week_number <= total_weeks LOOP
        -- Calcular fim da semana (6 dias depois do início, mas não além do fim do projeto)
        week_end := LEAST(week_start + INTERVAL '6 days', project_record.data_fim_prevista);
        
        -- Inserir semana
        INSERT INTO semanas_projeto (projeto_id, numero_semana, data_inicio, data_fim)
        VALUES (project_id, week_number, week_start, week_end);
        
        -- Passar para a semana seguinte
        week_start := week_end + INTERVAL '1 day';
        week_number := week_number + 1;
        
        -- Parar se chegámos ao fim do projeto
        IF week_start > project_record.data_fim_prevista THEN
            EXIT;
        END IF;
    END LOOP;
END;
$$;

-- Adicionar trigger para updated_at na tabela semanas_projeto se não existir
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger 
                   WHERE tgname = 'update_semanas_projeto_updated_at') THEN
        CREATE TRIGGER update_semanas_projeto_updated_at
            BEFORE UPDATE ON public.semanas_projeto
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Gerar semanas para todos os projetos existentes
DO $$
DECLARE
    projeto_record RECORD;
BEGIN
    FOR projeto_record IN SELECT id FROM projetos LOOP
        PERFORM generate_project_weeks(projeto_record.id);
    END LOOP;
END $$;