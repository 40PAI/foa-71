import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectName,
  onConfirm,
  isDeleting,
}: DeleteProjectDialogProps) {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await onConfirm();
    } catch (error) {
      console.error("Erro ao confirmar eliminação:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Projeto?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tem a certeza que deseja eliminar o projeto <strong className="text-foreground">"{projectName}"</strong>?
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Esta ação irá eliminar permanentemente:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 pl-2">
                <li>Todas as etapas do projeto</li>
                <li>Todas as tarefas associadas</li>
                <li>Dados financeiros e fluxo de caixa</li>
                <li>Alocações de colaboradores e ponto diário</li>
                <li>Documentos e histórico PPC</li>
                <li>Guias de consumo e semanas</li>
              </ul>
            </div>
            <p className="text-sm font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Esta ação não pode ser desfeita.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            variant="destructive"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Projeto
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
