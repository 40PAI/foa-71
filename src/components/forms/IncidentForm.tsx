
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectSelector } from "@/components/ProjectSelector";
import { StageSelector } from "@/components/StageSelector";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

interface IncidentFormProps {
  incident?: any;
  onSubmit: (data: TablesInsert<"incidentes"> | (TablesUpdate<"incidentes"> & { id: number })) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function IncidentForm({ incident, onSubmit, onCancel, isLoading }: IncidentFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: incident ? {
      data: incident.data,
      tipo: incident.tipo,
      descricao: incident.descricao,
      severidade: incident.severidade,
      etapa_relacionada: incident.etapa_relacionada,
      reportado_por: incident.reportado_por,
      id_projeto: incident.id_projeto,
    } : {}
  });

  const projectId = watch("id_projeto");

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      id_projeto: data.id_projeto || null,
    };

    if (incident) {
      onSubmit({ ...formData, id: incident.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="data">Data *</Label>
        <Input
          id="data"
          type="date"
          {...register("data", { required: "Data é obrigatória" })}
        />
        {errors.data && (
          <p className="text-sm text-destructive">{errors.data.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo *</Label>
        <Select onValueChange={(value) => setValue("tipo", value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Incidente">Incidente</SelectItem>
            <SelectItem value="Near-miss">Near-miss</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="severidade">Severidade *</Label>
        <Select onValueChange={(value) => setValue("severidade", value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Baixa">Baixa</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          {...register("descricao", { required: "Descrição é obrigatória" })}
          placeholder="Descreva o incidente..."
          rows={3}
        />
        {errors.descricao && (
          <p className="text-sm text-destructive">{errors.descricao.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_projeto">Projeto *</Label>
        <ProjectSelector
          value={projectId?.toString() || ""}
          onValueChange={(value) => setValue("id_projeto", value ? Number(value) : null)}
          placeholder="Selecionar projeto..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="etapa_relacionada">Etapa Relacionada *</Label>
        <StageSelector
          projectId={projectId?.toString()}
          value={watch("etapa_relacionada")}
          onValueChange={(value) => setValue("etapa_relacionada", value)}
          placeholder="Selecionar etapa..."
        />
        {errors.etapa_relacionada && (
          <p className="text-sm text-destructive">{errors.etapa_relacionada.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reportado_por">Reportado Por *</Label>
        <Input
          id="reportado_por"
          {...register("reportado_por", { required: "Campo obrigatório" })}
          placeholder="Nome de quem reportou"
        />
        {errors.reportado_por && (
          <p className="text-sm text-destructive">{errors.reportado_por.message as string}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : incident ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
