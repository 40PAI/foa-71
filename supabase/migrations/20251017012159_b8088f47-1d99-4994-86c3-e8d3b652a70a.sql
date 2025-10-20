-- Adicionar campos financeiros às etapas do projeto
ALTER TABLE etapas_projeto
ADD COLUMN IF NOT EXISTS orcamento_etapa NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gasto_etapa NUMERIC DEFAULT 0;

-- Adicionar campos temporais às etapas do projeto
ALTER TABLE etapas_projeto
ADD COLUMN IF NOT EXISTS tempo_previsto_dias INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tempo_real_dias INTEGER DEFAULT 0;

-- Adicionar comentários para documentação
COMMENT ON COLUMN etapas_projeto.orcamento_etapa IS 'Valor orçado para esta etapa';
COMMENT ON COLUMN etapas_projeto.gasto_etapa IS 'Valor realmente gasto nesta etapa';
COMMENT ON COLUMN etapas_projeto.tempo_previsto_dias IS 'Número de dias previstos para executar esta etapa';
COMMENT ON COLUMN etapas_projeto.tempo_real_dias IS 'Número de dias realmente gastos para executar esta etapa';

-- Criar índices para melhor performance em consultas financeiras
CREATE INDEX IF NOT EXISTS idx_etapas_projeto_orcamento ON etapas_projeto(orcamento_etapa);
CREATE INDEX IF NOT EXISTS idx_etapas_projeto_gasto ON etapas_projeto(gasto_etapa);