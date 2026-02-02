-- Corrigir ambiguidade de colunas na função detect_financial_discrepancies
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

    -- Gastos de movimentos_financeiros
    SELECT COALESCE(SUM(ABS(m.saida)), 0)
    INTO v_mov_fin
    FROM movimentos_financeiros m
    WHERE m.projeto_id = p_project_id 
      AND m.tipo_movimento = 'saida'
      AND normalize_financial_category(m.categoria) = cat;

    -- Gastos de requisições aprovadas
    SELECT COALESCE(SUM(r.valor_total), 0)
    INTO v_req
    FROM requisicoes r
    WHERE r.projeto_id = p_project_id 
      AND r.status = 'Aprovado'
      AND normalize_financial_category(r.categoria::text) = cat;

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

-- Actualizar get_detailed_expense_breakdown para usar o novo nome do parâmetro
DROP FUNCTION IF EXISTS get_detailed_expense_breakdown(integer);

CREATE OR REPLACE FUNCTION get_detailed_expense_breakdown(p_project_id INTEGER)
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
  WHERE id = p_project_id;

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
  FROM detect_financial_discrepancies(p_project_id) d
  ORDER BY d.gasto_calculado DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;