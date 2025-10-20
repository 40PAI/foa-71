-- FASE 1: Dashboard Executivo
-- Tabela de configurações FOA
CREATE TABLE IF NOT EXISTS public.configuracoes_foa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor_numerico NUMERIC,
  valor_texto TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.configuracoes_foa (chave, valor_numerico, descricao)
VALUES ('custos_suportados_foa', 8000000, 'Custos suportados pela FOA (valor fixo)')
ON CONFLICT (chave) DO NOTHING;

-- View de resumo FOA
CREATE OR REPLACE VIEW public.vw_resumo_foa AS
SELECT 
  p.id as projeto_id,
  p.nome as projeto_nome,
  COALESCE(SUM(CASE WHEN mf.fonte_financiamento = 'FOF_FIN' AND mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END), 0) as fof_financiamento,
  COALESCE((SELECT SUM(valor) FROM reembolsos_foa_fof r WHERE r.projeto_id = p.id AND r.tipo = 'aporte'), 0) as amortizacao,
  COALESCE((SELECT valor_numerico FROM configuracoes_foa WHERE chave = 'custos_suportados_foa'), 0) as custos_suportados,
  COALESCE(SUM(CASE WHEN mf.fonte_financiamento = 'FOF_FIN' AND mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END), 0) - 
  COALESCE((SELECT SUM(valor) FROM reembolsos_foa_fof r WHERE r.projeto_id = p.id AND r.tipo = 'aporte'), 0) as divida_foa_com_fof
FROM projetos p
LEFT JOIN movimentos_financeiros mf ON mf.projeto_id = p.id
GROUP BY p.id, p.nome;

-- FASE 2: DRE por Centro
-- Tabela DRE
CREATE TABLE IF NOT EXISTS public.dre_linhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id INTEGER NOT NULL REFERENCES projetos(id),
  centro_custo_id UUID REFERENCES centros_custo(id),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  receita_cliente NUMERIC DEFAULT 0,
  fof_financiamento NUMERIC DEFAULT 0,
  foa_auto NUMERIC DEFAULT 0,
  custos_totais NUMERIC DEFAULT 0,
  resultado NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(projeto_id, centro_custo_id, mes, ano)
);

-- Função para calcular DRE mensal
CREATE OR REPLACE FUNCTION public.calcular_dre_mensal(
  p_projeto_id INTEGER,
  p_mes INTEGER,
  p_ano INTEGER
)
RETURNS TABLE(
  centro_custo_id UUID,
  centro_nome TEXT,
  receita_cliente NUMERIC,
  fof_financiamento NUMERIC,
  foa_auto NUMERIC,
  custos_totais NUMERIC,
  resultado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id as centro_custo_id,
    cc.nome as centro_nome,
    COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento IS NULL THEN mf.valor ELSE 0 END), 0) as receita_cliente,
    COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'FOF_FIN' THEN mf.valor ELSE 0 END), 0) as fof_financiamento,
    COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' AND mf.fonte_financiamento = 'FOA_AUTO' THEN mf.valor ELSE 0 END), 0) as foa_auto,
    COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as custos_totais,
    COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as resultado
  FROM centros_custo cc
  LEFT JOIN movimentos_financeiros mf ON mf.centro_custo_id = cc.id
    AND EXTRACT(MONTH FROM mf.data_movimento) = p_mes
    AND EXTRACT(YEAR FROM mf.data_movimento) = p_ano
  WHERE cc.projeto_id = p_projeto_id
  GROUP BY cc.id, cc.nome
  ORDER BY cc.nome;
END;
$$ LANGUAGE plpgsql;

