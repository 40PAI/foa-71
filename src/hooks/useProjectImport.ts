import { useState } from 'react';
import { ExcelParser } from '@/utils/excelParser';
import { ProjectImportService } from '@/services/projectImport';
import { ExcelProjectData, ValidationError, ImportResult, ImportProgress } from '@/types/projectImport';

export function useProjectImport() {
  const [progress, setProgress] = useState<ImportProgress>({
    step: 'uploading',
    progress: 0,
    message: 'Aguardando arquivo...'
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ExcelProjectData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const parseExcelFile = async (file: File) => {
    setProgress({
      step: 'validating',
      progress: 25,
      message: 'Validando arquivo Excel...'
    });

    const parser = new ExcelParser();
    const { data, errors } = await parser.parseFile(file);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setProgress({
        step: 'error',
        progress: 0,
        message: `${errors.length} erro(s) de validação encontrado(s)`
      });
      return null;
    }

    if (data) {
      setPreviewData(data);
      setProgress({
        step: 'preview',
        progress: 50,
        message: 'Arquivo validado com sucesso! Revise os dados antes de importar.'
      });
    }

    return data;
  };

  const importProject = async (data: ExcelProjectData) => {
    setProgress({
      step: 'importing',
      progress: 75,
      message: 'Importando projeto para o banco de dados...'
    });

    const service = new ProjectImportService();
    const result = await service.importProject(data);

    setImportResult(result);

    if (result.success) {
      setProgress({
        step: 'success',
        progress: 100,
        message: `Projeto importado com sucesso! ${result.etapasCount} etapas e ${result.tarefasCount} tarefas criadas.`
      });
    } else {
      setProgress({
        step: 'error',
        progress: 0,
        message: 'Erro ao importar projeto'
      });
      setValidationErrors(result.errors?.map(err => ({
        aba: 'Importação',
        linha: 0,
        campo: 'Geral',
        mensagem: err
      })) || []);
    }

    return result;
  };

  const reset = () => {
    setProgress({
      step: 'uploading',
      progress: 0,
      message: 'Aguardando arquivo...'
    });
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
    importProject,
    reset
  };
}
