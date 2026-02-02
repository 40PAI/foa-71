-- ================================================================
-- FASE 1: CORRIGIR SISTEMA DE AUDITORIA E DISCREPÂNCIAS FINANCEIRAS
-- ================================================================

-- 1. Dropar funções existentes com problemas
DROP FUNCTION IF EXISTS calculate_integrated_financial_progress(integer);
DROP FUNCTION IF EXISTS map_categoria_principal_to_financas(text);
DROP FUNCTION IF EXISTS detect_financial_discrepancies(integer);
DROP FUNCTION IF EXISTS get_detailed_expense_breakdown(integer);

-- 2. Criar função de normalização de categorias (unificada e robusta)
CREATE OR REPLACE FUNCTION normalize_financial_category(categoria TEXT)
RETURNS TEXT AS $$
BEGIN
  IF categoria IS NULL THEN
    RETURN 'Outros';
  END IF;
  
  RETURN CASE 
    WHEN categoria ILIKE '%material%' OR categoria ILIKE '%construc%' THEN 'Materiais'
    WHEN categoria ILIKE '%mao%' OR categoria ILIKE '%mão%' 
         OR categoria ILIKE '%obra%' OR categoria ILIKE '%labor%'
         OR categoria ILIKE '%salario%' OR categoria ILIKE '%salário%' THEN 'Mao de Obra'
    WHEN categoria ILIKE '%patrimonio%' OR categoria ILIKE '%patrimônio%'
         OR categoria ILIKE '%equipamento%' OR categoria ILIKE '%ativo%'
         OR categoria ILIKE '%maquina%' OR categoria ILIKE '%máquina%' THEN 'Patrimonio'
    WHEN categoria ILIKE '%indireto%' OR categoria ILIKE '%custo%ind%'
         OR categoria ILIKE '%administrativo%' OR categoria ILIKE '%overhead%' THEN 'Custos Indiretos'
    WHEN categoria ILIKE '%seguranca%' OR categoria ILIKE '%segurança%'
         OR categoria ILIKE '%higiene%' OR categoria ILIKE '%epi%' THEN 'Seguranca e Higiene'
    WHEN categoria ILIKE '%transporte%' OR categoria ILIKE '%logistic%' THEN 'Transporte'
    WHEN categoria ILIKE '%servico%' OR categoria ILIKE '%serviço%' THEN 'Servicos'
    ELSE 'Outros'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Função de mapeamento de categorias (wrapper para compatibilidade)
