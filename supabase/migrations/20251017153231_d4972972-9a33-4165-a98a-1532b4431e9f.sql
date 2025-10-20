-- ============================================
-- DISABLE PROBLEMATIC TRIGGERS DURING DELETE
-- ============================================

-- Primeiro, vamos verificar que triggers existem que podem interferir
DO $$ 
BEGIN
    -- Desabilitar temporariamente os triggers que atualizam financas
    -- durante operações em outras tabelas
    
    -- Se o trigger update_financas_from_requisicoes existir, desabilitá-lo
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_financas_from_requisicoes'
    ) THEN
        ALTER TABLE requisicoes DISABLE TRIGGER trigger_update_financas_from_requisicoes;
    END IF;
    
    -- Recriar a constraint de financas com DEFERRABLE para permitir ordem de deleção
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_financas_projeto'
    ) THEN
        ALTER TABLE financas DROP CONSTRAINT fk_financas_projeto;
    END IF;
    
    -- Adicionar constraint DEFERRABLE INITIALLY DEFERRED
    ALTER TABLE financas
    ADD CONSTRAINT fk_financas_projeto 
        FOREIGN KEY (id_projeto) 
        REFERENCES projetos(id) 
        ON DELETE SET NULL
        DEFERRABLE INITIALLY DEFERRED;
        
    -- Reabilitar o trigger após a alteração
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_financas_from_requisicoes'
        AND NOT tgenabled = 'D'
    ) THEN
        ALTER TABLE requisicoes ENABLE TRIGGER trigger_update_financas_from_requisicoes;
    END IF;
END $$;