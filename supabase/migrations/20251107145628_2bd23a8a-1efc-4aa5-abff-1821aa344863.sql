-- Função para sincronizar requisição aprovada com movimento financeiro
CREATE OR REPLACE FUNCTION public.sync_requisicao_to_movimento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  categoria_financeira TEXT;
BEGIN
  -- Quando requisição é aprovada (OC Gerada ou superior)
  IF NEW.status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado') 
     AND (OLD.status_fluxo IS NULL OR OLD.status_fluxo NOT IN ('OC Gerada', 'Recepcionado', 'Liquidado')) THEN
    
    -- Mapear categoria principal para categoria financeira
    categoria_financeira := map_categoria_principal_to_financas(NEW.categoria_principal);
    
    -- Criar movimento financeiro correspondente apenas se não existir
    INSERT INTO movimentos_financeiros (
      projeto_id,
      categoria,
      subcategoria,
      descricao,
      valor,
      tipo_movimento,
      data_movimento,
      status_aprovacao,
      requisicao_id,
      forma_pagamento,
      responsavel_id
    ) 
    SELECT
      NEW.id_projeto,
      categoria_financeira,
      NEW.subcategoria,
      COALESCE(NEW.nome_comercial_produto, '') || 
        CASE WHEN NEW.descricao_tecnica IS NOT NULL 
          THEN ' - ' || NEW.descricao_tecnica 
          ELSE '' 
        END,
      COALESCE(NEW.valor_liquido, NEW.valor),
      'saida',
      NEW.data_requisicao,
      'aprovado',
      NEW.id,
      'oc',
      auth.uid()
    WHERE NOT EXISTS (
      SELECT 1 FROM movimentos_financeiros 
      WHERE requisicao_id = NEW.id
    );
    
    RAISE NOTICE 'Movimento financeiro criado para requisição % no valor de %', NEW.id, COALESCE(NEW.valor_liquido, NEW.valor);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS requisicao_aprovada_sync ON requisicoes;

-- Criar trigger
CREATE TRIGGER requisicao_aprovada_sync
AFTER UPDATE ON requisicoes
FOR EACH ROW
WHEN (NEW.status_fluxo IS DISTINCT FROM OLD.status_fluxo)
EXECUTE FUNCTION sync_requisicao_to_movimento();