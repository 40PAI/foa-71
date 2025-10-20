import { WarehouseMaterial } from "./warehouse";

export interface ExcelWarehouseData {
  materiais: Omit<WarehouseMaterial, 'id' | 'created_at' | 'updated_at'>[];
}

export interface WarehouseImportResult {
  success: boolean;
  materiaisCount?: number;
  errors?: string[];
}

export interface ValidationError {
  linha: number;
  campo: string;
  mensagem: string;
}

export interface WarehouseImportProgress {
  step: 'uploading' | 'validating' | 'preview' | 'importing' | 'success' | 'error';
  progress: number;
  message: string;
}
