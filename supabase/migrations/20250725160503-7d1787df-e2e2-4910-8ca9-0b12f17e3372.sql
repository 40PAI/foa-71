-- Adicionar quinta categoria principal para Segurança e Higiene no Trabalho
ALTER TYPE categoria_principal_enum ADD VALUE 'Segurança e Higiene no Trabalho';

-- Adicionar coluna para categoria secundária na estrutura hierárquica
ALTER TABLE subcategorias_compras 
ADD COLUMN categoria_secundaria TEXT NOT NULL DEFAULT '';

-- Limpar dados existentes para reestruturar
DELETE FROM subcategorias_compras;

-- Inserir dados estruturados hierarquicamente

-- CATEGORIA: Material
INSERT INTO subcategorias_compras (categoria_principal, categoria_secundaria, nome_subcategoria, categoria_financeira, limite_aprovacao_automatica) VALUES
-- Material de Construção
('Material', 'Material de Construção', 'Eletricidade', 'Materiais de Construção', 500000),
('Material', 'Material de Construção', 'Areia', 'Materiais de Construção', 300000),
('Material', 'Material de Construção', 'Cimento', 'Materiais de Construção', 800000),
('Material', 'Material de Construção', 'Blocos', 'Materiais de Construção', 600000),
('Material', 'Material de Construção', 'Ferragens', 'Materiais de Construção', 400000),
('Material', 'Material de Construção', 'Madeira', 'Materiais de Construção', 700000),
('Material', 'Material de Construção', 'Tintas', 'Materiais de Construção', 350000),
('Material', 'Material de Construção', 'Canalização', 'Materiais de Construção', 550000),
('Material', 'Material de Construção', 'Vidros', 'Materiais de Construção', 450000),
('Material', 'Material de Construção', 'Outros', 'Materiais de Construção', 200000);

-- CATEGORIA: Património  
INSERT INTO subcategorias_compras (categoria_principal, categoria_secundaria, nome_subcategoria, categoria_financeira, limite_aprovacao_automatica) VALUES
-- Equipamentos de Obra
('Património', 'Equipamentos de Obra', 'Betoneira', 'Equipamentos', 2000000),
('Património', 'Equipamentos de Obra', 'Andaimes', 'Equipamentos', 1500000),
('Património', 'Equipamentos de Obra', 'Geradores', 'Equipamentos', 3000000),
('Património', 'Equipamentos de Obra', 'Bombas de Água', 'Equipamentos', 1200000),
('Património', 'Equipamentos de Obra', 'Ferramentas Elétricas', 'Equipamentos', 800000),
('Património', 'Equipamentos de Obra', 'Outros', 'Equipamentos', 500000);

-- CATEGORIA: Custos Indiretos
INSERT INTO subcategorias_compras (categoria_principal, categoria_secundaria, nome_subcategoria, categoria_financeira, limite_aprovacao_automatica) VALUES
-- Aluguer de Equipamentos
('Custos Indiretos', 'Aluguer de Equipamentos', 'Aluguer de Betoneira', 'Custos Indiretos', 300000),
('Custos Indiretos', 'Aluguer de Equipamentos', 'Aluguer de Andaimes', 'Custos Indiretos', 250000),
('Custos Indiretos', 'Aluguer de Equipamentos', 'Aluguer de Camionetas', 'Custos Indiretos', 400000),
('Custos Indiretos', 'Aluguer de Equipamentos', 'Outros', 'Custos Indiretos', 150000);

-- CATEGORIA: Mão de Obra
INSERT INTO subcategorias_compras (categoria_principal, categoria_secundaria, nome_subcategoria, categoria_financeira, limite_aprovacao_automatica) VALUES
-- Pagamentos de Mão de Obra
('Mão de Obra', 'Pagamentos de Mão de Obra', 'Contrato diário', 'Mão de Obra', 100000),
('Mão de Obra', 'Pagamentos de Mão de Obra', 'Subempreitadas', 'Mão de Obra', 2000000),
('Mão de Obra', 'Pagamentos de Mão de Obra', 'Pagamentos por semana', 'Mão de Obra', 500000),
('Mão de Obra', 'Pagamentos de Mão de Obra', 'Equipa externa', 'Mão de Obra', 1500000),
('Mão de Obra', 'Pagamentos de Mão de Obra', 'Gratificações', 'Mão de Obra', 200000),
('Mão de Obra', 'Pagamentos de Mão de Obra', 'Outros', 'Mão de Obra', 100000);

-- CATEGORIA: Segurança e Higiene no Trabalho
INSERT INTO subcategorias_compras (categoria_principal, categoria_secundaria, nome_subcategoria, categoria_financeira, limite_aprovacao_automatica) VALUES
-- Equipamentos de Proteção
('Segurança e Higiene no Trabalho', 'Equipamentos de Proteção', 'Capacetes', 'Equipamentos de Segurança', 50000),
('Segurança e Higiene no Trabalho', 'Equipamentos de Proteção', 'Botas', 'Equipamentos de Segurança', 80000),
('Segurança e Higiene no Trabalho', 'Equipamentos de Proteção', 'Colete Reflector', 'Equipamentos de Segurança', 30000),
('Segurança e Higiene no Trabalho', 'Equipamentos de Proteção', 'Luvas', 'Equipamentos de Segurança', 25000),
('Segurança e Higiene no Trabalho', 'Equipamentos de Proteção', 'Óculos de Proteção', 'Equipamentos de Segurança', 40000),
('Segurança e Higiene no Trabalho', 'Equipamentos de Proteção', 'Outros', 'Equipamentos de Segurança', 20000);