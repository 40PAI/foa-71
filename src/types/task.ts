// Task and LEAN management domain types

export type TaskStatus = "Pendente" | "Em Progresso" | "Concluído" | "Cancelado" | "Atrasado";
export type TaskType = "Residencial" | "Comercial" | "Industrial" | "Infraestrutura" | "Reforma";

export interface Task {
  id?: number;
  id_projeto?: number;
  id_etapa?: number;
  descricao: string;
  tipo: TaskType;
  responsavel: string;
  prazo: string;
  status: TaskStatus;
  percentual_conclusao: number;
  semana_programada?: number;
  gasto_real?: number;
  tempo_real_dias?: number;
  preco_unitario?: number;      // PREÇO/UN em AKZ
  custo_material?: number;       // PREÇO MATERIAL em AKZ
  custo_mao_obra?: number;       // PREÇO MÃO DE OBRA em AKZ
  created_at?: string;
  updated_at?: string;
}

export interface PPCHistory {
  id?: number;
  projeto_id?: number;
  periodo_inicio: string;
  periodo_fim: string;
  ppc_percentual: number;
  tarefas_programadas: number;
  tarefas_concluidas_prazo: number;
  created_at?: string;
}

export interface WeeklyPPCData {
  semana_inicio: string;
  semana_fim: string;
  ppc_percentual: number;
  tarefas_programadas: number;
  tarefas_concluidas: number;
  status_ppc: "Bom" | "Médio" | "Crítico";
}

export interface ProjectWeek {
  id?: number;
  projeto_id?: number;
  numero_semana: number;
  data_inicio: string;
  data_fim: string;
  created_at?: string;
  updated_at?: string;
}
