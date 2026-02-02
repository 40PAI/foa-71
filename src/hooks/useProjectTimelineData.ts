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
    const startDate = parseISO(dataInicio);
    const endDate = parseISO(dataFimPrevista);
    const today = new Date();
    
    // Contar tarefas restantes AGORA (para fallback e ponto final)
    const remainingNow = tasks.filter(task => 
      task.status !== 'Concluído' && task.percentual_conclusao < 100
    ).length;
    
    // Se não há tarefas, retornar fallback mínimo
    if (totalTasks === 0) {
      return [
        { periodo: "Início", dataReferencia: startDate, planejado: 0, real: 0, tarefasRestantes: 0 },
        { periodo: "Atual", dataReferencia: today, planejado: 0, real: 0, tarefasRestantes: 0 }
      ];
    }
    
    // IMPORTANTE: Sempre mostrar histórico completo do projeto até hoje ou data_fim
    // Para projectos passados, mostramos até data_fim
    // Para projectos em curso, mostramos até hoje
    const displayEndDate = isAfter(today, endDate) ? endDate : today;
    
    const months = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: startOfMonth(displayEndDate),
    });
    
    // Fallback se o intervalo gerar 0 meses (datas inválidas)
    if (months.length === 0) {
      return [
        { periodo: "Início", dataReferencia: startDate, planejado: totalTasks, real: totalTasks, tarefasRestantes: totalTasks },
        { periodo: "Atual", dataReferencia: today, planejado: 0, real: remainingNow, tarefasRestantes: remainingNow }
      ];
    }
    
    // Calcular número total de meses do projecto (do início até data_fim_prevista)
    const allProjectMonths = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: startOfMonth(endDate),
    });
    const totalProjectMonths = allProjectMonths.length;
    
    // Para cada tarefa, distribuir linearmente pelos meses do projecto
    // Cada tarefa deve ser "removida" do planejado num mês específico
    const tasksWithDeadlines = tasks.map((task, index) => {
      // Se a tarefa tem prazo, usar o prazo
      if (task.prazo) {
        return { ...task, deadlineMonth: parseISO(task.prazo) };
      }
      // Se não tem prazo, distribuir uniformemente ao longo do projecto
      const monthIndex = Math.floor((index + 1) / totalTasks * totalProjectMonths) - 1;
      const assignedMonth = allProjectMonths[Math.max(0, Math.min(monthIndex, allProjectMonths.length - 1))];
      return { ...task, deadlineMonth: endOfMonth(assignedMonth) };
    });
    
    return months.map((month, index) => {
      const monthEnd = endOfMonth(month);
      const referenceDate = monthEnd;
      
      // Planejado: quantas tarefas ainda deveriam estar "restantes" neste mês
      // Uma tarefa é "planejada restante" se seu prazo é DEPOIS deste mês
      const planejado = tasksWithDeadlines.filter(task => {
        return isAfter(task.deadlineMonth, monthEnd);
      }).length;
      
      // Real: quantas tarefas estão realmente restantes (não concluídas)
      // Para meses no passado: mostrar o estado actual das tarefas
      // (não temos histórico de quando cada tarefa foi concluída)
      const tarefasRestantes = tasks.filter(task => {
        // Tarefas 100% concluídas NÃO contam como restantes
        if (task.status === 'Concluído' || task.percentual_conclusao >= 100) {
          return false;
        }
        return true;
      }).length;
      
      return {
        periodo: format(month, "MMM/yy", { locale: pt }),
        dataReferencia: referenceDate,
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
