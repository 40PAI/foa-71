export interface ExcelMovimentoRow {
  linha: number;
  data: string;
  descricao: string;
  categoria?: string;
  subcategoria?: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  centro_custo?: string;
  fonte_financiamento: string;
  forma_pagamento?: string;
  numero_documento?: string;
  observacoes?: string;
}

export interface ExcelMovimentoData {
  movimentos: ExcelMovimentoRow[];
  metadata: {
    totalLinhas: number;
    validRows: number;
    invalidRows: number;
    totalEntradas: number;
    totalSaidas: number;
    valorTotalEntradas: number;
    valorTotalSaidas: number;
  };
}

export interface MovimentoImportProgress {
  step: 'idle' | 'parsing' | 'validating' | 'importing' | 'success' | 'error';
  percentage: number;
  message: string;
  processedCount?: number;
  totalCount?: number;
}

export interface MovimentoValidationError {
  linha: number;
  campo: string;
  mensagem: string;
  valor?: any;
}

export interface MovimentoImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  errors: MovimentoValidationError[];
  message: string;
}
