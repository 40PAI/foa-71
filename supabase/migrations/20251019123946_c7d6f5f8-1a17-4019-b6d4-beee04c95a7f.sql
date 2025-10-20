-- Fases 2-7: Implementação completa do sistema financeiro FOA

-- =============================================
-- FASE 2: REEMBOLSOS FOA ↔ FOF
-- =============================================
CREATE TABLE reembolsos_foa_fof (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id INTEGER REFERENCES projetos(id) ON DELETE CASCADE,
  data_reembolso DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor > 0),
  tipo TEXT CHECK (tipo IN ('amortizacao', 'aporte')) DEFAULT 'amortizacao',
  meta_total NUMERIC,
  percentual_cumprido NUMERIC GENERATED ALWAYS AS 
    (CASE WHEN meta_total > 0 THEN (valor / meta_total * 100) ELSE 0 END) STORED,
  responsavel_id UUID REFERENCES auth.users(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reembolsos_projeto ON reembolsos_foa_fof(projeto_id);
CREATE INDEX idx_reembolsos_data ON reembolsos_foa_fof(data_reembolso);

-- RLS para reembolsos
ALTER TABLE reembolsos_foa_fof ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on reembolsos_foa_fof" 
ON reembolsos_foa_fof FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- FASE 3: CONTROLO DE CRÉDITO COM FORNECEDORES
-- =============================================
CREATE TABLE contas_correntes_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE CASCADE,
  projeto_id INTEGER REFERENCES projetos(id) ON DELETE CASCADE,
  saldo_inicial NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fornecedor_id, projeto_id)
);

CREATE TABLE lancamentos_fornecedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_fornecedor_id UUID REFERENCES contas_correntes_fornecedores(id) ON DELETE CASCADE,
  data_lancamento DATE NOT NULL,
  descricao TEXT NOT NULL,
  centro_custo_id UUID REFERENCES centros_custo(id),
  credito NUMERIC DEFAULT 0 CHECK (credito >= 0),
  debito NUMERIC DEFAULT 0 CHECK (debito >= 0),
  saldo_corrente NUMERIC,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_credito_ou_debito 
    CHECK ((credito > 0 AND debito = 0) OR (debito > 0 AND credito = 0) OR (credito = 0 AND debito = 0))
);

CREATE INDEX idx_lancamentos_conta ON lancamentos_fornecedor(conta_fornecedor_id);
CREATE INDEX idx_lancamentos_data ON lancamentos_fornecedor(data_lancamento);

-- RLS para contas fornecedores
ALTER TABLE contas_correntes_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_fornecedor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on contas_correntes_fornecedores" 
ON contas_correntes_fornecedores FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lancamentos_fornecedor" 
ON lancamentos_fornecedor FOR ALL USING (true) WITH CHECK (true);

-- Trigger para calcular saldo corrente automaticamente
CREATE OR REPLACE FUNCTION update_saldo_fornecedor()
RETURNS TRIGGER AS $$
DECLARE
  novo_saldo NUMERIC;
  saldo_inicial_conta NUMERIC;
BEGIN
  -- Buscar saldo inicial da conta
  SELECT saldo_inicial INTO saldo_inicial_conta
  FROM contas_correntes_fornecedores
  WHERE id = NEW.conta_fornecedor_id;
  
  -- Calcular saldo acumulado
  SELECT 
    COALESCE(saldo_inicial_conta, 0) + 
    COALESCE(SUM(credito), 0) - 
    COALESCE(SUM(debito), 0)
  INTO novo_saldo
  FROM lancamentos_fornecedor
  WHERE conta_fornecedor_id = NEW.conta_fornecedor_id
    AND data_lancamento <= NEW.data_lancamento
    AND id <= NEW.id;
  
  NEW.saldo_corrente := novo_saldo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saldo_fornecedor
  BEFORE INSERT OR UPDATE ON lancamentos_fornecedor
  FOR EACH ROW EXECUTE FUNCTION update_saldo_fornecedor();

-- =============================================
-- FASE 7: AUTOMAÇÕES AVANÇADAS
-- =============================================

-- 1. Vincular requisições aprovadas a movimentos financeiros
CREATE OR REPLACE FUNCTION vincular_requisicao_movimento()
RETURNS TRIGGER AS $$
DECLARE
  centro_id UUID;
