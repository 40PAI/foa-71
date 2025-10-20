-- ============================================
-- CREATE SAFE PROJECT DELETE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION delete_project_safely(project_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    trigger_exists BOOLEAN;
BEGIN
    -- Verificar se o trigger problemático existe
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_financas_from_requisicoes'
    ) INTO trigger_exists;
    
    -- Desabilitar o trigger temporariamente se existir
    IF trigger_exists THEN
        EXECUTE 'ALTER TABLE requisicoes DISABLE TRIGGER trigger_update_financas_from_requisicoes';
    END IF;
    
    -- Tentar deletar o projeto
    BEGIN
        DELETE FROM projetos WHERE id = project_id;
        
        -- Reabilitar o trigger se foi desabilitado
        IF trigger_exists THEN
            EXECUTE 'ALTER TABLE requisicoes ENABLE TRIGGER trigger_update_financas_from_requisicoes';
        END IF;
        
        result := json_build_object(
            'success', TRUE,
            'message', 'Projeto eliminado com sucesso',
            'project_id', project_id
        );
        
        RETURN result;
    EXCEPTION WHEN OTHERS THEN
        -- Reabilitar o trigger em caso de erro
        IF trigger_exists THEN
            EXECUTE 'ALTER TABLE requisicoes ENABLE TRIGGER trigger_update_financas_from_requisicoes';
        END IF;
        
        result := json_build_object(
            'success', FALSE,
            'message', SQLERRM,
            'error_code', SQLSTATE
        );
        
        RETURN result;
    END;
END;
$$;