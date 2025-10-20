// Warehouse and materials domain types

export type MaterialStatus = "Disponível" | "Em uso" | "Reservado" | "Manutenção" | "Inativo";
export type UnitOfMeasure = "saco" | "m³" | "m" | "kg" | "litro" | "unidade" | "outro";
export type MaterialCategory = "Material" | "Mão de Obra" | "Património" | "Custos Indiretos";

export interface Material {
  id?: number;
  codigo: string;
  nome: string;
  unidade: string;
  grupo_lean: string;
  necessita_aprovacao_qualidade: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseMaterial {
  id?: string;
  codigo_interno: string;
  nome_material: string;
  categoria_principal?: MaterialCategory;
  subcategoria: string;
  descricao_tecnica?: string;
  unidade_medida: UnitOfMeasure;
  quantidade_stock: number;
  fornecedor?: string;
  localizacao_fisica?: string;
  projeto_alocado_id?: number;
  status_item: MaterialStatus;
  data_entrada: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaterialMovement {
  id?: string;
  material_id: string;
  tipo_movimentacao: string;
  quantidade: number;
  projeto_origem_id?: number;
  projeto_destino_id?: number;
  responsavel: string;
  data_movimentacao: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsumptionGuide {
  id?: string;
  projeto_id: number;
  numero_guia: string;
  data_consumo: string;
  responsavel: string;
  frente_servico?: string;
  tarefa_relacionada?: string;
  status: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsumptionGuideItem {
  id?: string;
  guia_id: string;
  material_id: string;
  quantidade_consumida: number;
  observacoes?: string;
  created_at?: string;
}

export interface WarehouseAnalytics {
  weekly_consumption: any[];
  stock_flow: any[];
  critical_stock: any[];
  consumption_by_project: any[];
}
