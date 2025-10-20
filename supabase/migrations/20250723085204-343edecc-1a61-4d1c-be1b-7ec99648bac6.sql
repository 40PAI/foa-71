
-- Corrigir a função calculate_patrimony_expenses com os valores corretos do enum
CREATE OR REPLACE FUNCTION public.calculate_patrimony_expenses(project_id integer)
RETURNS numeric
LANGUAGE plpgsql
AS $function$
DECLARE
    total_patrimony NUMERIC := 0;
    patrimony_record RECORD;
    allocation_days INTEGER;
    daily_depreciation NUMERIC;
BEGIN
    -- Calcular custos de patrimônio baseado na alocação
    FOR patrimony_record IN
        SELECT 
            p.id,
            p.nome,
            p.tipo,
            -- Estimar valor baseado no tipo (usando os valores corretos do enum)
            CASE p.tipo
                WHEN 'Gerador' THEN 80000
                WHEN 'Betoneira' THEN 50000
                WHEN 'Andaime' THEN 30000
                WHEN 'Ferramenta' THEN 5000
                WHEN 'Outros' THEN 10000
                ELSE 10000
            END as estimated_value
        FROM patrimonio p
        WHERE p.alocado_projeto_id = project_id
          AND p.status = 'Em Uso'
    LOOP
        -- Calcular dias de alocação (assumindo desde a criação até hoje)
        SELECT EXTRACT(DAY FROM (NOW() - created_at)) INTO allocation_days
        FROM patrimonio
        WHERE id = patrimony_record.id;
        
        -- Calcular depreciação diária (assumindo 5 anos de vida útil)
        daily_depreciation := patrimony_record.estimated_value / (365 * 5);
        
        total_patrimony := total_patrimony + (daily_depreciation * COALESCE(allocation_days, 0));
    END LOOP;
    
    RETURN COALESCE(total_patrimony, 0);
END;
$function$;

-- Criar trigger para atualizar métricas automaticamente quando datas do projeto mudam
CREATE OR REPLACE FUNCTION public.update_project_metrics_on_date_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se as datas relevantes mudaram
    IF OLD.data_inicio != NEW.data_inicio OR 
       OLD.data_fim_prevista != NEW.data_fim_prevista OR
       OLD.metodo_calculo_temporal != NEW.metodo_calculo_temporal THEN
        
        -- Atualizar métricas do projeto
        PERFORM update_project_metrics_with_integrated_finance(NEW.id);
        
        -- Log para debug
        RAISE NOTICE 'Métricas atualizadas automaticamente para projeto %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_update_metrics_on_date_change ON projetos;
CREATE TRIGGER trigger_update_metrics_on_date_change
    AFTER UPDATE ON projetos
    FOR EACH ROW
    EXECUTE FUNCTION update_project_metrics_on_date_change();

-- Função melhorada para calcular progresso temporal com logs
CREATE OR REPLACE FUNCTION public.calculate_temporal_progress(project_id integer, method text DEFAULT 'linear'::text)
RETURNS numeric
LANGUAGE plpgsql
AS $function$
DECLARE
    project_record RECORD;
    linear_progress NUMERIC;
    ppc_progress NUMERIC;
    total_days INTEGER;
    days_passed INTEGER;
    current_date_val DATE;
BEGIN
    -- Buscar dados do projeto
    SELECT * INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Projeto % não encontrado', project_id;
        RETURN 0;
    END IF;
    
    current_date_val := CURRENT_DATE;
    
    -- Calcular progresso linear
    total_days := (project_record.data_fim_prevista - project_record.data_inicio) + 1;
    days_passed := (current_date_val - project_record.data_inicio) + 1;
    
    RAISE NOTICE 'Projeto %: Total dias: %, Dias passados: %, Data atual: %', 
                 project_id, total_days, days_passed, current_date_val;
    
    IF total_days > 0 THEN
        linear_progress := GREATEST(0, LEAST(100, (days_passed::NUMERIC / total_days::NUMERIC) * 100));
    ELSE
        linear_progress := 0;
    END IF;
    
    -- Calcular PPC
    ppc_progress := calculate_project_ppc(project_id);
    
    RAISE NOTICE 'Projeto %: Progresso linear: %, PPC: %, Método: %', 
                 project_id, linear_progress, ppc_progress, method;
    
    -- Retornar baseado no método escolhido
    IF method = 'ppc' THEN
        RETURN ROUND(ppc_progress, 2);
    ELSE
        RETURN ROUND(linear_progress, 2);
    END IF;
END;
$function$;
