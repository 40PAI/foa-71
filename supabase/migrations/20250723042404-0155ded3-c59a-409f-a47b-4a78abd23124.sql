
-- Criar função para calcular PPC (Percentual da Programação Cumprida)
CREATE OR REPLACE FUNCTION calculate_project_ppc(project_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total_tasks INTEGER;
    completed_on_time INTEGER;
    ppc_percentage NUMERIC;
BEGIN
    -- Contar total de tarefas do projeto
    SELECT COUNT(*) INTO total_tasks
    FROM tarefas_lean
    WHERE id_projeto = project_id;
    
    -- Contar tarefas concluídas no prazo ou antes
    SELECT COUNT(*) INTO completed_on_time
    FROM tarefas_lean
    WHERE id_projeto = project_id
    AND status = 'Concluído'
    AND updated_at::date <= prazo;
    
    -- Calcular PPC
    IF total_tasks > 0 THEN
        ppc_percentage := (completed_on_time::NUMERIC / total_tasks::NUMERIC) * 100;
    ELSE
        ppc_percentage := 0;
    END IF;
    
    RETURN ROUND(ppc_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Criar função para calcular avanço temporal melhorado
CREATE OR REPLACE FUNCTION calculate_temporal_progress(project_id INTEGER, method TEXT DEFAULT 'linear')
RETURNS NUMERIC AS $$
DECLARE
    project_record RECORD;
    linear_progress NUMERIC;
    ppc_progress NUMERIC;
    total_days INTEGER;
    days_passed INTEGER;
    current_date_val DATE;
BEGIN
    -- Buscar dados do projeto
    SELECT * INTO project_record
    FROM projetos
    WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    current_date_val := CURRENT_DATE;
    
    -- Calcular progresso linear
    total_days := (project_record.data_fim_prevista - project_record.data_inicio) + 1;
    days_passed := (current_date_val - project_record.data_inicio) + 1;
    
    IF total_days > 0 THEN
        linear_progress := GREATEST(0, LEAST(100, (days_passed::NUMERIC / total_days::NUMERIC) * 100));
    ELSE
        linear_progress := 0;
    END IF;
    
    -- Calcular PPC
    ppc_progress := calculate_project_ppc(project_id);
    
    -- Retornar baseado no método escolhido
    IF method = 'ppc' THEN
        RETURN ROUND(ppc_progress, 2);
    ELSE
        RETURN ROUND(linear_progress, 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Adicionar coluna para método de cálculo temporal nos projetos
ALTER TABLE projetos 
ADD COLUMN IF NOT EXISTS metodo_calculo_temporal TEXT DEFAULT 'linear';

-- Criar tabela para histórico de PPC
CREATE TABLE IF NOT EXISTS ppc_historico (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER REFERENCES projetos(id) ON DELETE CASCADE,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    ppc_percentual NUMERIC NOT NULL,
    tarefas_programadas INTEGER NOT NULL,
    tarefas_concluidas_prazo INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de histórico PPC
ALTER TABLE ppc_historico ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações na tabela ppc_historico
CREATE POLICY "Allow all operations for authenticated users" ON ppc_historico
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Atualizar a função de atualização de métricas do projeto
CREATE OR REPLACE FUNCTION update_project_metrics_with_ppc(project_id INTEGER)
RETURNS VOID AS $$
DECLARE
    projeto RECORD;
    physical_progress INTEGER;
    financial_progress INTEGER;
    temporal_progress INTEGER;
    total_spent NUMERIC;
BEGIN
    -- Buscar projeto
    SELECT * INTO projeto FROM projetos WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calcular avanço físico usando função existente
    physical_progress := calculate_project_physical_progress(project_id);
    
    -- Calcular avanço financeiro
    SELECT COALESCE(SUM(gasto), 0) INTO total_spent
    FROM financas
    WHERE id_projeto = project_id;
    
    IF projeto.orcamento > 0 THEN
        financial_progress := ROUND((total_spent / projeto.orcamento) * 100);
    ELSE
        financial_progress := 0;
    END IF;
    
    -- Calcular avanço temporal baseado no método configurado
    temporal_progress := calculate_temporal_progress(project_id, projeto.metodo_calculo_temporal);
    
    -- Atualizar projeto
    UPDATE projetos
    SET 
        avanco_fisico = physical_progress,
        avanco_financeiro = financial_progress,
        avanco_tempo = temporal_progress,
        gasto = total_spent,
        updated_at = NOW()
    WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;
