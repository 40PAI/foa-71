import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ProjectCentrosCustoForm, type ProjectCentroCusto } from "./ProjectCentrosCustoForm";
import type { ProjectFormDataType, ProjectStage } from "./types";

interface ProjectFinancialInfoProps {
  form: UseFormReturn<ProjectFormDataType>;
  centrosCusto: ProjectCentroCusto[];
  onCentrosCustoChange: (centrosCusto: ProjectCentroCusto[]) => void;
  stages: ProjectStage[];
}

export function ProjectFinancialInfo({ form, centrosCusto, onCentrosCustoChange, stages }: ProjectFinancialInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <FormDescription className="text-xs text-muted-foreground">
          Os valores serão arredondados para o inteiro mais próximo (ex: 1.232,50 Kz → 1.233 Kz)
        </FormDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

      <Separator className="my-6" />

      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Centros de Custo do Projeto</h3>
          <p className="text-sm text-muted-foreground">
            Defina os centros de custo e aloque-os às etapas para melhor controle financeiro.
          </p>
        </div>
        
        <ProjectCentrosCustoForm
          centrosCusto={centrosCusto}
          onCentrosCustoChange={onCentrosCustoChange}
          stages={stages}
        />
      </div>
    </div>
  );
}