
-- Add semana_programada field to tarefas_lean table
ALTER TABLE public.tarefas_lean 
ADD COLUMN semana_programada INTEGER;

-- Create semanas_projeto table to manage project weeks
CREATE TABLE public.semanas_projeto (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  numero_semana INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(projeto_id, numero_semana)
);

-- Enable RLS on semanas_projeto
ALTER TABLE public.semanas_projeto ENABLE ROW LEVEL SECURITY;

-- Create policy for semanas_projeto
CREATE POLICY "Allow all operations on semanas_projeto" ON public.semanas_projeto
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Function to calculate total weeks in a project
CREATE OR REPLACE FUNCTION public.calculate_project_weeks(project_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    project_record RECORD;
    total_weeks INTEGER;
BEGIN
    -- Get project dates
    SELECT data_inicio, data_fim_prevista INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate weeks between start and end dates
    total_weeks := CEIL(EXTRACT(EPOCH FROM (project_record.data_fim_prevista - project_record.data_inicio + 1)) / (7 * 24 * 60 * 60));
    
    RETURN GREATEST(1, total_weeks);
END;
$$ LANGUAGE plpgsql;

-- Function to generate project weeks
CREATE OR REPLACE FUNCTION public.generate_project_weeks(project_id INTEGER)
RETURNS VOID AS $$
DECLARE
    project_record RECORD;
    week_start DATE;
    week_end DATE;
    week_number INTEGER := 1;
    total_weeks INTEGER;
BEGIN
    -- Get project dates
    SELECT data_inicio, data_fim_prevista INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Clear existing weeks for this project
    DELETE FROM semanas_projeto WHERE projeto_id = project_id;
    
    -- Calculate total weeks
    total_weeks := calculate_project_weeks(project_id);
    
    -- Start from project start date
    week_start := project_record.data_inicio;
    
    -- Generate weeks
    WHILE week_number <= total_weeks LOOP
        -- Calculate week end (6 days after start, but not beyond project end)
        week_end := LEAST(week_start + INTERVAL '6 days', project_record.data_fim_prevista);
        
        -- Insert week
        INSERT INTO semanas_projeto (projeto_id, numero_semana, data_inicio, data_fim)
        VALUES (project_id, week_number, week_start, week_end);
        
        -- Move to next week
        week_start := week_end + INTERVAL '1 day';
        week_number := week_number + 1;
        
        -- Break if we've reached the end date
        IF week_start > project_record.data_fim_prevista THEN
            EXIT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get current project week
CREATE OR REPLACE FUNCTION public.get_current_project_week(project_id INTEGER)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate weeks when project dates change
CREATE OR REPLACE FUNCTION public.update_project_weeks()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if dates changed
    IF OLD.data_inicio != NEW.data_inicio OR OLD.data_fim_prevista != NEW.data_fim_prevista THEN
        -- Regenerate weeks for this project
        PERFORM generate_project_weeks(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_project_weeks ON projetos;
CREATE TRIGGER trigger_update_project_weeks
    AFTER UPDATE ON projetos
    FOR EACH ROW
    EXECUTE FUNCTION update_project_weeks();

-- Generate weeks for existing projects
DO $$
DECLARE
    projeto_record RECORD;
BEGIN
    FOR projeto_record IN SELECT id FROM projetos LOOP
        PERFORM generate_project_weeks(projeto_record.id);
    END LOOP;
END $$;

-- Update existing tasks to have a semana_programada based on their prazo
UPDATE tarefas_lean 
SET semana_programada = (
    SELECT sp.numero_semana
    FROM semanas_projeto sp
    WHERE sp.projeto_id = tarefas_lean.id_projeto
    AND tarefas_lean.prazo >= sp.data_inicio
    AND tarefas_lean.prazo <= sp.data_fim
    LIMIT 1
);

-- Add trigger to update updated_at on semanas_projeto
DROP TRIGGER IF EXISTS update_semanas_projeto_updated_at ON public.semanas_projeto;
CREATE TRIGGER update_semanas_projeto_updated_at
    BEFORE UPDATE ON public.semanas_projeto
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