-- FASE 6: Automações e Alertas
-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS public.auditoria_movimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movimento_id UUID,
  operacao TEXT NOT NULL,
  usuario_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  projeto_id INTEGER REFERENCES projetos(id),
  centro_custo_id UUID REFERENCES centros_custo(id),
  severidade TEXT DEFAULT 'info',
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger de auditoria
CREATE OR REPLACE FUNCTION public.audit_movimento_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria_movimentos (movimento_id, operacao, usuario_id, dados_anteriores, dados_novos)
    VALUES (OLD.id, 'UPDATE', auth.uid(), row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria_movimentos (movimento_id, operacao, usuario_id, dados_anteriores)
    VALUES (OLD.id, 'DELETE', auth.uid(), row_to_json(OLD));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_movimentos_financeiros
AFTER UPDATE OR DELETE ON movimentos_financeiros
FOR EACH ROW EXECUTE FUNCTION audit_movimento_changes();

-- Função de verificação de orçamento
CREATE OR REPLACE FUNCTION public.check_budget_thresholds()
RETURNS void AS $$
DECLARE
  centro_record RECORD;
  percentual NUMERIC;
BEGIN
  FOR centro_record IN 
    SELECT * FROM vw_cost_center_balances_extended
  LOOP
    percentual := centro_record.percentual_utilizado;
    
    IF percentual >= 100 AND NOT EXISTS (
      SELECT 1 FROM notificacoes 
      WHERE centro_custo_id = centro_record.centro_custo_id 
      AND tipo = 'orcamento_excedido'
      AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      INSERT INTO notificacoes (tipo, titulo, mensagem, centro_custo_id, severidade)
      VALUES (
        'orcamento_excedido',
        'Orçamento Excedido',
        'Centro de custo ' || centro_record.nome || ' excedeu 100% do orçamento',
        centro_record.centro_custo_id,
        'critical'
      );
    ELSIF percentual >= 90 AND percentual < 100 AND NOT EXISTS (
      SELECT 1 FROM notificacoes 
      WHERE centro_custo_id = centro_record.centro_custo_id 
      AND tipo = 'orcamento_90'
      AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      INSERT INTO notificacoes (tipo, titulo, mensagem, centro_custo_id, severidade)
      VALUES (
        'orcamento_90',
        'Atenção: 90% do Orçamento',
        'Centro de custo ' || centro_record.nome || ' atingiu 90% do orçamento',
        centro_record.centro_custo_id,
        'warning'
      );
    ELSIF percentual >= 80 AND percentual < 90 AND NOT EXISTS (
      SELECT 1 FROM notificacoes 
      WHERE centro_custo_id = centro_record.centro_custo_id 
      AND tipo = 'orcamento_80'
      AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      INSERT INTO notificacoes (tipo, titulo, mensagem, centro_custo_id, severidade)
      VALUES (
        'orcamento_80',
        'Alerta: 80% do Orçamento',
        'Centro de custo ' || centro_record.nome || ' atingiu 80% do orçamento',
        centro_record.centro_custo_id,
        'info'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função de previsão de gastos
CREATE OR REPLACE FUNCTION public.prever_gasto_mensal(p_centro_custo_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  media_3_meses NUMERIC;
BEGIN
  SELECT AVG(total_saidas) INTO media_3_meses
  FROM (
    SELECT 
      DATE_TRUNC('month', data_movimento) as mes,
      SUM(valor) as total_saidas
    FROM movimentos_financeiros
    WHERE centro_custo_id = p_centro_custo_id
      AND tipo_movimento = 'saida'
      AND data_movimento >= NOW() - INTERVAL '3 months'
    GROUP BY DATE_TRUNC('month', data_movimento)
    ORDER BY mes DESC
    LIMIT 3
  ) ultimos_meses;
  
  RETURN COALESCE(media_3_meses, 0);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE configuracoes_foa ENABLE ROW LEVEL SECURITY;
ALTER TABLE dre_linhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_movimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on configuracoes_foa" ON configuracoes_foa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on dre_linhas" ON dre_linhas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read on auditoria_movimentos" ON auditoria_movimentos FOR SELECT USING (true);
CREATE POLICY "Allow all on notificacoes" ON notificacoes FOR ALL USING (true) WITH CHECK (true);