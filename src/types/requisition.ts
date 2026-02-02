// Requisition and procurement domain types

import type { MaterialCategory } from "./warehouse";
import type { UnitOfMeasure } from "./warehouse";

export type RequisitionType = "alocamento" | "compra";

export type RequisitionStatus =
  | "Pendente"
  | "Cotações"
  | "Aprovação Qualidade"
  | "Aprovação Direção"
  | "OC Gerada"
  | "Recepcionado"
  | "Liquidado"
  | "Cancelado";

export type UrgencyPriority = "Alta" | "Média" | "Baixa";

export interface Requisition {
  id?: number;
  id_projeto?: number;
  id_material?: number;
  nome_comercial_produto?: string;
  codigo_produto?: string;
  descricao_tecnica?: string;
  categoria_principal?: MaterialCategory;
  subcategoria?: string;
  quantidade_requisitada?: number;
  unidade_medida?: UnitOfMeasure;
  valor_unitario?: number;
  valor: number;
  percentual_imposto?: number;
  valor_imposto?: number;
  percentual_desconto?: number;
  valor_desconto?: number;
  valor_liquido?: number;
  requisitante: string;
  fornecedor_preferencial?: string;
  urgencia_prioridade?: UrgencyPriority;
  prazo_limite_dias?: number;
  data_requisicao: string;
  data_limite?: string;
  status_fluxo: RequisitionStatus;
  aprovacao_qualidade: boolean;
  observacoes?: string;
  tipo_requisicao?: RequisitionType;
  created_at?: string;
  updated_at?: string;
}

export interface PendingApproval {
  id: number;
  nome_comercial_produto: string;
  categoria_principal: string;
  valor: number;
  status_fluxo: string;
  data_requisicao: string;
  requisitante: string;
  urgencia_prioridade: string;
}

export interface Subcategory {
  id?: number;
  categoria_principal: MaterialCategory;
  categoria_secundaria: string;
  nome_subcategoria: string;
  categoria_financeira: string;
  descricao?: string;
  limite_aprovacao_automatica?: number;
  created_at?: string;
  updated_at?: string;
}
