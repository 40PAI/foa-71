CREATE OR REPLACE FUNCTION public.delete_project_safely(project_id integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rows_deleted integer := 0;
  project_exists boolean := false;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.projetos WHERE id = project_id) INTO project_exists;

  IF NOT project_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Projeto não encontrado ou já foi eliminado.',
      'project_id', project_id,
      'rows_deleted', 0
    );
  END IF;

  BEGIN
    EXECUTE 'ALTER TABLE public.requisicoes DISABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
    EXECUTE 'ALTER TABLE public.tarefas_lean DISABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
    EXECUTE 'ALTER TABLE public.tarefas_lean DISABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    DELETE FROM public.notificacoes
    WHERE projeto_id = project_id
       OR centro_custo_id IN (SELECT id FROM public.centros_custo WHERE projeto_id = project_id)
       OR entidade_id = project_id::text;

    DELETE FROM public.auditoria_movimentos
    WHERE movimento_id IN (SELECT id FROM public.movimentos_financeiros WHERE projeto_id = project_id);

    DELETE FROM public.movimentos_financeiros
    WHERE projeto_id = project_id
       OR requisicao_id IN (SELECT id FROM public.requisicoes WHERE id_projeto = project_id OR projeto_destino_id = project_id)
       OR centro_custo_id IN (SELECT id FROM public.centros_custo WHERE projeto_id = project_id)
       OR etapa_id IN (SELECT id FROM public.etapas_projeto WHERE projeto_id = project_id)
       OR contrato_cliente_id IN (SELECT id FROM public.contratos_clientes WHERE projeto_id = project_id)
       OR contrato_fornecedor_id IN (SELECT id FROM public.contratos_fornecedores WHERE projeto_id = project_id);

    DELETE FROM public.financas
    WHERE id_projeto = project_id
       OR requisicao_id IN (SELECT id FROM public.requisicoes WHERE id_projeto = project_id OR projeto_destino_id = project_id)
       OR centro_custo_id IN (SELECT id FROM public.centros_custo WHERE projeto_id = project_id)
       OR etapa_id IN (SELECT id FROM public.etapas_projeto WHERE projeto_id = project_id);

    DELETE FROM public.fluxo_caixa
    WHERE projeto_id = project_id
       OR etapa_id IN (SELECT id FROM public.etapas_projeto WHERE projeto_id = project_id);

    DELETE FROM public.dre_linhas
    WHERE projeto_id = project_id
       OR centro_custo_id IN (SELECT id FROM public.centros_custo WHERE projeto_id = project_id);

    DELETE FROM public.lancamentos_fornecedor
    WHERE conta_fornecedor_id IN (SELECT id FROM public.contas_correntes_fornecedores WHERE projeto_id = project_id)
       OR centro_custo_id IN (SELECT id FROM public.centros_custo WHERE projeto_id = project_id);

    DELETE FROM public.contas_correntes_fornecedores WHERE projeto_id = project_id;
    DELETE FROM public.contratos_clientes WHERE projeto_id = project_id;
    DELETE FROM public.contratos_fornecedores WHERE projeto_id = project_id;
    DELETE FROM public.gastos_detalhados WHERE projeto_id = project_id;
    DELETE FROM public.reembolsos_foa_fof WHERE projeto_id = project_id;

    DELETE FROM public.materiais_movimentacoes
    WHERE projeto_origem_id = project_id
       OR projeto_destino_id = project_id
       OR guia_consumo_id IN (SELECT id FROM public.guias_consumo WHERE projeto_id = project_id);

    DELETE FROM public.guias_consumo_itens
    WHERE guia_id IN (SELECT id FROM public.guias_consumo WHERE projeto_id = project_id);
    DELETE FROM public.guias_consumo WHERE projeto_id = project_id;
    DELETE FROM public.materiais_alocados WHERE projeto_id = project_id;

    DELETE FROM public.ponto_diario WHERE projeto_id = project_id;
    DELETE FROM public.alocacao_mensal_colaboradores WHERE projeto_id = project_id;
    DELETE FROM public.colaboradores_projetos WHERE projeto_id = project_id;
    UPDATE public.colaboradores SET projeto_id = NULL WHERE projeto_id = project_id;

    DELETE FROM public.tarefas_lean
    WHERE id_projeto = project_id
       OR id_etapa IN (SELECT id FROM public.etapas_projeto WHERE projeto_id = project_id);

    DELETE FROM public.centros_custo WHERE projeto_id = project_id;
    DELETE FROM public.etapas_projeto WHERE projeto_id = project_id;

    DELETE FROM public.dashboard_kpis WHERE projeto_id = project_id;
    DELETE FROM public.documentos_projeto WHERE projeto_id = project_id;
    DELETE FROM public.ppc_historico WHERE projeto_id = project_id;
    DELETE FROM public.semanas_projeto WHERE projeto_id = project_id;
    DELETE FROM public.projeto_status_mensal WHERE projeto_id = project_id;
    DELETE FROM public.incidentes WHERE id_projeto = project_id;
    DELETE FROM public.user_project_access WHERE projeto_id = project_id;

    UPDATE public.patrimonio SET alocado_projeto_id = NULL WHERE alocado_projeto_id = project_id;
    UPDATE public.materiais_armazem SET projeto_alocado_id = NULL WHERE projeto_alocado_id = project_id;
    UPDATE public.clientes SET projeto_id = NULL WHERE projeto_id = project_id;
    UPDATE public.requisicoes SET projeto_destino_id = NULL WHERE projeto_destino_id = project_id;

    DELETE FROM public.requisicoes WHERE id_projeto = project_id;

    DELETE FROM public.projetos WHERE id = project_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;

    BEGIN
      EXECUTE 'ALTER TABLE public.requisicoes ENABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
      EXECUTE 'ALTER TABLE public.tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
      EXECUTE 'ALTER TABLE public.tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    RETURN json_build_object(
      'success', true,
      'message', 'Projeto eliminado com sucesso, incluindo dados dependentes.',
      'project_id', project_id,
      'rows_deleted', rows_deleted
    );

  EXCEPTION WHEN OTHERS THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.requisicoes ENABLE TRIGGER IF EXISTS trigger_update_financas_from_requisicoes';
      EXECUTE 'ALTER TABLE public.tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_change';
      EXECUTE 'ALTER TABLE public.tarefas_lean ENABLE TRIGGER IF EXISTS trigger_update_financas_on_task_delete';
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    RETURN json_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE,
      'detail', SQLERRM,
      'project_id', project_id
    );
  END;
END;
$function$;
