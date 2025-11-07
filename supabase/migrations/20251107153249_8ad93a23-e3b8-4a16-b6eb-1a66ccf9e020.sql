-- Drop existing function
DROP FUNCTION IF EXISTS public.calculate_integrated_financial_progress(integer);

-- Create updated function with Centro de Custos integration
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
    -- NOVO: Variáveis para centro de custos
    centro_custo_materials NUMERIC;
    centro_custo_payroll NUMERIC;
    centro_custo_patrimony NUMERIC;
    centro_custo_indirect NUMERIC;
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
    
    -- Calcular custos de tarefas (APENAS COM PROGRESSO >= 1%)
    SELECT 
        COALESCE(SUM(custo_material), 0),
        COALESCE(SUM(custo_mao_obra), 0),
        COALESCE(SUM(gasto_real), 0)
    INTO task_materials, task_labor, task_real
    FROM tarefas_lean
    WHERE id_projeto = project_id
      AND percentual_conclusao >= 1;
    
    -- *** NOVO: Buscar gastos dos movimentos financeiros (Centro de Custos) ***
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
    
    -- *** NOVO: Integrar gastos do centro de custos com outras fontes ***
    materials_cost := materials_cost + centro_custo_materials;
    payroll_cost := payroll_cost + centro_custo_payroll;
    patrimony_cost := patrimony_cost + centro_custo_patrimony;
    indirect_cost := indirect_cost + centro_custo_indirect;
    
    -- Combinar custos: usar o maior entre fontes
    materials_cost := GREATEST(materials_cost, task_materials);
    payroll_cost := GREATEST(payroll_cost, task_labor);
    
    -- Calcular total de gastos
    total_cost := materials_cost + payroll_cost + patrimony_cost + indirect_cost;
    
    -- Calcular percentual de progresso
    IF project_budget > 0 THEN
        progress_percentage := (total_cost / project_budget) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Log para debug
    RAISE NOTICE 'Centro Custos - Materials: %, Payroll: %, Patrimony: %, Indirect: %', 
        centro_custo_materials, centro_custo_payroll, centro_custo_patrimony, centro_custo_indirect;
    
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