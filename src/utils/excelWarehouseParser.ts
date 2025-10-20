import * as XLSX from 'xlsx';
import { ExcelWarehouseData, ValidationError } from '@/types/warehouseImport';
import { MaterialCategory, MaterialStatus, UnitOfMeasure } from '@/types/warehouse';

export class ExcelWarehouseParser {
  private workbook: XLSX.WorkBook | null = null;
  private errors: ValidationError[] = [];

  async parseFile(file: File): Promise<{ data: ExcelWarehouseData | null; errors: ValidationError[] }> {
    this.errors = [];
    
    try {
      const buffer = await file.arrayBuffer();
      this.workbook = XLSX.read(buffer);
      
      if (!this.validateStructure()) {
        return { data: null, errors: this.errors };
      }

      const materiais = this.parseMaterialsData();
      
      if (this.errors.length > 0) {
        return { data: null, errors: this.errors };
      }

      return {
        data: { materiais },
        errors: []
      };
    } catch (error) {
      this.errors.push({
        linha: 0,
        campo: 'arquivo',
        mensagem: 'Erro ao ler o arquivo Excel'
      });
      return { data: null, errors: this.errors };
    }
  }

  private validateStructure(): boolean {
    if (!this.workbook) return false;
    
    const requiredSheet = 'Materiais';
    if (!this.workbook.Sheets[requiredSheet]) {
      this.errors.push({
        linha: 0,
        campo: 'estrutura',
        mensagem: `Aba "${requiredSheet}" não encontrada no arquivo`
      });
      return false;
    }
    
    return true;
  }

  private parseMaterialsData() {
    if (!this.workbook) return [];
    
    const sheet = this.workbook.Sheets['Materiais'];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return data.map((row: any, index: number) => {
      const rowNum = index + 2; // +2 porque linha 1 é header
      
      return {
        codigo_interno: this.validateRequired(row['Código Interno'], rowNum, 'Código Interno'),
        nome_material: this.validateRequired(row['Nome Material'], rowNum, 'Nome Material'),
        categoria_principal: this.validateMaterialCategory(row['Categoria Principal'], rowNum),
        subcategoria: this.validateRequired(row['Subcategoria'], rowNum, 'Subcategoria'),
        descricao_tecnica: row['Descrição Técnica'] || '',
        unidade_medida: this.validateUnitOfMeasure(row['Unidade Medida'], rowNum),
        quantidade_stock: this.validateNumber(row['Quantidade Stock'], rowNum, 'Quantidade Stock'),
        fornecedor: row['Fornecedor'] || '',
        localizacao_fisica: row['Localização Física'] || '',
        projeto_alocado_id: row['Projeto Alocado ID'] ? this.validateNumber(row['Projeto Alocado ID'], rowNum, 'Projeto Alocado ID') : undefined,
        status_item: this.validateMaterialStatus(row['Status'], rowNum),
        data_entrada: this.validateDate(row['Data Entrada'], rowNum, 'Data Entrada')
      };
    });
  }

  private validateRequired(value: any, row: number, field: string): string {
    if (!value || value.toString().trim() === '') {
      this.errors.push({
        linha: row,
        campo: field,
        mensagem: `${field} é obrigatório`
      });
      return '';
    }
    return value.toString().trim();
  }

  private validateNumber(value: any, row: number, field: string): number {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      this.errors.push({
        linha: row,
        campo: field,
        mensagem: `${field} deve ser um número válido >= 0`
      });
      return 0;
    }
    return num;
  }

  private validateDate(value: any, row: number, field: string): string {
    if (!value) {
      return new Date().toISOString().split('T')[0];
    }

    // Se for número do Excel (serial date)
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    // Se for string, tentar converter
    const dateStr = value.toString();
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      this.errors.push({
        linha: row,
        campo: field,
        mensagem: `${field} deve ser uma data válida`
      });
      return new Date().toISOString().split('T')[0];
    }

    return date.toISOString().split('T')[0];
  }

  private validateMaterialCategory(value: any, row: number): MaterialCategory | undefined {
    const validCategories: MaterialCategory[] = ['Material', 'Mão de Obra', 'Património', 'Custos Indiretos'];
    const category = value?.toString().trim();
    
    if (!category) return undefined;
    
    if (!validCategories.includes(category as MaterialCategory)) {
      this.errors.push({
        linha: row,
        campo: 'Categoria Principal',
        mensagem: `Categoria deve ser uma das seguintes: ${validCategories.join(', ')}`
      });
      return undefined;
    }
    
    return category as MaterialCategory;
  }

  private validateUnitOfMeasure(value: any, row: number): UnitOfMeasure {
    const validUnits: UnitOfMeasure[] = ['saco', 'm³', 'm', 'kg', 'litro', 'unidade', 'outro'];
    const unit = value?.toString().trim().toLowerCase();
    
    if (!unit || !validUnits.includes(unit as UnitOfMeasure)) {
      this.errors.push({
        linha: row,
        campo: 'Unidade Medida',
        mensagem: `Unidade de Medida deve ser uma das seguintes: ${validUnits.join(', ')}`
      });
      return 'unidade';
    }
    
    return unit as UnitOfMeasure;
  }

  private validateMaterialStatus(value: any, row: number): MaterialStatus {
    const validStatuses: MaterialStatus[] = ['Disponível', 'Em uso', 'Reservado', 'Manutenção', 'Inativo'];
    const status = value?.toString().trim();
    
    if (!status || !validStatuses.includes(status as MaterialStatus)) {
      this.errors.push({
        linha: row,
        campo: 'Status',
        mensagem: `Status deve ser um dos seguintes: ${validStatuses.join(', ')}`
      });
      return 'Disponível';
    }
    
    return status as MaterialStatus;
  }
}