CREATE OR REPLACE FUNCTION map_categoria_principal_to_financas(categoria TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN normalize_financial_category(categoria);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Recriar calculate_integrated_financial_progress (corrigido)
CREATE OR REPLACE FUNCTION calculate_integrated_financial_progress(project_id INTEGER)
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
  WHERE p.id = project_id;

  -- Agregar gastos de movimentos_financeiros por categoria normalizada
  SELECT 
    COALESCE(SUM(CASE WHEN normalize_financial_category(categoria) = 'Materiais' THEN ABS(saida) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(categoria) = 'Mao de Obra' THEN ABS(saida) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(categoria) = 'Patrimonio' THEN ABS(saida) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(categoria) = 'Custos Indiretos' THEN ABS(saida) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN normalize_financial_category(categoria) NOT IN ('Materiais', 'Mao de Obra', 'Patrimonio', 'Custos Indiretos') THEN ABS(saida) ELSE 0 END), 0)
  INTO v_material_expenses, v_payroll_expenses, v_patrimony_expenses, v_indirect_expenses, v_other_expenses
  FROM movimentos_financeiros
  WHERE projeto_id = project_id AND tipo_movimento = 'saida';

  -- Adicionar gastos de requisições aprovadas
  SELECT 
    v_material_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(categoria::text) = 'Materiais' THEN valor_total ELSE 0 END), 0),
    v_patrimony_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(categoria::text) = 'Patrimonio' THEN valor_total ELSE 0 END), 0)
  INTO v_material_expenses, v_patrimony_expenses
  FROM requisicoes
  WHERE projeto_id = project_id AND status = 'Aprovado';

  -- Adicionar gastos detalhados
  SELECT 
    v_material_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(categoria_gasto) = 'Materiais' THEN valor ELSE 0 END), 0),
    v_payroll_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(categoria_gasto) = 'Mao de Obra' THEN valor ELSE 0 END), 0),
    v_patrimony_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(categoria_gasto) = 'Patrimonio' THEN valor ELSE 0 END), 0),
    v_indirect_expenses + COALESCE(SUM(CASE WHEN normalize_financial_category(categoria_gasto) = 'Custos Indiretos' THEN valor ELSE 0 END), 0)
  INTO v_material_expenses, v_payroll_expenses, v_patrimony_expenses, v_indirect_expenses
  FROM gastos_detalhados
  WHERE projeto_id = project_id AND status_aprovacao = 'aprovado';

  -- Buscar custos de tarefas (usando percentual_conclusao - CORRIGIDO)
  SELECT 
    COALESCE(SUM(custo_material), 0),
    COALESCE(SUM(custo_mao_obra), 0),
    COALESCE(SUM(gasto_real), 0)
  INTO v_task_material_cost, v_task_labor_cost, v_task_real_expenses
  FROM tarefas_lean
  WHERE projeto_id = project_id AND COALESCE(percentual_conclusao, 0) >= 1;

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

-- 5. Recriar detect_financial_discrepancies (agregando TODAS as fontes)
CREATE OR REPLACE FUNCTION detect_financial_discrepancies(project_id INTEGER)
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
    SELECT COALESCE(SUM(gasto), 0)
    INTO v_gasto_manual
    FROM financas
    WHERE id_projeto = project_id 
      AND normalize_financial_category(categoria) = cat;

    -- Gastos de movimentos_financeiros
    SELECT COALESCE(SUM(ABS(saida)), 0)
    INTO v_mov_fin
    FROM movimentos_financeiros
    WHERE projeto_id = project_id 
      AND tipo_movimento = 'saida'
      AND normalize_financial_category(categoria) = cat;

    -- Gastos de requisições aprovadas
    SELECT COALESCE(SUM(valor_total), 0)
    INTO v_req
    FROM requisicoes
    WHERE projeto_id = project_id 
      AND status = 'Aprovado'
      AND normalize_financial_category(categoria::text) = cat;

    -- Gastos detalhados aprovados
    SELECT COALESCE(SUM(valor), 0)
    INTO v_gastos_det
    FROM gastos_detalhados
    WHERE projeto_id = project_id 
      AND status_aprovacao = 'aprovado'
      AND normalize_financial_category(categoria_gasto) = cat;

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

-- 6. Recriar get_detailed_expense_breakdown
CREATE OR REPLACE FUNCTION get_detailed_expense_breakdown(project_id INTEGER)
RETURNS TABLE (
  categoria TEXT,
  valor_calculado NUMERIC,
  valor_manual NUMERIC,
  discrepancia NUMERIC,
  percentual_orcamento NUMERIC
) AS $$
DECLARE
  v_total_budget NUMERIC := 0;
BEGIN
  -- Buscar orçamento total
  SELECT COALESCE(orcamento_total, 0)
  INTO v_total_budget
  FROM projetos
  WHERE id = project_id;

  RETURN QUERY
  SELECT 
    d.categoria,
    d.gasto_calculado AS valor_calculado,
    d.gasto_manual AS valor_manual,
    d.discrepancia,
    CASE WHEN v_total_budget > 0 
      THEN ROUND((d.gasto_calculado / v_total_budget) * 100, 2)
      ELSE 0 
    END AS percentual_orcamento
  FROM detect_financial_discrepancies(project_id) d
  ORDER BY d.gasto_calculado DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;