
-- Create function to calculate weekly PPC for a specific week
CREATE OR REPLACE FUNCTION calculate_weekly_ppc(
    project_id INTEGER,
    week_start DATE,
    week_end DATE
) RETURNS NUMERIC AS $$
DECLARE
    total_tasks INTEGER;
    completed_on_time INTEGER;
    ppc_percentage NUMERIC;
BEGIN
    -- Count total tasks scheduled for this week
    SELECT COUNT(*) INTO total_tasks
    FROM tarefas_lean
    WHERE id_projeto = project_id
    AND prazo >= week_start
    AND prazo <= week_end;
    
    -- Count tasks completed on time during this week
    SELECT COUNT(*) INTO completed_on_time
    FROM tarefas_lean
    WHERE id_projeto = project_id
    AND prazo >= week_start
    AND prazo <= week_end
    AND status = 'Concluído'
    AND updated_at::date <= prazo;
    
    -- Calculate PPC for this week
    IF total_tasks > 0 THEN
        ppc_percentage := (completed_on_time::NUMERIC / total_tasks::NUMERIC) * 100;
    ELSE
        ppc_percentage := 0;
    END IF;
    
    RETURN ROUND(ppc_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate weekly average PPC
CREATE OR REPLACE FUNCTION calculate_weekly_average_ppc(project_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    project_record RECORD;
    current_week_start DATE;
    current_week_end DATE;
    week_ppc NUMERIC;
    total_ppc NUMERIC := 0;
    week_count INTEGER := 0;
    avg_ppc NUMERIC;
BEGIN
    -- Get project dates
    SELECT * INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Start from project start date (Monday of that week)
    current_week_start := date_trunc('week', project_record.data_inicio);
    
    -- Calculate PPC for each week until current date or project end
    WHILE current_week_start <= LEAST(CURRENT_DATE, project_record.data_fim_prevista) LOOP
        current_week_end := current_week_start + INTERVAL '6 days';
        
        -- Calculate PPC for this week
        week_ppc := calculate_weekly_ppc(project_id, current_week_start, current_week_end);
        
        -- Only count weeks that have tasks
        IF week_ppc > 0 OR EXISTS (
            SELECT 1 FROM tarefas_lean 
            WHERE id_projeto = project_id 
            AND prazo >= current_week_start 
            AND prazo <= current_week_end
        ) THEN
            total_ppc := total_ppc + week_ppc;
            week_count := week_count + 1;
        END IF;
        
        -- Move to next week
        current_week_start := current_week_start + INTERVAL '7 days';
    END LOOP;
    
    -- Calculate average
    IF week_count > 0 THEN
        avg_ppc := total_ppc / week_count;
    ELSE
        avg_ppc := 0;
    END IF;
    
    RETURN ROUND(avg_ppc, 2);
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically register weekly PPCs
CREATE OR REPLACE FUNCTION register_weekly_ppc_entries(project_id INTEGER)
RETURNS VOID AS $$
DECLARE
    project_record RECORD;
    current_week_start DATE;
    current_week_end DATE;
    week_ppc NUMERIC;
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    -- Get project dates
    SELECT * INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Start from project start date (Monday of that week)
    current_week_start := date_trunc('week', project_record.data_inicio);
    
    -- Register PPC for each completed week
    WHILE current_week_start + INTERVAL '6 days' <= CURRENT_DATE 
          AND current_week_start <= project_record.data_fim_prevista LOOP
        
        current_week_end := current_week_start + INTERVAL '6 days';
        
        -- Check if this week entry already exists
        IF NOT EXISTS (
            SELECT 1 FROM ppc_historico 
            WHERE projeto_id = project_id 
            AND periodo_inicio = current_week_start 
            AND periodo_fim = current_week_end
        ) THEN
            -- Count tasks for this week
            SELECT COUNT(*) INTO total_tasks
            FROM tarefas_lean
            WHERE id_projeto = project_id
            AND prazo >= current_week_start
            AND prazo <= current_week_end;
            
            -- Count completed tasks on time
            SELECT COUNT(*) INTO completed_tasks
            FROM tarefas_lean
            WHERE id_projeto = project_id
            AND prazo >= current_week_start
            AND prazo <= current_week_end
            AND status = 'Concluído'
            AND updated_at::date <= prazo;
            
            -- Calculate PPC for this week
            week_ppc := calculate_weekly_ppc(project_id, current_week_start, current_week_end);
            
            -- Insert only if there were tasks scheduled for this week
            IF total_tasks > 0 THEN
                INSERT INTO ppc_historico (
                    projeto_id,
                    periodo_inicio,
                    periodo_fim,
                    ppc_percentual,
                    tarefas_programadas,
                    tarefas_concluidas_prazo
                ) VALUES (
                    project_id,
                    current_week_start,
                    current_week_end,
                    week_ppc,
                    total_tasks,
                    completed_tasks
                );
            END IF;
        END IF;
        
        -- Move to next week
        current_week_start := current_week_start + INTERVAL '7 days';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update the temporal progress calculation to use weekly average PPC
CREATE OR REPLACE FUNCTION calculate_temporal_progress(project_id INTEGER, method TEXT DEFAULT 'linear')
RETURNS NUMERIC AS $$
DECLARE
    project_record RECORD;
    linear_progress NUMERIC;
    ppc_progress NUMERIC;
    total_days INTEGER;
    days_passed INTEGER;
    current_date_val DATE;
BEGIN
    -- Get project data
    SELECT * INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    current_date_val := CURRENT_DATE;
    
    -- Calculate linear progress
    total_days := (project_record.data_fim_prevista - project_record.data_inicio) + 1;
    days_passed := (current_date_val - project_record.data_inicio) + 1;
    
    IF total_days > 0 THEN
        linear_progress := GREATEST(0, LEAST(100, (days_passed::NUMERIC / total_days::NUMERIC) * 100));
    ELSE
        linear_progress := 0;
    END IF;
    
    -- Calculate PPC progress using weekly average
    IF method = 'ppc' THEN
        -- First, register any missing weekly PPC entries
        PERFORM register_weekly_ppc_entries(project_id);
        
        -- Calculate weekly average PPC
        ppc_progress := calculate_weekly_average_ppc(project_id);
        
        RETURN ROUND(ppc_progress, 2);
    ELSE
        RETURN ROUND(linear_progress, 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get weekly PPC data for charts
CREATE OR REPLACE FUNCTION get_weekly_ppc_data(project_id INTEGER)
RETURNS TABLE(
    semana_inicio DATE,
    semana_fim DATE,
    ppc_percentual NUMERIC,
    tarefas_programadas INTEGER,
    tarefas_concluidas INTEGER,
    status_ppc TEXT
) AS $$
BEGIN
    -- First ensure all weekly PPCs are registered
    PERFORM register_weekly_ppc_entries(project_id);
    
    RETURN QUERY
    SELECT 
        h.periodo_inicio as semana_inicio,
        h.periodo_fim as semana_fim,
        h.ppc_percentual,
        h.tarefas_programadas,
        h.tarefas_concluidas_prazo as tarefas_concluidas,
        CASE 
            WHEN h.ppc_percentual >= 80 THEN 'Bom'
            WHEN h.ppc_percentual >= 60 THEN 'Médio'
            ELSE 'Crítico'
        END as status_ppc
    FROM ppc_historico h
    WHERE h.projeto_id = project_id
    ORDER BY h.periodo_inicio;
END;
$$ LANGUAGE plpgsql;
