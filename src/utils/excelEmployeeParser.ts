import * as XLSX from 'xlsx';
import { ExcelEmployeeData, ValidationError } from '@/types/employeeImport';
import { EmployeeCategory, WorkScheduleType } from '@/types/employee';

export class ExcelEmployeeParser {
  private workbook: XLSX.WorkBook | null = null;
  private errors: ValidationError[] = [];

  async parseFile(file: File): Promise<{ data: ExcelEmployeeData | null; errors: ValidationError[] }> {
    this.errors = [];
    
    try {
      const buffer = await file.arrayBuffer();
      this.workbook = XLSX.read(buffer);
      
      if (!this.validateStructure()) {
        return { data: null, errors: this.errors };
      }

      const colaboradores = this.parseEmployeesData();
      const alocacoes = this.parseAllocationsData();
      
      if (this.errors.length > 0) {
        return { data: null, errors: this.errors };
      }

      return {
        data: { colaboradores, alocacoes },
        errors: []
      };
    } catch (error) {
      this.errors.push({
        aba: 'arquivo',
        linha: 0,
        campo: 'arquivo',
        mensagem: 'Erro ao ler o arquivo Excel'
      });
      return { data: null, errors: this.errors };
    }
  }

  private validateStructure(): boolean {
    if (!this.workbook) return false;
    
    if (!this.workbook.Sheets['Colaboradores']) {
      this.errors.push({
        aba: 'estrutura',
        linha: 0,
        campo: 'estrutura',
        mensagem: 'Aba "Colaboradores" não encontrada no arquivo'
      });
      return false;
    }
    
    return true;
  }

  private parseEmployeesData() {
    if (!this.workbook) return [];
    
    const sheet = this.workbook.Sheets['Colaboradores'];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return data.map((row: any, index: number) => {
      const rowNum = index + 2;
      
      return {
        nome: this.validateRequired(row['Nome'], rowNum, 'Nome', 'Colaboradores'),
        cargo: this.validateRequired(row['Cargo'], rowNum, 'Cargo', 'Colaboradores'),
        categoria: this.validateEmployeeCategory(row['Categoria'], rowNum),
        custo_hora: this.validateNumber(row['Custo/Hora'], rowNum, 'Custo/Hora', 'Colaboradores'),
        tipo_colaborador: row['Tipo Colaborador'] || '',
        numero_funcional: row['Nº Funcional'] || '',
        bi: row['BI'] || '',
        morada: row['Morada'] || '',
        hora_entrada: this.validateTime(row['Hora Entrada'], rowNum, 'Hora Entrada', 'Colaboradores'),
        hora_saida: this.validateTime(row['Hora Saída'], rowNum, 'Hora Saída', 'Colaboradores'),
        cv_link: row['CV Link'] || ''
      };
    });
  }

  private parseAllocationsData() {
    if (!this.workbook || !this.workbook.Sheets['Alocações']) {
      return [];
    }
    
    const sheet = this.workbook.Sheets['Alocações'];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return data.map((row: any, index: number) => {
      const rowNum = index + 2;
      
      return {
        numero_funcional: this.validateRequired(row['Nº Funcional'], rowNum, 'Nº Funcional', 'Alocações'),
        projeto_id: this.validateNumber(row['Projeto ID'], rowNum, 'Projeto ID', 'Alocações'),
        funcao: this.validateRequired(row['Função'], rowNum, 'Função', 'Alocações'),
        horario_tipo: this.validateWorkSchedule(row['Tipo Horário'], rowNum),
        data_alocacao: this.validateDate(row['Data Alocação'], rowNum, 'Data Alocação', 'Alocações')
      };
    });
  }

  private validateRequired(value: any, row: number, field: string, sheet: string): string {
    if (!value || value.toString().trim() === '') {
      this.errors.push({
        aba: sheet,
        linha: row,
        campo: field,
        mensagem: `${field} é obrigatório`
      });
      return '';
    }
    return value.toString().trim();
  }

  private validateNumber(value: any, row: number, field: string, sheet: string): number {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      this.errors.push({
        aba: sheet,
        linha: row,
        campo: field,
        mensagem: `${field} deve ser um número válido >= 0`
      });
      return 0;
    }
    return num;
  }

  private validateDate(value: any, row: number, field: string, sheet: string): string {
    if (!value) {
      return new Date().toISOString().split('T')[0];
    }

    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    const dateStr = value.toString();
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      this.errors.push({
        aba: sheet,
        linha: row,
        campo: field,
        mensagem: `${field} deve ser uma data válida`
      });
      return new Date().toISOString().split('T')[0];
    }

    return date.toISOString().split('T')[0];
  }

  private validateTime(value: any, row: number, field: string, sheet: string): string | undefined {
    if (!value) return undefined;
    
    const timeStr = value.toString().trim();
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(timeStr)) {
      this.errors.push({
        aba: sheet,
        linha: row,
        campo: field,
        mensagem: `${field} deve estar no formato HH:MM`
      });
      return undefined;
    }
    
    return timeStr;
  }

  private validateEmployeeCategory(value: any, row: number): EmployeeCategory {
    const validCategories: EmployeeCategory[] = ['Oficial', 'Auxiliar', 'Técnico Superior'];
    const category = value?.toString().trim();
    
    if (!category || !validCategories.includes(category as EmployeeCategory)) {
      this.errors.push({
        aba: 'Colaboradores',
        linha: row,
        campo: 'Categoria',
        mensagem: `Categoria deve ser uma das seguintes: ${validCategories.join(', ')}`
      });
      return 'Oficial';
    }
    
    return category as EmployeeCategory;
  }

  private validateWorkSchedule(value: any, row: number): WorkScheduleType {
    const validTypes: WorkScheduleType[] = ['integral', 'meio_periodo', 'turno'];
    const type = value?.toString().trim().toLowerCase();
    
    if (!type || !validTypes.includes(type as WorkScheduleType)) {
      this.errors.push({
        aba: 'Alocações',
        linha: row,
        campo: 'Tipo Horário',
        mensagem: `Tipo Horário deve ser um dos seguintes: ${validTypes.join(', ')}`
      });
      return 'integral';
    }
    
    return type as WorkScheduleType;
  }
}
