-- Drop e recriar função de cálculo financeiro integrado para incluir custos de tarefas
DROP FUNCTION IF EXISTS public.calculate_integrated_financial_progress(integer);

CREATE OR REPLACE FUNCTION public.calculate_integrated_financial_progress(project_id integer)
RETURNS TABLE(
    total_budget numeric, 
    material_expenses numeric, 
    payroll_expenses numeric, 
    patrimony_expenses numeric, 
    indirect_expenses numeric, 
    total_expenses numeric, 
    financial_progress numeric,
    task_material_cost numeric,
    task_labor_cost numeric,
    task_real_expenses numeric
)
LANGUAGE plpgsql
AS $function$
DECLARE
    project_budget NUMERIC;
    materials_cost NUMERIC;
    payroll_cost NUMERIC;
    patrimony_cost NUMERIC;
    indirect_cost NUMERIC;
    total_cost NUMERIC;
    progress_percentage NUMERIC;
    task_materials NUMERIC;
    task_labor NUMERIC;
    task_real NUMERIC;
BEGIN
    -- Obter orçamento do projeto
    SELECT orcamento INTO project_budget
    FROM projetos
    WHERE id = project_id;
    
    -- Calcular custos de materiais (requisições)
    materials_cost := calculate_material_expenses(project_id);
    
    -- Calcular custos de mão de obra (ponto diário)
    payroll_cost := calculate_payroll_expenses(project_id);
    
    -- Calcular custos de patrimônio
    patrimony_cost := calculate_patrimony_expenses(project_id);
    
    -- Calcular custos planejados de tarefas
    SELECT 
        COALESCE(SUM(custo_material), 0),
        COALESCE(SUM(custo_mao_obra), 0),
        COALESCE(SUM(gasto_real), 0)
    INTO task_materials, task_labor, task_real
    FROM tarefas_lean
    WHERE id_projeto = project_id;
    
    -- Combinar custos: usar o maior entre requisições e tarefas para materiais
    materials_cost := GREATEST(materials_cost, task_materials);
    
    -- Combinar custos: usar o maior entre ponto diário e tarefas para mão de obra
    payroll_cost := GREATEST(payroll_cost, task_labor);
    
    -- Calcular gastos indiretos (10% dos gastos diretos)
    indirect_cost := (materials_cost + payroll_cost + patrimony_cost) * 0.1;
    
    -- Calcular total de gastos
    total_cost := materials_cost + payroll_cost + patrimony_cost + indirect_cost;
    
    -- Calcular percentual de progresso
    IF project_budget > 0 THEN
        progress_percentage := (total_cost / project_budget) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        COALESCE(project_budget, 0),
        COALESCE(materials_cost, 0),
        COALESCE(payroll_cost, 0),
        COALESCE(patrimony_cost, 0),
        COALESCE(indirect_cost, 0),
        COALESCE(total_cost, 0),
        COALESCE(progress_percentage, 0),
        COALESCE(task_materials, 0),
        COALESCE(task_labor, 0),
        COALESCE(task_real, 0);
END;
$function$;

-- Criar nova função para análise financeira de tarefas
CREATE OR REPLACE FUNCTION public.get_task_financial_analytics(project_id integer)
RETURNS TABLE(
    total_planned_cost numeric,
    total_real_expenses numeric,
    budget_deviation numeric,
    budget_deviation_percentage numeric,
    total_planned_days integer,
    total_real_days integer,
    time_deviation integer,
    time_efficiency_percentage numeric,
    tasks_on_budget integer,
    tasks_over_budget integer,
    tasks_on_time integer,
    tasks_delayed integer,
    material_planned numeric,
    material_real numeric,
    labor_planned numeric,
    labor_real numeric,
    efficiency_score numeric
)
LANGUAGE plpgsql
AS $function$
DECLARE
    planned_cost NUMERIC;
    real_expenses NUMERIC;
    budget_dev NUMERIC;
    budget_dev_pct NUMERIC;
    planned_days INTEGER;
    real_days INTEGER;
    time_dev INTEGER;
    time_eff NUMERIC;
    on_budget INTEGER;
    over_budget INTEGER;
    on_time INTEGER;
    delayed INTEGER;
    mat_planned NUMERIC;
    mat_real NUMERIC;
    lab_planned NUMERIC;
    lab_real NUMERIC;
    eff_score NUMERIC;
