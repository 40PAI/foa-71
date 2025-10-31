import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { useWarehouseImport } from "@/hooks/useWarehouseImport";
import { WarehouseTemplateDownloadButton } from "@/components/warehouse/WarehouseTemplateDownloadButton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";

export function WarehouseImportModal() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  
  const {
    progress,
    validationErrors,
    previewData,
    importResult,
    parseExcelFile,
    importMaterials,
    reset
  } = useWarehouseImport();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await parseExcelFile(file);
    }
  };

  const handleImport = async () => {
    if (previewData) {
      const result = await importMaterials(previewData);
      if (result?.success) {
        await queryClient.invalidateQueries({ queryKey: ['materials-armazem'] });
        toast.success(`${result.materiaisCount ?? 0} materiais importados com sucesso!`);
        setTimeout(() => {
          setOpen(false);
          handleClose();
        }, 2000);
      } else if (result?.errors?.length) {
        toast.error(result.errors.join('; '));
      }
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) handleClose();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="h-4 w-4 mr-2" />
          Importar de Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Materiais do Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Template de Importação</p>
              <p className="text-sm text-muted-foreground">
                Baixe o template Excel para facilitar o preenchimento
              </p>
            </div>
            <WarehouseTemplateDownloadButton />
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="warehouse-file-upload"
            />
            <label htmlFor="warehouse-file-upload" className="cursor-pointer">
              <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">
                {selectedFile ? selectedFile.name : 'Clique para selecionar o arquivo Excel'}
              </p>
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: .xlsx, .xls
              </p>
            </label>
          </div>

          {/* Progress */}
          {progress.progress > 0 && progress.step !== 'error' && (
            <div className="space-y-2">
              <Progress value={progress.progress} />
              <p className="text-sm text-center text-muted-foreground">{progress.message}</p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Erros encontrados:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <li key={index}>
                      Linha {error.linha} - {error.campo}: {error.mensagem}
                    </li>
                  ))}
                  {validationErrors.length > 10 && (
                    <li className="text-muted-foreground">
                      ... e mais {validationErrors.length - 10} erros
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {previewData && progress.step === 'preview' && (
            <div className="space-y-3">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">
                    Pronto para importar {previewData.materiais.length} materiais
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Revise os dados e confirme a importação
                  </p>
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="font-medium mb-2">Primeiros 5 materiais:</p>
                <div className="space-y-2 text-sm">
                  {previewData.materiais.slice(0, 5).map((material, index) => (
                    <div key={index} className="p-2 bg-muted rounded">
                      <p><strong>{material.codigo_interno}</strong> - {material.nome_material}</p>
                      <p className="text-muted-foreground">
                        {material.categoria_principal} / {material.subcategoria} - {material.quantidade_stock} {material.unidade_medida}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {importResult.success ? (
                  <p>{importResult.materiaisCount} materiais importados com sucesso!</p>
                ) : (
                  <div>
                    <p className="font-medium">Erro na importação:</p>
                    <ul className="list-disc list-inside mt-1">
                      {importResult.errors?.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            {previewData && progress.step === 'preview' && (
              <Button onClick={handleImport}>
                Confirmar Importação
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
