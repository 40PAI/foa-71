-- Corrigir detect_financial_discrepancies e calculate_integrated_financial_progress
-- para usar valores correctos do enum status_fluxo
-- Valores válidos: 'Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção', 
-- 'OC Gerada', 'Recepcionado', 'Liquidado', 'Rejeitado'
-- Requisições "aprovadas" = status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')

DROP FUNCTION IF EXISTS detect_financial_discrepancies(integer);

CREATE OR REPLACE FUNCTION detect_financial_discrepancies(p_project_id INTEGER)
RETURNS TABLE (
  categoria TEXT,
  gasto_manual NUMERIC,
  gasto_calculado NUMERIC,
  discrepancia NUMERIC,
  percentual_discrepancia NUMERIC,
  fontes TEXT[]
) AS $$
DECLARE
  categorias_padrao TEXT[] := ARRAY['Materiais', 'Mao de Obra', 'Patrimonio', 'Custos Indiretos', 'Seguranca e Higiene', 'Transporte', 'Servicos', 'Outros'];
  cat TEXT;
  v_gasto_manual NUMERIC;
  v_gasto_calculado NUMERIC;
  v_mov_fin NUMERIC;
  v_req NUMERIC;
  v_gastos_det NUMERIC;
  v_fontes TEXT[];
BEGIN
  FOREACH cat IN ARRAY categorias_padrao LOOP
    -- Gasto manual da tabela financas
    SELECT COALESCE(SUM(f.gasto), 0)
    INTO v_gasto_manual
    FROM financas f
    WHERE f.id_projeto = p_project_id 
      AND normalize_financial_category(f.categoria) = cat;

    -- Gastos de movimentos_financeiros (saídas = tipo_movimento = 'saida')
    SELECT COALESCE(SUM(ABS(m.valor)), 0)
    INTO v_mov_fin
    FROM movimentos_financeiros m
    WHERE m.projeto_id = p_project_id 
      AND m.tipo_movimento = 'saida'
      AND normalize_financial_category(m.categoria) = cat;

    -- Gastos de requisições aprovadas (usando status_fluxo correcto)
    -- OC Gerada, Recepcionado, Liquidado = requisições aprovadas/processadas
    SELECT COALESCE(SUM(r.valor), 0)
    INTO v_req
    FROM requisicoes r
    WHERE r.id_projeto = p_project_id 
      AND r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
      AND normalize_financial_category(r.categoria_principal::text) = cat;

    -- Gastos detalhados aprovados
    SELECT COALESCE(SUM(g.valor), 0)
    INTO v_gastos_det
    FROM gastos_detalhados g
    WHERE g.projeto_id = p_project_id 
      AND g.status_aprovacao = 'aprovado'
      AND normalize_financial_category(g.categoria_gasto) = cat;

    -- Calcular total calculado
    v_gasto_calculado := v_mov_fin + v_req + v_gastos_det;

    -- Identificar fontes que contribuíram
    v_fontes := ARRAY[]::TEXT[];
    IF v_mov_fin > 0 THEN v_fontes := v_fontes || 'movimentos_financeiros'; END IF;
    IF v_req > 0 THEN v_fontes := v_fontes || 'requisicoes'; END IF;
    IF v_gastos_det > 0 THEN v_fontes := v_fontes || 'gastos_detalhados'; END IF;

    -- Só retornar se houver algum valor
    IF v_gasto_manual > 0 OR v_gasto_calculado > 0 THEN
      RETURN QUERY SELECT 
        cat,
        v_gasto_manual,
        v_gasto_calculado,
        v_gasto_calculado - v_gasto_manual,
        CASE WHEN v_gasto_manual > 0 
          THEN ROUND(((v_gasto_calculado - v_gasto_manual) / v_gasto_manual) * 100, 2)
          ELSE CASE WHEN v_gasto_calculado > 0 THEN 100.00 ELSE 0 END
        END,
        v_fontes;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir calculate_integrated_financial_progress
DROP FUNCTION IF EXISTS calculate_integrated_financial_progress(integer);

