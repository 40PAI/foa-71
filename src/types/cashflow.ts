export type TipoMovimento = 'entrada' | 'saida';
export type FormaPagamentoCaixa = 'dinheiro' | 'transferencia' | 'cheque' | 'cartao' | 'boleto' | 'pix';

export interface CashFlowMovement {
  id?: string;
  projeto_id: number;
  tipo_movimento: TipoMovimento;
  valor: number;
  data_movimento: string;
  categoria: string;
  subcategoria?: string;
  descricao: string;
  etapa_id?: number;
  tarefa_id?: number;
  fornecedor_beneficiario?: string;
  forma_pagamento?: FormaPagamentoCaixa;
  numero_documento?: string;
  comprovante_url?: string;
  observacoes?: string;
  responsavel_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CashFlowSummary {
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  total_movimentos: number;
}

export interface CashFlowFilter {
  tipo_movimento?: TipoMovimento;
  data_inicio?: string;
  data_fim?: string;
  categoria?: string;
}

// Categorias predefinidas
export const CASHFLOW_CATEGORIES = {
  entrada: [
    'Adiantamento',
    'Medição',
    'Reforço Caixa',
    'Reembolso',
    'Outros Recebimentos'
  ],
  saida: [
    'Material',
    'Mão de Obra',
    'Equipamento',
    'Logística',
    'Administrativo',
    'Impostos',
    'Comissões',
    'Outros Gastos'
  ]
};
