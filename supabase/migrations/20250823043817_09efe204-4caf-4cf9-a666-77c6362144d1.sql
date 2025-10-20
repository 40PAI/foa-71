-- Fix foreign key constraints for material movements
ALTER TABLE materiais_movimentacoes 
ADD CONSTRAINT fk_material_movimentacoes_material 
FOREIGN KEY (material_id) REFERENCES materiais_armazem(id) ON DELETE CASCADE;

ALTER TABLE materiais_movimentacoes 
ADD CONSTRAINT fk_material_movimentacoes_projeto_origem 
FOREIGN KEY (projeto_origem_id) REFERENCES projetos(id) ON DELETE SET NULL;

ALTER TABLE materiais_movimentacoes 
ADD CONSTRAINT fk_material_movimentacoes_projeto_destino 
FOREIGN KEY (projeto_destino_id) REFERENCES projetos(id) ON DELETE SET NULL;

-- Fix foreign key constraints for consumption guides
ALTER TABLE guias_consumo 
ADD CONSTRAINT fk_guias_consumo_projeto 
FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE;

ALTER TABLE guias_consumo_itens 
ADD CONSTRAINT fk_guias_consumo_itens_guia 
FOREIGN KEY (guia_id) REFERENCES guias_consumo(id) ON DELETE CASCADE;

ALTER TABLE guias_consumo_itens 
ADD CONSTRAINT fk_guias_consumo_itens_material 
FOREIGN KEY (material_id) REFERENCES materiais_armazem(id) ON DELETE CASCADE;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_materiais_movimentacoes_material_id ON materiais_movimentacoes(material_id);
CREATE INDEX IF NOT EXISTS idx_materiais_movimentacoes_projeto_origem ON materiais_movimentacoes(projeto_origem_id);
CREATE INDEX IF NOT EXISTS idx_materiais_movimentacoes_projeto_destino ON materiais_movimentacoes(projeto_destino_id);
CREATE INDEX IF NOT EXISTS idx_guias_consumo_projeto_id ON guias_consumo(projeto_id);
CREATE INDEX IF NOT EXISTS idx_guias_consumo_itens_guia_id ON guias_consumo_itens(guia_id);
CREATE INDEX IF NOT EXISTS idx_ponto_diario_colaborador_projeto ON ponto_diario(colaborador_id, projeto_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_projeto_status ON requisicoes(id_projeto, status_fluxo);

-- Ensure map_categoria_principal_to_financas function exists
CREATE OR REPLACE FUNCTION public.map_categoria_principal_to_financas(categoria categoria_principal_enum)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN CASE categoria
    WHEN 'Material' THEN 'Materiais de Construção'
    WHEN 'Mão de Obra' THEN 'Mão de Obra'
    WHEN 'Património' THEN 'Equipamentos'
    WHEN 'Custos Indiretos' THEN 'Custos Indiretos'
    ELSE 'Outros'
  END;
END;
$function$;