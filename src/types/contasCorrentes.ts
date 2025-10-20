// Clientes
export interface Cliente {
  id?: string;
  nome: string;
  nif?: string;
  tipo_cliente?: 'pessoa_fisica' | 'pessoa_juridica';
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  provincia?: string;
  projeto_id?: number;
  status: 'ativo' | 'inativo' | 'inadimplente';
  observacoes?: string;
  responsavel_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Fornecedores
export interface Fornecedor {
  id?: string;
  nome: string;
  nif?: string;
  tipo_fornecedor?: 'materiais' | 'servicos' | 'equipamentos' | 'misto';
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  provincia?: string;
  categoria_principal?: string;
  recorrencia?: 'ativo' | 'eventual' | 'estrategico';
  status: 'ativo' | 'inativo' | 'bloqueado';
  avaliacao_qualidade?: number;
  observacoes?: string;
  responsavel_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Contratos de Clientes
export interface ContratoCliente {
  id?: string;
  cliente_id: string;
  projeto_id?: number;
  numero_contrato?: string;
  descricao_servicos: string;
  valor_contratado: number;
  valor_recebido: number;
  saldo_receber?: number;
  data_inicio: string;
  data_termino?: string;
  data_ultimo_recebimento?: string;
  frequencia_faturacao?: 'unico' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  metodo_pagamento?: 'transferencia' | 'cheque' | 'dinheiro' | 'cartao' | 'boleto' | 'pix';
  prazo_pagamento_dias?: number;
  status: 'ativo' | 'concluido' | 'cancelado' | 'suspenso';
  documento_contrato_url?: string;
  observacoes?: string;
  responsavel_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Contratos de Fornecedores
export interface ContratoFornecedor {
  id?: string;
  fornecedor_id: string;
  projeto_id?: number;
  numero_contrato?: string;
  descricao_produtos_servicos: string;
  valor_contratado: number;
  valor_pago: number;
  saldo_pagar?: number;
  data_inicio: string;
  data_termino?: string;
  data_ultimo_pagamento?: string;
  condicao_pagamento?: string;
  metodo_pagamento?: 'transferencia' | 'cheque' | 'dinheiro' | 'cartao' | 'boleto' | 'pix';
  status: 'ativo' | 'concluido' | 'cancelado' | 'suspenso';
  documento_contrato_url?: string;
  notas_fiscais?: any[];
  observacoes?: string;
  responsavel_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Pagamentos/Recebimentos
export interface PagamentoRecebimento {
  id?: string;
  tipo: 'pagamento' | 'recebimento';
  contrato_cliente_id?: string;
  contrato_fornecedor_id?: string;
  valor: number;
  data_transacao: string;
  metodo?: 'transferencia' | 'cheque' | 'dinheiro' | 'cartao' | 'boleto' | 'pix';
  numero_documento?: string;
  comprovante_url?: string;
  nota_fiscal_url?: string;
  banco?: string;
  conta?: string;
  descricao?: string;
  observacoes?: string;
  responsavel_id?: string;
  created_at?: string;
}

// KPIs
export interface ClientesKPIs {
  total_clientes: number;
  total_contratado: number;
  total_recebido: number;
  saldo_receber: number;
  taxa_recebimento: number;
  prazo_medio_recebimento: number;
}

export interface FornecedoresKPIs {
  total_fornecedores: number;
  total_contratado: number;
  total_pago: number;
  saldo_pagar: number;
  taxa_pagamento: number;
  prazo_medio_pagamento: number;
}
