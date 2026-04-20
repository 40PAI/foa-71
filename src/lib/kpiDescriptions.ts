/**
 * Dicionário central de descrições e fórmulas para KPIs e gráficos da plataforma.
 * Usado pelo componente InfoTooltip para mostrar contexto sobre cada métrica.
 */

export interface KpiInfoEntry {
  title?: string;
  description: string;
  formula?: string;
}

export const KPI_INFO = {
  // ===== Dashboard Geral =====
  totalProjetos: {
    description: "Número total de projetos cadastrados na plataforma, independentemente do status.",
    formula: "COUNT(projetos)",
  },
  projetosAtivos: {
    description: "Projetos com status 'Em Andamento' (não concluídos nem cancelados).",
    formula: "COUNT(projetos WHERE status = 'Em Andamento')",
  },
  projetosAtrasados: {
    description: "Projetos ativos cuja data fim prevista já passou.",
    formula: "COUNT(projetos ativos WHERE data_fim_prevista < hoje)",
  },
  orcamentoTotal: {
    description: "Soma do orçamento previsto de todos os projetos cadastrados.",
    formula: "SUM(projetos.orcamento)",
  },
  gastoTotal: {
    description: "Soma de tudo o que já foi gasto em todos os projetos (compras, requisições aprovadas, despesas).",
    formula: "SUM(movimentos_financeiros WHERE tipo = 'saída')",
  },
  saldoDisponivel: {
    description: "Diferença entre o orçamento total previsto e o que já foi gasto.",
    formula: "orcamento_total - gasto_total",
  },
  percentualGasto: {
    description: "Proporção do orçamento total que já foi consumida.",
    formula: "(gasto_total / orcamento_total) × 100",
  },
  avancoMedio: {
    description: "Média aritmética do percentual de avanço físico de todos os projetos ativos.",
    formula: "AVG(projetos_ativos.avanco_fisico)",
  },

  // ===== Fluxo de Caixa =====
  totalEntradas: {
    description: "Soma de todos os movimentos financeiros classificados como entrada/receita no período.",
    formula: "SUM(movimentos WHERE tipo = 'entrada')",
  },
  totalSaidas: {
    description: "Soma de todos os movimentos financeiros classificados como saída/despesa no período.",
    formula: "SUM(movimentos WHERE tipo = 'saída')",
  },
  saldoLiquido: {
    description: "Resultado líquido do período: entradas menos saídas.",
    formula: "total_entradas - total_saidas",
  },
  saldoAcumulado: {
    description: "Saldo acumulado considerando todos os movimentos anteriores até a data atual.",
    formula: "saldo_inicial + Σ(entradas - saídas)",
  },

  // ===== Fornecedores =====
  totalFornecedores: {
    description: "Número de fornecedores cadastrados.",
    formula: "COUNT(fornecedores)",
  },
  totalContratadoFornecedores: {
    description: "Soma do valor total dos contratos com todos os fornecedores.",
    formula: "SUM(contratos_fornecedores.valor_total)",
  },
  totalPagoFornecedores: {
    description: "Soma de todos os pagamentos já realizados a fornecedores.",
    formula: "SUM(pagamentos WHERE tipo = 'fornecedor')",
  },
  saldoDevedor: {
    description: "Valor ainda em dívida com fornecedores: contratado menos pago.",
    formula: "total_contratado - total_pago",
  },
  taxaPagamento: {
    description: "Percentual do valor contratado que já foi efetivamente pago.",
    formula: "(total_pago / total_contratado) × 100",
  },
  prazoMedioPagamento: {
    description: "Prazo médio (em dias) entre a emissão da fatura e o pagamento ao fornecedor.",
    formula: "AVG(data_pagamento - data_emissão)",
  },

  // ===== Clientes =====
  totalClientes: {
    description: "Número de clientes cadastrados.",
    formula: "COUNT(clientes)",
  },
  totalContratadoClientes: {
    description: "Soma do valor total dos contratos firmados com clientes.",
    formula: "SUM(contratos_clientes.valor_total)",
  },
  totalRecebido: {
    description: "Soma de todos os recebimentos já efetivados de clientes.",
    formula: "SUM(recebimentos)",
  },
  saldoReceber: {
    description: "Valor ainda a receber: contratado menos recebido.",
    formula: "total_contratado - total_recebido",
  },
  taxaRecebimento: {
    description: "Percentual do valor contratado que já foi efetivamente recebido.",
    formula: "(total_recebido / total_contratado) × 100",
  },
  prazoMedioRecebimento: {
    description: "Prazo médio (em dias) entre a emissão da fatura e o recebimento.",
    formula: "AVG(data_recebimento - data_emissão)",
  },

  // ===== Gastos de Obra =====
  totalGastosObra: {
    description: "Soma de todos os gastos registrados diretamente na obra.",
    formula: "SUM(gastos_obra.valor)",
  },
  gastosObraMes: {
    description: "Total gasto no mês corrente em todas as obras.",
    formula: "SUM(gastos_obra WHERE mês = mês_atual)",
  },

  // ===== Requisições / Compras =====
  totalRequisicoes: {
    description: "Número total de requisições de compra criadas.",
    formula: "COUNT(requisicoes)",
  },
  requisicoesPendentes: {
    description: "Requisições aguardando aprovação ou processamento.",
    formula: "COUNT(requisicoes WHERE status IN ('Pendente','Em Análise'))",
  },
  requisicoesAprovadas: {
    description: "Requisições aprovadas pela direção e prontas para ordem de compra.",
    formula: "COUNT(requisicoes WHERE status = 'Aprovada')",
  },
  valorTotalCompras: {
    description: "Soma do valor de todas as requisições/ordens de compra geradas.",
    formula: "SUM(requisicoes.valor_total)",
  },
  valorPendenteCompras: {
    description: "Soma do valor de requisições ainda não aprovadas.",
    formula: "SUM(requisicoes.valor WHERE status IN ('Pendente','Em Análise'))",
  },
  requisicoesEmAprovacao: {
    description: "Requisições atualmente em fluxo de cotação ou aprovação técnica.",
    formula: "COUNT(requisicoes WHERE status IN ('Cotações','Aprovação Qualidade','Aprovação Direção'))",
  },
  requisicoesEmProcesso: {
    description: "Requisições ainda em qualquer fase do fluxo de aprovação (não rejeitadas nem totalmente concluídas).",
    formula: "COUNT(requisicoes WHERE status NOT IN ('Liquidado','Rejeitado','Cancelado'))",
  },
  taxaAprovacaoCompras: {
    description: "Percentual de requisições aprovadas em relação ao total submetido.",
    formula: "(aprovadas / total_requisicoes) × 100",
  },
  pendentesAprovacao: {
    description: "Requisições aguardando decisão da direção ou área técnica.",
    formula: "COUNT(requisicoes WHERE status IN ('Pendente','Aprovação Qualidade','Aprovação Direção'))",
  },
  desvioOrcamental: {
    description: "Diferença percentual entre o gasto e o orçamento (positivo = excedeu).",
    formula: "(gasto / orcamento - 1) × 100",
  },
  saldoDisponivelProjeto: {
    description: "Valor ainda disponível do orçamento do projeto.",
    formula: "orcamento - gasto",
  },

  // ===== Armazém / Materiais =====
  totalMateriais: {
    description: "Número de itens distintos cadastrados no armazém.",
    formula: "COUNT(DISTINCT materiais)",
  },
  estoqueCritico: {
    description: "Materiais cuja quantidade em estoque está abaixo do mínimo definido.",
    formula: "COUNT(materiais WHERE quantidade <= estoque_minimo)",
  },
  valorEstoque: {
    description: "Valor total do estoque atual (quantidade × preço unitário).",
    formula: "SUM(quantidade × preco_unitario)",
  },
  consumoMes: {
    description: "Valor total dos materiais consumidos/saídos no mês corrente.",
    formula: "SUM(saídas WHERE mês = mês_atual)",
  },
  entradasMaterial: {
    description: "Total de unidades que entraram no armazém no período (compras, devoluções, transferências de entrada).",
    formula: "SUM(movimentacoes WHERE tipo IN ('entrada','transferencia_entrada'))",
  },
  saidasMaterial: {
    description: "Total de unidades que saíram do armazém para uso/transferência no período.",
    formula: "SUM(movimentacoes WHERE tipo IN ('saida','transferencia_saida'))",
  },
  consumosMaterial: {
    description: "Total de unidades efetivamente consumidas em obra no período.",
    formula: "SUM(movimentacoes WHERE tipo = 'consumo')",
  },
  devolucoesMaterial: {
    description: "Total de unidades devolvidas ao armazém após uso parcial ou cancelamento.",
    formula: "SUM(movimentacoes WHERE tipo = 'devolucao')",
  },
  unidadesEmStock: {
    description: "Soma da quantidade total atualmente disponível no armazém para todos os materiais.",
    formula: "SUM(materiais.quantidade_stock)",
  },
  saudeStock: {
    description: "Percentual de materiais com stock acima do nível mínimo.",
    formula: "(materiais_não_críticos / total_materiais) × 100",
  },

  // ===== RH / Funcionários =====
  totalFuncionarios: {
    description: "Número total de funcionários cadastrados.",
    formula: "COUNT(funcionarios)",
  },
  funcionariosAtivos: {
    description: "Funcionários com status ativo (não desligados).",
    formula: "COUNT(funcionarios WHERE status = 'ativo')",
  },
  funcionariosAlocados: {
    description: "Funcionários atualmente alocados a algum projeto.",
    formula: "COUNT(DISTINCT funcionarios WITH alocacao_ativa)",
  },
  custoMensalRH: {
    description: "Custo total mensal estimado com salários dos funcionários ativos.",
    formula: "SUM(funcionarios_ativos.salario)",
  },
  funcionariosFixos: {
    description: "Colaboradores com vínculo fixo (efetivos), com contrato permanente.",
    formula: "COUNT(funcionarios WHERE tipo_colaborador = 'Fixo')",
  },
  funcionariosTemporarios: {
    description: "Colaboradores com vínculo temporário ou por contrato a prazo.",
    formula: "COUNT(funcionarios WHERE tipo_colaborador = 'Temporário')",
  },
  funcionariosOficiais: {
    description: "Colaboradores com categoria profissional 'Oficial' (técnicos qualificados).",
    formula: "COUNT(funcionarios WHERE categoria = 'Oficial')",
  },
  funcionariosTecnicos: {
    description: "Colaboradores com categoria 'Técnico Superior' (engenheiros, arquitetos, etc.).",
    formula: "COUNT(funcionarios WHERE categoria = 'Técnico Superior')",
  },
  custoHoraMedio: {
    description: "Custo médio por hora dos colaboradores alocados ao projeto.",
    formula: "AVG(funcionarios_alocados.custo_hora)",
  },

  // ===== DRE =====
  receitaBruta: {
    description: "Soma de todas as receitas no período antes de deduções e impostos.",
    formula: "SUM(receitas) no período",
  },
  custosOperacionais: {
    description: "Soma dos custos diretos das operações no período.",
    formula: "SUM(custos_diretos) no período",
  },
  margemBruta: {
    description: "Receita menos custos diretos, em valor absoluto.",
    formula: "receita_bruta - custos_operacionais",
  },
  margemBrutaPercentual: {
    description: "Margem bruta como percentual da receita bruta.",
    formula: "(margem_bruta / receita_bruta) × 100",
  },
  resultadoLiquido: {
    description: "Lucro ou prejuízo final após todos os custos, despesas e impostos.",
    formula: "receita - custos - despesas - impostos",
  },

  // ===== Centros de Custo =====
  totalCentrosCusto: {
    description: "Número de centros de custo configurados.",
    formula: "COUNT(centros_custo)",
  },
  utilizacaoCentroCusto: {
    description: "Percentual do orçamento de cada centro de custo já utilizado.",
    formula: "(gasto_centro / orcamento_centro) × 100",
  },

  // ===== FOA / Reembolsos =====
  totalReembolsos: {
    description: "Soma de todos os reembolsos solicitados pela equipa FOA.",
    formula: "SUM(reembolsos.valor)",
  },
  dividaFOA: {
    description: "Saldo total que a empresa deve à FOA referente a adiantamentos e despesas.",
    formula: "SUM(adiantamentos) - SUM(prestacoes_contas)",
  },

  // ===== Tarefas =====
  totalTarefas: {
    description: "Número total de tarefas registradas em todos os projetos.",
    formula: "COUNT(tarefas)",
  },
  tarefasConcluidas: {
    description: "Tarefas com status concluída.",
    formula: "COUNT(tarefas WHERE status = 'concluída')",
  },
  tarefasEmAndamento: {
    description: "Tarefas atualmente em execução (iniciadas mas ainda não concluídas).",
    formula: "COUNT(tarefas WHERE status = 'em_andamento')",
  },
  tarefasAtrasadas: {
    description: "Tarefas não concluídas cujo prazo já passou.",
    formula: "COUNT(tarefas WHERE status != 'concluída' AND data_fim < hoje)",
  },
  taxaConclusaoTarefas: {
    description: "Percentual de tarefas concluídas em relação ao total planejado.",
    formula: "(tarefas_concluídas / total_tarefas) × 100",
  },
  ppcSemanal: {
    description: "Percentual de Planejamento Concluído: tarefas planejadas para a semana que foram efetivamente concluídas.",
    formula: "(tarefas_concluídas / tarefas_planejadas) × 100",
  },
  ppcProjeto: {
    description: "PPC consolidado do projeto: percentual médio de cumprimento do planeamento ao longo de todas as semanas.",
    formula: "AVG(ppc_semanal) por projeto",
  },
  leadTimeMedio: {
    description: "Tempo médio (em dias) entre a requisição de compra e a entrega/recepção do material.",
    formula: "AVG(data_recepcao - data_requisicao)",
  },
  taxaUtilizacaoEquipamentos: {
    description: "Percentual de tempo em que os equipamentos estão efetivamente em uso vs. disponíveis.",
    formula: "(horas_utilizadas / horas_disponíveis) × 100",
  },

  // ===== Segurança =====
  totalIncidentes: {
    description: "Número total de incidentes de segurança registrados.",
    formula: "COUNT(incidentes)",
  },
  incidentesMes: {
    description: "Incidentes de segurança ocorridos no mês corrente.",
    formula: "COUNT(incidentes WHERE mês = mês_atual)",
  },

  // ===== Gráficos comuns =====
  graficoSCurve: {
    description: "Curva S — compara o avanço físico planejado vs. o realizado ao longo do tempo.",
    formula: "Σ(avanço_acumulado) por período",
  },
  graficoBurndown: {
    description: "Burndown — mostra o trabalho restante (orçamento ou tarefas) ao longo do tempo vs. o ideal.",
    formula: "trabalho_total - trabalho_concluído_acumulado",
  },
  graficoCashFlow: {
    description: "Evolução do fluxo de caixa ao longo do tempo, mostrando entradas, saídas e saldo acumulado.",
    formula: "saldo_t = saldo_(t-1) + entradas_t - saídas_t",
  },
  graficoCategoryBreakdown: {
    description: "Distribuição percentual dos gastos por categoria no período.",
    formula: "(gasto_categoria / gasto_total) × 100",
  },
  graficoTimeline: {
    description: "Linha do tempo dos eventos/fases do projeto com datas de início e fim.",
  },
  graficoHeatmap: {
    description: "Mapa de calor mostrando intensidade de valores numa matriz (ex.: gastos por mês × categoria).",
  },
  graficoTopMateriais: {
    description: "Top materiais com maior consumo ou valor no período selecionado.",
    formula: "TOP N materiais ORDER BY valor DESC",
  },
  graficoSupplierBalance: {
    description: "Treemap dos fornecedores ordenados pelo saldo devedor — área proporcional ao valor.",
    formula: "área ∝ saldo_devedor_fornecedor",
  },
  graficoCriticalStock: {
    description: "Materiais com estoque abaixo do mínimo, ordenados por criticidade.",
    formula: "ORDER BY (quantidade - estoque_minimo) ASC",
  },
  graficoStageComparison: {
    description: "Comparação entre etapas do projeto: orçado vs. realizado.",
    formula: "Por etapa: realizado / orçado",
  },
  graficoIncidentes: {
    description: "Evolução de incidentes de segurança ao longo do tempo.",
    formula: "COUNT(incidentes) por período",
  },
  graficoRadar: {
    description: "Comparação multidimensional de indicadores numa única visualização radial.",
  },
  graficoGauge: {
    description: "Indicador tipo velocímetro mostrando o valor atual em relação a uma meta ou intervalo.",
    formula: "(valor_atual / meta) × 100",
  },
  graficoGroupedBar: {
    description: "Comparação de múltiplas categorias agrupadas lado a lado.",
  },
  graficoStackedBar: {
    description: "Composição de cada categoria empilhada para mostrar o total e suas partes.",
  },
  graficoDonut: {
    description: "Distribuição percentual das categorias num gráfico circular.",
    formula: "(parte / total) × 100",
  },
  graficoSparkline: {
    description: "Mini-gráfico de tendência mostrando a evolução recente do indicador.",
  },
  graficoMaterialFlow: {
    description: "Fluxo de entrada e saída de materiais ao longo do tempo.",
    formula: "Σ(entradas - saídas) por período",
  },
  graficoConsumoProjeto: {
    description: "Consumo de materiais agregado por projeto.",
    formula: "SUM(consumo) GROUP BY projeto",
  },
  graficoCostCenterUtil: {
    description: "Utilização orçamentária de cada centro de custo.",
    formula: "(gasto / orçamento) × 100 por centro",
  },
  graficoStageCosts: {
    description: "Distribuição dos custos pelas etapas do projeto.",
    formula: "(custo_etapa / custo_total) × 100",
  },
  graficoPPC: {
    description: "Histórico do indicador PPC (Percentual de Planejamento Concluído) por semana.",
    formula: "(tarefas_concluídas_semana / tarefas_planejadas_semana) × 100",
  },

  // ===== Centros de Custo (página) =====
  orcamentoCentroCusto: {
    description: "Soma do orçamento mensal alocado aos centros de custo do projeto selecionado.",
    formula: "SUM(centros_custo.orcamento_mensal)",
  },
  gastoCentroCusto: {
    description: "Total efetivamente gasto (saídas) nos centros de custo no período.",
    formula: "SUM(movimentos_financeiros WHERE tipo='saída' AND centro_custo_id IN selecionados)",
  },
  saldoCentroCusto: {
    description: "Saldo disponível em cada centro de custo: orçamento menos gasto.",
    formula: "orçamento - gasto",
  },
  centrosEmAlerta: {
    description: "Número de centros de custo cuja utilização orçamentária já atingiu ou ultrapassou 80%.",
    formula: "COUNT(centros WHERE percentual_utilizado >= 80)",
  },
  graficoEvolucaoTemporalCC: {
    description: "Evolução temporal das entradas e saídas financeiras do centro de custo ao longo do tempo.",
    formula: "SUM(movimentos) GROUP BY data, tipo",
  },
  graficoDespesasCategoriaCC: {
    description: "Distribuição das despesas do centro de custo por categoria principal (Material, Mão de Obra, etc.).",
    formula: "SUM(saídas) GROUP BY categoria",
  },

  // ===== Contas Fornecedores (página) =====
  totalContasFornecedores: {
    description: "Número de contas correntes ativas com fornecedores do projeto.",
    formula: "COUNT(contas_correntes_fornecedores)",
  },
  creditoTotalFornecedores: {
    description: "Soma de todos os créditos (faturas/dívidas a pagar) lançados nas contas correntes de fornecedores.",
    formula: "SUM(lancamentos.credito)",
  },
  debitoTotalFornecedores: {
    description: "Soma de todos os débitos (pagamentos efetuados) lançados nas contas correntes de fornecedores.",
    formula: "SUM(lancamentos.debito)",
  },
  saldoLiquidoFornecedores: {
    description: "Saldo líquido consolidado das contas com fornecedores: débitos menos créditos. Negativo significa dívida pendente.",
    formula: "SUM(débitos) - SUM(créditos)",
  },

  // ===== Dívida FOA (página) =====
  totalCreditosDivida: {
    description: "Soma de todos os créditos/financiamentos recebidos de todas as fontes (FOF, Bancos, Fornecedores, Outros).",
    formula: "SUM(créditos) por fonte",
  },
  totalAmortizadoDivida: {
    description: "Soma de todos os pagamentos/amortizações já realizados sobre as dívidas de todas as fontes.",
    formula: "SUM(amortizações)",
  },
  dividaTotal: {
    description: "Saldo devedor consolidado: total de créditos recebidos menos total já amortizado.",
    formula: "total_créditos - total_amortizado",
  },
  proximoVencimento: {
    description: "Data do próximo vencimento dentro dos próximos 30 dias entre os créditos pendentes.",
    formula: "MIN(data_vencimento WHERE data_vencimento BETWEEN hoje AND hoje+30)",
  },
  dividasPorFonte: {
    description: "Dívida líquida (crédito - amortização) agrupada por fonte: FOF, Bancos, Fornecedores e Outros.",
    formula: "Por fonte: SUM(créditos) - SUM(amortizações)",
  },
  graficoHistoricoMovimentosDivida: {
    description: "Histórico cronológico de todos os movimentos (créditos, amortizações, juros) por fonte.",
  },

  // ===== Tarefas (página) =====
  tarefasEmAndamentoLista: {
    description: "Tarefas atualmente em execução no projeto selecionado.",
    formula: "COUNT(tarefas WHERE status = 'Em Andamento')",
  },

  // ===== Compras (página) =====
  valorTotalRequisicoesCompra: {
    description: "Valor financeiro total das requisições ativas no projeto selecionado.",
    formula: "SUM(requisicoes.valor)",
  },
  leadTimeRequisicoes: {
    description: "Tempo médio (em dias) entre a criação da requisição e a recepção do material/serviço.",
    formula: "AVG(data_recepcao - data_requisicao)",
  },
  pendentesCompras: {
    description: "Requisições aguardando aprovação de qualidade ou direção.",
    formula: "COUNT(requisicoes WHERE status IN ('Aprovação Qualidade','Aprovação Direção'))",
  },
  graficoFluxoRequisicoes: {
    description: "Lista detalhada de todas as requisições com status, urgência e valor — fluxo completo de aprovação.",
  },
  limitesAprovacaoCompras: {
    description: "Limites configurados para aprovação automática vs aprovação financeira vs aprovação direção, baseados no orçamento do projeto.",
    formula: "limite_base × {1, 3.33}",
  },
  observacoesRequisicoes: {
    description: "Observações importantes registradas nas requisições deste projeto que merecem atenção.",
  },
} as const satisfies Record<string, KpiInfoEntry>;

export type KpiInfoKey = keyof typeof KPI_INFO;
