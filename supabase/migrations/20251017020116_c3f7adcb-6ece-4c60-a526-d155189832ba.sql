-- Adicionar campos financeiros e temporais às tarefas
ALTER TABLE tarefas_lean
ADD COLUMN IF NOT EXISTS gasto_real NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tempo_real_dias INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN tarefas_lean.gasto_real IS 'Valor realmente gasto para executar esta tarefa';
COMMENT ON COLUMN tarefas_lean.tempo_real_dias IS 'Número de dias realmente gastos para executar esta tarefa';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tarefas_lean_id_etapa ON tarefas_lean(id_etapa);
CREATE INDEX IF NOT EXISTS idx_tarefas_lean_gasto_real ON tarefas_lean(gasto_real);

-- Função para atualizar gastos e tempos da etapa baseado nas tarefas
CREATE OR REPLACE FUNCTION update_stage_from_tasks()
RETURNS TRIGGER AS $$
DECLARE
    total_gasto NUMERIC;
    total_tempo INTEGER;
BEGIN
    -- Se a tarefa tem etapa associada
    IF COALESCE(NEW.id_etapa, OLD.id_etapa) IS NOT NULL THEN
        -- Calcular soma dos gastos reais de todas as tarefas da etapa
        SELECT COALESCE(SUM(gasto_real), 0)
        INTO total_gasto
        FROM tarefas_lean
        WHERE id_etapa = COALESCE(NEW.id_etapa, OLD.id_etapa);
        
        -- Calcular soma dos tempos reais de todas as tarefas da etapa
        SELECT COALESCE(SUM(tempo_real_dias), 0)
        INTO total_tempo
        FROM tarefas_lean
        WHERE id_etapa = COALESCE(NEW.id_etapa, OLD.id_etapa);
        
        -- Atualizar a etapa do projeto
        UPDATE etapas_projeto
        SET 
            gasto_etapa = total_gasto,
            tempo_real_dias = total_tempo,
            updated_at = NOW()
        WHERE id = COALESCE(NEW.id_etapa, OLD.id_etapa);
        
        RAISE NOTICE 'Etapa % atualizada: gasto_etapa=%, tempo_real_dias=%', 
            COALESCE(NEW.id_etapa, OLD.id_etapa), total_gasto, total_tempo;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar etapa quando tarefa é inserida/atualizada
DROP TRIGGER IF EXISTS trigger_update_stage_on_task_change ON tarefas_lean;
CREATE TRIGGER trigger_update_stage_on_task_change
AFTER INSERT OR UPDATE OF gasto_real, tempo_real_dias, id_etapa ON tarefas_lean
FOR EACH ROW
EXECUTE FUNCTION update_stage_from_tasks();

-- Trigger para atualizar etapa quando tarefa é deletada
DROP TRIGGER IF EXISTS trigger_update_stage_on_task_delete ON tarefas_lean;
CREATE TRIGGER trigger_update_stage_on_task_delete
AFTER DELETE ON tarefas_lean
FOR EACH ROW
EXECUTE FUNCTION update_stage_from_tasks();