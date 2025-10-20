-- Adicionar 6 etapas ao projeto demonstração
DO $$
DECLARE
  v_projeto_id INTEGER;
BEGIN
  SELECT id INTO v_projeto_id FROM projetos WHERE nome = 'Edifício Comercial Talatona Plaza' LIMIT 1;

  IF v_projeto_id IS NOT NULL THEN
    -- Etapa 1: Fundação
    IF NOT EXISTS (SELECT 1 FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 1) THEN
      INSERT INTO etapas_projeto (projeto_id, numero_etapa, nome_etapa, tipo_etapa, responsavel_etapa, data_inicio_etapa, data_fim_prevista_etapa, status_etapa, orcamento_etapa, gasto_etapa, tempo_previsto_dias, tempo_real_dias, observacoes)
      VALUES (v_projeto_id, 1, 'Fundação e Terraplenagem', 'Fundação', 'Mestre João Silva', '2024-09-01', '2024-10-15', 'Concluída', 9000000, 7850000, 45, 45, 'Fundação concluída dentro do prazo');
    END IF;

    -- Etapa 2: Estrutura
    IF NOT EXISTS (SELECT 1 FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 2) THEN
      INSERT INTO etapas_projeto (projeto_id, numero_etapa, nome_etapa, tipo_etapa, responsavel_etapa, data_inicio_etapa, data_fim_prevista_etapa, status_etapa, orcamento_etapa, gasto_etapa, tempo_previsto_dias, tempo_real_dias, observacoes)
      VALUES (v_projeto_id, 2, 'Estrutura de Concreto', 'Estrutura', 'Eng. Pedro Costa', '2024-10-16', '2024-12-30', 'Em Curso', 15000000, 10500000, 76, 53, 'Estrutura em bom ritmo');
    END IF;

    -- Etapa 3: Alvenaria
    IF NOT EXISTS (SELECT 1 FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 3) THEN
      INSERT INTO etapas_projeto (projeto_id, numero_etapa, nome_etapa, tipo_etapa, responsavel_etapa, data_inicio_etapa, data_fim_prevista_etapa, status_etapa, orcamento_etapa, gasto_etapa, tempo_previsto_dias, tempo_real_dias, observacoes)
      VALUES (v_projeto_id, 3, 'Alvenaria e Vedação', 'Alvenaria', 'Mestre António Lopes', '2024-12-01', '2025-02-15', 'Em Curso', 7000000, 4200000, 77, 31, 'Iniciada em paralelo');
    END IF;

    -- Etapa 4: Instalações
    IF NOT EXISTS (SELECT 1 FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 4) THEN
      INSERT INTO etapas_projeto (projeto_id, numero_etapa, nome_etapa, tipo_etapa, responsavel_etapa, data_inicio_etapa, data_fim_prevista_etapa, status_etapa, orcamento_etapa, gasto_etapa, tempo_previsto_dias, tempo_real_dias, observacoes)
      VALUES (v_projeto_id, 4, 'Instalações Elétricas e Hidráulicas', 'Instalações', 'Téc. Manuel Ferreira', '2025-02-16', '2025-04-15', 'Não Iniciada', 6000000, 0, 59, 0, 'Aguardando conclusão');
    END IF;

    -- Etapa 5: Acabamento
    IF NOT EXISTS (SELECT 1 FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 5) THEN
      INSERT INTO etapas_projeto (projeto_id, numero_etapa, nome_etapa, tipo_etapa, responsavel_etapa, data_inicio_etapa, data_fim_prevista_etapa, status_etapa, orcamento_etapa, gasto_etapa, tempo_previsto_dias, tempo_real_dias, observacoes)
      VALUES (v_projeto_id, 5, 'Acabamento e Revestimentos', 'Acabamento', 'Eng. Sofia Martins', '2025-04-16', '2025-06-15', 'Não Iniciada', 6000000, 0, 61, 0, 'Fase final');
    END IF;

    -- Etapa 6: Entrega
    IF NOT EXISTS (SELECT 1 FROM etapas_projeto WHERE projeto_id = v_projeto_id AND numero_etapa = 6) THEN
      INSERT INTO etapas_projeto (projeto_id, numero_etapa, nome_etapa, tipo_etapa, responsavel_etapa, data_inicio_etapa, data_fim_prevista_etapa, status_etapa, orcamento_etapa, gasto_etapa, tempo_previsto_dias, tempo_real_dias, observacoes)
      VALUES (v_projeto_id, 6, 'Entrega e Documentação', 'Entrega', 'Eng. Carlos Mendes', '2025-06-16', '2025-06-30', 'Não Iniciada', 2000000, 0, 15, 0, 'Vistoria e entrega');
    END IF;

    -- Gerar semanas do projeto
    PERFORM generate_project_weeks(v_projeto_id);
  END IF;
END $$;