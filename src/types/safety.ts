// Safety and incidents domain types

export type IncidentType = 
  | "Acidente"
  | "Quase Acidente"
  | "Condição Insegura"
  | "Ato Inseguro"
  | "Não Conformidade"
  | "Outro";

export type IncidentSeverity = "Baixa" | "Média" | "Alta" | "Crítica";

export interface Incident {
  id?: number;
  id_projeto?: number;
  tipo: IncidentType;
  severidade: IncidentSeverity;
  descricao: string;
  data: string;
  etapa_relacionada: string;
  reportado_por: string;
  created_at?: string;
  updated_at?: string;
}

export interface EPI {
  id?: number;
  codigo: string;
  descricao: string;
  tarefa_relacionada: string;
  estoque_atual: number;
  estoque_minimo: number;
  created_at?: string;
  updated_at?: string;
}

export interface TechnicalDatasheet {
  id?: number;
  id_material?: number;
  status: "Pendente" | "Aprovado" | "Rejeitado";
  pdf_url?: string;
  aprovado_por?: string;
  data_aprovacao?: string;
  created_at?: string;
  updated_at?: string;
}
