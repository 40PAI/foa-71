import { useProjectContext } from "@/contexts/ProjectContext";
import { ReembolsosFOASection } from "@/components/financial/ReembolsosFOASection";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DividaFOAPage() {
  const { selectedProjectId } = useProjectContext();

  if (!selectedProjectId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione um projeto para visualizar o controle de dívida FOA ↔ FOF
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <ArrowRight className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Controle de Dívida FOA ↔ FOF
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhamento automático de financiamentos e amortizações
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <ReembolsosFOASection projectId={selectedProjectId} />
        </CardContent>
      </Card>
    </div>
  );
}

export default DividaFOAPage;
