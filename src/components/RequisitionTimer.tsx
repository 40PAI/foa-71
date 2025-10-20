import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, isAfter, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

interface RequisitionTimerProps {
  dataRequisicao: string;
  prazoLimiteDias: number;
  className?: string;
}

export function RequisitionTimer({ 
  dataRequisicao, 
  prazoLimiteDias, 
  className 
}: RequisitionTimerProps) {
  const [timeInfo, setTimeInfo] = useState<{
    diasRestantes: number;
    isVencido: boolean;
    dataLimite: Date;
    percentual: number;
  } | null>(null);

  useEffect(() => {
    const calcularTempo = () => {
      const dataReq = parseISO(dataRequisicao);
      const dataLimite = new Date(dataReq);
      dataLimite.setDate(dataLimite.getDate() + prazoLimiteDias);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataLimite.setHours(0, 0, 0, 0);
      
      const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      const isVencido = diasRestantes < 0;
      const percentual = Math.max(0, Math.min(100, ((prazoLimiteDias - Math.abs(diasRestantes)) / prazoLimiteDias) * 100));
      
      setTimeInfo({
        diasRestantes: Math.max(0, diasRestantes),
        isVencido,
        dataLimite,
        percentual
      });
    };

    calcularTempo();
    const interval = setInterval(calcularTempo, 1000 * 60 * 60); // Atualizar a cada hora

    return () => clearInterval(interval);
  }, [dataRequisicao, prazoLimiteDias]);

  if (!timeInfo) return null;

  const getVariant = () => {
    if (timeInfo.isVencido) return "destructive";
    if (timeInfo.diasRestantes <= 1) return "destructive";
    if (timeInfo.diasRestantes <= 2) return "secondary";
    return "default";
  };

  const getIcon = () => {
    if (timeInfo.isVencido || timeInfo.diasRestantes <= 1) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return <Clock className="h-3 w-3" />;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getIcon()}
        {timeInfo.isVencido 
          ? "Vencido" 
          : `${timeInfo.diasRestantes}/${prazoLimiteDias} dias`
        }
      </Badge>
      
      {/* Barra de progresso visual */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${
            timeInfo.isVencido 
              ? 'bg-destructive' 
              : timeInfo.diasRestantes <= 1 
                ? 'bg-destructive' 
                : timeInfo.diasRestantes <= 2 
                  ? 'bg-yellow-500' 
                  : 'bg-primary'
          }`}
          style={{ width: `${timeInfo.percentual}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        {timeInfo.isVencido 
          ? `Venceu ${formatDistanceToNow(timeInfo.dataLimite, { addSuffix: true, locale: pt })}`
          : `Vence ${formatDistanceToNow(timeInfo.dataLimite, { addSuffix: true, locale: pt })}`
        }
      </p>
    </div>
  );
}