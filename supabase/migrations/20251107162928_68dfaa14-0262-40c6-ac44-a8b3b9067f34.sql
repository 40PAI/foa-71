-- Drop and recreate calculate_integrated_financial_progress to include ALL outbound movements
-- This aligns with the Centro de Custos calculation

DROP FUNCTION IF EXISTS public.calculate_integrated_financial_progress(integer);

CREATE OR REPLACE FUNCTION public.calculate_integrated_financial_progress(project_id integer)
 RETURNS TABLE(
   total_budget numeric,
   material_expenses numeric,
   payroll_expenses numeric,
   patrimony_expenses numeric,
   indirect_expenses numeric,
   total_expenses numeric,
   financial_progress numeric
 )
 LANGUAGE plpgsql
AS $function$
DECLARE
    budget_value NUMERIC;
    mat_expenses NUMERIC := 0;
    pay_expenses NUMERIC := 0;
    pat_expenses NUMERIC := 0;
    ind_expenses NUMERIC := 0;
    total_exp NUMERIC := 0;
    fin_progress NUMERIC := 0;
BEGIN
    -- Get project budget
    SELECT COALESCE(orcamento, 0) INTO budget_value
    FROM projetos
    WHERE id = project_id;
    
    -- Calculate material expenses from multiple sources
    -- Source 1: Financial movements (Centro de Custos) - ALL movements, not just approved
    SELECT COALESCE(SUM(mf.valor), 0) INTO mat_expenses
    FROM movimentos_financeiros mf
    WHERE mf.projeto_id = project_id
        AND mf.tipo_movimento = 'saida'
        AND mf.categoria IN ('material', 'Material', 'Materiais', 'Materiais de Construção');
    
    -- Source 2: Approved/Liquidated requisitions for materials
    mat_expenses := GREATEST(mat_expenses, COALESCE((
        SELECT SUM(r.valor)
        FROM requisicoes r
        WHERE r.id_projeto = project_id
            AND r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
            AND r.categoria_principal = 'Material'
    ), 0));
    
    -- Source 3: Tasks with material costs (only if progress >= 1%)
    mat_expenses := GREATEST(mat_expenses, COALESCE((
        SELECT SUM(t.custo_material)
        FROM tarefas_lean t
        WHERE t.id_projeto = project_id
            AND COALESCE(t.progresso, 0) >= 1
    ), 0));
    
    -- Calculate payroll expenses
    -- Source 1: Financial movements - ALL movements
    SELECT COALESCE(SUM(mf.valor), 0) INTO pay_expenses
    FROM movimentos_financeiros mf
    WHERE mf.projeto_id = project_id
        AND mf.tipo_movimento = 'saida'
        AND mf.categoria IN ('mao_obra', 'Mão de Obra', 'Mao de Obra');
    
    -- Source 2: Approved/Liquidated requisitions for labor
    pay_expenses := GREATEST(pay_expenses, COALESCE((
        SELECT SUM(r.valor)
        FROM requisicoes r
        WHERE r.id_projeto = project_id
            AND r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
            AND r.categoria_principal = 'Mão de Obra'
    ), 0));
    
    -- Source 3: Tasks with labor costs (only if progress >= 1%)
    pay_expenses := GREATEST(pay_expenses, COALESCE((
        SELECT SUM(t.custo_mao_obra)
        FROM tarefas_lean t
        WHERE t.id_projeto = project_id
            AND COALESCE(t.progresso, 0) >= 1
    ), 0));
    
    -- Calculate patrimony expenses
    -- Source 1: Financial movements - ALL movements
    SELECT COALESCE(SUM(mf.valor), 0) INTO pat_expenses
    FROM movimentos_financeiros mf
    WHERE mf.projeto_id = project_id
        AND mf.tipo_movimento = 'saida'
        AND mf.categoria IN ('patrimonio', 'Patrimônio', 'Equipamentos');
    
    -- Source 2: Approved/Liquidated requisitions for patrimony
    pat_expenses := GREATEST(pat_expenses, COALESCE((
        SELECT SUM(r.valor)
        FROM requisicoes r
        WHERE r.id_projeto = project_id
            AND r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
            AND r.categoria_principal = 'Património'
    ), 0));
    
    -- Calculate indirect expenses
    -- Source 1: Financial movements - ALL movements
    SELECT COALESCE(SUM(mf.valor), 0) INTO ind_expenses
    FROM movimentos_financeiros mf
    WHERE mf.projeto_id = project_id
        AND mf.tipo_movimento = 'saida'
        AND mf.categoria IN ('indireto', 'Custos Indiretos', 'Indiretos');
    
    -- Source 2: Approved/Liquidated requisitions for indirect costs
    ind_expenses := GREATEST(ind_expenses, COALESCE((
        SELECT SUM(r.valor)
        FROM requisicoes r
        WHERE r.id_projeto = project_id
            AND r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
            AND r.categoria_principal = 'Custos Indiretos'
    ), 0));
    
    -- Calculate totals
    total_exp := mat_expenses + pay_expenses + pat_expenses + ind_expenses;
    
    -- Calculate financial progress percentage
    IF budget_value > 0 THEN
        fin_progress := (total_exp / budget_value) * 100;
    ELSE
        fin_progress := 0;
    END IF;
    
    -- Return results
    RETURN QUERY SELECT
        budget_value,
        mat_expenses,
        pay_expenses,
        pat_expenses,
        ind_expenses,
        total_exp,
        fin_progress;
END;
$function$;