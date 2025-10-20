
-- Criar função para calcular gastos de mão de obra por projeto
CREATE OR REPLACE FUNCTION calculate_payroll_expenses(project_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total_payroll NUMERIC := 0;
    colaborador_record RECORD;
    days_worked INTEGER;
    daily_cost NUMERIC;
BEGIN
    -- Calcular custos de mão de obra baseado nas alocações e ponto diário
    FOR colaborador_record IN
        SELECT 
            c.id,
            c.custo_hora,
            cp.funcao,
            cp.horario_tipo,
            cp.data_alocacao
        FROM colaboradores c
        JOIN colaboradores_projetos cp ON c.id = cp.colaborador_id
        WHERE cp.projeto_id = project_id
    LOOP
        -- Calcular dias trabalhados baseado no ponto diário
        SELECT COUNT(*) INTO days_worked
        FROM ponto_diario pd
        WHERE pd.colaborador_id = colaborador_record.id
          AND pd.projeto_id = project_id
          AND pd.status = 'presente';
        
        -- Calcular custo diário baseado no tipo de horário
        CASE colaborador_record.horario_tipo
            WHEN 'integral' THEN daily_cost := colaborador_record.custo_hora * 8;
            WHEN 'meio_periodo' THEN daily_cost := colaborador_record.custo_hora * 4;
            WHEN 'turno' THEN daily_cost := colaborador_record.custo_hora * 6;
            ELSE daily_cost := colaborador_record.custo_hora * 8;
        END CASE;
        
        total_payroll := total_payroll + (daily_cost * days_worked);
    END LOOP;
    
    RETURN COALESCE(total_payroll, 0);
END;
$$ LANGUAGE plpgsql;

-- Criar função para calcular gastos de patrimônio alocado
CREATE OR REPLACE FUNCTION calculate_patrimony_expenses(project_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total_patrimony NUMERIC := 0;
    patrimony_record RECORD;
    allocation_days INTEGER;
    daily_depreciation NUMERIC;
BEGIN
    -- Calcular custos de patrimônio baseado na alocação
    FOR patrimony_record IN
        SELECT 
            p.id,
            p.nome,
            p.tipo,
            -- Estimar valor baseado no tipo (seria melhor ter um campo de valor)
            CASE p.tipo
                WHEN 'Veículo' THEN 50000
                WHEN 'Equipamento' THEN 20000
                WHEN 'Ferramenta' THEN 5000
                ELSE 10000
            END as estimated_value
        FROM patrimonio p
        WHERE p.alocado_projeto_id = project_id
          AND p.status = 'Em Uso'
    LOOP
        -- Calcular dias de alocação (assumindo desde a criação até hoje)
        SELECT EXTRACT(DAY FROM (NOW() - created_at)) INTO allocation_days
        FROM patrimonio
        WHERE id = patrimony_record.id;
        
        -- Calcular depreciação diária (assumindo 5 anos de vida útil)
        daily_depreciation := patrimony_record.estimated_value / (365 * 5);
        
        total_patrimony := total_patrimony + (daily_depreciation * COALESCE(allocation_days, 0));
    END LOOP;
    
    RETURN COALESCE(total_patrimony, 0);
END;
$$ LANGUAGE plpgsql;

-- Criar função para calcular gastos de materiais (requisições liquidadas)
CREATE OR REPLACE FUNCTION calculate_material_expenses(project_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total_materials NUMERIC := 0;
BEGIN
    -- Somar valores de requisições liquidadas
    SELECT COALESCE(SUM(valor), 0) INTO total_materials
    FROM requisicoes
    WHERE id_projeto = project_id
      AND status_fluxo IN ('Liquidado', 'Recepcionado');
    
    RETURN total_materials;
END;
$$ LANGUAGE plpgsql;

-- Criar função principal para calcular avanço financeiro integrado
CREATE OR REPLACE FUNCTION calculate_integrated_financial_progress(project_id INTEGER)
RETURNS TABLE (
    total_budget NUMERIC,
    material_expenses NUMERIC,
    payroll_expenses NUMERIC,
    patrimony_expenses NUMERIC,
    indirect_expenses NUMERIC,
    total_expenses NUMERIC,
    financial_progress NUMERIC
) AS $$
DECLARE
    project_budget NUMERIC;
    materials_cost NUMERIC;
    payroll_cost NUMERIC;
    patrimony_cost NUMERIC;
    indirect_cost NUMERIC;
    total_cost NUMERIC;
    progress_percentage NUMERIC;
BEGIN
    -- Obter orçamento do projeto
    SELECT orcamento INTO project_budget
    FROM projetos
    WHERE id = project_id;
    
    -- Calcular custos por categoria
    materials_cost := calculate_material_expenses(project_id);
    payroll_cost := calculate_payroll_expenses(project_id);
    patrimony_cost := calculate_patrimony_expenses(project_id);
    
    -- Calcular gastos indiretos (10% dos gastos diretos como estimativa)
    indirect_cost := (materials_cost + payroll_cost + patrimony_cost) * 0.1;
    
    -- Calcular total de gastos
    total_cost := materials_cost + payroll_cost + patrimony_cost + indirect_cost;
    
    -- Calcular percentual de progresso
    IF project_budget > 0 THEN
        progress_percentage := (total_cost / project_budget) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        COALESCE(project_budget, 0),
        COALESCE(materials_cost, 0),
        COALESCE(payroll_cost, 0),
        COALESCE(patrimony_cost, 0),
        COALESCE(indirect_cost, 0),
        COALESCE(total_cost, 0),
        COALESCE(progress_percentage, 0);
END;
$$ LANGUAGE plpgsql;

-- Criar tabela para histórico de gastos detalhados
CREATE TABLE IF NOT EXISTS gastos_detalhados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id INTEGER REFERENCES projetos(id) ON DELETE CASCADE,
    categoria_gasto TEXT NOT NULL CHECK (categoria_gasto IN ('material', 'mao_obra', 'patrimonio', 'indireto')),
    valor NUMERIC NOT NULL,
    data_gasto DATE NOT NULL DEFAULT CURRENT_DATE,
    descricao TEXT,
    comprovante_url TEXT,
    aprovado_por TEXT,
    status_aprovacao TEXT DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE gastos_detalhados ENABLE ROW LEVEL SECURITY;

-- Criar política para gastos detalhados
CREATE POLICY "Allow all operations on gastos_detalhados" ON gastos_detalhados
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_gastos_detalhados_projeto_categoria ON gastos_detalhados(projeto_id, categoria_gasto);
CREATE INDEX IF NOT EXISTS idx_gastos_detalhados_data ON gastos_detalhados(data_gasto);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_gastos_detalhados_updated_at
    BEFORE UPDATE ON gastos_detalhados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualizar função de métricas do projeto para usar o cálculo integrado
CREATE OR REPLACE FUNCTION update_project_metrics_with_integrated_finance(project_id INTEGER)
RETURNS VOID AS $$
DECLARE
    projeto RECORD;
    physical_progress INTEGER;
    financial_result RECORD;
    temporal_progress INTEGER;
BEGIN
    -- Buscar projeto
    SELECT * INTO projeto FROM projetos WHERE id = project_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calcular avanço físico
    physical_progress := calculate_project_physical_progress(project_id);
    
    -- Calcular avanço financeiro integrado
    SELECT * INTO financial_result
    FROM calculate_integrated_financial_progress(project_id);
    
    -- Calcular avanço temporal
    temporal_progress := calculate_temporal_progress(project_id, projeto.metodo_calculo_temporal);
    
    -- Atualizar projeto
    UPDATE projetos
    SET 
        avanco_fisico = physical_progress,
        avanco_financeiro = ROUND(financial_result.financial_progress),
        avanco_tempo = temporal_progress,
        gasto = financial_result.total_expenses,
        updated_at = NOW()
    WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Criar função para obter breakdown detalhado dos gastos
CREATE OR REPLACE FUNCTION get_detailed_expense_breakdown(project_id INTEGER)
RETURNS TABLE (
    categoria TEXT,
    valor_calculado NUMERIC,
    valor_manual NUMERIC,
    discrepancia NUMERIC,
    percentual_orcamento NUMERIC
) AS $$
DECLARE
    finance_data RECORD;
    total_budget NUMERIC;
BEGIN
    -- Obter dados financeiros integrados
    SELECT * INTO finance_data
    FROM calculate_integrated_financial_progress(project_id);
    
    total_budget := finance_data.total_budget;
    
    -- Retornar breakdown por categoria
    RETURN QUERY
    SELECT 
        'Materiais'::TEXT,
        finance_data.material_expenses,
        COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Material%'), 0)::NUMERIC,
        (finance_data.material_expenses - COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Material%'), 0))::NUMERIC,
        CASE WHEN total_budget > 0 THEN (finance_data.material_expenses / total_budget * 100) ELSE 0 END::NUMERIC
    
    UNION ALL
    
    SELECT 
        'Mão de Obra'::TEXT,
        finance_data.payroll_expenses,
        COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Mão%'), 0)::NUMERIC,
        (finance_data.payroll_expenses - COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Mão%'), 0))::NUMERIC,
        CASE WHEN total_budget > 0 THEN (finance_data.payroll_expenses / total_budget * 100) ELSE 0 END::NUMERIC
    
    UNION ALL
    
    SELECT 
        'Patrimônio'::TEXT,
        finance_data.patrimony_expenses,
        COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Equipamento%'), 0)::NUMERIC,
        (finance_data.patrimony_expenses - COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Equipamento%'), 0))::NUMERIC,
        CASE WHEN total_budget > 0 THEN (finance_data.patrimony_expenses / total_budget * 100) ELSE 0 END::NUMERIC
    
    UNION ALL
    
    SELECT 
        'Custos Indiretos'::TEXT,
        finance_data.indirect_expenses,
        COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Indireto%'), 0)::NUMERIC,
        (finance_data.indirect_expenses - COALESCE((SELECT SUM(gasto) FROM financas WHERE id_projeto = project_id AND categoria LIKE '%Indireto%'), 0))::NUMERIC,
        CASE WHEN total_budget > 0 THEN (finance_data.indirect_expenses / total_budget * 100) ELSE 0 END::NUMERIC;
END;
$$ LANGUAGE plpgsql;
