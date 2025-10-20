// Finance domain types

export type TipoDespesa = 'fixa' | 'variavel' | 'emergencial' | 'planejada';
export type PrioridadeDespesa = 'baixa' | 'media' | 'alta' | 'critica';
export type FormaPagamento = 'dinheiro' | 'transferencia' | 'cheque' | 'cartao' | 'boleto' | 'pix' | 'oc';
export type StatusAprovacao = 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';

export interface Finance {
  id?: number;
  id_projeto: number;
  categoria: string;
  subcategoria?: string;
  orcamentado: number;
  gasto: number;
  tipo_despesa?: TipoDespesa;
  prioridade?: PrioridadeDespesa;
  etapa_id?: number;
  tarefa_id?: number;
  centro_custo?: string;
  justificativa?: string;
  fornecedor?: string;
  forma_pagamento?: FormaPagamento;
  numero_nf?: string;
  prazo_pagamento?: string;
  data_despesa?: string;
  data_pagamento?: string;
  responsavel_id?: string;
  requer_aprovacao_direcao?: boolean;
  requisicao_id?: number;
  comprovantes?: string[];
  observacoes?: string;
  numero_parcelas?: number;
  valor_parcela?: number;
  status_aprovacao?: StatusAprovacao;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialBreakdown {
  categoria: string;
  valor_calculado: number;
  valor_manual: number;
  discrepancia: number;
  percentual_orcamento: number;
}

export interface FinancialDiscrepancy {
  categoria: string;
  gasto_manual: number;
  gasto_calculado: number;
  discrepancia: number;
  percentual_discrepancia: number;
}

export interface IntegratedFinancialData {
  total_budget: number;
  material_expenses: number;
  payroll_expenses: number;
  patrimony_expenses: number;
  indirect_expenses: number;
  total_expenses: number;
  financial_progress: number;
}

export interface PurchaseBreakdown {
  categoria: string;
  total_requisicoes: number;
  valor_pendente: number;
  valor_aprovado: number;
  percentual_aprovacao: number;
}

export interface DetailedExpense {
  id?: string;
  projeto_id: number;
  categoria_gasto: string;
  descricao?: string;
  valor: number;
  data_gasto: string;
  comprovante_url?: string;
  aprovado_por?: string;
  status_aprovacao?: string;
  created_at?: string;
  updated_at?: string;
}

export type FinancialCategory = 
  | "Materiais de Construção"
  | "Mão de Obra"
  | "Equipamentos"
  | "Custos Indiretos"
  | "Outros";
