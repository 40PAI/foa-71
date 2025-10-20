
-- Adicionar coluna id_etapa na tabela tarefas_lean para vincular tarefas às etapas
ALTER TABLE public.tarefas_lean 
ADD COLUMN id_etapa INTEGER;

-- Criar foreign key constraint para vincular tarefas às etapas
ALTER TABLE public.tarefas_lean 
ADD CONSTRAINT fk_tarefas_etapa 
FOREIGN KEY (id_etapa) REFERENCES public.etapas_projeto(id);

-- Criar índice para melhorar performance das consultas
CREATE INDEX idx_tarefas_lean_etapa ON public.tarefas_lean(id_etapa);

-- Função para calcular progresso da etapa baseado nas tarefas
CREATE OR REPLACE FUNCTION calculate_stage_progress(stage_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    avg_progress INTEGER;
BEGIN
    SELECT COALESCE(AVG(percentual_conclusao), 0)::INTEGER
    INTO avg_progress
    FROM tarefas_lean
    WHERE id_etapa = stage_id;
    
    RETURN avg_progress;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular progresso físico do projeto baseado nas etapas
CREATE OR REPLACE FUNCTION calculate_project_physical_progress(project_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    avg_progress INTEGER;
BEGIN
    SELECT COALESCE(AVG(calculate_stage_progress(id)), 0)::INTEGER
    INTO avg_progress
    FROM etapas_projeto
    WHERE projeto_id = project_id;
    
    RETURN avg_progress;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente o progresso do projeto quando tarefas mudam
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    project_id INTEGER;
BEGIN
    -- Obter o projeto_id da etapa relacionada
    SELECT ep.projeto_id INTO project_id
    FROM etapas_projeto ep
    WHERE ep.id = COALESCE(NEW.id_etapa, OLD.id_etapa);
    
    -- Atualizar o avanço físico do projeto
    IF project_id IS NOT NULL THEN
        UPDATE projetos 
        SET avanco_fisico = calculate_project_physical_progress(project_id),
            updated_at = now()
        WHERE id = project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar progresso automaticamente
DROP TRIGGER IF EXISTS trigger_update_project_progress ON tarefas_lean;
CREATE TRIGGER trigger_update_project_progress
    AFTER INSERT OR UPDATE OR DELETE ON tarefas_lean
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();
