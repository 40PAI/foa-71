import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectWeeks } from "@/hooks/useProjectWeeks";
import { useStageWeeks } from "@/hooks/useStageWeeks";
import { LoadingSpinner } from "./LoadingSpinner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeekSelectorProps {
  projectId: string | number;
  stageId?: string | number;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function WeekSelector({ 
  projectId, 
  stageId,
  value, 
  onValueChange, 
  placeholder = "Selecionar semana...",
  className 
}: WeekSelectorProps) {
  // Se stageId for fornecido, usar semanas da etapa, senão usar semanas do projeto
  const { data: projectWeeks, isLoading: isLoadingProject } = useProjectWeeks(Number(projectId));
  const { data: stageWeeks, isLoading: isLoadingStage } = useStageWeeks(
    Number(projectId), 
    stageId ? Number(stageId) : undefined
  );
  
  const weeks = stageId ? stageWeeks : projectWeeks;
  const isLoading = stageId ? isLoadingStage : isLoadingProject;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {weeks?.map((week) => {
          const keyValue = stageId ? `${week.etapa_id}-${week.numero_semana}` : week.id;
          const displayText = stageId 
            ? `Semana ${week.numero_semana} da Etapa (${format(new Date(week.data_inicio), "dd/MM", { locale: ptBR })} - ${format(new Date(week.data_fim), "dd/MM", { locale: ptBR })})`
            : `Semana ${week.numero_semana} (${format(new Date(week.data_inicio), "dd/MM", { locale: ptBR })} - ${format(new Date(week.data_fim), "dd/MM", { locale: ptBR })})`;
          
          return (
            <SelectItem key={keyValue} value={week.numero_semana.toString()}>
              {displayText}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}