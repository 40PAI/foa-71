
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ProjectSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProjectSelector({ 
  value, 
  onValueChange, 
  placeholder = "Selecionar projeto...",
  className 
}: ProjectSelectorProps) {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-destructive text-sm">
        Erro ao carregar projetos
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {projects?.map((project) => (
          <SelectItem key={project.id} value={project.id.toString()}>
            {project.nome} - {project.cliente}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
