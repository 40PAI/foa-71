-- Add new stage types to the enum
ALTER TYPE tipo_etapa_enum ADD VALUE IF NOT EXISTS 'Mobilização';
ALTER TYPE tipo_etapa_enum ADD VALUE IF NOT EXISTS 'Desmobilização';

-- Create table for material movements
CREATE TABLE public.materiais_movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL,
  projeto_origem_id INTEGER,
  projeto_destino_id INTEGER,
  quantidade NUMERIC NOT NULL,
  data_movimentacao DATE NOT NULL DEFAULT CURRENT_DATE,
  responsavel TEXT NOT NULL,
  observacoes TEXT,
  tipo_movimentacao TEXT NOT NULL DEFAULT 'transferencia', -- 'transferencia', 'entrada', 'saida'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_material_movimentacao_material FOREIGN KEY (material_id) REFERENCES materiais_armazem(id),
  CONSTRAINT fk_material_movimentacao_origem FOREIGN KEY (projeto_origem_id) REFERENCES projetos(id),
  CONSTRAINT fk_material_movimentacao_destino FOREIGN KEY (projeto_destino_id) REFERENCES projetos(id)
);

-- Enable RLS
ALTER TABLE public.materiais_movimentacoes ENABLE ROW LEVEL SECURITY;

-- Create policy for material movements
CREATE POLICY "Allow all operations on materiais_movimentacoes" 
ON public.materiais_movimentacoes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create table for consumption guides
CREATE TABLE public.guias_consumo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_guia TEXT NOT NULL UNIQUE,
  projeto_id INTEGER NOT NULL,
  data_consumo DATE NOT NULL DEFAULT CURRENT_DATE,
  responsavel TEXT NOT NULL,
  tarefa_relacionada TEXT,
  frente_servico TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo', -- 'ativo', 'fechado', 'cancelado'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_guia_consumo_projeto FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

-- Enable RLS
ALTER TABLE public.guias_consumo ENABLE ROW LEVEL SECURITY;

-- Create policy for consumption guides
CREATE POLICY "Allow all operations on guias_consumo" 
ON public.guias_consumo 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create table for consumption guide items
CREATE TABLE public.guias_consumo_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guia_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantidade_consumida NUMERIC NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_guia_item_guia FOREIGN KEY (guia_id) REFERENCES guias_consumo(id) ON DELETE CASCADE,
  CONSTRAINT fk_guia_item_material FOREIGN KEY (material_id) REFERENCES materiais_armazem(id)
);

-- Enable RLS
ALTER TABLE public.guias_consumo_itens ENABLE ROW LEVEL SECURITY;

-- Create policy for consumption guide items
CREATE POLICY "Allow all operations on guias_consumo_itens" 
ON public.guias_consumo_itens 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to move materials between projects
CREATE OR REPLACE FUNCTION public.move_material(
  p_material_id UUID,
  p_projeto_origem_id INTEGER,
  p_projeto_destino_id INTEGER,
  p_quantidade NUMERIC,
  p_responsavel TEXT,
  p_observacoes TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  material_record RECORD;
  resultado JSON;
BEGIN
  -- Get material info
  SELECT * INTO material_record 
  FROM materiais_armazem 
  WHERE id = p_material_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Material não encontrado');
  END IF;
  
  -- Check if there's enough stock
  IF material_record.quantidade_stock < p_quantidade THEN
    RETURN json_build_object('success', false, 'message', 'Quantidade insuficiente em stock');
  END IF;
  
  -- Record the movement
  INSERT INTO materiais_movimentacoes (
    material_id, projeto_origem_id, projeto_destino_id, 
    quantidade, responsavel, observacoes
  ) VALUES (
    p_material_id, p_projeto_origem_id, p_projeto_destino_id,
    p_quantidade, p_responsavel, p_observacoes
  );
  
  -- Update material allocation if moving to a different project
  IF p_projeto_destino_id IS NOT NULL AND p_projeto_destino_id != COALESCE(material_record.projeto_alocado_id, 0) THEN
    UPDATE materiais_armazem 
    SET projeto_alocado_id = p_projeto_destino_id,
        updated_at = now()
    WHERE id = p_material_id;
  END IF;
  
  -- If moving out of project (to general warehouse), clear allocation
  IF p_projeto_destino_id IS NULL THEN
    UPDATE materiais_armazem 
    SET projeto_alocado_id = NULL,
        updated_at = now()
    WHERE id = p_material_id;
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Movimentação registada com sucesso');
END;
$$;

-- Create function to process consumption guide
CREATE OR REPLACE FUNCTION public.process_consumption_guide(
  p_guia_id UUID
) RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  guia_record RECORD;
  item_record RECORD;
  resultado JSON;
BEGIN
  -- Get guide info
  SELECT * INTO guia_record 
  FROM guias_consumo 
  WHERE id = p_guia_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Guia não encontrada');
  END IF;
  
  -- Process each item in the guide
  FOR item_record IN 
    SELECT * FROM guias_consumo_itens WHERE guia_id = p_guia_id
  LOOP
    -- Check if there's enough stock
    IF (SELECT quantidade_stock FROM materiais_armazem WHERE id = item_record.material_id) < item_record.quantidade_consumida THEN
      RETURN json_build_object('success', false, 'message', 'Stock insuficiente para material: ' || (SELECT nome_material FROM materiais_armazem WHERE id = item_record.material_id));
    END IF;
    
    -- Deduct from stock
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock - item_record.quantidade_consumida,
        updated_at = now()
    WHERE id = item_record.material_id;
  END LOOP;
  
  -- Mark guide as processed
  UPDATE guias_consumo 
  SET status = 'fechado',
      updated_at = now()
  WHERE id = p_guia_id;
  
  RETURN json_build_object('success', true, 'message', 'Guia de consumo processada com sucesso');
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_materiais_movimentacoes_updated_at
  BEFORE UPDATE ON public.materiais_movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guias_consumo_updated_at
  BEFORE UPDATE ON public.guias_consumo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();