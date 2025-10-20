import * as XLSX from 'xlsx';
import { ExcelProjectData, ValidationError } from '@/types/projectImport';
import { ProjectFormData, ProjectStage } from '@/types/project';
import { Task } from '@/types/task';

export class ExcelParser {
  private workbook: XLSX.WorkBook | null = null;
  private errors: ValidationError[] = [];

  async parseFile(file: File): Promise<{ data: ExcelProjectData | null; errors: ValidationError[] }> {
    this.errors = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Validar estrutura do arquivo
      if (!this.validateStructure()) {
        return { data: null, errors: this.errors };
      }

      // Parsear dados
      const projeto = this.parseProjectData();
      const etapas = this.parseStagesData();
      const tarefas = this.parseTasksData();

      if (this.errors.length > 0) {
        return { data: null, errors: this.errors };
      }

      return {
        data: { projeto, etapas, tarefas },
        errors: []
      };
    } catch (error) {
      this.errors.push({
        aba: 'Geral',
        linha: 0,
        campo: 'Arquivo',
        mensagem: `Erro ao ler arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return { data: null, errors: this.errors };
    }
  }

  private validateStructure(): boolean {
    if (!this.workbook) return false;

    const requiredSheets = ['Dados do Projeto', 'Etapas', 'Tarefas'];
    const sheetNames = this.workbook.SheetNames;

    for (const sheet of requiredSheets) {
      if (!sheetNames.includes(sheet)) {
        this.errors.push({
          aba: 'Estrutura',
          linha: 0,
          campo: 'Abas',
          mensagem: `Aba obrigatória "${sheet}" não encontrada`
        });
      }
    }

    return this.errors.length === 0;
  }

  private parseProjectData(): ProjectFormData {
    const sheet = this.workbook!.Sheets['Dados do Projeto'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Converter formato vertical (campo | valor) para objeto
    const projectData: any = {};
    for (let i = 1; i < data.length; i++) {
      const [campo, valor] = data[i];
      if (campo && valor !== undefined) {
        projectData[campo] = valor;
      }
    }

    // Validar e converter campos obrigatórios
    const projeto: any = {
      nome: this.validateRequired(projectData['Nome do Projeto'], 'Dados do Projeto', 'Nome do Projeto'),
      cliente: this.validateRequired(projectData['Cliente'], 'Dados do Projeto', 'Cliente'),
      encarregado: this.validateRequired(projectData['Encarregado'], 'Dados do Projeto', 'Encarregado'),
      data_inicio: this.validateDate(projectData['Data de Início'], 'Dados do Projeto', 'Data de Início'),
      data_fim_prevista: this.validateDate(projectData['Data de Fim Prevista'], 'Dados do Projeto', 'Data de Fim Prevista'),
      orcamento: this.validateNumber(projectData['Orçamento Total'], 'Dados do Projeto', 'Orçamento Total'),
      limite_aprovacao: this.validateNumber(projectData['Limite de Aprovação'], 'Dados do Projeto', 'Limite de Aprovação'),
      limite_gastos: this.validateNumber(projectData['Limite de Gastos'] || 0, 'Dados do Projeto', 'Limite de Gastos'),
      status: this.validateStatus(projectData['Status'], 'Dados do Projeto', 'Status'),
      provincia: this.validateRequired(projectData['Província'], 'Dados do Projeto', 'Província'),
      municipio: this.validateRequired(projectData['Município'], 'Dados do Projeto', 'Município'),
      zona_bairro: projectData['Zona/Bairro'] || '',
      tipo_projeto: this.validateProjectType(projectData['Tipo de Projeto'], 'Dados do Projeto', 'Tipo de Projeto'),
      numero_etapas: this.validateNumber(projectData['Número de Etapas'], 'Dados do Projeto', 'Número de Etapas')
    };

    return projeto;
  }

  private parseStagesData(): ProjectStage[] {
    const sheet = this.workbook!.Sheets['Etapas'];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    return data.map((row, index) => ({
      numero_etapa: this.validateNumber(row['Número da Etapa'], 'Etapas', 'Número da Etapa', index + 2),
      nome_etapa: this.validateRequired(row['Nome da Etapa'], 'Etapas', 'Nome da Etapa', index + 2),
      tipo_etapa: this.validateStageType(row['Tipo de Etapa'], 'Etapas', 'Tipo de Etapa', index + 2),
      responsavel_etapa: this.validateRequired(row['Responsável da Etapa'], 'Etapas', 'Responsável da Etapa', index + 2),
      data_inicio_etapa: this.validateDate(row['Data Início Etapa'], 'Etapas', 'Data Início Etapa', index + 2),
      data_fim_prevista_etapa: this.validateDate(row['Data Fim Prevista Etapa'], 'Etapas', 'Data Fim Prevista Etapa', index + 2),
      status_etapa: this.validateStageStatus(row['Status Etapa'], 'Etapas', 'Status Etapa', index + 2),
      observacoes: row['Observações'] || '',
      orcamento_etapa: this.validateNumber(row['Orçamento da Etapa'], 'Etapas', 'Orçamento da Etapa', index + 2),
      gasto_etapa: 0,
      tempo_previsto_dias: this.validateNumber(row['Tempo Previsto (dias)'], 'Etapas', 'Tempo Previsto', index + 2),
      tempo_real_dias: 0
    }));
  }

  private parseTasksData(): Omit<Task, 'id' | 'created_at' | 'updated_at'>[] {
    const sheet = this.workbook!.Sheets['Tarefas'];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    return data.map((row, index) => ({
      id_etapa: this.validateNumber(row['Número da Etapa'], 'Tarefas', 'Número da Etapa', index + 2),
      descricao: this.validateRequired(row['Descrição da Tarefa'], 'Tarefas', 'Descrição da Tarefa', index + 2),
      tipo: this.validateTaskType(row['Tipo'], 'Tarefas', 'Tipo', index + 2),
      responsavel: this.validateRequired(row['Responsável'], 'Tarefas', 'Responsável', index + 2),
      prazo: this.validateDate(row['Prazo'], 'Tarefas', 'Prazo', index + 2),
      status: this.validateTaskStatus(row['Status'], 'Tarefas', 'Status', index + 2),
      percentual_conclusao: this.validatePercentage(row['Percentual de Conclusão'] || 0, 'Tarefas', 'Percentual de Conclusão', index + 2),
      custo_material: this.validateNumber(row['Custo Material'] || 0, 'Tarefas', 'Custo Material', index + 2),
      custo_mao_obra: this.validateNumber(row['Custo Mão de Obra'] || 0, 'Tarefas', 'Custo Mão de Obra', index + 2),
      preco_unitario: this.validateNumber(row['Preço Unitário'] || 0, 'Tarefas', 'Preço Unitário', index + 2),
      tempo_real_dias: 0,
      gasto_real: 0,
      semana_programada: row['Semana Programada'] || undefined
    }));
  }

  // Métodos de validação
  private validateRequired(value: any, aba: string, campo: string, linha?: number): string {
    if (!value || String(value).trim() === '') {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Campo obrigatório não preenchido`
      });
      return '';
    }
    return String(value).trim();
  }

  private validateNumber(value: any, aba: string, campo: string, linha?: number): number {
    const num = Number(value);
    if (isNaN(num)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Valor deve ser um número válido`
      });
      return 0;
    }
    return num;
  }

  private validateDate(value: any, aba: string, campo: string, linha?: number): string {
    if (!value) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Data obrigatória não preenchida`
      });
      return '';
    }

    // Tentar converter serial date do Excel para data
    let dateStr: string;
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      dateStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    } else {
      dateStr = String(value);
    }

    // Validar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Data deve estar no formato YYYY-MM-DD`
      });
      return '';
    }

    return dateStr;
  }

  private validateStatus(value: any, aba: string, campo: string, linha?: number): any {
    const validStatuses = ['Em Andamento', 'Atrasado', 'Concluído', 'Pausado', 'Planeado', 'Cancelado'];
    if (!validStatuses.includes(value)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`
      });
      return 'Em Andamento';
    }
    return value;
  }

  private validateProjectType(value: any, aba: string, campo: string, linha?: number): any {
    const validTypes = ['Residencial', 'Comercial', 'Industrial', 'Infraestrutura', 'Reforma'];
    if (!validTypes.includes(value)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Tipo inválido. Valores permitidos: ${validTypes.join(', ')}`
      });
      return 'Residencial';
    }
    return value;
  }

  private validateStageType(value: any, aba: string, campo: string, linha?: number): string {
    const validTypes = ['Fundação', 'Estrutura', 'Alvenaria', 'Acabamento', 'Instalações', 'Entrega', 'Mobilização', 'Desmobilização'];
    if (!validTypes.includes(value)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Tipo de etapa inválido. Valores permitidos: ${validTypes.join(', ')}`
      });
      return 'Fundação';
    }
    return value;
  }

  private validateStageStatus(value: any, aba: string, campo: string, linha?: number): string {
    const validStatuses = ['Não Iniciada', 'Em Curso', 'Concluída', 'Atrasada'];
    if (!validStatuses.includes(value)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Status de etapa inválido. Valores permitidos: ${validStatuses.join(', ')}`
      });
      return 'Não Iniciada';
    }
    return value;
  }

  private validateTaskType(value: any, aba: string, campo: string, linha?: number): any {
    const validTypes = ['Residencial', 'Comercial', 'Industrial', 'Infraestrutura', 'Reforma'];
    if (!validTypes.includes(value)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Tipo de tarefa inválido. Valores permitidos: ${validTypes.join(', ')}`
      });
      return 'Residencial';
    }
    return value;
  }

  private validateTaskStatus(value: any, aba: string, campo: string, linha?: number): any {
    const validStatuses = ['Pendente', 'Em Progresso', 'Concluído', 'Cancelado', 'Atrasado'];
    if (!validStatuses.includes(value)) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Status de tarefa inválido. Valores permitidos: ${validStatuses.join(', ')}`
      });
      return 'Pendente';
    }
    return value;
  }

  private validatePercentage(value: any, aba: string, campo: string, linha?: number): number {
    const num = this.validateNumber(value, aba, campo, linha);
    if (num < 0 || num > 100) {
      this.errors.push({
        aba,
        linha: linha || 0,
        campo,
        mensagem: `Percentual deve estar entre 0 e 100`
      });
      return 0;
    }
    return num;
  }
}
