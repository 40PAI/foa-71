-- Adicionar tarefas às etapas do projeto demonstração
DO $$
DECLARE
  v_projeto_id INTEGER;
  v_etapa1_id INTEGER;
  v_etapa2_id INTEGER;
  v_etapa3_id INTEGER;
BEGIN
  SELECT id INTO v_projeto_id FROM projetos WHERE nome = 'Edifício Comercial Talatona Plaza' LIMIT 1;
  
  IF v_projeto_id IS NOT NULL THEN
    -- Buscar IDs das etapas
    SELECT id INTO v_etapa1_id FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 1;
    SELECT id INTO v_etapa2_id FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 2;
    SELECT id INTO v_etapa3_id FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 3;
    
    -- Tarefas da Etapa 1 (Fundação) - Concluídas
    IF NOT EXISTS (SELECT 1 FROM tarefas_lean WHERE id_projeto = v_projeto_id AND descricao = 'Escavação e Terraplenagem') THEN
      INSERT INTO tarefas_lean (id_projeto, id_etapa, descricao, responsavel, prazo, status, percentual_conclusao, tipo, custo_material, custo_mao_obra, gasto_real, tempo_real_dias, preco_unitario, semana_programada)
      VALUES 
        (v_projeto_id, v_etapa1_id, 'Escavação e Terraplenagem', 'Mestre João Silva', '2024-09-15', 'Concluído', 100, 'Infraestrutura', 1800000, 800000, 2600000, 15, 2600000, 1),
        (v_projeto_id, v_etapa1_id, 'Fundações Profundas - Estacas', 'Eng. Pedro Costa', '2024-09-30', 'Concluído', 100, 'Infraestrutura', 3200000, 900000, 4100000, 15, 4100000, 3),
        (v_projeto_id, v_etapa1_id, 'Lastro e Impermeabilização', 'Mestre João Silva', '2024-10-15', 'Concluído', 100, 'Infraestrutura', 850000, 300000, 1150000, 15, 1150000, 5);
    END IF;
    
    -- Tarefas da Etapa 2 (Estrutura) - Em progresso
    IF NOT EXISTS (SELECT 1 FROM tarefas_lean WHERE id_projeto = v_projeto_id AND descricao = 'Estrutura Térreo') THEN
      INSERT INTO tarefas_lean (id_projeto, id_etapa, descricao, responsavel, prazo, status, percentual_conclusao, tipo, custo_material, custo_mao_obra, gasto_real, tempo_real_dias, preco_unitario, semana_programada)
      VALUES 
        (v_projeto_id, v_etapa2_id, 'Estrutura Térreo', 'Eng. Pedro Costa', '2024-11-10', 'Concluído', 100, 'Comercial', 2800000, 1200000, 4000000, 25, 4000000, 7),
        (v_projeto_id, v_etapa2_id, 'Estrutura 1º Pavimento', 'Eng. Pedro Costa', '2024-11-30', 'Concluído', 100, 'Comercial', 2500000, 1100000, 3600000, 20, 3600000, 10),
        (v_projeto_id, v_etapa2_id, 'Estrutura 2º Pavimento', 'Eng. Pedro Costa', '2024-12-20', 'Em Andamento', 75, 'Comercial', 2500000, 1100000, 2700000, 15, 3600000, 13),
        (v_projeto_id, v_etapa2_id, 'Laje de Cobertura', 'Eng. Pedro Costa', '2024-12-30', 'Pendente', 20, 'Comercial', 1200000, 500000, 200000, 3, 1700000, 15);
    END IF;
    
    -- Tarefas da Etapa 3 (Alvenaria) - Em início
    IF NOT EXISTS (SELECT 1 FROM tarefas_lean WHERE id_projeto = v_projeto_id AND descricao = 'Alvenaria Térreo') THEN
      INSERT INTO tarefas_lean (id_projeto, id_etapa, descricao, responsavel, prazo, status, percentual_conclusao, tipo, custo_material, custo_mao_obra, gasto_real, tempo_real_dias, preco_unitario, semana_programada)
      VALUES 
        (v_projeto_id, v_etapa3_id, 'Alvenaria Térreo', 'Mestre António Lopes', '2024-12-25', 'Em Andamento', 60, 'Comercial', 1400000, 600000, 1200000, 18, 2000000, 14),
        (v_projeto_id, v_etapa3_id, 'Alvenaria 1º Pavimento', 'Mestre António Lopes', '2025-01-20', 'Em Andamento', 30, 'Comercial', 1300000, 550000, 555000, 8, 1850000, 17),
        (v_projeto_id, v_etapa3_id, 'Alvenaria 2º Pavimento', 'Mestre António Lopes', '2025-02-10', 'Pendente', 5, 'Comercial', 1300000, 550000, 92500, 5, 1850000, 20),
        (v_projeto_id, v_etapa3_id, 'Contramarcos e Vãos', 'Mestre António Lopes', '2025-02-15', 'Pendente', 0, 'Comercial', 600000, 200000, 0, 0, 800000, 22);
    END IF;
    
    -- Atualizar métricas do projeto
    PERFORM update_project_metrics_with_integrated_finance(v_projeto_id);
  END IF;
END $$;