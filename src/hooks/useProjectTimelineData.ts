import { useMemo } from "react";
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, isAfter, isBefore, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

interface Task {
  id: number;
  prazo: string | null;
  status: string;
  percentual_conclusao: number;
  updated_at?: string;
}

interface Stage {
  numero_etapa: number;
  data_inicio_etapa: string | null;
  data_fim_prevista_etapa: string | null;
  orcamento_etapa: number;
  gasto_etapa: number;
  status_etapa: string;
}

export interface TimelineDataPoint {
  periodo: string;
  dataReferencia: Date;
  avancoFisicoReal: number;
  avancoFinanceiroReal: number;
  avancoTemporalLinear: number;
  tarefasConcluidas: number;
  tarefasTotal: number;
}

export interface BurndownDataPoint {
  periodo: string;
  dataReferencia: Date;
  planejado: number;
  real: number;
  tarefasRestantes: number;
}

interface UseProjectTimelineDataProps {
  dataInicio: string | null | undefined;
  dataFimPrevista: string | null | undefined;
  tasks: Task[];
  stages: Stage[];
  orcamentoTotal: number;
  gastoAtual: number;
}

export function useProjectTimelineData({
  dataInicio,
  dataFimPrevista,
  tasks,
  stages,
  orcamentoTotal,
  gastoAtual,
}: UseProjectTimelineDataProps) {
  
  const timelineData = useMemo((): TimelineDataPoint[] => {
    if (!dataInicio || !dataFimPrevista) return [];
    
    const startDate = parseISO(dataInicio);
    const endDate = parseISO(dataFimPrevista);
    const today = new Date();
    
    // Determinar o último mês a mostrar (o menor entre hoje e data fim)
    const lastDisplayDate = isAfter(today, endDate) ? endDate : today;
    
    // Gerar intervalo de meses
    const months = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: startOfMonth(lastDisplayDate),
    });
    
    if (months.length === 0) return [];
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const totalTasks = tasks.length;
    
    return months.map((month) => {
      const monthEnd = endOfMonth(month);
      const referenceDate = isAfter(monthEnd, today) ? today : monthEnd;
      
      // Calcular avanço linear (baseline ideal)
      const elapsedTime = referenceDate.getTime() - startDate.getTime();
      const avancoTemporalLinear = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100));
      
      // Calcular avanço físico real baseado em tarefas
      // Contar tarefas que deveriam estar concluídas até este mês (prazo <= referenceDate)
      // e calcular o percentual médio de conclusão
      let avancoFisicoReal = 0;
      let tarefasConcluidas = 0;
      
      if (totalTasks > 0) {
        const tasksUpToDate = tasks.filter(task => {
          if (!task.prazo) return false;
          const taskDeadline = parseISO(task.prazo);
          return isBefore(taskDeadline, referenceDate) || taskDeadline.getTime() === referenceDate.getTime();
        });
        
        // Calcular avanço baseado no peso das tarefas com prazo até esta data
        const weightPerTask = 100 / totalTasks;
        
        tasks.forEach(task => {
          if (!task.prazo) return;
          const taskDeadline = parseISO(task.prazo);
          
          if (isBefore(taskDeadline, referenceDate) || taskDeadline.getTime() === referenceDate.getTime()) {
            // Tarefa já deveria estar concluída - usar seu percentual real
            avancoFisicoReal += (task.percentual_conclusao / 100) * weightPerTask;
            if (task.status === 'Concluído' || task.percentual_conclusao >= 100) {
              tarefasConcluidas++;
            }
          }
        });
      }
      
      // Calcular avanço financeiro real
      // Interpolar baseado nas etapas concluídas ou usar gasto acumulado
      let avancoFinanceiroReal = 0;
      
      if (orcamentoTotal > 0) {
        // Método 1: Baseado em etapas
        const stagesUpToDate = stages.filter(stage => {
          if (!stage.data_fim_prevista_etapa) return false;
          const stageEnd = parseISO(stage.data_fim_prevista_etapa);
          return isBefore(stageEnd, referenceDate) || stageEnd.getTime() === referenceDate.getTime();
        });
        
        const gastoEtapasAteDat = stagesUpToDate.reduce((sum, s) => sum + (s.gasto_etapa || 0), 0);
        
        // Se temos dados de etapas, usar. Senão, interpolar do gasto atual
        if (gastoEtapasAteDat > 0) {
          avancoFinanceiroReal = (gastoEtapasAteDat / orcamentoTotal) * 100;
        } else {
          // Interpolar linearmente do gasto atual até a data atual
          const progressRatio = elapsedTime / (today.getTime() - startDate.getTime());
          avancoFinanceiroReal = ((gastoAtual / orcamentoTotal) * 100) * Math.min(1, progressRatio);
        }
      }
      
      return {
        periodo: format(month, "MMM/yy", { locale: pt }),
        dataReferencia: referenceDate,
        avancoFisicoReal: Math.round(avancoFisicoReal * 10) / 10,
        avancoFinanceiroReal: Math.min(100, Math.round(avancoFinanceiroReal * 10) / 10),
        avancoTemporalLinear: Math.round(avancoTemporalLinear * 10) / 10,
        tarefasConcluidas,
        tarefasTotal: totalTasks,
      };
    });
  }, [dataInicio, dataFimPrevista, tasks, stages, orcamentoTotal, gastoAtual]);
  
  const burndownData = useMemo((): BurndownDataPoint[] => {
    if (!dataInicio || !dataFimPrevista) return [];
    
    const totalTasks = tasks.length;
    const projectStartDate = parseISO(dataInicio);
    const projectEndDate = parseISO(dataFimPrevista);
    const today = new Date();
    
    // Contar tarefas restantes AGORA
    const remainingNow = tasks.filter(task => 
      task.status !== 'Concluído' && task.percentual_conclusao < 100
    ).length;
    
    // Se não há tarefas, retornar fallback mínimo
    if (totalTasks === 0) {
      return [
        { periodo: "Início", dataReferencia: projectStartDate, planejado: 0, real: 0, tarefasRestantes: 0 },
        { periodo: "Atual", dataReferencia: today, planejado: 0, real: 0, tarefasRestantes: 0 }
      ];
    }
    
    // Encontrar a data mais antiga entre tarefas e início do projeto
    const earliestTaskDeadline = tasks
      .filter(t => t.prazo)
      .reduce((min, t) => {
        const d = parseISO(t.prazo!);
        return !min || isBefore(d, min) ? d : min;
      }, null as Date | null);
    
    // Usar a data mais antiga como início efetivo
    const effectiveStart = earliestTaskDeadline && isBefore(earliestTaskDeadline, projectStartDate) 
      ? startOfMonth(earliestTaskDeadline) 
      : startOfMonth(projectStartDate);
    
    // SEMPRE mostrar até hoje para ver estado actual
    const displayEndDate = today;
    
    // Gerar meses do intervalo efectivo
    const months = eachMonthOfInterval({
      start: effectiveStart,
      end: startOfMonth(displayEndDate),
    });
    
    // Fallback se o intervalo gerar 0 meses
    if (months.length === 0) {
      return [
        { periodo: "Início", dataReferencia: effectiveStart, planejado: totalTasks, real: totalTasks, tarefasRestantes: totalTasks },
        { periodo: "Atual", dataReferencia: today, planejado: 0, real: remainingNow, tarefasRestantes: remainingNow }
      ];
    }
    
    // Calcular meses totais do projecto para distribuição linear
    const totalProjectMonths = months.length;
    
    // Para cada tarefa, atribuir uma deadline (usar prazo real ou distribuir linearmente)
    const tasksWithDeadlines = tasks.map((task, index) => {
      if (task.prazo) {
        return { ...task, deadlineMonth: parseISO(task.prazo) };
      }
      // Distribuir uniformemente
      const monthIndex = Math.floor((index + 1) / totalTasks * totalProjectMonths) - 1;
      const assignedMonth = months[Math.max(0, Math.min(monthIndex, months.length - 1))];
      return { ...task, deadlineMonth: endOfMonth(assignedMonth) };
    });
    
    return months.map((month) => {
      const monthEnd = endOfMonth(month);
      
      // Planejado: quantas tarefas deveriam estar "restantes" neste mês
      // Uma tarefa é "planejada restante" se seu prazo é DEPOIS deste mês
      const planejado = tasksWithDeadlines.filter(task => {
        return isAfter(task.deadlineMonth, monthEnd);
      }).length;
      
      // Real: quantas tarefas estão realmente por fazer
      const tarefasRestantes = remainingNow;
      
      return {
        periodo: format(month, "MMM/yy", { locale: pt }),
        dataReferencia: monthEnd,
        planejado,
        real: tarefasRestantes,
        tarefasRestantes,
      };
    });
  }, [dataInicio, dataFimPrevista, tasks]);
  
  // Dados para S-Curve com pontos mensais
  const sCurveData = useMemo(() => {
    return timelineData.map(point => ({
      periodo: point.periodo,
      fisico: point.avancoFisicoReal,
      financeiro: point.avancoFinanceiroReal,
      tempo: point.avancoTemporalLinear,
    }));
  }, [timelineData]);
  
  // Verificar se há dados suficientes para gráficos significativos
  const hasEnoughData = timelineData.length >= 2;
  
  return {
    timelineData,
    burndownData,
    sCurveData,
    hasEnoughData,
    totalTasks: tasks.length,
    totalMonths: timelineData.length,
  };
}
