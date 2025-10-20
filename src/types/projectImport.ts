import { ProjectFormData, ProjectStage } from "./project";
import { Task } from "./task";

export interface ExcelProjectData {
  projeto: ProjectFormData;
  etapas: ProjectStage[];
  tarefas: Omit<Task, 'id' | 'created_at' | 'updated_at'>[];
}

export interface ImportResult {
  success: boolean;
  projetoId?: number;
  etapasCount?: number;
  tarefasCount?: number;
  errors?: string[];
}

export interface ValidationError {
  aba: string;
  linha: number;
  campo: string;
  mensagem: string;
}

export interface ImportProgress {
  step: 'uploading' | 'validating' | 'preview' | 'importing' | 'success' | 'error';
  progress: number;
  message: string;
}
