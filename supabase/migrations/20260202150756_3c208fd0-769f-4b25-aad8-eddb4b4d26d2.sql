-- ============================================
-- FASE 1 & 4: Corrigir Funções RPC e Sincronização
-- ============================================

-- Primeiro, remover as funções existentes para poder recriá-las
DROP FUNCTION IF EXISTS calculate_integrated_financial_progress(integer);
DROP FUNCTION IF EXISTS update_project_metrics_with_integrated_finance(integer);
DROP FUNCTION IF EXISTS sync_all_project_metrics();

-- Corrigir a função calculate_integrated_financial_progress
-- Alterações: p.orcamento_total -> p.orcamento
CREATE OR REPLACE FUNCTION calculate_integrated_financial_progress(p_projeto_id integer)
RETURNS TABLE(
  total_gasto numeric,
  percentual_progresso numeric,
  orcamento_total numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_orcamento numeric;
  v_gasto_movimentos numeric;
  v_total_gasto numeric;
  v_percentual numeric;
BEGIN
  -- Obter orçamento do projeto (coluna correta: orcamento)
  SELECT COALESCE(p.orcamento, 0) INTO v_orcamento
  FROM projetos p
  WHERE p.id = p_projeto_id;

  -- Agregar gastos de movimentos_financeiros (saídas)
  SELECT COALESCE(SUM(m.valor), 0) INTO v_gasto_movimentos
  FROM movimentos_financeiros m
  WHERE m.projeto_id = p_projeto_id
    AND m.tipo_movimento = 'saida';

  -- Calcular total (usar movimentos como fonte primária)
  v_total_gasto := v_gasto_movimentos;

  -- Calcular percentual
  IF v_orcamento > 0 THEN
    v_percentual := ROUND((v_total_gasto / v_orcamento) * 100, 2);
  ELSE
    v_percentual := 0;
  END IF;

  RETURN QUERY SELECT v_total_gasto, v_percentual, v_orcamento;
END;
$$;

-- Corrigir função update_project_metrics_with_integrated_finance
-- Correção: usar id_projeto em vez de projeto_id para tarefas_lean
CREATE OR REPLACE FUNCTION update_project_metrics_with_integrated_finance(p_projeto_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_tarefas integer;
  v_tarefas_concluidas integer;
  v_avanco_fisico integer;
  v_avanco_financeiro numeric;
BEGIN
  -- Calcular avanço físico (tarefas concluídas / total)
  -- Correção: usar id_projeto em vez de projeto_id
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'Concluído')
  INTO v_total_tarefas, v_tarefas_concluidas
  FROM tarefas_lean t
  WHERE t.id_projeto = p_projeto_id;

  IF v_total_tarefas > 0 THEN
    v_avanco_fisico := ROUND((v_tarefas_concluidas::numeric / v_total_tarefas) * 100);
  ELSE
    v_avanco_fisico := 0;
  END IF;

  -- Calcular avanço financeiro usando a função corrigida
  SELECT percentual_progresso INTO v_avanco_financeiro
  FROM calculate_integrated_financial_progress(p_projeto_id);

  -- Atualizar dashboard_kpis (usar UPDATE pois a constraint única pode não existir)
  UPDATE dashboard_kpis
  SET 
    avanco_fisico_real = v_avanco_fisico,
    avanco_financeiro_real = COALESCE(v_avanco_financeiro, 0),
    data_calculo = CURRENT_DATE,
    updated_at = now()
  WHERE projeto_id = p_projeto_id;

  -- Se não existir, inserir
  IF NOT FOUND THEN
    INSERT INTO dashboard_kpis (
      projeto_id,
      avanco_fisico_real,
      avanco_financeiro_real,
      data_calculo
    ) VALUES (
      p_projeto_id,
      v_avanco_fisico,
      COALESCE(v_avanco_financeiro, 0),
      CURRENT_DATE
    );
  END IF;
END;
$$;

-- Criar função de sincronização em massa
CREATE OR REPLACE FUNCTION sync_all_project_metrics()
RETURNS TABLE(projeto_id integer, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p_rec RECORD;
BEGIN
  FOR p_rec IN SELECT id FROM projetos WHERE status != 'Cancelado' LOOP
    BEGIN
      PERFORM update_project_metrics_with_integrated_finance(p_rec.id);
      RETURN QUERY SELECT p_rec.id, 'success'::text;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT p_rec.id, ('error: ' || SQLERRM)::text;
    END;
  END LOOP;
END;
$$;