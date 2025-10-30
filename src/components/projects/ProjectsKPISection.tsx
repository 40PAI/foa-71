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
    // Filtrar apenas projetos ativos (excluir concluídos e pausados)
    const projetosAtivos = projects.filter(p => 
      p.status !== 'Concluído' && p.status !== 'Pausado'
    );
    const projetosConcluidos = projects.filter(p => p.status === 'Concluído').length;
    const projetosPausados = projects.filter(p => p.status === 'Pausado').length;
    const projetosAtrasados = projetosAtivos.filter(p => p.status === 'Atrasado').length;
    
    const mediaAvanco = projetosAtivos.length > 0 
      ? projetosAtivos.reduce((acc, p) => acc + (p.avanco_fisico || 0), 0) / projetosAtivos.length
      : 0;
    const orcamentoTotal = projects.reduce((acc, p) => acc + p.orcamento, 0);

    return [
      {
        title: "Projetos Ativos",
        value: projetosAtivos.length,
        subtitle: `${projetosConcluidos} concluídos, ${projetosPausados} pausados`,
        icon: <Calendar className="h-4 w-4" />,
        alert: projetosAtivos.length > 0 ? "green" : "yellow"
      },
      {
        title: "Projetos Atrasados", 
        value: projetosAtrasados,
        subtitle: `${projetosAtivos.length > 0 ? ((projetosAtrasados / projetosAtivos.length) * 100).toFixed(0) : 0}% dos ativos`,
        icon: <Clock className="h-4 w-4" />,
        alert: projetosAtrasados > 0 ? "red" : "green"
      },
      {
        title: "Avanço Médio",
        value: `${mediaAvanco.toFixed(0)}%`,
        subtitle: "Avanço físico dos ativos", 
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