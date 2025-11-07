-- Fix NULL handling in calculate_integrated_financial_progress
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
    materials_cost NUMERIC := 0;
    payroll_cost NUMERIC := 0;
    patrimony_cost NUMERIC := 0;
    indirect_cost NUMERIC := 0;
    total_cost NUMERIC := 0;
    progress_percentage NUMERIC := 0;
    task_materials NUMERIC := 0;
    task_labor NUMERIC := 0;
    task_real NUMERIC := 0;
    centro_custo_materials NUMERIC := 0;
    centro_custo_payroll NUMERIC := 0;
    centro_custo_patrimony NUMERIC := 0;
    centro_custo_indirect NUMERIC := 0;
BEGIN
    -- Obter orçamento do projeto
    SELECT orcamento INTO project_budget
    FROM projetos
    WHERE id = project_id;
    
    -- Calcular custos de materiais (requisições) - garantir que não seja NULL
    materials_cost := COALESCE(calculate_material_expenses(project_id), 0);
    
    -- Calcular custos de mão de obra (ponto diário) - garantir que não seja NULL
    payroll_cost := COALESCE(calculate_payroll_expenses(project_id), 0);
    
    -- Calcular custos de patrimônio - garantir que não seja NULL
    patrimony_cost := COALESCE(calculate_patrimony_expenses(project_id), 0);
    
    -- Calcular custos de tarefas (APENAS COM PROGRESSO >= 1%)
    SELECT 
        COALESCE(SUM(custo_material), 0),
        COALESCE(SUM(custo_mao_obra), 0),
        COALESCE(SUM(gasto_real), 0)
    INTO task_materials, task_labor, task_real
    FROM tarefas_lean
    WHERE id_projeto = project_id
      AND percentual_conclusao >= 1;
    
    -- Buscar gastos dos movimentos financeiros (Centro de Custos)
    SELECT 
        COALESCE(SUM(CASE 
            WHEN LOWER(categoria) LIKE '%material%' OR LOWER(categoria) LIKE '%materiais%' THEN valor 
            ELSE 0 
        END), 0),
        COALESCE(SUM(CASE 
            WHEN LOWER(categoria) LIKE '%mão%' OR LOWER(categoria) LIKE '%mao%' OR LOWER(categoria) LIKE '%obra%' THEN valor 
            ELSE 0 
        END), 0),
        COALESCE(SUM(CASE 
            WHEN LOWER(categoria) LIKE '%patrimônio%' OR LOWER(categoria) LIKE '%patrimonio%' OR LOWER(categoria) LIKE '%equipamento%' THEN valor 
            ELSE 0 
        END), 0),
        COALESCE(SUM(CASE 
            WHEN LOWER(categoria) LIKE '%indireto%' OR LOWER(categoria) LIKE '%custo%' THEN valor 
            ELSE 0 
        END), 0)
    INTO centro_custo_materials, centro_custo_payroll, centro_custo_patrimony, centro_custo_indirect
    FROM movimentos_financeiros
    WHERE projeto_id = project_id
        AND tipo_movimento = 'saida'
        AND status_aprovacao = 'aprovado';
    
    -- Integrar gastos do centro de custos com outras fontes
    materials_cost := COALESCE(materials_cost, 0) + COALESCE(centro_custo_materials, 0);
    payroll_cost := COALESCE(payroll_cost, 0) + COALESCE(centro_custo_payroll, 0);
    patrimony_cost := COALESCE(patrimony_cost, 0) + COALESCE(centro_custo_patrimony, 0);
    indirect_cost := COALESCE(indirect_cost, 0) + COALESCE(centro_custo_indirect, 0);
    
    -- Combinar custos: usar o maior entre fontes
    materials_cost := GREATEST(COALESCE(materials_cost, 0), COALESCE(task_materials, 0));
    payroll_cost := GREATEST(COALESCE(payroll_cost, 0), COALESCE(task_labor, 0));
    
    -- Calcular total de gastos com proteção contra NULL
    total_cost := COALESCE(materials_cost, 0) + COALESCE(payroll_cost, 0) + 
                  COALESCE(patrimony_cost, 0) + COALESCE(indirect_cost, 0);
    
    -- Calcular percentual de progresso
    IF COALESCE(project_budget, 0) > 0 THEN
        progress_percentage := (total_cost / project_budget) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Log para debug
    RAISE NOTICE 'Total Cost Calculation: Materials=%, Payroll=%, Patrimony=%, Indirect=%, TOTAL=%', 
        materials_cost, payroll_cost, patrimony_cost, indirect_cost, total_cost;
    
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