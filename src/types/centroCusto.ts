// Centro de Custo types
export type TipoCentroCusto = 'projeto' | 'departamento' | 'categoria' | 'fornecedor';

export interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  tipo: TipoCentroCusto;
  projeto_id?: number;
  departamento?: string;
  ativo: boolean;
  responsavel_id?: string;
  orcamento_mensal: number;
  created_at: string;
  updated_at: string;
}

export interface SaldoCentroCusto {
  centro_custo_id: string;
  codigo: string;
  nome: string;
  tipo: TipoCentroCusto;
  projeto_id?: number;
  orcamento_mensal: number;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  total_movimentos: number;
  percentual_utilizado: number;
}

export type TipoMovimento = 'entrada' | 'saida';
export type FonteFinanciamento = 'REC_FOA' | 'FOF_FIN' | 'FOA_AUTO';
export type FormaPagamento = 'dinheiro' | 'transferencia' | 'cheque' | 'cartao' | 'boleto' | 'pix';
export type StatusAprovacao = 'pendente' | 'aprovado' | 'rejeitado';

export interface MovimentoFinanceiro {
  id: string;
  projeto_id: number;
  centro_custo_id?: string;
  data_movimento: string;
  tipo_movimento: TipoMovimento;
  fonte_financiamento?: FonteFinanciamento;
  
  // Categorização
  categoria: string;
  subcategoria?: string;
  descricao: string;
  
  // Valores
  valor: number;
  valor_liquido?: number;
  
  // Informações Fiscais
  numero_documento?: string;
  nota_fiscal_url?: string;
  comprovante_url?: string;
  
  // Informações de Pagamento
  forma_pagamento?: FormaPagamento;
  banco?: string;
  conta?: string;
  
  // Aprovação
  status_aprovacao: StatusAprovacao;
  aprovado_por?: string;
  data_aprovacao?: string;
  
  // Vínculos
  requisicao_id?: number;
  tarefa_id?: number;
  etapa_id?: number;
  contrato_cliente_id?: string;
  contrato_fornecedor_id?: string;
  
  // Metadados
  responsavel_id?: string;
  observacoes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

export interface RelatorioMensal {
  centro_custo: string;
  orcamento: number;
  gasto: number;
  saldo: number;
  percentual_usado: number;
  status: 'Sem Orçamento' | 'Normal' | 'Atenção' | 'Crítico' | 'Excedido';
}
