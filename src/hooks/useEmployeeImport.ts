import { useState } from 'react';
import { ExcelEmployeeParser } from '@/utils/excelEmployeeParser';
import { EmployeeImportService } from '@/services/employeeImport';
import { 
  ExcelEmployeeData, 
  EmployeeImportResult, 
  ValidationError, 
  EmployeeImportProgress 
} from '@/types/employeeImport';

export function useEmployeeImport() {
  const [progress, setProgress] = useState<EmployeeImportProgress>({
    step: 'uploading',
    progress: 0,
    message: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ExcelEmployeeData | null>(null);
  const [importResult, setImportResult] = useState<EmployeeImportResult | null>(null);

  const parseExcelFile = async (file: File) => {
    setProgress({ step: 'validating', progress: 30, message: 'Validando arquivo...' });
    setValidationErrors([]);
    setPreviewData(null);
    setImportResult(null);

    const parser = new ExcelEmployeeParser();
    const { data, errors } = await parser.parseFile(file);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setProgress({ step: 'error', progress: 0, message: 'Erros de validação encontrados' });
      return;
    }

    if (data) {
      setPreviewData(data);
      setProgress({ step: 'preview', progress: 60, message: 'Pré-visualização pronta' });
    }
  };

  const importEmployees = async (data: ExcelEmployeeData) => {
    setProgress({ step: 'importing', progress: 80, message: 'Importando colaboradores...' });

    const service = new EmployeeImportService();
    const result = await service.importEmployees(data);

    setImportResult(result);

    if (result.success) {
      setProgress({ step: 'success', progress: 100, message: 'Importação concluída!' });
    } else {
      setProgress({ step: 'error', progress: 0, message: 'Erro na importação' });
    }
  };

  const reset = () => {
    setProgress({ step: 'uploading', progress: 0, message: '' });
    setValidationErrors([]);
    setPreviewData(null);
    setImportResult(null);
  };

  return {
    progress,
    validationErrors,
    previewData,
    importResult,
    parseExcelFile,
    importEmployees,
    reset
  };
}
