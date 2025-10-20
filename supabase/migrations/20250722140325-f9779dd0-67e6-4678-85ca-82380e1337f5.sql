
-- Função para mapear categoria_principal para categorias financeiras
CREATE OR REPLACE FUNCTION map_categoria_principal_to_financas(categoria_principal categoria_principal_enum)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE categoria_principal
    WHEN 'Material de Construção' THEN 'Materiais de Construção'
    WHEN 'Equipamento de Obra' THEN 'Equipamentos'
    WHEN 'Ferramenta Manual' THEN 'Ferramentas'
    WHEN 'Equipamento Elétrico' THEN 'Equipamentos Elétricos'
    WHEN 'Dispositivo de Medição' THEN 'Instrumentos de Medição'
    WHEN 'Dispositivo de Conectividade' THEN 'Equipamentos de Conectividade'
    WHEN 'Acessório/Sub-dispositivo' THEN 'Acessórios'
    WHEN 'Equipamento de Segurança (EPI)' THEN 'Equipamentos de Segurança'
    ELSE 'Outros'
  END;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar finanças baseado nas requisições
CREATE OR REPLACE FUNCTION update_financas_from_requisicoes()
RETURNS TRIGGER AS $$
DECLARE
  categoria_financeira TEXT;
  projeto_id INTEGER;
  valor_gasto BIGINT;
BEGIN
  -- Usar NEW para operações INSERT/UPDATE, OLD para DELETE
  projeto_id := COALESCE(NEW.id_projeto, OLD.id_projeto);
  categoria_financeira := map_categoria_principal_to_financas(COALESCE(NEW.categoria_principal, OLD.categoria_principal));
  
  -- Calcular total gasto para esta categoria e projeto (apenas requisições aprovadas/liquidadas)
  SELECT COALESCE(SUM(valor), 0) INTO valor_gasto
  FROM requisicoes 
  WHERE id_projeto = projeto_id 
    AND map_categoria_principal_to_financas(categoria_principal) = categoria_financeira
    AND status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado');
  
  -- Atualizar ou inserir na tabela financas
  INSERT INTO financas (id_projeto, categoria, gasto, orcamentado)
  VALUES (projeto_id, categoria_financeira, valor_gasto, 0)
  ON CONFLICT (id_projeto, categoria) 
  DO UPDATE SET 
    gasto = valor_gasto,
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar finanças quando requisições mudam
DROP TRIGGER IF EXISTS trigger_update_financas_from_requisicoes ON requisicoes;
CREATE TRIGGER trigger_update_financas_from_requisicoes
  AFTER INSERT OR UPDATE OR DELETE ON requisicoes
  FOR EACH ROW
  EXECUTE FUNCTION update_financas_from_requisicoes();

-- Função para detectar discrepâncias entre gastos manuais e calculados
CREATE OR REPLACE FUNCTION detect_financial_discrepancies(project_id INTEGER)
RETURNS TABLE (
  categoria TEXT,
  gasto_manual BIGINT,
  gasto_calculado BIGINT,
  discrepancia BIGINT,
  percentual_discrepancia NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.categoria,
    f.gasto as gasto_manual,
    COALESCE(calc.gasto_calculado, 0) as gasto_calculado,
    (f.gasto - COALESCE(calc.gasto_calculado, 0)) as discrepancia,
    CASE 
      WHEN COALESCE(calc.gasto_calculado, 0) > 0 THEN
        ROUND(((f.gasto - COALESCE(calc.gasto_calculado, 0))::NUMERIC / calc.gasto_calculado::NUMERIC) * 100, 2)
      ELSE 0
    END as percentual_discrepancia
  FROM financas f
  LEFT JOIN (
    SELECT 
      map_categoria_principal_to_financas(categoria_principal) as categoria,
      SUM(valor) as gasto_calculado
    FROM requisicoes 
    WHERE id_projeto = project_id 
      AND status_fluxo IN ('OC Gerada', 'Recepcionado', 'Liquidado')
    GROUP BY map_categoria_principal_to_financas(categoria_principal)
  ) calc ON f.categoria = calc.categoria
  WHERE f.id_projeto = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter requisições pendentes de aprovação por projeto
CREATE OR REPLACE FUNCTION get_pending_approvals(project_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  nome_comercial_produto TEXT,
  categoria_principal TEXT,
  valor BIGINT,
  status_fluxo TEXT,
  data_requisicao DATE,
  requisitante TEXT,
  urgencia_prioridade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.nome_comercial_produto,
    r.categoria_principal::TEXT,
    r.valor,
    r.status_fluxo::TEXT,
    r.data_requisicao,
    r.requisitante,
    r.urgencia_prioridade::TEXT
  FROM requisicoes r
  WHERE r.id_projeto = project_id 
    AND r.status_fluxo IN ('Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção')
  ORDER BY 
    CASE r.urgencia_prioridade
      WHEN 'Alta' THEN 1
      WHEN 'Média' THEN 2
      WHEN 'Baixa' THEN 3
    END,
    r.data_requisicao ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar realtime para as tabelas
ALTER TABLE requisicoes REPLICA IDENTITY FULL;
ALTER TABLE financas REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE requisicoes;
ALTER PUBLICATION supabase_realtime ADD TABLE financas;
