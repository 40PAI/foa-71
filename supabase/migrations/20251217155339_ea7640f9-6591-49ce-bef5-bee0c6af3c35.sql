-- Add new columns to materiais_movimentacoes for full traceability
ALTER TABLE materiais_movimentacoes 
ADD COLUMN IF NOT EXISTS movimentacao_origem_id UUID REFERENCES materiais_movimentacoes(id),
ADD COLUMN IF NOT EXISTS guia_consumo_id UUID REFERENCES guias_consumo(id),
ADD COLUMN IF NOT EXISTS documento_referencia TEXT,
ADD COLUMN IF NOT EXISTS custo_unitario NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS motivo_devolucao TEXT,
ADD COLUMN IF NOT EXISTS estado_material TEXT DEFAULT 'bom';

-- Create table for material allocations to projects
CREATE TABLE IF NOT EXISTS materiais_alocados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materiais_armazem(id) ON DELETE CASCADE,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  quantidade_alocada NUMERIC NOT NULL DEFAULT 0,
  quantidade_consumida NUMERIC NOT NULL DEFAULT 0,
  quantidade_devolvida NUMERIC NOT NULL DEFAULT 0,
  movimentacao_saida_id UUID REFERENCES materiais_movimentacoes(id),
  status TEXT NOT NULL DEFAULT 'alocado',
  etapa_id INTEGER REFERENCES etapas_projeto(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment explaining status values
COMMENT ON COLUMN materiais_alocados.status IS 'Status: alocado, parcialmente_consumido, consumido, devolvido';

-- Enable RLS on materiais_alocados
ALTER TABLE materiais_alocados ENABLE ROW LEVEL SECURITY;

-- Create policy for materiais_alocados
CREATE POLICY "Allow all operations on materiais_alocados" ON materiais_alocados
FOR ALL USING (true) WITH CHECK (true);

-- Create function to calculate quantidade_pendente
CREATE OR REPLACE FUNCTION get_quantidade_pendente(alocacao materiais_alocados)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
  SELECT alocacao.quantidade_alocada - alocacao.quantidade_consumida - alocacao.quantidade_devolvida;
$$;

-- Create trigger to update materiais_alocados.updated_at
CREATE OR REPLACE FUNCTION update_materiais_alocados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_materiais_alocados_updated_at
BEFORE UPDATE ON materiais_alocados
FOR EACH ROW
EXECUTE FUNCTION update_materiais_alocados_updated_at();

-- Create trigger to update materiais_alocados status based on quantities
CREATE OR REPLACE FUNCTION update_alocacao_status()
RETURNS TRIGGER AS $$
DECLARE
  pendente NUMERIC;
BEGIN
  pendente := NEW.quantidade_alocada - NEW.quantidade_consumida - NEW.quantidade_devolvida;
  
  IF NEW.quantidade_devolvida >= NEW.quantidade_alocada THEN
    NEW.status := 'devolvido';
  ELSIF NEW.quantidade_consumida >= NEW.quantidade_alocada THEN
    NEW.status := 'consumido';
  ELSIF NEW.quantidade_consumida > 0 OR NEW.quantidade_devolvida > 0 THEN
    NEW.status := 'parcialmente_consumido';
  ELSE
    NEW.status := 'alocado';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_alocacao_status
BEFORE INSERT OR UPDATE ON materiais_alocados
FOR EACH ROW
EXECUTE FUNCTION update_alocacao_status();

-- Create function to update material stock on movements
CREATE OR REPLACE FUNCTION update_material_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- For entrada type, increase stock
  IF NEW.tipo_movimentacao = 'entrada' THEN
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock + NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.material_id;
  
  -- For saida type, decrease stock
  ELSIF NEW.tipo_movimentacao = 'saida' THEN
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock - NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.material_id;
  
  -- For devolucao type, increase stock (material returning)
  ELSIF NEW.tipo_movimentacao = 'devolucao' THEN
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock + NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.material_id;
  
  -- For ajuste_positivo, increase stock
  ELSIF NEW.tipo_movimentacao = 'ajuste_positivo' THEN
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock + NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.material_id;
  
  -- For ajuste_negativo, decrease stock
  ELSIF NEW.tipo_movimentacao = 'ajuste_negativo' THEN
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock - NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.material_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_movement
AFTER INSERT ON materiais_movimentacoes
FOR EACH ROW
EXECUTE FUNCTION update_material_stock_on_movement();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_materiais_alocados_material ON materiais_alocados(material_id);
CREATE INDEX IF NOT EXISTS idx_materiais_alocados_projeto ON materiais_alocados(projeto_id);
CREATE INDEX IF NOT EXISTS idx_materiais_movimentacoes_tipo ON materiais_movimentacoes(tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_materiais_movimentacoes_data ON materiais_movimentacoes(data_movimentacao);