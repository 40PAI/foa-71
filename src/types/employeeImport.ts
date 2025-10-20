import { Employee, EmployeeAllocation } from "./employee";

export interface ExcelEmployeeData {
  colaboradores: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[];
  alocacoes?: Array<Omit<EmployeeAllocation, 'id' | 'created_at' | 'updated_at' | 'colaborador_id'> & { numero_funcional: string }>;
}

export interface EmployeeImportResult {
  success: boolean;
  colaboradoresCount?: number;
  alocacoesCount?: number;
  errors?: string[];
}

export interface ValidationError {
  aba: string;
  linha: number;
  campo: string;
  mensagem: string;
}

export interface EmployeeImportProgress {
  step: 'uploading' | 'validating' | 'preview' | 'importing' | 'success' | 'error';
  progress: number;
  message: string;
}
