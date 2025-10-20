-- Fix move_material function to properly handle stock quantities and status updates
CREATE OR REPLACE FUNCTION public.move_material(
  p_material_id uuid, 
  p_projeto_origem_id integer, 
  p_projeto_destino_id integer, 
  p_quantidade numeric, 
  p_responsavel text, 
  p_observacoes text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
AS $function$
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
  
  -- Check if there's enough stock for outbound movements (from warehouse to project)
  IF p_projeto_origem_id IS NULL AND p_projeto_destino_id IS NOT NULL THEN
    IF material_record.quantidade_stock < p_quantidade THEN
      RETURN json_build_object('success', false, 'message', 'Quantidade insuficiente em stock');
    END IF;
    
    -- Decrease stock for outbound movement
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock - p_quantidade,
        updated_at = now()
    WHERE id = p_material_id;
    
  -- Increase stock for inbound movements (from project to warehouse)
  ELSIF p_projeto_origem_id IS NOT NULL AND p_projeto_destino_id IS NULL THEN
    -- Increase stock for inbound movement
    UPDATE materiais_armazem 
    SET quantidade_stock = quantidade_stock + p_quantidade,
        updated_at = now()
    WHERE id = p_material_id;
  END IF;
  
  -- Record the movement
  INSERT INTO materiais_movimentacoes (
    material_id, projeto_origem_id, projeto_destino_id, 
    quantidade, responsavel, observacoes
  ) VALUES (
    p_material_id, p_projeto_origem_id, p_projeto_destino_id,
    p_quantidade, p_responsavel, p_observacoes
  );
  
  -- Update material allocation and status based on final stock and allocation
  DECLARE
    final_stock NUMERIC;
    new_status status_material_enum;
    new_allocation INTEGER;
  BEGIN
    -- Get updated stock quantity
    SELECT quantidade_stock INTO final_stock
    FROM materiais_armazem
    WHERE id = p_material_id;
    
    -- Determine new allocation and status
    IF p_projeto_destino_id IS NOT NULL THEN
      -- Moving to a project
      new_allocation := p_projeto_destino_id;
      IF final_stock <= 0 THEN
        new_status := 'Em uso'::status_material_enum;
      ELSE
        new_status := 'Disponível'::status_material_enum;
      END IF;
    ELSIF p_projeto_origem_id IS NOT NULL AND p_projeto_destino_id IS NULL THEN
      -- Moving back to warehouse
      new_allocation := NULL;
      new_status := 'Disponível'::status_material_enum;
    ELSE
      -- Keep current allocation for project-to-project transfers
      new_allocation := COALESCE(p_projeto_destino_id, material_record.projeto_alocado_id);
      IF final_stock <= 0 AND new_allocation IS NOT NULL THEN
        new_status := 'Em uso'::status_material_enum;
      ELSE
        new_status := 'Disponível'::status_material_enum;
      END IF;
    END IF;
    
    -- Update allocation and status
    UPDATE materiais_armazem 
    SET projeto_alocado_id = new_allocation,
        status_item = new_status,
        updated_at = now()
    WHERE id = p_material_id;
  END;
  
  RETURN json_build_object('success', true, 'message', 'Movimentação registada com sucesso');
END;
$function$;