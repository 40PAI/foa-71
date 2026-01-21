// Tipos para o sistema de gestão de dívidas

export type FonteCredito = 'FOF' | 'BANCO' | 'FORNECEDOR' | 'OUTRO';

// Inclui 'aporte' para backward compatibility
export type TipoMovimentoDivida = 'credito' | 'amortizacao' | 'juro' | 'aporte';

export type StatusDivida = 'ativo' | 'quitado' | 'em_atraso';

export interface MovimentoDivida {
  id: string;
  projeto_id: number;
  data_reembolso: string;
  descricao: string;
  valor: number;
  tipo: TipoMovimentoDivida;
  fonte_credito: FonteCredito;
  credor_nome?: string;
  fornecedor_id?: string;
  taxa_juro?: number;
  data_vencimento?: string;
  numero_contrato?: string;
  status_divida: StatusDivida;
  meta_total?: number;
  percentual_cumprido?: number;
  responsavel_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumoDivida {
  fonte_credito: FonteCredito;
  credor_nome: string;
  total_credito: number;
  total_amortizado: number;
  total_juros: number;
  saldo_devedor: number;
  status: StatusDivida;
  proxima_vencimento?: string;
}

export interface ResumoDividaGeral {
  total_creditos: number;
  total_amortizado: number;
  total_juros: number;
  divida_total: number;
  proxima_vencimento?: string;
  dividas_por_fonte: {
    FOF: number;
    BANCO: number;
    FORNECEDOR: number;
    OUTRO: number;
  };
}

export const FONTE_CREDITO_LABELS: Record<FonteCredito, string> = {
  FOF: 'FOF (Fundo de Operações)',
  BANCO: 'Banco',
  FORNECEDOR: 'Fornecedor',
  OUTRO: 'Outro',
};

export const TIPO_MOVIMENTO_LABELS: Record<TipoMovimentoDivida, string> = {
  credito: 'Crédito Recebido',
  aporte: 'Aporte (Legado)',
  amortizacao: 'Amortização',
  juro: 'Pagamento de Juros',
};

export const STATUS_DIVIDA_LABELS: Record<StatusDivida, string> = {
  ativo: 'Activo',
  quitado: 'Quitado',
  em_atraso: 'Em Atraso',
};

// Helper para verificar se é um tipo de entrada (crédito)
export function isCredito(tipo: TipoMovimentoDivida): boolean {
  return tipo === 'credito' || tipo === 'aporte';
}
