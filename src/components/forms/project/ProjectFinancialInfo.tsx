import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import type { ProjectFormDataType } from "./types";

interface ProjectFinancialInfoProps {
  form: UseFormReturn<ProjectFormDataType>;
}

export function ProjectFinancialInfo({ form }: ProjectFinancialInfoProps) {
  return (
    <div className="space-y-4">
      <FormDescription className="text-xs text-muted-foreground">
        Os valores serão arredondados para o inteiro mais próximo (ex: 1.232,50 Kz → 1.233 Kz)
      </FormDescription>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="orcamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento Total (Kz) *</FormLabel>
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
          name="limite_aprovacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de Aprovação (Kz) *</FormLabel>
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
          name="limite_gastos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de Gastos do Projeto (Kz)</FormLabel>
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
      </div>
    </div>
  );
}