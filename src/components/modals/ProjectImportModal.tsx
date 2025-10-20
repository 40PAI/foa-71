import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, CheckCircle2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useProjectImport } from "@/hooks/useProjectImport";
import { ImportErrorsDisplay } from "@/components/projects/ImportErrorsDisplay";
import { ImportPreview } from "@/components/projects/ImportPreview";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { TemplateDownloadButton } from "@/components/projects/TemplateDownloadButton";

export function ProjectImportModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    progress,
    validationErrors,
    previewData,
    importResult,
    parseExcelFile,
    importProject,
    reset
  } = useProjectImport();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validar tamanho (10MB máx)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Tamanho máximo: 10MB",
        variant: "destructive"
      });
      return;
    }

    await parseExcelFile(file);
  }, [parseExcelFile, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: progress.step === 'importing'
  });

  const handleImport = async () => {
    if (!previewData) return;

    const result = await importProject(previewData);
    
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: `Projeto "${previewData.projeto.nome}" importado com sucesso!`,
      });
      
      // Invalidar queries para atualizar lista de projetos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 2000);
    } else {
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar o projeto. Verifique os detalhes.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Importar de Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Projeto de Excel</DialogTitle>
          <DialogDescription>
            Importe um projeto completo com etapas e tarefas através de um arquivo Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Botão de download do template */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Baixe o template, preencha e faça upload
            </p>
            <TemplateDownloadButton />
          </div>

          {/* Área de upload */}
          {progress.step === 'uploading' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Solte o arquivo aqui...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Arraste um arquivo Excel ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Formatos aceitos: .xlsx, .xls (máx. 10MB)
                  </p>
                </>
              )}
            </div>
          )}

          {/* Progress bar */}
          {progress.step !== 'uploading' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{progress.message}</span>
                <span className="text-muted-foreground">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} />
            </div>
          )}

          {/* Erros de validação */}
          {validationErrors.length > 0 && (
            <ImportErrorsDisplay errors={validationErrors} />
          )}

          {/* Preview dos dados */}
          {progress.step === 'preview' && previewData && (
            <ImportPreview data={previewData} />
          )}

          {/* Sucesso */}
          {progress.step === 'success' && importResult?.success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Projeto importado com sucesso! {importResult.etapasCount} etapas e{' '}
                {importResult.tarefasCount} tarefas foram criadas.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {progress.step === 'success' ? 'Fechar' : 'Cancelar'}
          </Button>
          {progress.step === 'preview' && previewData && (
            <Button onClick={handleImport}>
              Confirmar Importação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
