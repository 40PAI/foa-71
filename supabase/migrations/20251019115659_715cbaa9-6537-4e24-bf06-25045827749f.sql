-- ====================================
-- FASE 1: ESTRUTURAÇÃO DOS CENTROS DE CUSTO
-- ====================================

-- Tabela de Centros de Custo
CREATE TABLE IF NOT EXISTS public.centros_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('projeto', 'departamento', 'categoria', 'fornecedor')),
  projeto_id INTEGER REFERENCES public.projetos(id) ON DELETE CASCADE,
  departamento TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  responsavel_id UUID REFERENCES auth.users(id),
  orcamento_mensal NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Movimentos Financeiros (substituirá fluxo_caixa gradualmente)
CREATE TABLE IF NOT EXISTS public.movimentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id INTEGER NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  centro_custo_id UUID REFERENCES public.centros_custo(id),
  data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida')),
  fonte_financiamento TEXT CHECK (fonte_financiamento IN ('proprio', 'cliente', 'financiamento', 'investidor', 'outro')),
  
  -- Categorização
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  descricao TEXT NOT NULL,
  
  -- Valores
  valor NUMERIC NOT NULL CHECK (valor > 0),
  valor_liquido NUMERIC,
  
  -- Informações Fiscais
  numero_documento TEXT,
  nota_fiscal_url TEXT,
  comprovante_url TEXT,
  
  -- Informações de Pagamento
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'cheque', 'cartao', 'boleto', 'pix')),
  banco TEXT,
  conta TEXT,
  
  -- Aprovação
  status_aprovacao TEXT DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  aprovado_por UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMPTZ,
  
  -- Vínculos com outros módulos
  requisicao_id INTEGER REFERENCES public.requisicoes(id),
  tarefa_id INTEGER REFERENCES public.tarefas_lean(id),
  etapa_id INTEGER REFERENCES public.etapas_projeto(id),
  contrato_cliente_id UUID REFERENCES public.contratos_clientes(id),
  contrato_fornecedor_id UUID REFERENCES public.contratos_fornecedores(id),
  
  -- Metadados
  responsavel_id UUID REFERENCES auth.users(id),
  observacoes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- View Materializada para Saldos dos Centros de Custo
CREATE MATERIALIZED VIEW IF NOT EXISTS public.saldos_centros_custo AS
SELECT 
  cc.id as centro_custo_id,
  cc.codigo,
  cc.nome,
  cc.tipo,
  cc.projeto_id,
  cc.orcamento_mensal,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE 0 END), 0) as total_entradas,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as total_saidas,
  COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'entrada' THEN mf.valor ELSE -mf.valor END), 0) as saldo,
  COUNT(mf.id) as total_movimentos,
  CASE 
    WHEN cc.orcamento_mensal > 0 THEN 
      (COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) / cc.orcamento_mensal * 100)
    ELSE 0 
  END as percentual_utilizado
FROM public.centros_custo cc
LEFT JOIN public.movimentos_financeiros mf ON cc.id = mf.centro_custo_id
WHERE cc.ativo = true
GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, cc.projeto_id, cc.orcamento_mensal;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_centros_custo_projeto ON public.centros_custo(projeto_id);
CREATE INDEX IF NOT EXISTS idx_centros_custo_tipo ON public.centros_custo(tipo);
CREATE INDEX IF NOT EXISTS idx_centros_custo_ativo ON public.centros_custo(ativo);

CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_projeto ON public.movimentos_financeiros(projeto_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_centro_custo ON public.movimentos_financeiros(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_data ON public.movimentos_financeiros(data_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_tipo ON public.movimentos_financeiros(tipo_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_categoria ON public.movimentos_financeiros(categoria);
CREATE INDEX IF NOT EXISTS idx_movimentos_financeiros_status ON public.movimentos_financeiros(status_aprovacao);

-- ====================================
-- FASE 2: INTEGRAÇÃO COM SISTEMA EXISTENTE
-- ====================================

-- Adicionar centro_custo_id à tabela financas
ALTER TABLE public.financas 
ADD COLUMN IF NOT EXISTS centro_custo_id UUID REFERENCES public.centros_custo(id);

CREATE INDEX IF NOT EXISTS idx_financas_centro_custo ON public.financas(centro_custo_id);

-- ====================================
-- FASE 4: AUTOMAÇÕES E INTELIGÊNCIA
-- ====================================

-- Função para categorização automática de despesas
CREATE OR REPLACE FUNCTION public.auto_categorize_expense(descricao_texto TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Material de Construção
  IF descricao_texto ~* '(cimento|areia|brita|ferro|tijolo|bloco|argamassa|concreto|material)' THEN
    RETURN 'Materiais de Construção';
  END IF;
  
  -- Equipamentos
  IF descricao_texto ~* '(equipamento|gerador|betoneira|andaime|ferramenta|máquina|aluguel|locação)' THEN
    RETURN 'Equipamentos';
  END IF;
  
  -- Mão de Obra
  IF descricao_texto ~* '(salário|mão.?de.?obra|pedreiro|servente|encarregado|engenheiro|pagamento|trabalhador)' THEN
    RETURN 'Mão de Obra';
  END IF;
  
  -- Logística
  IF descricao_texto ~* '(transporte|frete|combustível|diesel|gasolina|caminhão|entrega)' THEN
    RETURN 'Custos Indiretos';
  END IF;
  
  -- Administrativo
  IF descricao_texto ~* '(escritório|administrativo|água|luz|energia|telefone|internet|contabilidade)' THEN
    RETURN 'Custos Indiretos';
  END IF;
  
  -- Default
  RETURN 'Outros';
END;
$$;

-- Trigger para verificar alertas de orçamento
CREATE OR REPLACE FUNCTION public.check_budget_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  saldo_record RECORD;
  percentual_usado NUMERIC;
BEGIN
  -- Se tem centro de custo associado
  IF NEW.centro_custo_id IS NOT NULL THEN
    -- Buscar informações do centro de custo
    SELECT * INTO saldo_record
    FROM public.saldos_centros_custo
    WHERE centro_custo_id = NEW.centro_custo_id;
    
    -- Calcular percentual usado
    IF saldo_record.orcamento_mensal > 0 THEN
      percentual_usado := (saldo_record.total_saidas / saldo_record.orcamento_mensal * 100);
      
      -- Alertas em diferentes níveis
      IF percentual_usado >= 100 THEN
        RAISE NOTICE 'ALERTA CRÍTICO: Centro de custo % excedeu 100%% do orçamento!', saldo_record.nome;
      ELSIF percentual_usado >= 90 THEN
        RAISE NOTICE 'ALERTA ALTO: Centro de custo % atingiu 90%% do orçamento!', saldo_record.nome;
      ELSIF percentual_usado >= 80 THEN
        RAISE NOTICE 'ALERTA MÉDIO: Centro de custo % atingiu 80%% do orçamento!', saldo_record.nome;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger nos movimentos financeiros
DROP TRIGGER IF EXISTS trigger_budget_alerts ON public.movimentos_financeiros;
CREATE TRIGGER trigger_budget_alerts
  AFTER INSERT OR UPDATE ON public.movimentos_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.check_budget_alerts();

-- Função para gerar relatório mensal
CREATE OR REPLACE FUNCTION public.generate_monthly_report(
  p_projeto_id INTEGER,
  p_mes INTEGER,
  p_ano INTEGER
)
RETURNS TABLE(
  centro_custo TEXT,
  orcamento NUMERIC,
  gasto NUMERIC,
  saldo NUMERIC,
  percentual_usado NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.nome as centro_custo,
    cc.orcamento_mensal as orcamento,
    COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as gasto,
    cc.orcamento_mensal - COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) as saldo,
    CASE 
      WHEN cc.orcamento_mensal > 0 THEN 
        (COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) / cc.orcamento_mensal * 100)
      ELSE 0 
    END as percentual_usado,
    CASE 
      WHEN cc.orcamento_mensal = 0 THEN 'Sem Orçamento'
      WHEN COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) > cc.orcamento_mensal THEN 'Excedido'
      WHEN COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) / cc.orcamento_mensal >= 0.9 THEN 'Crítico'
      WHEN COALESCE(SUM(CASE WHEN mf.tipo_movimento = 'saida' THEN mf.valor ELSE 0 END), 0) / cc.orcamento_mensal >= 0.8 THEN 'Atenção'
      ELSE 'Normal'
    END as status
  FROM public.centros_custo cc
  LEFT JOIN public.movimentos_financeiros mf ON cc.id = mf.centro_custo_id
    AND EXTRACT(MONTH FROM mf.data_movimento) = p_mes
    AND EXTRACT(YEAR FROM mf.data_movimento) = p_ano
  WHERE cc.projeto_id = p_projeto_id
    AND cc.ativo = true
  GROUP BY cc.id, cc.nome, cc.orcamento_mensal
  ORDER BY percentual_usado DESC;
END;
$$;

-- ====================================
-- TRIGGERS E ATUALIZAÇÕES
-- ====================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_centros_custo_updated_at ON public.centros_custo;
CREATE TRIGGER update_centros_custo_updated_at
  BEFORE UPDATE ON public.centros_custo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_movimentos_financeiros_updated_at ON public.movimentos_financeiros;
CREATE TRIGGER update_movimentos_financeiros_updated_at
  BEFORE UPDATE ON public.movimentos_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para refresh da view materializada
CREATE OR REPLACE FUNCTION public.refresh_saldos_centros_custo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.saldos_centros_custo;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS refresh_saldos_on_movimento ON public.movimentos_financeiros;
CREATE TRIGGER refresh_saldos_on_movimento
  AFTER INSERT OR UPDATE OR DELETE ON public.movimentos_financeiros
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_saldos_centros_custo();

-- ====================================
-- RLS POLICIES
-- ====================================

ALTER TABLE public.centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_financeiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on centros_custo"
  ON public.centros_custo
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on movimentos_financeiros"
  ON public.movimentos_financeiros
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Refresh inicial da view materializada
REFRESH MATERIALIZED VIEW public.saldos_centros_custo;