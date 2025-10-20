import { ValidationError } from "@/types/projectImport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ImportErrorsDisplayProps {
  errors: ValidationError[];
}

export function ImportErrorsDisplay({ errors }: ImportErrorsDisplayProps) {
  // Agrupar erros por aba
  const errorsBySheet = errors.reduce((acc, error) => {
    if (!acc[error.aba]) {
      acc[error.aba] = [];
    }
    acc[error.aba].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="mb-2">
        {errors.length} erro(s) de validação encontrado(s)
      </AlertTitle>
      <AlertDescription>
        <ScrollArea className="h-[200px] mt-2">
          <div className="space-y-4">
            {Object.entries(errorsBySheet).map(([sheet, sheetErrors]) => (
              <div key={sheet} className="space-y-2">
                <Badge variant="outline" className="font-semibold">
                  {sheet} ({sheetErrors.length})
                </Badge>
                <ul className="space-y-1 ml-2">
                  {sheetErrors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error.linha > 0 && (
                        <span className="font-medium">Linha {error.linha}: </span>
                      )}
                      <span className="text-muted-foreground">{error.campo}</span>
                      {' - '}
                      {error.mensagem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </AlertDescription>
    </Alert>
  );
}
