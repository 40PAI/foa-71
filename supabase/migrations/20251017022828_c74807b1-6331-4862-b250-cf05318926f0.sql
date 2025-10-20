-- =====================================================
-- Adicionar campos financeiros à tabela tarefas_lean
-- =====================================================

-- Adicionar novas colunas
ALTER TABLE tarefas_lean
ADD COLUMN IF NOT EXISTS preco_unitario NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_material NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_mao_obra NUMERIC DEFAULT 0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN tarefas_lean.preco_unitario IS 'Preço unitário (PREÇO/UN) em AKZ conforme orçamento';
COMMENT ON COLUMN tarefas_lean.custo_material IS 'Preço de materiais (PREÇO MATERIAL) em AKZ conforme orçamento';
COMMENT ON COLUMN tarefas_lean.custo_mao_obra IS 'Preço de mão de obra (PREÇO MÃO DE OBRA) em AKZ conforme orçamento';

-- Criar índice para otimizar agregações
CREATE INDEX IF NOT EXISTS idx_tarefas_lean_custos_financeiros 
ON tarefas_lean(id_projeto, custo_material, custo_mao_obra);

-- =====================================================
-- Garantir constraint única em financas
-- =====================================================

-- Adicionar constraint única se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_projeto_categoria'
    ) THEN
        ALTER TABLE financas 
        ADD CONSTRAINT unique_projeto_categoria 
        UNIQUE (id_projeto, categoria);
    END IF;
END $$;

-- =====================================================
-- Função para atualizar finanças automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_financas_from_tasks()
RETURNS TRIGGER AS $$
DECLARE
    projeto_id INTEGER;
    total_material NUMERIC;
    total_mao_obra NUMERIC;
BEGIN
    -- Obter projeto_id da tarefa (funciona para INSERT, UPDATE e DELETE)
    projeto_id := COALESCE(NEW.id_projeto, OLD.id_projeto);
    
    IF projeto_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calcular SUBTOTAL de MATERIAIS (soma de todas as tarefas do projeto)
    SELECT COALESCE(SUM(custo_material), 0)
    INTO total_material
    FROM tarefas_lean
    WHERE id_projeto = projeto_id;
    
    -- Calcular SUBTOTAL de MÃO DE OBRA (soma de todas as tarefas do projeto)
    SELECT COALESCE(SUM(custo_mao_obra), 0)
    INTO total_mao_obra
    FROM tarefas_lean
    WHERE id_projeto = projeto_id;
    
    -- Atualizar ou inserir categoria "Materiais de Construção" em financas
    INSERT INTO financas (id_projeto, categoria, gasto, orcamentado)
    VALUES (projeto_id, 'Materiais de Construção', total_material, 0)
    ON CONFLICT (id_projeto, categoria) 
    DO UPDATE SET 
        gasto = total_material,
        updated_at = NOW();
    
    -- Atualizar ou inserir categoria "Mão de Obra" em financas
    INSERT INTO financas (id_projeto, categoria, gasto, orcamentado)
    VALUES (projeto_id, 'Mão de Obra', total_mao_obra, 0)
    ON CONFLICT (id_projeto, categoria) 
    DO UPDATE SET 
        gasto = total_mao_obra,
        updated_at = NOW();
    
    RAISE NOTICE 'Finanças atualizadas - Projeto %: Subtotal Material=%, Subtotal Mão de Obra=%, Total=%', 
        projeto_id, total_material, total_mao_obra, (total_material + total_mao_obra);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers para sincronização automática
-- =====================================================

-- Drop triggers existentes se houver (para evitar duplicação)
DROP TRIGGER IF EXISTS trigger_update_financas_on_task_change ON tarefas_lean;
DROP TRIGGER IF EXISTS trigger_update_financas_on_task_delete ON tarefas_lean;

-- Trigger para INSERT e UPDATE
CREATE TRIGGER trigger_update_financas_on_task_change
AFTER INSERT OR UPDATE OF custo_material, custo_mao_obra, id_projeto ON tarefas_lean
FOR EACH ROW
EXECUTE FUNCTION update_financas_from_tasks();

-- Trigger para DELETE
CREATE TRIGGER trigger_update_financas_on_task_delete
AFTER DELETE ON tarefas_lean
FOR EACH ROW
EXECUTE FUNCTION update_financas_from_tasks();