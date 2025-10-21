import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectBasicInfo } from "./ProjectBasicInfo";
import { ProjectFinancialInfo } from "./ProjectFinancialInfo";
import { ProjectLocationInfo } from "./ProjectLocationInfo";
import { ProjectStagesForm } from "../ProjectStagesForm";
import { ProjectCentrosCustoForm, type ProjectCentroCusto } from "./ProjectCentrosCustoForm";
import type { ProjectFormDataType, ProjectStage } from "./types";

interface ProjectFormTabsProps {
  form: UseFormReturn<ProjectFormDataType>;
  stages: ProjectStage[];
  onStagesChange: (stages: ProjectStage[]) => void;
  centrosCusto: ProjectCentroCusto[];
  onCentrosCustoChange: (centrosCusto: ProjectCentroCusto[]) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProjectFormTabs({ 
  form, 
  stages, 
  onStagesChange,
  centrosCusto,
  onCentrosCustoChange,
  activeTab, 
  onTabChange 
}: ProjectFormTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="etapas">Etapas</TabsTrigger>
        <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        <TabsTrigger value="localizacao">Localização</TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="space-y-4">
        <ProjectBasicInfo form={form} />
      </TabsContent>

      <TabsContent value="etapas" className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Etapas do Projeto</h3>
          <p className="text-sm text-muted-foreground">
            Defina as etapas que compõem este projeto. Estas etapas serão usadas para acompanhar o progresso da obra.
          </p>
        </div>
        
        <ProjectStagesForm
          form={form}
          stages={stages}
          onStagesChange={onStagesChange}
        />
      </TabsContent>

      <TabsContent value="financeiro" className="space-y-4">
        <ProjectFinancialInfo 
          form={form}
          centrosCusto={centrosCusto}
          onCentrosCustoChange={onCentrosCustoChange}
          stages={stages}
        />
      </TabsContent>

      <TabsContent value="localizacao" className="space-y-4">
        <ProjectLocationInfo form={form} />
      </TabsContent>
    </Tabs>
  );
}