
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStages } from "@/hooks/useProjectStages";

interface StageSelectorProps {
  projectId?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function StageSelector({ 
  projectId, 
  value, 
  onValueChange, 
  placeholder = "Selecionar etapa..." 
}: StageSelectorProps) {
  const { data: stages = [], isLoading } = useProjectStages(projectId ? parseInt(projectId) : undefined);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando etapas..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (!projectId) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Selecione primeiro um projeto" />
        </SelectTrigger>
      </Select>
    );
  }

  if (stages.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Nenhuma etapa encontrada para este projeto" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {stages.map((stage) => (
          <SelectItem key={stage.id} value={stage.id.toString()}>
            Etapa {stage.numero_etapa}: {stage.nome_etapa}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
