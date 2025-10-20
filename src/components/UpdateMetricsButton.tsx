
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useUpdateProjectMetrics } from "@/hooks/useUpdateProjectMetrics";

interface UpdateMetricsButtonProps {
  projectId: number;
  size?: "sm" | "default";
}

export function UpdateMetricsButton({ projectId, size = "sm" }: UpdateMetricsButtonProps) {
  const updateMetrics = useUpdateProjectMetrics();

  const handleUpdate = () => {
    updateMetrics.mutate(projectId);
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleUpdate}
      disabled={updateMetrics.isPending}
      title="Recalcular métricas do projeto"
    >
      <RefreshCw className={`h-4 w-4 ${updateMetrics.isPending ? 'animate-spin' : ''}`} />
      {size === "default" && (updateMetrics.isPending ? "Atualizando..." : "Atualizar Métricas")}
    </Button>
  );
}
