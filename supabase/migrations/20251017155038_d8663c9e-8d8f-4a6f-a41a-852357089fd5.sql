-- Recriar a função delete_project_safely com lógica completa e robusta
CREATE OR REPLACE FUNCTION delete_project_safely(project_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    rows_deleted INTEGER := 0;
BEGIN
    -- PASSO 1: Desabilitar triggers problemáticos
    BEGIN
        EXECUTE 'ALTER TABLE requisicoes DISABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
        EXECUTE 'ALTER TABLE tarefas_lean DISABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
        EXECUTE 'ALTER TABLE tarefas_lean DISABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
    EXCEPTION WHEN OTHERS THEN
        -- Se não conseguir desabilitar, continuar mesmo assim
        NULL;
    END;
    
    BEGIN
        -- PASSO 2: Deletar dados relacionados manualmente (em ordem correta)
        
        -- 2.1 Deletar guias de consumo e itens
        DELETE FROM guias_consumo_itens 
        WHERE guia_id IN (SELECT id FROM guias_consumo WHERE projeto_id = project_id);
        
        DELETE FROM guias_consumo WHERE projeto_id = project_id;
        
        -- 2.2 Deletar alocações e ponto diário
        DELETE FROM ponto_diario WHERE projeto_id = project_id;
        DELETE FROM alocacao_mensal_colaboradores WHERE projeto_id = project_id;
        DELETE FROM colaboradores_projetos WHERE projeto_id = project_id;
        
        -- 2.3 Deletar tarefas (sem acionar triggers de financas)
        DELETE FROM tarefas_lean WHERE id_projeto = project_id;
        
        -- 2.4 Deletar etapas
        DELETE FROM etapas_projeto WHERE projeto_id = project_id;
        
        -- 2.5 Deletar dados financeiros
        DELETE FROM fluxo_caixa WHERE projeto_id = project_id;
        DELETE FROM financas WHERE id_projeto = project_id;
        DELETE FROM requisicoes WHERE id_projeto = project_id;
        
        -- 2.6 Deletar outros dados relacionados
        DELETE FROM dashboard_kpis WHERE projeto_id = project_id;
        DELETE FROM documentos_projeto WHERE projeto_id = project_id;
        DELETE FROM ppc_historico WHERE projeto_id = project_id;
        DELETE FROM semanas_projeto WHERE projeto_id = project_id;
        DELETE FROM projeto_status_mensal WHERE projeto_id = project_id;
        DELETE FROM incidentes WHERE id_projeto = project_id;
        
        -- 2.7 Atualizar referências para NULL onde apropriado (preservar dados)
        UPDATE patrimonio SET alocado_projeto_id = NULL WHERE alocado_projeto_id = project_id;
        UPDATE materiais_armazem SET projeto_alocado_id = NULL WHERE projeto_alocado_id = project_id;
        UPDATE clientes SET projeto_id = NULL WHERE projeto_id = project_id;
        UPDATE contratos_clientes SET projeto_id = NULL WHERE projeto_id = project_id;
        UPDATE contratos_fornecedores SET projeto_id = NULL WHERE projeto_id = project_id;
        UPDATE materiais_movimentacoes SET projeto_origem_id = NULL WHERE projeto_origem_id = project_id;
        UPDATE materiais_movimentacoes SET projeto_destino_id = NULL WHERE projeto_destino_id = project_id;
        UPDATE gastos_detalhados SET projeto_id = NULL WHERE projeto_id = project_id;
        
        -- PASSO 3: Finalmente deletar o projeto
        DELETE FROM projetos WHERE id = project_id;
        GET DIAGNOSTICS rows_deleted = ROW_COUNT;
        
        -- PASSO 4: Reabilitar triggers
        BEGIN
            EXECUTE 'ALTER TABLE requisicoes ENABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
        EXCEPTION WHEN OTHERS THEN
            -- Se não conseguir reabilitar, continuar mesmo assim
            NULL;
        END;
        
        -- Retornar sucesso
        result := json_build_object(
            'success', TRUE,
            'message', 'Projeto eliminado com sucesso',
            'project_id', project_id,
            'rows_deleted', rows_deleted
        );
        
        RETURN result;
        
    EXCEPTION WHEN OTHERS THEN
        -- Em caso de erro, tentar reabilitar triggers
        BEGIN
            EXECUTE 'ALTER TABLE requisicoes ENABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
        
        -- Retornar erro detalhado
        result := json_build_object(
            'success', FALSE,
            'message', SQLERRM,
            'error_code', SQLSTATE,
            'detail', COALESCE(SQLERRM, 'Erro desconhecido ao eliminar projeto')
        );
        
        RETURN result;
    END;
END;
$$;