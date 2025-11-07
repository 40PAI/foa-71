-- Update delete_project_safely function to include missing tables
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
    -- Disable problematic triggers
    BEGIN
        EXECUTE 'ALTER TABLE requisicoes DISABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
        EXECUTE 'ALTER TABLE tarefas_lean DISABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
        EXECUTE 'ALTER TABLE tarefas_lean DISABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        -- Delete related data in correct order
        
        -- 1. Consumption guides
        DELETE FROM guias_consumo_itens 
        WHERE guia_id IN (SELECT id FROM guias_consumo WHERE projeto_id = project_id);
        DELETE FROM guias_consumo WHERE projeto_id = project_id;
        
        -- 2. Employee allocations and daily time tracking
        DELETE FROM ponto_diario WHERE projeto_id = project_id;
        DELETE FROM alocacao_mensal_colaboradores WHERE projeto_id = project_id;
        DELETE FROM colaboradores_projetos WHERE projeto_id = project_id;
        
        -- 3. Tasks
        DELETE FROM tarefas_lean WHERE id_projeto = project_id;
        
        -- 4. Project stages
        DELETE FROM etapas_projeto WHERE projeto_id = project_id;
        
        -- 5. DRE lines (NEW - must be deleted BEFORE centros_custo)
        DELETE FROM dre_linhas WHERE projeto_id = project_id;
        
        -- 6. Financial movements (NEW - must be deleted BEFORE centros_custo)
        DELETE FROM movimentos_financeiros WHERE projeto_id = project_id;
        
        -- 7. Other financial data
        DELETE FROM fluxo_caixa WHERE projeto_id = project_id;
        DELETE FROM financas WHERE id_projeto = project_id;
        DELETE FROM requisicoes WHERE id_projeto = project_id;
        
        -- 8. Cost centers (NEW - after deleting dependencies)
        DELETE FROM centros_custo WHERE projeto_id = project_id;
        
        -- 9. Other related data
        DELETE FROM dashboard_kpis WHERE projeto_id = project_id;
        DELETE FROM documentos_projeto WHERE projeto_id = project_id;
        DELETE FROM ppc_historico WHERE projeto_id = project_id;
        DELETE FROM semanas_projeto WHERE projeto_id = project_id;
        DELETE FROM projeto_status_mensal WHERE projeto_id = project_id;
        DELETE FROM incidentes WHERE id_projeto = project_id;
        DELETE FROM contas_correntes_fornecedores WHERE projeto_id = project_id;
        
        -- 10. Update references to NULL
        UPDATE patrimonio SET alocado_projeto_id = NULL WHERE alocado_projeto_id = project_id;
        UPDATE materiais_armazem SET projeto_alocado_id = NULL WHERE projeto_alocado_id = project_id;
        UPDATE clientes SET projeto_id = NULL WHERE projeto_id = project_id;
        UPDATE contratos_clientes SET projeto_id = NULL WHERE projeto_id = project_id;
        UPDATE contratos_fornecedores SET projeto_id = NULL WHERE projeto_id = project_id;
        UPDATE materiais_movimentacoes SET projeto_origem_id = NULL WHERE projeto_origem_id = project_id;
        UPDATE materiais_movimentacoes SET projeto_destino_id = NULL WHERE projeto_destino_id = project_id;
        UPDATE gastos_detalhados SET projeto_id = NULL WHERE projeto_id = project_id;
        
        -- 11. Delete the project
        DELETE FROM projetos WHERE id = project_id;
        GET DIAGNOSTICS rows_deleted = ROW_COUNT;
        
        -- Re-enable triggers
        BEGIN
            EXECUTE 'ALTER TABLE requisicoes ENABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
        
        result := json_build_object(
            'success', TRUE,
            'message', 'Projeto eliminado com sucesso',
            'project_id', project_id,
            'rows_deleted', rows_deleted
        );
        
        RETURN result;
        
    EXCEPTION WHEN OTHERS THEN
        -- Re-enable triggers on error
        BEGIN
            EXECUTE 'ALTER TABLE requisicoes ENABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
            EXECUTE 'ALTER TABLE tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
        
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