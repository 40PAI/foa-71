
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
    
    // Verde - Estados positivos/completos
    if (['aprovado', 'concluído', 'presente', 'em-uso'].includes(normalizedStatus)) {
      return 'default'; // green
    }
    
    // Vermelho - Estados críticos/negativos
    if (['rejeitado', 'ausente', 'alta', 'atrasado', 'manutenção', 'cancelado'].includes(normalizedStatus)) {
      return 'destructive'; // red
    }
    
    // Azul - Em andamento e pausado
    if (['em-andamento', 'pausado'].includes(normalizedStatus)) {
      return 'outline'; // blue
    }
    
    // Amarelo/Cinza - Estados neutros/pendentes
    if (['pendente', 'atraso', 'baixa', 'disponível', 'planeado'].includes(normalizedStatus)) {
      return 'secondary'; // yellow/gray
    }
    
    return 'secondary';
  };

  return (
    <Badge 
      variant={getStatusVariant(status)} 
      className={cn("font-medium", className)}
    >
      {status}
    </Badge>
  );
}
