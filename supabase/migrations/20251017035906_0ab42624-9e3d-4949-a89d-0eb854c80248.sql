-- Adicionar novos campos à tabela financas para registro completo de despesas
ALTER TABLE financas
ADD COLUMN IF NOT EXISTS subcategoria TEXT,
ADD COLUMN IF NOT EXISTS tipo_despesa TEXT CHECK (tipo_despesa IN ('fixa', 'variavel', 'emergencial', 'planejada')),
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
ADD COLUMN IF NOT EXISTS etapa_id INTEGER REFERENCES etapas_projeto(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tarefa_id INTEGER REFERENCES tarefas_lean(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS centro_custo TEXT,
ADD COLUMN IF NOT EXISTS justificativa TEXT,
ADD COLUMN IF NOT EXISTS fornecedor TEXT,
ADD COLUMN IF NOT EXISTS forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'cheque', 'cartao', 'boleto', 'pix', 'oc')),
ADD COLUMN IF NOT EXISTS numero_nf TEXT,
ADD COLUMN IF NOT EXISTS prazo_pagamento DATE,
ADD COLUMN IF NOT EXISTS data_despesa DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS data_pagamento DATE,
ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS requer_aprovacao_direcao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requisicao_id INTEGER REFERENCES requisicoes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS comprovantes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER DEFAULT 1 CHECK (numero_parcelas >= 1),
ADD COLUMN IF NOT EXISTS valor_parcela NUMERIC CHECK (valor_parcela >= 0),
ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado', 'em_analise'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_financas_etapa ON financas(etapa_id);
CREATE INDEX IF NOT EXISTS idx_financas_tarefa ON financas(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_financas_responsavel ON financas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_financas_data_despesa ON financas(data_despesa);
CREATE INDEX IF NOT EXISTS idx_financas_status_aprovacao ON financas(status_aprovacao);

-- Comentários para documentação
COMMENT ON COLUMN financas.subcategoria IS 'Subcategoria específica dentro da categoria principal';
COMMENT ON COLUMN financas.tipo_despesa IS 'Tipo de despesa: fixa, variavel, emergencial, planejada';
COMMENT ON COLUMN financas.prioridade IS 'Prioridade da despesa: baixa, media, alta, critica';
COMMENT ON COLUMN financas.justificativa IS 'Justificativa detalhada da despesa (20-500 caracteres)';
COMMENT ON COLUMN financas.comprovantes IS 'Array JSON com URLs dos comprovantes anexados';
COMMENT ON COLUMN financas.numero_parcelas IS 'Número de parcelas para despesas recorrentes';
COMMENT ON COLUMN financas.status_aprovacao IS 'Status de aprovação da despesa';