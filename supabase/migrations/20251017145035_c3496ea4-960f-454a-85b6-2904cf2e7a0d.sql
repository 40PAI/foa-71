-- =====================================================
-- MÓDULO: CONTAS CORRENTES (CLIENTES & FORNECEDORES)
-- =====================================================

-- Tabela: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome TEXT NOT NULL,
  nif TEXT UNIQUE,
  tipo_cliente TEXT CHECK (tipo_cliente IN ('pessoa_fisica', 'pessoa_juridica')),
  
  -- Contato
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  provincia TEXT,
  
  -- Relacionamento com projetos
  projeto_id INTEGER REFERENCES projetos(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'inadimplente')),
  
  -- Observações
  observacoes TEXT,
  
  -- Audit
  responsavel_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clientes_projeto ON clientes(projeto_id);
CREATE INDEX idx_clientes_nif ON clientes(nif);
CREATE INDEX idx_clientes_status ON clientes(status);

-- Tabela: fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome TEXT NOT NULL,
  nif TEXT UNIQUE,
  tipo_fornecedor TEXT CHECK (tipo_fornecedor IN ('materiais', 'servicos', 'equipamentos', 'misto')),
  
  -- Contato
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  provincia TEXT,
  
  -- Classificação
  categoria_principal TEXT,
  recorrencia TEXT CHECK (recorrencia IN ('ativo', 'eventual', 'estrategico')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  
  -- Avaliação
  avaliacao_qualidade INTEGER CHECK (avaliacao_qualidade BETWEEN 1 AND 5),
  
  -- Observações
  observacoes TEXT,
  
  -- Audit
  responsavel_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fornecedores_tipo ON fornecedores(tipo_fornecedor);
CREATE INDEX idx_fornecedores_nif ON fornecedores(nif);
CREATE INDEX idx_fornecedores_status ON fornecedores(status);

-- Tabela: contratos_clientes
CREATE TABLE IF NOT EXISTS contratos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  projeto_id INTEGER REFERENCES projetos(id) ON DELETE SET NULL,
  
  -- Informações do contrato
  numero_contrato TEXT UNIQUE,
  descricao_servicos TEXT NOT NULL,
  
  -- Valores
  valor_contratado NUMERIC NOT NULL CHECK (valor_contratado >= 0),
  valor_recebido NUMERIC DEFAULT 0 CHECK (valor_recebido >= 0),
  saldo_receber NUMERIC GENERATED ALWAYS AS (valor_contratado - valor_recebido) STORED,
  
  -- Datas
  data_inicio DATE NOT NULL,
  data_termino DATE,
  data_ultimo_recebimento DATE,
  
  -- Condições de pagamento
  frequencia_faturacao TEXT CHECK (frequencia_faturacao IN ('unico', 'mensal', 'trimestral', 'semestral', 'anual')),
  metodo_pagamento TEXT CHECK (metodo_pagamento IN ('transferencia', 'cheque', 'dinheiro', 'cartao', 'boleto', 'pix')),
  prazo_pagamento_dias INTEGER,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado', 'suspenso')),
  
  -- Documentação
  documento_contrato_url TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Audit
  responsavel_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contratos_clientes_cliente ON contratos_clientes(cliente_id);
CREATE INDEX idx_contratos_clientes_projeto ON contratos_clientes(projeto_id);
CREATE INDEX idx_contratos_clientes_status ON contratos_clientes(status);

-- Tabela: contratos_fornecedores
CREATE TABLE IF NOT EXISTS contratos_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
  projeto_id INTEGER REFERENCES projetos(id) ON DELETE SET NULL,
  
  -- Informações do contrato
  numero_contrato TEXT,
  descricao_produtos_servicos TEXT NOT NULL,
  
  -- Valores
  valor_contratado NUMERIC NOT NULL CHECK (valor_contratado >= 0),
  valor_pago NUMERIC DEFAULT 0 CHECK (valor_pago >= 0),
  saldo_pagar NUMERIC GENERATED ALWAYS AS (valor_contratado - valor_pago) STORED,
  
  -- Datas
  data_inicio DATE NOT NULL,
  data_termino DATE,
  data_ultimo_pagamento DATE,
  
  -- Condições de pagamento
  condicao_pagamento TEXT,
  metodo_pagamento TEXT CHECK (metodo_pagamento IN ('transferencia', 'cheque', 'dinheiro', 'cartao', 'boleto', 'pix')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado', 'suspenso')),
  
  -- Documentação
  documento_contrato_url TEXT,
  notas_fiscais JSONB DEFAULT '[]'::jsonb,
  
  -- Observações
  observacoes TEXT,
  
  -- Audit
  responsavel_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contratos_fornecedores_fornecedor ON contratos_fornecedores(fornecedor_id);
CREATE INDEX idx_contratos_fornecedores_projeto ON contratos_fornecedores(projeto_id);
CREATE INDEX idx_contratos_fornecedores_status ON contratos_fornecedores(status);

-- Tabela: pagamentos_recebimentos
CREATE TABLE IF NOT EXISTS pagamentos_recebimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo e relacionamento
  tipo TEXT NOT NULL CHECK (tipo IN ('pagamento', 'recebimento')),
  contrato_cliente_id UUID REFERENCES contratos_clientes(id) ON DELETE CASCADE,
  contrato_fornecedor_id UUID REFERENCES contratos_fornecedores(id) ON DELETE CASCADE,
  
  -- Dados da transação
  valor NUMERIC NOT NULL CHECK (valor > 0),
  data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
  metodo TEXT CHECK (metodo IN ('transferencia', 'cheque', 'dinheiro', 'cartao', 'boleto', 'pix')),
  
  -- Documentação
  numero_documento TEXT,
  comprovante_url TEXT,
  nota_fiscal_url TEXT,
  
  -- Informações bancárias
  banco TEXT,
  conta TEXT,
  
  -- Observações
  descricao TEXT,
  observacoes TEXT,
  
  -- Audit
  responsavel_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: deve ter referência a cliente OU fornecedor
  CONSTRAINT check_contrato_reference CHECK (
    (contrato_cliente_id IS NOT NULL AND contrato_fornecedor_id IS NULL) OR
    (contrato_cliente_id IS NULL AND contrato_fornecedor_id IS NOT NULL)
  )
);

CREATE INDEX idx_pagamentos_recebimentos_tipo ON pagamentos_recebimentos(tipo);
CREATE INDEX idx_pagamentos_recebimentos_data ON pagamentos_recebimentos(data_transacao);
CREATE INDEX idx_pagamentos_recebimentos_cliente ON pagamentos_recebimentos(contrato_cliente_id);
CREATE INDEX idx_pagamentos_recebimentos_fornecedor ON pagamentos_recebimentos(contrato_fornecedor_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on fornecedores" ON fornecedores FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE contratos_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on contratos_clientes" ON contratos_clientes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE contratos_fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on contratos_fornecedores" ON contratos_fornecedores FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE pagamentos_recebimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on pagamentos_recebimentos" ON pagamentos_recebimentos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_clientes_updated_at BEFORE UPDATE ON contratos_clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_fornecedores_updated_at BEFORE UPDATE ON contratos_fornecedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATABASE FUNCTIONS PARA KPIs
-- =====================================================

-- KPIs de Clientes
CREATE OR REPLACE FUNCTION get_clientes_kpis(project_id INTEGER DEFAULT NULL)
RETURNS TABLE(
  total_clientes BIGINT,
  total_contratado NUMERIC,
  total_recebido NUMERIC,
  saldo_receber NUMERIC,
  taxa_recebimento NUMERIC,
  prazo_medio_recebimento NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::BIGINT as total_clientes,
    COALESCE(SUM(cc.valor_contratado), 0) as total_contratado,
    COALESCE(SUM(cc.valor_recebido), 0) as total_recebido,
    COALESCE(SUM(cc.saldo_receber), 0) as saldo_receber,
    CASE 
      WHEN SUM(cc.valor_contratado) > 0 THEN 
        ROUND((SUM(cc.valor_recebido) / SUM(cc.valor_contratado) * 100)::NUMERIC, 2)
      ELSE 0 
    END as taxa_recebimento,
    COALESCE(AVG(EXTRACT(DAY FROM (pr.data_transacao - cc.data_inicio))), 0)::NUMERIC as prazo_medio_recebimento
  FROM clientes c
  LEFT JOIN contratos_clientes cc ON c.id = cc.cliente_id
  LEFT JOIN pagamentos_recebimentos pr ON cc.id = pr.contrato_cliente_id
  WHERE (project_id IS NULL OR cc.projeto_id = project_id)
    AND (cc.id IS NULL OR cc.status = 'ativo');
END;
$$;

-- KPIs de Fornecedores
CREATE OR REPLACE FUNCTION get_fornecedores_kpis(project_id INTEGER DEFAULT NULL)
RETURNS TABLE(
  total_fornecedores BIGINT,
  total_contratado NUMERIC,
  total_pago NUMERIC,
  saldo_pagar NUMERIC,
  taxa_pagamento NUMERIC,
  prazo_medio_pagamento NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT f.id)::BIGINT as total_fornecedores,
    COALESCE(SUM(cf.valor_contratado), 0) as total_contratado,
    COALESCE(SUM(cf.valor_pago), 0) as total_pago,
    COALESCE(SUM(cf.saldo_pagar), 0) as saldo_pagar,
    CASE 
      WHEN SUM(cf.valor_contratado) > 0 THEN 
        ROUND((SUM(cf.valor_pago) / SUM(cf.valor_contratado) * 100)::NUMERIC, 2)
      ELSE 0 
    END as taxa_pagamento,
    COALESCE(AVG(EXTRACT(DAY FROM (pr.data_transacao - cf.data_inicio))), 0)::NUMERIC as prazo_medio_pagamento
  FROM fornecedores f
  LEFT JOIN contratos_fornecedores cf ON f.id = cf.fornecedor_id
  LEFT JOIN pagamentos_recebimentos pr ON cf.id = pr.contrato_fornecedor_id
  WHERE (project_id IS NULL OR cf.projeto_id = project_id)
    AND (cf.id IS NULL OR cf.status = 'ativo');
END;
$$;

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos-contratos', 'documentos-contratos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprovantes-transacoes', 'comprovantes-transacoes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies para documentos-contratos
CREATE POLICY "Allow authenticated users to upload contract documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-contratos');

CREATE POLICY "Allow authenticated users to view contract documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-contratos');

CREATE POLICY "Allow authenticated users to update contract documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos-contratos');

CREATE POLICY "Allow authenticated users to delete contract documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos-contratos');

-- Storage policies para comprovantes-transacoes
CREATE POLICY "Allow authenticated users to upload transaction receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprovantes-transacoes');

CREATE POLICY "Allow authenticated users to view transaction receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprovantes-transacoes');

CREATE POLICY "Allow authenticated users to update transaction receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'comprovantes-transacoes');

CREATE POLICY "Allow authenticated users to delete transaction receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'comprovantes-transacoes');