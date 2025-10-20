import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { ProjectChartsModal } from "@/components/modals/ProjectChartsModal";
import { UpdateMetricsButton } from "@/components/UpdateMetricsButton";
import type { ExtendedProject } from "@/types/project";

interface ProjectKPICardsProps {
  projects: ExtendedProject[];
  kpis?: any[];
}

export function ProjectKPICards({ projects, kpis }: ProjectKPICardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
      {projects.map((projeto) => {
        const kpi = kpis?.find(k => k.projeto_id === projeto.id);
        if (!kpi) return null;

        return (
          <Card key={projeto.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                {projeto.nome}
                <div className="flex gap-1">
                  <UpdateMetricsButton projectId={projeto.id!} />
                  <ProjectChartsModal 
                    projectId={projeto.id!}
                    projectName={projeto.nome}
                  />
                  <ProjectDetailsModal 
                    projectId={projeto.id!}
                    projectName={projeto.nome}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Desvio Prazo</div>
                  <div className={`font-semibold ${
                    kpi.desvio_prazo_dias > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {kpi.desvio_prazo_dias > 0 ? '+' : ''}{kpi.desvio_prazo_dias} dias
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Lead-time Compras</div>
                  <div className={`font-semibold ${
                    kpi.lead_time_compras_medio > 7 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {kpi.lead_time_compras_medio.toFixed(1)} dias
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Absentismo</div>
                  <div className={`font-semibold ${
                    kpi.absentismo_percentual > 5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {kpi.absentismo_percentual.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status Geral</div>
                  <Badge variant="outline" className={
                    kpi.status_alerta === 'Verde' ? 'border-green-500 text-green-700' :
                    kpi.status_alerta === 'Amarelo' ? 'border-yellow-500 text-yellow-700' :
                    'border-red-500 text-red-700'
                  }>
                    {kpi.status_alerta}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}