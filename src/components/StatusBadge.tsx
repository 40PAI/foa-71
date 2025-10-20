
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
    
    if (['aprovado', 'concluído', 'presente', 'em-uso'].includes(normalizedStatus)) {
      return 'default'; // green
    }
    if (['pendente', 'atraso', 'baixa', 'disponível'].includes(normalizedStatus)) {
      return 'secondary'; // yellow/gray
    }
    if (['rejeitado', 'ausente', 'alta', 'atrasado', 'manutenção'].includes(normalizedStatus)) {
      return 'destructive'; // red
    }
    if (['em-andamento'].includes(normalizedStatus)) {
      return 'outline'; // blue
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
