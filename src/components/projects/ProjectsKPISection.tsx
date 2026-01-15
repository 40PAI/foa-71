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
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Filtrar apenas projetos ativos (excluir concluídos e cancelados)
    const projetosAtivos = projects.filter(p => 
      p.status !== 'Concluído' && p.status !== 'Cancelado'
    );
    const projetosConcluidos = projects.filter(p => p.status === 'Concluído').length;
    const projetosCancelados = projects.filter(p => p.status === 'Cancelado').length;
    
    // Calcular projetos atrasados baseado na data_fim_prevista, não apenas no status
    const projetosAtrasados = projetosAtivos.filter(p => {
      const dataFim = new Date(p.data_fim_prevista);
      dataFim.setHours(0, 0, 0, 0);
      return dataFim < hoje;
    }).length;
    
    const mediaAvanco = projetosAtivos.length > 0 
      ? projetosAtivos.reduce((acc, p) => acc + (p.avanco_fisico || 0), 0) / projetosAtivos.length
      : 0;
    const orcamentoTotal = projects.reduce((acc, p) => acc + p.orcamento, 0);

    return [
      {
        title: "Projetos Ativos",
        value: projetosAtivos.length,
        subtitle: `${projetosConcluidos} concluídos, ${projetosCancelados} cancelados`,
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