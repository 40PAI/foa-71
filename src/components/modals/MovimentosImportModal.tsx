import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useMovimentosImport } from "@/hooks/useMovimentosImport";
import { MovimentosTemplateDownloadButton } from "@/components/financial/MovimentosTemplateDownloadButton";
import { formatCurrencyInput } from "@/utils/currency";
import { useQueryClient } from "@tanstack/react-query";

interface MovimentosImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number | null;
}

export function MovimentosImportModal({ open, onOpenChange, projectId }: MovimentosImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  const {
    progress,
    validationErrors,
    previewData,
    importResult,
    parseExcelFile,
    importMovimentos,
    reset,
  } = useMovimentosImport();

  const handleClose = () => {
    setSelectedFile(null);
    reset();
    onOpenChange(false);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(file.type)) {
      alert('Formato de arquivo inválido. Use .xlsx ou .csv');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setSelectedFile(file);
    await parseExcelFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = async () => {
    if (!previewData || !projectId) return;
    
    const success = await importMovimentos(previewData, projectId);
    
    if (success) {
      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['movimentos-financeiros'] }),
        queryClient.invalidateQueries({ queryKey: ['gastos-obra'] }),
        queryClient.invalidateQueries({ queryKey: ['gastos-obra-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['saldos-centros-custo'] }),
      ]);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Movimentos Financeiros</DialogTitle>
          <DialogDescription>
            Importe entradas e saídas em massa usando um arquivo Excel ou CSV
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Download Template Button */}
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Não tem um arquivo pronto?</span>
            </div>
            <MovimentosTemplateDownloadButton />
          </div>

          {/* File Upload Area */}
          {!selectedFile && progress.step === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Arraste e solte seu arquivo aqui
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ou clique para selecionar (Excel .xlsx ou CSV)
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Selecionar Arquivo</span>
                </Button>
              </label>
            </div>
          )}

          {/* Progress Bar */}
          {progress.step !== 'idle' && progress.step !== 'success' && (
            <div className="space-y-2">
              <Progress value={progress.percentage} />
              <p className="text-sm text-center text-muted-foreground">
                {progress.message}
              </p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">
                  {validationErrors.length} erro(s) encontrado(s):
                </p>
                <ScrollArea className="h-32">
                  <ul className="space-y-1 text-sm">
                    {validationErrors.slice(0, 10).map((error, idx) => (
                      <li key={idx}>
                        Linha {error.linha} - {error.campo}: {error.mensagem}
                      </li>
                    ))}
                    {validationErrors.length > 10 && (
                      <li className="text-muted-foreground">
                        + {validationErrors.length - 10} erros adicionais
                      </li>
                    )}
                  </ul>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Data */}
          {previewData && validationErrors.length === 0 && progress.step !== 'importing' && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Arquivo validado com sucesso!</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">
                        {previewData.metadata.totalEntradas} Entradas
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {formatCurrencyInput(previewData.metadata.valorTotalEntradas)}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-600 font-medium">
                        {previewData.metadata.totalSaidas} Saídas
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {formatCurrencyInput(previewData.metadata.valorTotalSaidas)}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-medium mb-2">Preview (primeiras 10 linhas):</h4>
                <ScrollArea className="h-64 border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Data</th>
                        <th className="p-2 text-left">Descrição</th>
                        <th className="p-2 text-left">Categoria</th>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.movimentos.slice(0, 10).map((mov, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{mov.data}</td>
                          <td className="p-2">{mov.descricao}</td>
                          <td className="p-2">{mov.categoria}</td>
                          <td className="p-2">
                            <span
                              className={
                                mov.tipo === 'entrada'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {mov.tipo}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            {formatCurrencyInput(mov.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert variant={importResult.success ? 'default' : 'destructive'}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <p className="font-medium">{importResult.message}</p>
                {importResult.errors.length > 0 && (
                  <ScrollArea className="h-32 mt-2">
                    <ul className="space-y-1 text-sm">
                      {importResult.errors.map((error, idx) => (
                        <li key={idx}>
                          Linha {error.linha}: {error.mensagem}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          {previewData && validationErrors.length === 0 && !importResult && (
            <Button
              onClick={handleImport}
              disabled={progress.step === 'importing' || !projectId}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar {previewData.metadata.validRows} Movimento(s)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
