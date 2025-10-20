import { useState } from 'react';
import { ExcelWarehouseParser } from '@/utils/excelWarehouseParser';
import { WarehouseImportService } from '@/services/warehouseImport';
import { 
  ExcelWarehouseData, 
  WarehouseImportResult, 
  ValidationError, 
  WarehouseImportProgress 
} from '@/types/warehouseImport';

export function useWarehouseImport() {
  const [progress, setProgress] = useState<WarehouseImportProgress>({
    step: 'uploading',
    progress: 0,
    message: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ExcelWarehouseData | null>(null);
  const [importResult, setImportResult] = useState<WarehouseImportResult | null>(null);

  const parseExcelFile = async (file: File) => {
    setProgress({ step: 'validating', progress: 30, message: 'Validando arquivo...' });
    setValidationErrors([]);
    setPreviewData(null);
    setImportResult(null);

    const parser = new ExcelWarehouseParser();
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

  const importMaterials = async (data: ExcelWarehouseData) => {
    setProgress({ step: 'importing', progress: 80, message: 'Importando materiais...' });

    const service = new WarehouseImportService();
    const result = await service.importMaterials(data);

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
    importMaterials,
    reset
  };
}