BEGIN
  -- Quando uma requisição é aprovada, criar movimento financeiro
  IF NEW.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') 
     AND OLD.status_fluxo NOT IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN
    
    -- Tentar encontrar centro de custo do projeto
    SELECT id INTO centro_id
    FROM centros_custo
    WHERE projeto_id = NEW.id_projeto
      AND tipo = 'projeto'
    LIMIT 1;
    
    -- Se não encontrou, usar o primeiro centro ativo
    IF centro_id IS NULL THEN
      SELECT id INTO centro_id
      FROM centros_custo
      WHERE projeto_id = NEW.id_projeto
        AND ativo = true
      LIMIT 1;
    END IF;
    
    -- Criar movimento financeiro
    INSERT INTO movimentos_financeiros (
      projeto_id,
      centro_custo_id,
      data_movimento,
      tipo_movimento,
      categoria,
      subcategoria,
      descricao,
      valor,
      requisicao_id,
      status_aprovacao
    )
    VALUES (
      NEW.id_projeto,
      centro_id,
      CURRENT_DATE,
      'saida',
      map_categoria_principal_to_financas(NEW.categoria_principal),
      NEW.subcategoria,
      'REQ #' || NEW.id || ' - ' || NEW.nome_comercial_produto,
      NEW.valor,
      NEW.id,
      'aprovado'
    );
    
    RAISE NOTICE 'Movimento financeiro criado automaticamente para requisição %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_movimento_from_requisicao
  AFTER UPDATE ON requisicoes
  FOR EACH ROW
  EXECUTE FUNCTION vincular_requisicao_movimento();

-- 2. Função de previsão de gastos (média dos últimos 3 meses)
CREATE OR REPLACE FUNCTION prever_gasto_mensal(p_centro_custo_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  media_ultimos_3_meses NUMERIC;
BEGIN
  SELECT AVG(total_saidas) INTO media_ultimos_3_meses
  FROM (
    SELECT 
      EXTRACT(MONTH FROM data_movimento) as mes,
      SUM(valor) as total_saidas
    FROM movimentos_financeiros
    WHERE centro_custo_id = p_centro_custo_id
      AND tipo_movimento = 'saida'
      AND data_movimento >= CURRENT_DATE - INTERVAL '3 months'
    GROUP BY EXTRACT(MONTH FROM data_movimento)
  ) subq;
  
  RETURN COALESCE(media_ultimos_3_meses, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. View para breakdown por fonte de financiamento
CREATE OR REPLACE VIEW vw_funding_breakdown AS
SELECT 
  mf.projeto_id,
  p.nome as projeto_nome,
  mf.fonte_financiamento,
  CASE mf.fonte_financiamento
    WHEN 'REC_FOA' THEN 'Rec. FOA - Recebimento'
    WHEN 'FOF_FIN' THEN 'FOF Financiamento'
    WHEN 'FOA_AUTO' THEN 'FOA Auto Financiamento'
    ELSE 'Sem Fonte'
  END as fonte_label,
  COUNT(*) as total_movimentos,
  SUM(mf.valor) as total_valor,
  ROUND(
    (SUM(mf.valor)::NUMERIC / NULLIF(
      (SELECT SUM(valor) FROM movimentos_financeiros WHERE projeto_id = mf.projeto_id AND tipo_movimento = 'entrada'), 
    0)) * 100, 
  2) as percentual_total
FROM movimentos_financeiros mf
JOIN projetos p ON p.id = mf.projeto_id
WHERE mf.tipo_movimento = 'entrada'
  AND mf.fonte_financiamento IS NOT NULL
GROUP BY mf.projeto_id, p.nome, mf.fonte_financiamento;

-- 4. View para cost center balances com fonte predominante
CREATE OR REPLACE VIEW vw_cost_center_balances_extended AS
SELECT 
  cc.id as centro_custo_id,
  cc.codigo,
  cc.nome,
  cc.tipo,
  cc.projeto_id,
  cc.orcamento_mensal,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END), 0) as total_entradas,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as total_saidas,
  COALESCE(
    SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END) - 
    SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 
  0) as saldo,
  COUNT(mf.id) as total_movimentos,
  CASE 
    WHEN cc.orcamento_mensal > 0 THEN 
      ROUND((COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) / cc.orcamento_mensal * 100)::NUMERIC, 2)
    ELSE 0 
  END as percentual_utilizado,
  (
    SELECT fonte_financiamento
    FROM movimentos_financeiros mf2
    WHERE mf2.centro_custo_id = cc.id
      AND mf2.tipo_movimento = 'entrada'
      AND mf2.fonte_financiamento IS NOT NULL
    GROUP BY fonte_financiamento
    ORDER BY SUM(valor) DESC
    LIMIT 1
  ) as fonte_predominante
FROM centros_custo cc
LEFT JOIN movimentos_financeiros mf ON cc.id = mf.centro_custo_id
WHERE cc.ativo = true
GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, cc.projeto_id, cc.orcamento_mensal;

COMMENT ON VIEW vw_funding_breakdown IS 'Breakdown de financiamento por fonte (REC_FOA, FOF_FIN, FOA_AUTO)';
COMMENT ON VIEW vw_cost_center_balances_extended IS 'Saldos de centros de custo com fonte predominante de financiamento';