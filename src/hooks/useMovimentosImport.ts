import { useState } from 'react';
import { ExcelMovimentosParser } from '@/utils/excelMovimentosParser';
import {
  ExcelMovimentoData,
  MovimentoImportProgress,
  MovimentoImportResult,
  MovimentoValidationError,
} from '@/types/movimentoImport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMovimentosImport() {
  const [progress, setProgress] = useState<MovimentoImportProgress>({
    step: 'idle',
    percentage: 0,
    message: '',
  });
  const [validationErrors, setValidationErrors] = useState<MovimentoValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ExcelMovimentoData | null>(null);
  const [importResult, setImportResult] = useState<MovimentoImportResult | null>(null);

  const parseExcelFile = async (file: File): Promise<boolean> => {
    setProgress({
      step: 'parsing',
      percentage: 10,
      message: 'Lendo arquivo...',
    });

    try {
      const parser = new ExcelMovimentosParser();
      const data = await parser.parseFile(file);
      const errors = parser.getErrors();

      setProgress({
        step: 'validating',
        percentage: 50,
        message: 'Validando dados...',
      });

      setValidationErrors(errors);
      setPreviewData(data);

      if (errors.length > 0) {
        setProgress({
          step: 'error',
          percentage: 100,
          message: `${errors.length} erro(s) encontrado(s). Corrija-os antes de importar.`,
        });
        return false;
      }

      setProgress({
        step: 'idle',
        percentage: 100,
        message: 'Arquivo validado com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Error parsing file:', error);
      setProgress({
        step: 'error',
        percentage: 0,
        message: error.message || 'Erro ao processar arquivo',
      });
      toast.error('Erro ao processar arquivo', {
        description: error.message,
      });
      return false;
    }
  };

  const importMovimentos = async (data: ExcelMovimentoData, projectId: number): Promise<boolean> => {
    setProgress({
      step: 'importing',
      percentage: 0,
      message: 'Iniciando importação...',
    });

    try {
      const { movimentos } = data;
      const totalMovimentos = movimentos.length;
      let importedCount = 0;
      let errorCount = 0;
      const errors: MovimentoValidationError[] = [];

      // Get all centros de custo for this project
      const { data: centrosCusto, error: centrosError } = await supabase
        .from('centros_custo')
        .select('id, codigo, nome')
        .eq('projeto_id', projectId)
        .eq('ativo', true);

      if (centrosError) throw centrosError;

      for (let i = 0; i < movimentos.length; i++) {
        const movimento = movimentos[i];
        
        setProgress({
          step: 'importing',
          percentage: Math.round(((i + 1) / totalMovimentos) * 100),
          message: `Importando movimento ${i + 1} de ${totalMovimentos}...`,
          processedCount: i + 1,
          totalCount: totalMovimentos,
        });

        try {
          // Find centro_custo_id if specified
          let centroCustoId = null;
          if (movimento.centro_custo && centrosCusto) {
            const centro = centrosCusto.find(
              (c) =>
                c.codigo === movimento.centro_custo ||
                c.nome.toLowerCase() === movimento.centro_custo?.toLowerCase()
            );
            
            if (!centro) {
              errors.push({
                linha: movimento.linha,
                campo: 'Centro Custo',
                mensagem: `Centro de custo "${movimento.centro_custo}" não encontrado`,
              });
              errorCount++;
              continue;
            }
            centroCustoId = centro.id;
          }

          // Convert date from DD/MM/YYYY to YYYY-MM-DD
          const [day, month, year] = movimento.data.split('/');
          const dataFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

          // Insert movimento
          const { error: insertError } = await supabase
            .from('movimentos_financeiros')
            .insert({
              projeto_id: projectId,
              centro_custo_id: centroCustoId,
              tipo_movimento: movimento.tipo,
              categoria: movimento.categoria || null,
              subcategoria: movimento.subcategoria || null,
              descricao: movimento.descricao,
              valor: movimento.valor,
              data_movimento: dataFormatted,
              fonte_financiamento: movimento.fonte_financiamento,
              forma_pagamento: movimento.forma_pagamento || null,
              numero_documento: movimento.numero_documento || null,
              observacoes: movimento.observacoes || null,
              status_aprovacao: 'aprovado',
            });

          if (insertError) {
            console.error('Error inserting movimento:', insertError);
            errors.push({
              linha: movimento.linha,
              campo: 'Geral',
              mensagem: insertError.message,
            });
            errorCount++;
          } else {
            importedCount++;
          }
        } catch (error: any) {
          console.error('Error processing movimento:', error);
          errors.push({
            linha: movimento.linha,
            campo: 'Geral',
            mensagem: error.message || 'Erro desconhecido',
          });
          errorCount++;
        }
      }

      const result: MovimentoImportResult = {
        success: errorCount === 0,
        importedCount,
        errorCount,
        errors,
        message:
          errorCount === 0
            ? `${importedCount} movimento(s) importado(s) com sucesso!`
            : `${importedCount} importado(s), ${errorCount} com erro(s)`,
      };

      setImportResult(result);
      
      // Aguardar um pouco antes de mostrar sucesso para garantir que o banco processou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress({
        step: 'success',
        percentage: 100,
        message: result.message,
      });

      if (errorCount === 0) {
        toast.success('Importação concluída!', {
          description: result.message,
        });
      } else {
        toast.warning('Importação concluída com erros', {
          description: result.message,
        });
      }

      return result.success;
    } catch (error: any) {
      console.error('Import error:', error);
      setProgress({
        step: 'error',
        percentage: 0,
        message: error.message || 'Erro ao importar movimentos',
      });
      toast.error('Erro na importação', {
        description: error.message,
      });
      return false;
    }
  };

  const reset = () => {
    setProgress({
      step: 'idle',
      percentage: 0,
      message: '',
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
    importMovimentos,
    reset,
  };
}
