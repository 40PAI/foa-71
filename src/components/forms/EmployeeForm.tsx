
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectSelector } from "@/components/ProjectSelector";
import { FileUpload } from "@/components/ui/file-upload";
import type { TablesInsert } from "@/integrations/supabase/types";

interface EmployeeFormProps {
  onSubmit: (data: TablesInsert<"colaboradores">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
}

export function EmployeeForm({ onSubmit, onCancel, isLoading, initialData }: EmployeeFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TablesInsert<"colaboradores">>({
    defaultValues: initialData || {}
  });

  const projectId = watch("projeto_id");
  const tipoColaborador = watch("tipo_colaborador");
  const cvLink = watch("cv_link");

  const handleFormSubmit = (data: TablesInsert<"colaboradores">) => {
    onSubmit({
      ...data,
      custo_hora: Number(data.custo_hora) || 0,
      projeto_id: data.projeto_id || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            {...register("nome", { required: "Nome é obrigatório" })}
            placeholder="Nome do colaborador"
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_colaborador">Tipo de Colaborador *</Label>
          <Select onValueChange={(value) => setValue("tipo_colaborador", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fixo">Fixo (Tempo Integral)</SelectItem>
              <SelectItem value="Temporário">Temporário (Por Obra)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_funcional">Número Funcional</Label>
          <Input
            id="numero_funcional"
            {...register("numero_funcional")}
            placeholder="Ex: FOA001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bi">BI/Passaporte</Label>
          <Input
            id="bi"
            {...register("bi")}
            placeholder="Número do documento"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo *</Label>
        <Input
          id="cargo"
          {...register("cargo", { required: "Cargo é obrigatório" })}
          placeholder="Cargo do colaborador"
        />
        {errors.cargo && (
          <p className="text-sm text-destructive">{errors.cargo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoria *</Label>
        <Select onValueChange={(value) => setValue("categoria", value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Oficial">Oficial</SelectItem>
            <SelectItem value="Auxiliar">Auxiliar</SelectItem>
            <SelectItem value="Técnico Superior">Técnico Superior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="morada">Morada</Label>
        <Textarea
          id="morada"
          {...register("morada")}
          placeholder="Endereço completo"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custo_hora">Custo por Hora (KZ)</Label>
        <Input
          id="custo_hora"
          type="number"
          {...register("custo_hora")}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <FileUpload
          label="Upload do CV"
          value={cvLink || ""}
          onValueChange={(value) => setValue("cv_link", value)}
          accept="application/pdf,image/*"
          maxSize={10}
          bucket="cvs"
          placeholder="Nenhum CV carregado"
        />
      </div>

      {tipoColaborador === "Fixo" && (
        <div className="space-y-2">
          <Label htmlFor="projeto_id">Projeto Principal</Label>
          <ProjectSelector
            value={projectId?.toString() || ""}
            onValueChange={(value) => setValue("projeto_id", value ? Number(value) : null)}
            placeholder="Selecionar projeto..."
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hora_entrada">Hora de Entrada</Label>
          <Input
            id="hora_entrada"
            type="time"
            {...register("hora_entrada")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hora_saida">Hora de Saída</Label>
          <Input
            id="hora_saida"
            type="time"
            {...register("hora_saida")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
