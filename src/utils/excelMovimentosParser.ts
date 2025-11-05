import * as XLSX from 'xlsx';
import { ExcelMovimentoRow, ExcelMovimentoData, MovimentoValidationError } from '@/types/movimentoImport';

const REQUIRED_COLUMNS = ['Data', 'Descrição', 'Tipo', 'Valor', 'Fonte Financiamento'];

const COLUMN_MAPPING: Record<string, keyof ExcelMovimentoRow> = {
  'Data': 'data',
  'Descrição': 'descricao',
  'Categoria': 'categoria',
  'Subcategoria': 'subcategoria',
  'Tipo': 'tipo',
  'Valor': 'valor',
  'Centro Custo': 'centro_custo',
  'Fonte Financiamento': 'fonte_financiamento',
  'Forma Pagamento': 'forma_pagamento',
  'Número Documento': 'numero_documento',
  'Observações': 'observacoes',
};

export class ExcelMovimentosParser {
  private errors: MovimentoValidationError[] = [];

  async parseFile(file: File): Promise<ExcelMovimentoData> {
    this.errors = [];

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: any[] = XLSX.utils.sheet_to_json(firstSheet);

      if (!rawData || rawData.length === 0) {
        throw new Error('O arquivo está vazio ou não contém dados válidos');
      }

      // Validate required columns
      this.validateColumns(rawData[0]);

      // Parse and validate rows
      const movimentos: ExcelMovimentoRow[] = [];
      let totalEntradas = 0;
      let totalSaidas = 0;
      let valorTotalEntradas = 0;
      let valorTotalSaidas = 0;

      rawData.forEach((row, index) => {
        const linha = index + 2; // +2 porque Excel começa em 1 e tem header
        const movimento = this.parseRow(row, linha);

        if (movimento) {
          movimentos.push(movimento);
          
          if (movimento.tipo === 'entrada') {
            totalEntradas++;
            valorTotalEntradas += movimento.valor;
          } else {
            totalSaidas++;
            valorTotalSaidas += movimento.valor;
          }
        }
      });

      return {
        movimentos,
        metadata: {
          totalLinhas: rawData.length,
          validRows: movimentos.length,
          invalidRows: this.errors.length,
          totalEntradas,
          totalSaidas,
          valorTotalEntradas,
          valorTotalSaidas,
        },
      };
    } catch (error: any) {
      throw new Error(`Erro ao processar arquivo: ${error.message}`);
    }
  }

  private validateColumns(firstRow: any): void {
    const columns = Object.keys(firstRow);
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !columns.includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`
      );
    }
  }

  private parseRow(row: any, linha: number): ExcelMovimentoRow | null {
    const errors: MovimentoValidationError[] = [];

    // Parse Data
    const data = this.parseDate(row['Data'], linha, errors);
    
    // Parse Descrição
    const descricao = this.parseString(row['Descrição'], linha, 'Descrição', errors, true);
    
    // Parse Categoria (opcional)
    const categoria = this.parseString(row['Categoria'], linha, 'Categoria', errors, false);
    
    // Parse Tipo
    const tipo = this.parseTipo(row['Tipo'], linha, errors);
    
    // Parse Valor
    const valor = this.parseValor(row['Valor'], linha, errors);

    // Optional fields
    const subcategoria = this.parseString(row['Subcategoria'], linha, 'Subcategoria', errors, false);
    const centro_custo = this.parseString(row['Centro Custo'], linha, 'Centro Custo', errors, false);
    
    // Fonte Financiamento é obrigatória
    const fonte_financiamento = this.parseString(row['Fonte Financiamento'], linha, 'Fonte Financiamento', errors, true);
    const forma_pagamento = this.parseString(row['Forma Pagamento'], linha, 'Forma Pagamento', errors, false);
    const numero_documento = this.parseString(row['Número Documento'], linha, 'Número Documento', errors, false);
    const observacoes = this.parseString(row['Observações'], linha, 'Observações', errors, false);

    // If there are errors, add them to the global errors list
    if (errors.length > 0) {
      this.errors.push(...errors);
      return null;
    }

    return {
      linha,
      data: data!,
      descricao: descricao!,
      categoria,
      subcategoria,
      tipo: tipo!,
      valor: valor!,
      centro_custo,
      fonte_financiamento: fonte_financiamento!,
      forma_pagamento,
      numero_documento,
      observacoes,
    };
  }

  private parseDate(value: any, linha: number, errors: MovimentoValidationError[]): string | null {
    if (!value) {
      errors.push({
        linha,
        campo: 'Data',
        mensagem: 'Data é obrigatória',
      });
      return null;
    }

    // Handle Excel date serial number
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      return `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
    }

    // Handle string date (DD/MM/YYYY or YYYY-MM-DD)
    const dateStr = String(value).trim();
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

    if (ddmmyyyyRegex.test(dateStr)) {
      return dateStr;
    } else if (yyyymmddRegex.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    errors.push({
      linha,
      campo: 'Data',
      mensagem: 'Data inválida. Use formato DD/MM/YYYY',
      valor: value,
    });
    return null;
  }

  private parseString(
    value: any,
    linha: number,
    campo: string,
    errors: MovimentoValidationError[],
    required: boolean
  ): string | undefined {
    if (!value || String(value).trim() === '') {
      if (required) {
        errors.push({
          linha,
          campo,
          mensagem: `${campo} é obrigatório`,
        });
        return undefined;
      }
      return undefined;
    }

    return String(value).trim();
  }

  private parseTipo(value: any, linha: number, errors: MovimentoValidationError[]): 'entrada' | 'saida' | null {
    if (!value) {
      errors.push({
        linha,
        campo: 'Tipo',
        mensagem: 'Tipo é obrigatório',
      });
      return null;
    }

    const tipo = String(value).toLowerCase().trim();
    
    if (tipo === 'entrada' || tipo === 'saida' || tipo === 'saída') {
      return tipo === 'saída' ? 'saida' : tipo as 'entrada' | 'saida';
    }

    errors.push({
      linha,
      campo: 'Tipo',
      mensagem: 'Tipo deve ser "entrada" ou "saida"',
      valor: value,
    });
    return null;
  }

  private parseValor(value: any, linha: number, errors: MovimentoValidationError[]): number | null {
    if (value === null || value === undefined || value === '') {
      errors.push({
        linha,
        campo: 'Valor',
        mensagem: 'Valor é obrigatório',
      });
      return null;
    }

    let numValue: number;

    if (typeof value === 'number') {
      numValue = value;
    } else {
      // Handle string numbers with separators
      const cleanValue = String(value)
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      
      numValue = parseFloat(cleanValue);
    }

    if (isNaN(numValue) || numValue <= 0) {
      errors.push({
        linha,
        campo: 'Valor',
        mensagem: 'Valor deve ser um número positivo',
        valor: value,
      });
      return null;
    }

    return numValue;
  }

  getErrors(): MovimentoValidationError[] {
    return this.errors;
  }
}
