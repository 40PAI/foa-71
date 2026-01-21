-- Primeiro, remover a função existente
DROP FUNCTION IF EXISTS public.verificar_notificacoes_periodicas();

-- Recriar função de verificação periódica com retorno void
CREATE OR REPLACE FUNCTION public.verificar_notificacoes_periodicas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar orçamentos
  PERFORM check_budget_thresholds();
  
  -- Verificar stock crítico
  PERFORM criar_notificacoes_stock_critico();
END;
$$;