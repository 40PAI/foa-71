-- Primeiro, fazer backup e limpar dados que podem causar conflito
DELETE FROM subcategorias_compras;

-- Recrear o enum com as 4 categorias principais
DROP TYPE IF EXISTS categoria_principal_enum CASCADE;
CREATE TYPE categoria_principal_enum AS ENUM (
  'Material',
  'Mão de Obra',
  'Património', 
  'Custos Indiretos'
);

-- Recriar colunas categoria_principal nas tabelas
ALTER TABLE requisicoes DROP COLUMN IF EXISTS categoria_principal;
ALTER TABLE requisicoes ADD COLUMN categoria_principal categoria_principal_enum;

ALTER TABLE materiais_armazem DROP COLUMN IF EXISTS categoria_principal;
ALTER TABLE materiais_armazem ADD COLUMN categoria_principal categoria_principal_enum;

ALTER TABLE subcategorias_compras DROP COLUMN IF EXISTS categoria_principal;
ALTER TABLE subcategorias_compras ADD COLUMN categoria_principal categoria_principal_enum NOT NULL;

-- Inserir as subcategorias do novo framework
-- Material
INSERT INTO subcategorias_compras (categoria_principal, nome_subcategoria, categoria_financeira, descricao, limite_aprovacao_automatica) VALUES
('Material', 'Eletricidade', 'Materiais de Construção', 'Cabos, interruptores, tomadas, disjuntores', 500000),
('Material', 'Areia', 'Materiais de Construção', 'Areia fina, grossa, lavada', 300000),
('Material', 'Cimento', 'Materiais de Construção', 'Cimento Portland, especiais', 800000),
('Material', 'Blocos', 'Materiais de Construção', 'Blocos de cimento, cerâmicos', 600000),
('Material', 'Ferragens', 'Materiais de Construção', 'Vergalhões, arames, pregos, parafusos', 400000),
('Material', 'Madeira', 'Materiais de Construção', 'Tábuas, vigas, compensados', 700000),
('Material', 'Tintas', 'Materiais de Construção', 'Tintas, vernizes, primers', 300000),
('Material', 'Canalização', 'Materiais de Construção', 'Tubos, conexões, válvulas', 500000),
('Material', 'Vidros', 'Materiais de Construção', 'Vidros temperados, comuns', 400000),
('Material', 'Capacetes', 'Equipamentos de Segurança', 'Capacetes de segurança', 150000),
('Material', 'Botas', 'Equipamentos de Segurança', 'Botas de segurança', 200000),
('Material', 'Colete Reflector', 'Equipamentos de Segurança', 'Coletes de alta visibilidade', 100000),
('Material', 'Luvas', 'Equipamentos de Segurança', 'Luvas de proteção', 80000),
('Material', 'Óculos de Proteção', 'Equipamentos de Segurança', 'Óculos de segurança', 120000),
('Material', 'Outros', 'Materiais de Construção', 'Outros materiais não categorizados', 200000);

-- Mão de Obra
INSERT INTO subcategorias_compras (categoria_principal, nome_subcategoria, categoria_financeira, descricao, limite_aprovacao_automatica) VALUES
('Mão de Obra', 'Técnicos', 'Mão de Obra', 'Técnicos especializados', 2000000),
('Mão de Obra', 'Operários', 'Mão de Obra', 'Operários de construção civil', 1500000),
('Mão de Obra', 'Especialistas', 'Mão de Obra', 'Especialistas em áreas específicas', 3000000),
('Mão de Obra', 'Consultores', 'Mão de Obra', 'Consultores externos', 5000000),
('Mão de Obra', 'Outros', 'Mão de Obra', 'Outros serviços de mão de obra', 1000000);

-- Património  
INSERT INTO subcategorias_compras (categoria_principal, nome_subcategoria, categoria_financeira, descricao, limite_aprovacao_automatica) VALUES
('Património', 'Betoneira', 'Equipamentos', 'Betoneiras de diferentes capacidades', 8000000),
('Património', 'Andaimes', 'Equipamentos', 'Sistemas de andaimes', 5000000),
('Património', 'Geradores', 'Equipamentos', 'Geradores elétricos', 10000000),
('Património', 'Bombas de Água', 'Equipamentos', 'Bombas de água e drenagem', 3000000),
('Património', 'Ferramentas Elétricas', 'Ferramentas', 'Furadeiras, serras, lixadeiras', 1000000),
('Património', 'Outros', 'Equipamentos', 'Outros equipamentos', 2000000);

-- Custos Indiretos
INSERT INTO subcategorias_compras (categoria_principal, nome_subcategoria, categoria_financeira, descricao, limite_aprovacao_automatica) VALUES
('Custos Indiretos', 'Aluguer de Betoneira', 'Custos Indiretos', 'Aluguer de betoneiras', 500000),
('Custos Indiretos', 'Aluguer de Andaimes', 'Custos Indiretos', 'Aluguer de andaimes', 300000),
('Custos Indiretos', 'Aluguer de Camionetas', 'Custos Indiretos', 'Aluguer de veículos', 800000),
('Custos Indiretos', 'Transporte', 'Custos Indiretos', 'Transporte de materiais e pessoal', 400000),
('Custos Indiretos', 'Seguros', 'Custos Indiretos', 'Seguros de obra e equipamentos', 1000000),
('Custos Indiretos', 'Licenças', 'Custos Indiretos', 'Licenças e alvarás', 500000),
('Custos Indiretos', 'Outros', 'Custos Indiretos', 'Outros custos indiretos', 300000);

-- Atualizar função de mapeamento
CREATE OR REPLACE FUNCTION public.map_categoria_to_financas(categoria_principal categoria_principal_enum, subcategoria text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
  IF subcategoria IS NOT NULL THEN
    RETURN (
      SELECT categoria_financeira 
      FROM subcategorias_compras 
      WHERE categoria_principal = $1 AND nome_subcategoria = subcategoria
      LIMIT 1
    );
  END IF;
  
  RETURN CASE categoria_principal
    WHEN 'Material' THEN 'Materiais de Construção'
    WHEN 'Mão de Obra' THEN 'Mão de Obra'
    WHEN 'Património' THEN 'Equipamentos'
    WHEN 'Custos Indiretos' THEN 'Custos Indiretos'
    ELSE 'Outros'
  END;
END;
$function$;