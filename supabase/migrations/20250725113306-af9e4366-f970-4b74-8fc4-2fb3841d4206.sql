-- Adicionar campos de imposto, desconto e prazo limite às requisições
ALTER TABLE requisicoes 
ADD COLUMN percentual_imposto NUMERIC DEFAULT 0,
ADD COLUMN valor_imposto NUMERIC DEFAULT 0,
ADD COLUMN percentual_desconto NUMERIC DEFAULT 0,
ADD COLUMN valor_desconto NUMERIC DEFAULT 0,
ADD COLUMN prazo_limite_dias INTEGER DEFAULT 7,
ADD COLUMN data_limite DATE,
ADD COLUMN valor_liquido NUMERIC DEFAULT 0;

-- Adicionar limite de gastos aos projetos
ALTER TABLE projetos 
ADD COLUMN limite_gastos BIGINT DEFAULT 0;

-- Função para calcular valor líquido das requisições
CREATE OR REPLACE FUNCTION calculate_valor_liquido(
  valor_base NUMERIC,
  percentual_imposto NUMERIC DEFAULT 0,
  valor_imposto NUMERIC DEFAULT 0,
  percentual_desconto NUMERIC DEFAULT 0,
  valor_desconto NUMERIC DEFAULT 0
) RETURNS NUMERIC AS $$
DECLARE
  valor_com_imposto NUMERIC;
  valor_final NUMERIC;
BEGIN
  -- Calcular valor com imposto
  valor_com_imposto := valor_base + (valor_base * percentual_imposto / 100) + valor_imposto;
  
  -- Aplicar desconto
  valor_final := valor_com_imposto - (valor_com_imposto * percentual_desconto / 100) - valor_desconto;
  
  RETURN GREATEST(0, valor_final);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular dias restantes do prazo
CREATE OR REPLACE FUNCTION calculate_dias_restantes(data_requisicao DATE, prazo_limite_dias INTEGER)
RETURNS TEXT AS $$
DECLARE
  data_limite DATE;
  dias_restantes INTEGER;
BEGIN
  data_limite := data_requisicao + INTERVAL '1 day' * prazo_limite_dias;
  dias_restantes := (data_limite - CURRENT_DATE);
  
  IF dias_restantes < 0 THEN
    RETURN '0/' || prazo_limite_dias || ' (Vencido)';
  ELSE
    RETURN dias_restantes || '/' || prazo_limite_dias;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar data_limite e valor_liquido automaticamente
CREATE OR REPLACE FUNCTION update_requisicao_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular data limite
  NEW.data_limite := NEW.data_requisicao + INTERVAL '1 day' * NEW.prazo_limite_dias;
  
  -- Calcular valor líquido
  NEW.valor_liquido := calculate_valor_liquido(
    NEW.valor,
    COALESCE(NEW.percentual_imposto, 0),
    COALESCE(NEW.valor_imposto, 0),
    COALESCE(NEW.percentual_desconto, 0),
    COALESCE(NEW.valor_desconto, 0)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_requisicao_calculated_fields
  BEFORE INSERT OR UPDATE ON requisicoes
  FOR EACH ROW
  EXECUTE FUNCTION update_requisicao_calculated_fields();