BEGIN
    -- Calcular custos planejados vs reais
    SELECT 
        COALESCE(SUM(custo_material + custo_mao_obra), 0),
        COALESCE(SUM(gasto_real), 0),
        COALESCE(SUM(custo_material), 0),
        COALESCE(SUM(custo_mao_obra), 0)
    INTO planned_cost, real_expenses, mat_planned, lab_planned
    FROM tarefas_lean
    WHERE id_projeto = project_id;
    
    -- Calcular materiais e mão de obra reais (estimativa baseada em proporção)
    IF planned_cost > 0 THEN
        mat_real := real_expenses * (mat_planned / planned_cost);
        lab_real := real_expenses * (lab_planned / planned_cost);
    ELSE
        mat_real := 0;
        lab_real := 0;
    END IF;
    
    -- Calcular desvio orçamentário
    budget_dev := real_expenses - planned_cost;
    IF planned_cost > 0 THEN
        budget_dev_pct := (budget_dev / planned_cost) * 100;
    ELSE
        budget_dev_pct := 0;
    END IF;
    
    -- Calcular tempo planejado vs real
    SELECT 
        COALESCE(SUM(EXTRACT(DAY FROM (prazo - CURRENT_DATE))), 0)::INTEGER,
        COALESCE(SUM(tempo_real_dias), 0)
    INTO planned_days, real_days
    FROM tarefas_lean
    WHERE id_projeto = project_id;
    
    -- Calcular desvio temporal
    time_dev := real_days - planned_days;
    IF real_days > 0 THEN
        time_eff := ((planned_days::NUMERIC / real_days::NUMERIC) * 100);
    ELSE
        time_eff := 100;
    END IF;
    
    -- Contar tarefas dentro/fora do orçamento
    SELECT 
        COUNT(CASE WHEN gasto_real <= (custo_material + custo_mao_obra) THEN 1 END),
        COUNT(CASE WHEN gasto_real > (custo_material + custo_mao_obra) THEN 1 END)
    INTO on_budget, over_budget
    FROM tarefas_lean
    WHERE id_projeto = project_id AND gasto_real > 0;
    
    -- Contar tarefas no prazo/atrasadas
    SELECT 
        COUNT(CASE WHEN status = 'Concluído' AND updated_at::date <= prazo THEN 1 END),
        COUNT(CASE WHEN status = 'Concluído' AND updated_at::date > prazo THEN 1 END)
    INTO on_time, delayed
    FROM tarefas_lean
    WHERE id_projeto = project_id;
    
    -- Calcular score de eficiência (média ponderada)
    IF planned_cost > 0 AND real_days > 0 THEN
        eff_score := (
            (CASE WHEN budget_dev_pct <= 0 THEN 100 ELSE GREATEST(0, 100 - ABS(budget_dev_pct)) END * 0.6) +
            (time_eff * 0.4)
        );
    ELSE
        eff_score := 100;
    END IF;
    
    RETURN QUERY SELECT 
        COALESCE(planned_cost, 0),
        COALESCE(real_expenses, 0),
        COALESCE(budget_dev, 0),
        COALESCE(budget_dev_pct, 0),
        COALESCE(planned_days, 0),
        COALESCE(real_days, 0),
        COALESCE(time_dev, 0),
        COALESCE(time_eff, 0),
        COALESCE(on_budget, 0),
        COALESCE(over_budget, 0),
        COALESCE(on_time, 0),
        COALESCE(delayed, 0),
        COALESCE(mat_planned, 0),
        COALESCE(mat_real, 0),
        COALESCE(lab_planned, 0),
        COALESCE(lab_real, 0),
        COALESCE(eff_score, 100);
END;
$function$;

-- Criar função para obter tarefas com maiores desvios
CREATE OR REPLACE FUNCTION public.get_top_deviation_tasks(project_id integer, limit_count integer DEFAULT 10)
RETURNS TABLE(
    task_id integer,
    descricao text,
    responsavel text,
    custo_planejado numeric,
    gasto_real numeric,
    desvio_orcamentario numeric,
    desvio_percentual numeric,
    tempo_previsto integer,
    tempo_real integer,
    desvio_temporal integer,
    status text
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.descricao,
        t.responsavel,
        (t.custo_material + t.custo_mao_obra)::NUMERIC as custo_planejado,
        t.gasto_real,
        (t.gasto_real - (t.custo_material + t.custo_mao_obra))::NUMERIC as desvio_orcamentario,
        CASE 
            WHEN (t.custo_material + t.custo_mao_obra) > 0 
            THEN ((t.gasto_real - (t.custo_material + t.custo_mao_obra)) / (t.custo_material + t.custo_mao_obra) * 100)
            ELSE 0 
        END::NUMERIC as desvio_percentual,
        EXTRACT(DAY FROM (t.prazo - CURRENT_DATE))::INTEGER as tempo_previsto,
        t.tempo_real_dias,
        (t.tempo_real_dias - EXTRACT(DAY FROM (t.prazo - CURRENT_DATE)))::INTEGER as desvio_temporal,
        t.status::TEXT
    FROM tarefas_lean t
    WHERE t.id_projeto = project_id
        AND t.gasto_real > 0
    ORDER BY ABS(t.gasto_real - (t.custo_material + t.custo_mao_obra)) DESC
    LIMIT limit_count;
END;
$function$;