CREATE OR REPLACE FUNCTION calculate_integrated_financial_progress(p_project_id INTEGER)
RETURNS TABLE (
  total_budget NUMERIC,
  material_expenses NUMERIC,
  payroll_expenses NUMERIC,
  patrimony_expenses NUMERIC,
  indirect_expenses NUMERIC,
  total_expenses NUMERIC,
  financial_progress NUMERIC,
  task_material_cost NUMERIC,
  task_labor_cost NUMERIC,
  task_real_expenses NUMERIC
) AS $$
DECLARE
  v_total_budget NUMERIC := 0;
  v_material_expenses NUMERIC := 0;
  v_payroll_expenses NUMERIC := 0;
  v_patrimony_expenses NUMERIC := 0;
  v_indirect_expenses NUMERIC := 0;
  v_other_expenses NUMERIC := 0;
  v_task_material_cost NUMERIC := 0;
  v_task_labor_cost NUMERIC := 0;
  v_task_real_expenses NUMERIC := 0;
BEGIN
  -- Buscar orçamento total do projeto
  SELECT COALESCE(p.orcamento_total, 0)
  INTO v_total_budget
  FROM projetos p
  WHERE p.id = p_project_id;

  -- Agregar gastos de movimentos_financeiros por categoria normalizada
  SELECT 
    COALESCE(SUM(CASE WHEN normalize_financial_category(m.categoria) = 'Materiais' THEN ABS(m.valor) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(m.categoria) = 'Mao de Obra' THEN ABS(m.valor) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(m.categoria) = 'Patrimonio' THEN ABS(m.valor) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(m.categoria) = 'Custos Indiretos' THEN ABS(m.valor) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(m.categoria) NOT IN ('Materiais', 'Mao de Obra', 'Patrimonio', 'Custos Indiretos') THEN ABS(m.valor) ELSE 0 END), 0)
  INTO v_material_expenses, v_payroll_expenses, v_patrimony_expenses, v_indirect_expenses, v_other_expenses
  FROM movimentos_financeiros m
  WHERE m.projeto_id = p_project_id AND m.tipo_movimento = 'saida';

  -- Adicionar gastos de requisições aprovadas (usando status_fluxo correcto)
  SELECT 
    v_material_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(r.categoria_principal::text) = 'Materiais' THEN r.valor ELSE 0 END), 0),
    v_patrimony_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(r.categoria_principal::text) = 'Patrimonio' THEN r.valor ELSE 0 END), 0)
  INTO v_material_expenses, v_patrimony_expenses
  FROM requisicoes r
  WHERE r.id_projeto = p_project_id AND r.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado');

  -- Adicionar gastos detalhados
  SELECT 
    v_material_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(g.categoria_gasto) = 'Materiais' THEN g.valor ELSE 0 END), 0),
    v_payroll_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(g.categoria_gasto) = 'Mao de Obra' THEN g.valor ELSE 0 END), 0),
    v_patrimony_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(g.categoria_gasto) = 'Patrimonio' THEN g.valor ELSE 0 END), 0),
    v_indirect_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(g.categoria_gasto) = 'Custos Indiretos' THEN g.valor ELSE 0 END), 0)
  INTO v_material_expenses, v_payroll_expenses, v_patrimony_expenses, v_indirect_expenses
  FROM gastos_detalhados g
  WHERE g.projeto_id = p_project_id AND g.status_aprovacao = 'aprovado';

  -- Buscar custos de tarefas
  SELECT 
    COALESCE(SUM(t.custo_material), 0),
    COALESCE(SUM(t.custo_mao_obra), 0),
    COALESCE(SUM(t.gasto_real), 0)
  INTO v_task_material_cost, v_task_labor_cost, v_task_real_expenses
  FROM tarefas_lean t
  WHERE t.projeto_id = p_project_id AND COALESCE(t.percentual_conclusao, 0) >= 1;

  RETURN QUERY SELECT 
    v_total_budget,
    v_material_expenses,
    v_payroll_expenses,
    v_patrimony_expenses,
    v_indirect_expenses,
    v_material_expenses + v_payroll_expenses + v_patrimony_expenses + v_indirect_expenses + v_other_expenses,
    CASE WHEN v_total_budget > 0 
      THEN ROUND(((v_material_expenses + v_payroll_expenses + v_patrimony_expenses + v_indirect_expenses + v_other_expenses) / v_total_budget) * 100, 2)
      ELSE 0 
    END,
    v_task_material_cost,
    v_task_labor_cost,
    v_task_real_expenses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;