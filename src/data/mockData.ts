
export interface Projeto {
  id: number;
  nome: string;
  cliente: string;
  orcamento: number;
  gasto: number;
  avanco_fisico: number;
  avanco_financeiro: number;
  avanco_tempo: number;
  data_inicio: string;
  data_fim_prevista: string;
  status: 'Em Andamento' | 'Atrasado' | 'Concluído' | 'Pausado';
  encarregado: string;
  limite_aprovacao: number;
}

export interface Financa {
  id_projeto: number;
  categoria: string;
  orcamentado: number;
  gasto: number;
}

export interface Requisicao {
  id: number;
  id_material: number;
  id_projeto: number;
  valor: number;
  aprovacao_qualidade: boolean;
  status_fluxo: 'Pendente' | 'Cotações' | 'Aprovação Qualidade' | 'Aprovação Direção' | 'OC Gerada' | 'Recepcionado' | 'Liquidado';
  data_requisicao: string;
  requisitante: string;
  observacoes?: string;
}

export interface Material {
  id: number;
  nome: string;
  codigo: string;
  unidade: string;
  grupo_lean: string;
  necessita_aprovacao_qualidade: boolean;
}

export interface FichaTecnica {
  id: number;
  id_material: number;
  pdf_url: string;
  aprovado_por: string;
  data_aprovacao: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

export interface Patrimonio {
  id: string;
  nome: string;
  codigo: string;
  alocado_projeto_id: number | null;
  status: 'Em Uso' | 'Disponível' | 'Manutenção' | 'Transferência';
  tipo: 'Gerador' | 'Betoneira' | 'Andaime' | 'Ferramenta' | 'Outros';
}

export interface Colaborador {
  id: number;
  nome: string;
  cargo: string;
  categoria: string;
  custo_hora: number;
  projeto_id: number;
  hora_entrada: string | null;
  hora_saida: string | null;
  offline_token?: string;
}

export interface Incidente {
  id: number;
  data: string;
  id_projeto: number;
  tipo: 'Incidente' | 'Near-miss';
  descricao: string;
  severidade: 'Baixa' | 'Média' | 'Alta';
  etapa_relacionada: string;
  reportado_por: string;
}

export interface TarefaLean {
  id: number;
  id_projeto: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  percentual_conclusao: number;
  tipo: 'PDCA' | '5S' | 'Melhoria' | 'Corretiva';
}

export interface EPI {
  id: number;
  codigo: string;
  descricao: string;
  tarefa_relacionada: string;
  estoque_minimo: number;
  estoque_atual: number;
}

export interface DashboardKPI {
  projeto_id: number;
  avanco_fisico_real: number;
  avanco_financeiro_real: number;
  desvio_prazo_dias: number;
  lead_time_compras_medio: number;
  absentismo_percentual: number;
  status_alerta: 'Verde' | 'Amarelo' | 'Vermelho';
}

// Dados expandidos baseados nos requisitos
export const mockData = {
  projetos: [
    { 
      id: 1, 
      nome: 'Ed. Atlântico', 
      cliente: 'Imobiliária Horizonte', 
      orcamento: 500000000, 
      gasto: 380000000, 
      avanco_fisico: 75, 
      avanco_financeiro: 76,
      avanco_tempo: 68,
      data_inicio: '2024-01-15',
      data_fim_prevista: '2025-06-30',
      status: 'Atrasado' as const,
      encarregado: 'Eng. João Silva',
      limite_aprovacao: 10000000
    },
    { 
      id: 2, 
      nome: 'Cond. Baía Azul', 
      cliente: 'Grupo V&V', 
      orcamento: 350000000, 
      gasto: 150000000, 
      avanco_fisico: 42, 
      avanco_financeiro: 43,
      avanco_tempo: 45,
      data_inicio: '2024-03-01',
      data_fim_prevista: '2025-08-15',
      status: 'Em Andamento' as const,
      encarregado: 'Eng. Maria Costa',
      limite_aprovacao: 3000000
    },
    { 
      id: 3, 
      nome: 'Hospital Central', 
      cliente: 'Governo Provincial', 
      orcamento: 800000000, 
      gasto: 780000000, 
      avanco_fisico: 95, 
      avanco_financeiro: 97.5,
      avanco_tempo: 92,
      data_inicio: '2023-06-01',
      data_fim_prevista: '2025-01-30',
      status: 'Em Andamento' as const,
      encarregado: 'Eng. Carlos Mendes',
      limite_aprovacao: 10000000
    },
  ] as Projeto[],
  
  financas: [
    { id_projeto: 1, categoria: 'Mão-de-Obra', orcamentado: 150000000, gasto: 165000000 },
    { id_projeto: 1, categoria: 'Materiais', orcamentado: 250000000, gasto: 200000000 },
    { id_projeto: 1, categoria: 'Serviços Terceiros', orcamentado: 50000000, gasto: 15000000 },
    { id_projeto: 1, categoria: 'Administrativos', orcamentado: 30000000, gasto: 25000000 },
    { id_projeto: 1, categoria: 'Outros', orcamentado: 20000000, gasto: 10000000 },
    { id_projeto: 2, categoria: 'Mão-de-Obra', orcamentado: 100000000, gasto: 40000000 },
    { id_projeto: 2, categoria: 'Materiais', orcamentado: 200000000, gasto: 110000000 },
    { id_projeto: 2, categoria: 'Serviços Terceiros', orcamentado: 30000000, gasto: 8000000 },
    { id_projeto: 3, categoria: 'Mão-de-Obra', orcamentado: 300000000, gasto: 295000000 },
    { id_projeto: 3, categoria: 'Materiais', orcamentado: 400000000, gasto: 385000000 },
    { id_projeto: 3, categoria: 'Serviços Terceiros', orcamentado: 80000000, gasto: 75000000 },
    { id_projeto: 3, categoria: 'Administrativos', orcamentado: 20000000, gasto: 25000000 },
  ] as Financa[],
  
  requisicoes: [
    { 
      id: 101, 
      id_material: 1, 
      id_projeto: 1, 
      valor: 2500000, 
      aprovacao_qualidade: false, 
      status_fluxo: 'OC Gerada' as const,
      data_requisicao: '2025-01-10',
      requisitante: 'Eng. João Silva',
      observacoes: 'Urgente para fundação'
    },
    { 
      id: 102, 
      id_material: 2, 
      id_projeto: 2, 
      valor: 4500000, 
      aprovacao_qualidade: true, 
      status_fluxo: 'Aprovação Qualidade' as const,
      data_requisicao: '2025-01-12',
      requisitante: 'Eng. Maria Costa'
    },
    { 
      id: 103, 
      id_material: 3, 
      id_projeto: 1, 
      valor: 12000000, 
      aprovacao_qualidade: false, 
      status_fluxo: 'Aprovação Direção' as const,
      data_requisicao: '2025-01-08',
      requisitante: 'Eng. João Silva',
      observacoes: 'Equipamento crítico para cronograma'
    },
    { 
      id: 104, 
      id_material: 4, 
      id_projeto: 2, 
      valor: 1500000, 
      aprovacao_qualidade: true, 
      status_fluxo: 'Cotações' as const,
      data_requisicao: '2025-01-14',
      requisitante: 'Enc. Pedro Santos'
    },
  ] as Requisicao[],
  
  materiais: [
    { id: 1, nome: 'Cimento Portland', codigo: 'CIM-001', unidade: 'Saco 50kg', grupo_lean: 'Estrutura', necessita_aprovacao_qualidade: false },
    { id: 2, nome: 'Vergalhão de Aço CA-50 12mm', codigo: 'ACO-012', unidade: 'Vara 12m', grupo_lean: 'Estrutura', necessita_aprovacao_qualidade: true },
    { id: 3, nome: 'Gerador 50kVA', codigo: 'GER-050', unidade: 'Unidade', grupo_lean: 'Equipamento', necessita_aprovacao_qualidade: false },
    { id: 4, nome: 'EPI - Capacete', codigo: 'EPI-001', unidade: 'Unidade', grupo_lean: 'Segurança', necessita_aprovacao_qualidade: true },
    { id: 5, nome: 'Tijolo Cerâmico 6 furos', codigo: 'TIJ-006', unidade: 'Milheiro', grupo_lean: 'Alvenaria', necessita_aprovacao_qualidade: true },
  ] as Material[],
  
  fichas_tecnicas: [
    { id: 1, id_material: 2, pdf_url: '/docs/ficha_aco_ca50.pdf', aprovado_por: 'Eng. Qualidade Ana', data_aprovacao: '2025-01-05', status: 'Aprovado' as const },
    { id: 2, id_material: 4, pdf_url: '/docs/ficha_capacete.pdf', aprovado_por: 'Téc. Segurança Paulo', data_aprovacao: '2025-01-12', status: 'Pendente' as const },
    { id: 3, id_material: 5, pdf_url: '/docs/ficha_tijolo.pdf', aprovado_por: 'Eng. Qualidade Ana', data_aprovacao: '2025-01-10', status: 'Aprovado' as const },
  ] as FichaTecnica[],
  
  patrimonio: [
    { id: 'GER-001', nome: 'Gerador 50kVA Caterpillar', codigo: 'GER-001', alocado_projeto_id: 1, status: 'Em Uso' as const, tipo: 'Gerador' as const },
    { id: 'BET-003', nome: 'Betoneira 500L', codigo: 'BET-003', alocado_projeto_id: 2, status: 'Em Uso' as const, tipo: 'Betoneira' as const },
    { id: 'AND-250', nome: 'Andaimes (Lote 50)', codigo: 'AND-250', alocado_projeto_id: 1, status: 'Em Uso' as const, tipo: 'Andaime' as const },
    { id: 'GER-002', nome: 'Gerador 25kVA Iveco', codigo: 'GER-002', alocado_projeto_id: null, status: 'Disponível' as const, tipo: 'Gerador' as const },
    { id: 'AND-125', nome: 'Andaimes (Lote 25)', codigo: 'AND-125', alocado_projeto_id: null, status: 'Manutenção' as const, tipo: 'Andaime' as const },
    { id: 'BET-001', nome: 'Betoneira 300L', codigo: 'BET-001', alocado_projeto_id: 3, status: 'Transferência' as const, tipo: 'Betoneira' as const },
  ] as Patrimonio[],
  
  colaboradores: [
    { id: 1, nome: 'António Costa', cargo: 'Pedreiro', categoria: 'Oficial', custo_hora: 2500, projeto_id: 1, hora_entrada: '07:55', hora_saida: null },
    { id: 2, nome: 'Bruno Fernandes', cargo: 'Eletricista', categoria: 'Oficial', custo_hora: 2800, projeto_id: 1, hora_entrada: '08:10', hora_saida: null },
    { id: 3, nome: 'Carla Santos', cargo: 'Engenheira', categoria: 'Técnico Superior', custo_hora: 8500, projeto_id: 2, hora_entrada: null, hora_saida: null },
    { id: 4, nome: 'David Lopes', cargo: 'Servente', categoria: 'Auxiliar', custo_hora: 1800, projeto_id: 1, hora_entrada: '07:45', hora_saida: '17:30' },
    { id: 5, nome: 'Eva Mendes', cargo: 'Pintora', categoria: 'Oficial', custo_hora: 2300, projeto_id: 2, hora_entrada: '08:00', hora_saida: null },
    { id: 6, nome: 'Francisco Silva', cargo: 'Carpinteiro', categoria: 'Oficial', custo_hora: 2600, projeto_id: 3, hora_entrada: '07:50', hora_saida: null },
  ] as Colaborador[],
  
  incidentes: [
    { 
      id: 1,
      data: '2025-01-15', 
      id_projeto: 1, 
      tipo: 'Near-miss' as const, 
      descricao: 'Queda de ferramenta do 2º piso, sem feridos.', 
      severidade: 'Baixa' as const,
      etapa_relacionada: 'Estrutura - Laje 2º Piso',
      reportado_por: 'Enc. Pedro Santos'
    },
    { 
      id: 2,
      data: '2025-01-12', 
      id_projeto: 2, 
      tipo: 'Incidente' as const, 
      descricao: 'Corte ligeiro na mão de um colaborador durante corte de vergalhão.', 
      severidade: 'Baixa' as const,
      etapa_relacionada: 'Estrutura - Armação',
      reportado_por: 'Eng. Maria Costa'
    },
    { 
      id: 3,
      data: '2025-01-08', 
      id_projeto: 1, 
      tipo: 'Incidente' as const, 
      descricao: 'Falha em cabo de aço de grua, suspenção de atividades.', 
      severidade: 'Alta' as const,
      etapa_relacionada: 'Estrutura - Içamento',
      reportado_por: 'Eng. João Silva'
    },
  ] as Incidente[],
  
  tarefasLean: [
    { 
      id: 1, 
      id_projeto: 1,
      descricao: 'Organizar armazém de ferramentas (5S)', 
      responsavel: 'Chefe de Armazém', 
      prazo: '2025-01-25',
      status: 'Em Andamento' as const,
      percentual_conclusao: 65,
      tipo: '5S' as const
    },
    { 
      id: 2, 
      id_projeto: 2,
      descricao: 'Revisar plano de cofragem da Laje 3', 
      responsavel: 'Eng.ª Carla', 
      prazo: '2025-01-20',
      status: 'Concluído' as const,
      percentual_conclusao: 100,
      tipo: 'Melhoria' as const
    },
    { 
      id: 3, 
      id_projeto: 1,
      descricao: 'Verificar stock de EPIs para pintura', 
      responsavel: 'Téc. Segurança', 
      prazo: '2025-01-30',
      status: 'Pendente' as const,
      percentual_conclusao: 0,
      tipo: 'PDCA' as const
    },
    { 
      id: 4, 
      id_projeto: 3,
      descricao: 'Implementar sinalização de segurança em área de solda', 
      responsavel: 'Enc. Segurança', 
      prazo: '2025-01-22',
      status: 'Em Andamento' as const,
      percentual_conclusao: 30,
      tipo: 'Corretiva' as const
    },
  ] as TarefaLean[],

  epis: [
    { id: 1, codigo: 'EPI-001', descricao: 'Capacete de Segurança', tarefa_relacionada: 'Todas as atividades', estoque_minimo: 50, estoque_atual: 120 },
    { id: 2, codigo: 'EPI-002', descricao: 'Óculos de Proteção', tarefa_relacionada: 'Corte e solda', estoque_minimo: 30, estoque_atual: 45 },
    { id: 3, codigo: 'EPI-003', descricao: 'Luva de Couro', tarefa_relacionada: 'Manuseio de materiais', estoque_minimo: 40, estoque_atual: 15 },
    { id: 4, codigo: 'EPI-004', descricao: 'Bota de Segurança', tarefa_relacionada: 'Todas as atividades', estoque_minimo: 60, estoque_atual: 80 },
    { id: 5, codigo: 'EPI-005', descricao: 'Cinto de Segurança', tarefa_relacionada: 'Trabalho em altura', estoque_minimo: 20, estoque_atual: 8 },
  ] as EPI[],

  kpis: [
    {
      projeto_id: 1,
      avanco_fisico_real: 75,
      avanco_financeiro_real: 76,
      desvio_prazo_dias: 12,
      lead_time_compras_medio: 8.5,
      absentismo_percentual: 3.2,
      status_alerta: 'Amarelo' as const
    },
    {
      projeto_id: 2,
      avanco_fisico_real: 42,
      avanco_financeiro_real: 43,
      desvio_prazo_dias: -3,
      lead_time_compras_medio: 5.2,
      absentismo_percentual: 1.8,
      status_alerta: 'Verde' as const
    },
    {
      projeto_id: 3,
      avanco_fisico_real: 95,
      avanco_financeiro_real: 97.5,
      desvio_prazo_dias: 5,
      lead_time_compras_medio: 12.3,
      absentismo_percentual: 6.1,
      status_alerta: 'Vermelho' as const
    },
  ] as DashboardKPI[],
};
