import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import type { ProjectFormDataType } from "./types";

interface ProjectBasicInfoProps {
  form: UseFormReturn<ProjectFormDataType>;
}

export function ProjectBasicInfo({ form }: ProjectBasicInfoProps) {
  return (
    <div className="space-y-4">
      <FormDescription className="text-xs text-muted-foreground">
        Os valores serão arredondados para o inteiro mais próximo (ex: 1.232,50 Kz → 1.233 Kz)
      </FormDescription>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Projeto *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do projeto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="encarregado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Encarregado *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do encarregado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Atrasado">Atrasado</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_inicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Início *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_fim_prevista"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Fim Prevista *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orcamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento Total do Projeto (Kz) *</FormLabel>
              <FormControl>
                <CurrencyInput
                  placeholder="0,00"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_projeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Projeto *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Residencial">Residencial</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="Reforma">Reforma</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provincia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Província *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Luanda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="municipio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Município *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Luanda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zona_bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona / Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Talatona" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}