
-- Atualizar função de mapeamento de categorias para incluir Segurança e Higiene
CREATE OR REPLACE FUNCTION public.map_categoria_principal_to_financas(categoria TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE 
    WHEN categoria ILIKE '%material%' THEN 'Material'
    WHEN categoria ILIKE '%mão%' OR categoria ILIKE '%mao%' OR categoria ILIKE '%obra%' THEN 'Mão de Obra'
    WHEN categoria ILIKE '%patrimônio%' OR categoria ILIKE '%patrimonio%' OR categoria ILIKE '%equipamento%' THEN 'Patrimônio'
    WHEN categoria ILIKE '%custo%' OR categoria ILIKE '%indireto%' THEN 'Custos Indiretos'
    WHEN categoria ILIKE '%segurança%' OR categoria ILIKE '%seguranca%' OR categoria ILIKE '%higiene%' OR categoria ILIKE '%sht%' THEN 'Segurança e Higiene'
    ELSE 'Outros'
  END;
END;
$$;

-- Atualizar o movimento existente que foi mapeado incorretamente
UPDATE movimentos_financeiros 
SET categoria = 'Segurança e Higiene'
WHERE requisicao_id = 26 
  AND categoria = 'Outros';

-- Atualizar também a descrição para melhor identificação
UPDATE movimentos_financeiros 
SET descricao = 'REQ #' || requisicao_id || ' - ' || COALESCE(descricao, '')
WHERE requisicao_id IS NOT NULL 
  AND descricao NOT LIKE 'REQ #%';
