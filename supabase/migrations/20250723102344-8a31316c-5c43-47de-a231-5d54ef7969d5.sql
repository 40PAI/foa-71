
-- Corrigir a função calculate_material_expenses para incluir 'OC Gerada' como gasto executado
CREATE OR REPLACE FUNCTION calculate_material_expenses(project_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total_materials NUMERIC := 0;
BEGIN
    -- Somar valores de requisições com status que representam gastos executados/comprometidos
    SELECT COALESCE(SUM(valor), 0) INTO total_materials
    FROM requisicoes
    WHERE id_projeto = project_id
      AND status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado');
    
    RETURN total_materials;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a função update_project_metrics_with_integrated_finance está usando o cálculo correto
CREATE OR REPLACE FUNCTION update_project_metrics_with_integrated_finance(project_id INTEGER)
RETURNS VOID AS $$
DECLARE
    projeto RECORD;
    physical_progress INTEGER;
    financial_result RECORD;
    temporal_progress INTEGER;
BEGIN
    -- Buscar projeto
    SELECT * INTO projeto FROM projetos WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calcular avanço físico
    physical_progress := calculate_project_physical_progress(project_id);
    
    -- Calcular avanço financeiro integrado
    SELECT * INTO financial_result
    FROM calculate_integrated_financial_progress(project_id);
    
    -- Calcular avanço temporal
    temporal_progress := calculate_temporal_progress(project_id, projeto.metodo_calculo_temporal);
    
    -- Atualizar projeto com valores corretos
    UPDATE projetos
    SET 
        avanco_fisico = physical_progress,
        avanco_financeiro = ROUND(financial_result.financial_progress),
        avanco_tempo = temporal_progress,
        gasto = financial_result.total_expenses,
        updated_at = NOW()
    WHERE id = project_id;
    
    -- Log para debug
    RAISE NOTICE 'Projeto % atualizado: Físico=%, Financeiro=%, Temporal=%, Gasto=%', 
        project_id, physical_progress, ROUND(financial_result.financial_progress), temporal_progress, financial_result.total_expenses;
END;
$$ LANGUAGE plpgsql;

-- Atualizar a função detect_financial_discrepancies para refletir a nova lógica
CREATE OR REPLACE FUNCTION detect_financial_discrepancies(project_id INTEGER)
RETURNS TABLE (
  categoria TEXT,
  gasto_manual NUMERIC,
  gasto_calculado NUMERIC,
  discrepancia NUMERIC,
  percentual_discrepancia NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.categoria,
    COALESCE(f.gasto, 0)::NUMERIC as gasto_manual,
    COALESCE(r.total_gasto, 0)::NUMERIC as gasto_calculado,
    (COALESCE(f.gasto, 0) - COALESCE(r.total_gasto, 0))::NUMERIC as discrepancia,
    CASE 
      WHEN COALESCE(f.gasto, 0) > 0 THEN 
        (ABS(COALESCE(f.gasto, 0) - COALESCE(r.total_gasto, 0)) / COALESCE(f.gasto, 0) * 100)::NUMERIC
      ELSE 0 
    END as percentual_discrepancia
  FROM financas f
  FULL OUTER JOIN (
    SELECT 
      map_categoria_principal_to_financas(categoria_principal) as categoria,
      SUM(valor)::NUMERIC as total_gasto
    FROM requisicoes 
    WHERE id_projeto = project_id 
      AND status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
    GROUP BY map_categoria_principal_to_financas(categoria_principal)
  ) r ON f.categoria = r.categoria
  WHERE f.id_projeto = project_id OR r.categoria IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
