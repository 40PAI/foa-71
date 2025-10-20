-- Primeiro vamos corrigir o erro de coluna ambígua na função get_purchase_breakdown
DROP FUNCTION IF EXISTS public.get_purchase_breakdown(integer);

CREATE OR REPLACE FUNCTION public.get_purchase_breakdown(project_id integer)
RETURNS TABLE(categoria text, total_requisicoes bigint, valor_pendente numeric, valor_aprovado numeric, percentual_aprovacao numeric)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    req.categoria_principal::TEXT,
    COUNT(*)::BIGINT as total_requisicoes,
    COALESCE(SUM(CASE WHEN req.status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção') THEN req.valor ELSE 0 END), 0)::NUMERIC as valor_pendente,
    COALESCE(SUM(CASE WHEN req.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN req.valor ELSE 0 END), 0)::NUMERIC as valor_aprovado,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN req.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100)
      ELSE 0 
    END::NUMERIC as percentual_aprovacao
  FROM requisicoes req
  WHERE req.id_projeto = project_id
  GROUP BY req.categoria_principal
  ORDER BY valor_aprovado DESC;
END;
$function$;

-- Adicionar tabela para subcategorias detalhadas
CREATE TABLE IF NOT EXISTS public.subcategorias_compras (
  id SERIAL PRIMARY KEY,
  categoria_principal categoria_principal_enum NOT NULL,
  nome_subcategoria TEXT NOT NULL,
  categoria_financeira TEXT NOT NULL,
  descricao TEXT,
  limite_aprovacao_automatica BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subcategorias_compras
ALTER TABLE public.subcategorias_compras ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subcategorias_compras
CREATE POLICY "Allow all operations on subcategorias_compras" 
ON public.subcategorias_compras 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Inserir subcategorias baseadas no framework
INSERT INTO public.subcategorias_compras (categoria_principal, nome_subcategoria, categoria_financeira) VALUES
-- Material de Construção
('Material de Construção', 'Eletricidade', 'Materiais de Construção'),
('Material de Construção', 'Areia', 'Materiais de Construção'),
('Material de Construção', 'Cimento', 'Materiais de Construção'),
('Material de Construção', 'Blocos', 'Materiais de Construção'),
('Material de Construção', 'Ferragens', 'Materiais de Construção'),
('Material de Construção', 'Madeira', 'Materiais de Construção'),
('Material de Construção', 'Tintas', 'Materiais de Construção'),
('Material de Construção', 'Canalização', 'Materiais de Construção'),
('Material de Construção', 'Vidros', 'Materiais de Construção'),
('Material de Construção', 'Outros', 'Materiais de Construção'),

-- Equipamento de Obra
('Equipamento de Obra', 'Betoneira', 'Equipamentos'),
('Equipamento de Obra', 'Andaimes', 'Equipamentos'),
('Equipamento de Obra', 'Geradores', 'Equipamentos'),
('Equipamento de Obra', 'Bombas de Água', 'Equipamentos'),
('Equipamento de Obra', 'Ferramentas Elétricas', 'Equipamentos'),
('Equipamento de Obra', 'Outros', 'Equipamentos'),

-- Equipamento de Segurança (EPI)
('Equipamento de Segurança (EPI)', 'Capacetes', 'Equipamentos de Segurança'),
('Equipamento de Segurança (EPI)', 'Botas', 'Equipamentos de Segurança'),
('Equipamento de Segurança (EPI)', 'Colete Reflector', 'Equipamentos de Segurança'),
('Equipamento de Segurança (EPI)', 'Luvas', 'Equipamentos de Segurança'),
('Equipamento de Segurança (EPI)', 'Óculos de Proteção', 'Equipamentos de Segurança'),
('Equipamento de Segurança (EPI)', 'Outros', 'Equipamentos de Segurança');

-- Adicionar campo subcategoria à tabela requisicoes
ALTER TABLE public.requisicoes 
ADD COLUMN IF NOT EXISTS subcategoria TEXT;

-- Atualizar função de mapeamento para incluir subcategorias
CREATE OR REPLACE FUNCTION public.map_categoria_to_financas(categoria_principal categoria_principal_enum, subcategoria TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Se subcategoria for fornecida, usar mapeamento específico
  IF subcategoria IS NOT NULL THEN
    RETURN (
      SELECT categoria_financeira 
      FROM subcategorias_compras 
      WHERE categoria_principal = $1 AND nome_subcategoria = subcategoria
      LIMIT 1
    );
  END IF;
  
  -- Fallback para mapeamento básico
  RETURN CASE categoria_principal
    WHEN 'Material de Construção' THEN 'Materiais de Construção'
    WHEN 'Equipamento de Obra' THEN 'Equipamentos'
    WHEN 'Ferramenta Manual' THEN 'Ferramentas'
    WHEN 'Equipamento Elétrico' THEN 'Equipamentos Elétricos'
    WHEN 'Dispositivo de Medição' THEN 'Instrumentos de Medição'
    WHEN 'Dispositivo de Conectividade' THEN 'Equipamentos de Conectividade'
    WHEN 'Acessório/Sub-dispositivo' THEN 'Acessórios'
    WHEN 'Equipamento de Segurança (EPI)' THEN 'Equipamentos de Segurança'
    ELSE 'Outros'
  END;
END;
$function$;

-- Função para validar limite de gastos do projeto
CREATE OR REPLACE FUNCTION public.validate_project_spending_limit(project_id INTEGER, new_amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $function$
DECLARE
    current_spending NUMERIC;
    spending_limit NUMERIC;
    projected_total NUMERIC;
BEGIN
    -- Obter limite de gastos do projeto
    SELECT limite_gastos INTO spending_limit
    FROM projetos
    WHERE id = project_id;
    
    -- Se não há limite definido, permitir
    IF spending_limit IS NULL OR spending_limit = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Calcular gastos atuais
    SELECT COALESCE(gasto, 0) INTO current_spending
    FROM projetos
    WHERE id = project_id;
    
    -- Calcular total projetado
    projected_total := current_spending + new_amount;
    
    -- Verificar se excede o limite
    RETURN projected_total <= spending_limit;
END;
$function$;

-- Função para obter dados de dashboard integrado com alertas
CREATE OR REPLACE FUNCTION public.get_integrated_dashboard_data(project_id INTEGER)
RETURNS TABLE(
    categoria TEXT,
    valor_orcamentado NUMERIC,
    valor_gasto NUMERIC,
    valor_pendente NUMERIC,
    percentual_execucao NUMERIC,
    status_alerta TEXT,
    limite_excedido BOOLEAN
)
LANGUAGE plpgsql
AS $function$
DECLARE
    projeto_limite NUMERIC;
BEGIN
    -- Obter limite do projeto
    SELECT limite_gastos INTO projeto_limite
    FROM projetos
    WHERE id = project_id;
    
    RETURN QUERY
    SELECT 
        f.categoria,
        COALESCE(f.orcamentado, 0)::NUMERIC as valor_orcamentado,
        COALESCE(f.gasto, 0)::NUMERIC as valor_gasto,
        COALESCE(pb.valor_pendente, 0)::NUMERIC as valor_pendente,
        CASE 
            WHEN COALESCE(f.orcamentado, 0) > 0 THEN 
                (COALESCE(f.gasto, 0)::NUMERIC / COALESCE(f.orcamentado, 0)::NUMERIC * 100)
            ELSE 0 
        END::NUMERIC as percentual_execucao,
        CASE 
            WHEN COALESCE(f.gasto, 0) > COALESCE(f.orcamentado, 0) * 1.1 THEN 'Crítico'
            WHEN COALESCE(f.gasto, 0) > COALESCE(f.orcamentado, 0) * 0.9 THEN 'Atenção'
            ELSE 'Normal'
        END::TEXT as status_alerta,
        CASE 
            WHEN projeto_limite IS NOT NULL AND projeto_limite > 0 THEN
                (COALESCE(f.gasto, 0) + COALESCE(pb.valor_pendente, 0)) > projeto_limite
            ELSE FALSE
        END::BOOLEAN as limite_excedido
    FROM financas f
    LEFT JOIN (
        SELECT 
            map_categoria_to_financas(categoria_principal, subcategoria) as categoria,
            SUM(CASE WHEN status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção') THEN valor ELSE 0 END) as valor_pendente
        FROM requisicoes 
        WHERE id_projeto = project_id
        GROUP BY map_categoria_to_financas(categoria_principal, subcategoria)
    ) pb ON f.categoria = pb.categoria
    WHERE f.id_projeto = project_id;
END;
$function$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_requisicoes_projeto_categoria 
ON requisicoes(id_projeto, categoria_principal);

CREATE INDEX IF NOT EXISTS idx_requisicoes_status_valor 
ON requisicoes(status_fluxo, valor);

CREATE INDEX IF NOT EXISTS idx_financas_projeto_categoria 
ON financas(id_projeto, categoria);

-- Trigger para validar limite de gastos
CREATE OR REPLACE FUNCTION public.validate_requisition_against_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
    projeto_limite NUMERIC;
    gastos_atuais NUMERIC;
    gastos_pendentes NUMERIC;
BEGIN
    -- Verificar se é uma aprovação (mudança para status aprovado)
    IF NEW.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') 
       AND OLD.status_fluxo NOT IN ('OC Gerada', 'Recepcionado', 'Liquidado') THEN
        
        -- Verificar limite do projeto
        IF NOT validate_project_spending_limit(NEW.id_projeto, NEW.valor) THEN
            RAISE EXCEPTION 'Aprovação negada: valor excede limite de gastos do projeto';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Aplicar trigger para validação de limites
DROP TRIGGER IF EXISTS trigger_validate_requisition_limits ON requisicoes;
CREATE TRIGGER trigger_validate_requisition_limits
    BEFORE UPDATE ON requisicoes
    FOR EACH ROW
    EXECUTE FUNCTION validate_requisition_against_limits();