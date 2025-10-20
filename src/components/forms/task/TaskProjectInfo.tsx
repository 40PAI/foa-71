import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ProjectSelector } from "@/components/ProjectSelector";
import { StageSelector } from "@/components/StageSelector";
import { WeekSelector } from "@/components/WeekSelector";

interface TaskFormData {
  id_projeto: string;
  id_etapa?: string;
  semana_programada?: string;
}

interface TaskProjectInfoProps {
  form: UseFormReturn<TaskFormData>;
}

export function TaskProjectInfo({ form }: TaskProjectInfoProps) {
  const watchedProjectId = form.watch("id_projeto");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="id_projeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projeto *</FormLabel>
              <FormControl>
                <ProjectSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione o projeto"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="id_etapa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etapa do Projeto</FormLabel>
              <FormControl>
                <StageSelector
                  projectId={watchedProjectId || undefined}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione a etapa"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="semana_programada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semana Programada</FormLabel>
              <FormControl>
                <WeekSelector
                  projectId={watchedProjectId || ""}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione a semana"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}