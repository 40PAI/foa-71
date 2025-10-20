-- Fix foreign key conflicts that are causing query ambiguity

-- Drop duplicate foreign keys for materiais_movimentacoes
ALTER TABLE materiais_movimentacoes 
DROP CONSTRAINT IF EXISTS fk_material_movimentacao_material;

-- Drop duplicate foreign keys for guias_consumo  
ALTER TABLE guias_consumo
DROP CONSTRAINT IF EXISTS fk_guia_consumo_projeto;

-- Ensure correct foreign key relationships exist
ALTER TABLE materiais_movimentacoes
ADD CONSTRAINT fk_materiais_movimentacoes_material 
FOREIGN KEY (material_id) REFERENCES materiais_armazem(id);

ALTER TABLE materiais_movimentacoes
ADD CONSTRAINT fk_materiais_movimentacoes_projeto_origem
FOREIGN KEY (projeto_origem_id) REFERENCES projetos(id);

ALTER TABLE materiais_movimentacoes
ADD CONSTRAINT fk_materiais_movimentacoes_projeto_destino  
FOREIGN KEY (projeto_destino_id) REFERENCES projetos(id);

ALTER TABLE guias_consumo
ADD CONSTRAINT fk_guias_consumo_projeto
FOREIGN KEY (projeto_id) REFERENCES projetos(id);

ALTER TABLE guias_consumo_itens
ADD CONSTRAINT fk_guias_consumo_itens_guia
FOREIGN KEY (guia_id) REFERENCES guias_consumo(id);

ALTER TABLE guias_consumo_itens  
ADD CONSTRAINT fk_guias_consumo_itens_material
FOREIGN KEY (material_id) REFERENCES materiais_armazem(id);