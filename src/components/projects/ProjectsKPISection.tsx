import React, { useMemo } from "react";
import { Calendar, Clock, DollarSign, TrendingUp } from "lucide-react";
import { KPIGrid } from "@/components/common/KPIGrid";
import { formatCurrency } from "@/utils/formatters";
import type { ExtendedProject } from "@/types/project";

interface ProjectsKPISectionProps {
  projects: ExtendedProject[];
}

export function ProjectsKPISection({ projects }: ProjectsKPISectionProps) {
  const kpiData = useMemo(() => {
    const totalProjetos = projects.length;
    const projetosAtrasados = projects.filter(p => p.status === 'Atrasado').length;
    const mediaAvanco = totalProjetos > 0 
      ? projects.reduce((acc, p) => acc + (p.avanco_fisico || 0), 0) / totalProjetos 
      : 0;
    const orcamentoTotal = projects.reduce((acc, p) => acc + p.orcamento, 0);

    return [
      {
        title: "Total de Projetos",
        value: totalProjetos,
        subtitle: "Projetos ativos",
        icon: <Calendar className="h-4 w-4" />,
        alert: "green"
      },
      {
        title: "Projetos Atrasados", 
        value: projetosAtrasados,
        subtitle: `${totalProjetos > 0 ? ((projetosAtrasados / totalProjetos) * 100).toFixed(0) : 0}% do total`,
        icon: <Clock className="h-4 w-4" />,
        alert: projetosAtrasados > 0 ? "red" : "green"
      },
      {
        title: "Avanço Médio",
        value: `${mediaAvanco.toFixed(0)}%`,
        subtitle: "Avanço físico geral", 
        icon: <TrendingUp className="h-4 w-4" />,
        alert: mediaAvanco >= 80 ? "green" : mediaAvanco >= 60 ? "yellow" : "red"
      },
      {
        title: "Orçamento Total",
        value: formatCurrency(orcamentoTotal),
        subtitle: "Soma de todos os projetos",
        icon: <DollarSign className="h-4 w-4" />,
        alert: "green"
      }
    ];
  }, [projects]);

  return <KPIGrid items={kpiData} columns={4} />;
}