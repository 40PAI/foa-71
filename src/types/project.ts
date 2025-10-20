
// Tipos para as funcionalidades de projeto
export type ProjectStatus = "Em Andamento" | "Atrasado" | "Concluído" | "Pausado" | "Planeado" | "Cancelado";
export type TipoEtapa = "Fundação" | "Estrutura" | "Alvenaria" | "Acabamento" | "Instalações" | "Entrega" | "Mobilização" | "Desmobilização";
export type StatusEtapa = "Não Iniciada" | "Em Curso" | "Concluída" | "Atrasada";
export type TipoProjeto = "Residencial" | "Comercial" | "Industrial" | "Infraestrutura" | "Reforma";

export interface ProjectStage {
  numero_etapa: number;
  nome_etapa: string;
  tipo_etapa: string;
  responsavel_etapa: string;
  data_inicio_etapa: string;
  data_fim_prevista_etapa: string;
  status_etapa: string;
  observacoes: string;
  orcamento_etapa: number;
  gasto_etapa: number;
  tempo_previsto_dias: number;
  tempo_real_dias: number;
}

export interface ProjectStageDB {
  id?: number;
  projeto_id: number;
  numero_etapa: number;
  nome_etapa: string;
  tipo_etapa: string;
  responsavel_etapa: string;
  data_inicio_etapa: string | null;
  data_fim_prevista_etapa: string | null;
  status_etapa: string;
  observacoes: string | null;
  orcamento_etapa: number;
  gasto_etapa: number;
  tempo_previsto_dias: number;
  tempo_real_dias: number;
  created_at?: string;
  updated_at?: string;
}

// Tipo estendido do projeto com as novas colunas
export interface ExtendedProject {
  id?: number;
  nome: string;
  cliente: string;
  encarregado: string;
  data_inicio: string;
  data_fim_prevista: string;
  orcamento: number;
  limite_aprovacao: number;
  status: ProjectStatus;
  provincia: string;
  municipio: string;
  zona_bairro?: string;
  tipo_projeto: TipoProjeto;
  numero_etapas: number;
  limite_gastos?: number;
  metodo_calculo_temporal?: string;
  avanco_financeiro?: number;
  avanco_fisico?: number;
  avanco_tempo?: number;
  gasto?: number;
  created_at?: string;
  updated_at?: string;
}

// Tipo para dados do formulário de projeto
export interface ProjectFormData {
  nome: string;
  cliente: string;
  encarregado: string;
  data_inicio: string;
  data_fim_prevista: string;
  orcamento: number;
  limite_aprovacao: number;
  status: ProjectStatus;
  provincia: string;
  municipio: string;
  zona_bairro?: string;
  tipo_projeto: TipoProjeto;
  numero_etapas: number;
}
