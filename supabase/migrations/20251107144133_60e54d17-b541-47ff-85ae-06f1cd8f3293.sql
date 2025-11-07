
-- Função para zerar custos de um projeto específico
CREATE OR REPLACE FUNCTION public.zerar_custos_projeto(p_projeto_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tarefas_atualizadas INTEGER;
  financas_atualizadas INTEGER;
  resultado JSON;
BEGIN
  -- Zerar custos das tarefas
  UPDATE tarefas_lean
  SET 
    custo_material = 0,
    custo_mao_obra = 0,
    gasto_real = 0,
    updated_at = NOW()
  WHERE id_projeto = p_projeto_id;
  
  GET DIAGNOSTICS tarefas_atualizadas = ROW_COUNT;
  
  -- Zerar gastos em financas
  UPDATE financas
  SET 
    gasto = 0,
    updated_at = NOW()
  WHERE id_projeto = p_projeto_id;
  
  GET DIAGNOSTICS financas_atualizadas = ROW_COUNT;
  
  -- Atualizar projeto
  UPDATE projetos
  SET 
    gasto = 0,
    avanco_financeiro = 0,
    updated_at = NOW()
  WHERE id = p_projeto_id;
  
  -- Retornar resultado
  resultado := json_build_object(
    'success', TRUE,
    'projeto_id', p_projeto_id,
    'tarefas_atualizadas', tarefas_atualizadas,
    'financas_atualizadas', financas_atualizadas,
    'message', 'Custos zerados com sucesso'
  );
  
  RETURN resultado;
  
EXCEPTION WHEN OTHERS THEN
  resultado := json_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'message', 'Erro ao zerar custos'
  );
  
  RETURN resultado;
END;
$$;
