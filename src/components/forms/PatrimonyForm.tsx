
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePatrimony, useUpdatePatrimony } from "@/hooks/usePatrimony";
import { ProjectSelector } from "@/components/ProjectSelector";
import type { Tables } from "@/integrations/supabase/types";

const patrimonyFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  tipo: z.enum(["Gerador", "Betoneira", "Andaime", "Ferramenta", "Outros"]),
  status: z.enum(["Em Uso", "Disponível", "Manutenção", "Transferência"]),
  alocado_projeto_id: z.string().optional(),
});

type PatrimonyFormValues = z.infer<typeof patrimonyFormSchema>;

interface PatrimonyFormProps {
  patrimony?: Tables<"patrimonio">;
  onSuccess?: () => void;
}

export function PatrimonyForm({ patrimony, onSuccess }: PatrimonyFormProps) {
  const createPatrimony = useCreatePatrimony();
  const updatePatrimony = useUpdatePatrimony();

  const form = useForm<PatrimonyFormValues>({
    resolver: zodResolver(patrimonyFormSchema),
    defaultValues: {
      nome: patrimony?.nome || "",
      codigo: patrimony?.codigo || "",
      tipo: patrimony?.tipo || "Outros",
      status: patrimony?.status || "Disponível",
      alocado_projeto_id: patrimony?.alocado_projeto_id?.toString() || "",
    },
  });

  const onSubmit = async (values: PatrimonyFormValues) => {
    try {
      const patrimonyData = {
        nome: values.nome,
        codigo: values.codigo,
        tipo: values.tipo,
        status: values.status,
        alocado_projeto_id: values.alocado_projeto_id ? parseInt(values.alocado_projeto_id) : null,
      };

      if (patrimony) {
        await updatePatrimony.mutateAsync({
          id: patrimony.id,
          ...patrimonyData,
        });
      } else {
        await createPatrimony.mutateAsync({
          id: crypto.randomUUID(),
          ...patrimonyData,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);
    }
  };

  const watchedStatus = form.watch("status");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Equipamento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Betoneira 400L" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input placeholder="Ex: BET-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Gerador">Gerador</SelectItem>
                  <SelectItem value="Betoneira">Betoneira</SelectItem>
                  <SelectItem value="Andaime">Andaime</SelectItem>
                  <SelectItem value="Ferramenta">Ferramenta</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Em Uso">Em Uso</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedStatus === "Em Uso" && (
          <FormField
            control={form.control}
            name="alocado_projeto_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto Alocado</FormLabel>
                <ProjectSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecionar projeto..."
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={createPatrimony.isPending || updatePatrimony.isPending}
          >
            {patrimony ? "Atualizar" : "Adicionar"} Equipamento
          </Button>
        </div>
      </form>
    </Form>
  );
}
