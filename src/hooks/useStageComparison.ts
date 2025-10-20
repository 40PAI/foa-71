import { useMemo } from 'react';
import { useTaskFinancialSummary } from './useTaskFinancialSummary';
import { useProjectStages } from './useProjectStages';

export interface StageComparison {
  etapa_nome: string;
  custo_orcado: number;
  custo_real: number;
  desvio_orcamentario: number;
  desvio_percentual: number;
  dias_previstos: number;
  dias_executados: number;
  eficiencia_temporal: number;
  status_orcamento: 'normal' | 'atencao' | 'critico';
  status_prazo: 'normal' | 'atencao' | 'critico';
  percentual_custo_total: number;
}

export function useStageComparison(projectId: number | null) {
  const { data: taskSummary, isLoading: loadingSummary } = useTaskFinancialSummary(projectId);
  const { data: stages, isLoading: loadingStages } = useProjectStages(projectId);

  const comparison = useMemo<StageComparison[]>(() => {
    if (!taskSummary || !stages) return [];

    const totalCost = taskSummary.totals.total;

    return taskSummary.stages.map((stage) => {
      const stageInfo = stages.find(s => s.id === stage.etapa_id);
      
      const custoOrcado = stage.total;
      const custoReal = stageInfo?.gasto_etapa || 0;
      const desvioOrcamentario = custoReal - custoOrcado;
      const desvioPercentual = custoOrcado > 0 ? (desvioOrcamentario / custoOrcado) * 100 : 0;

      const diasPrevistos = stageInfo?.tempo_previsto_dias || 0;
      const diasExecutados = stageInfo?.tempo_real_dias || 0;
      const eficienciaTemp = diasPrevistos > 0 ? (diasExecutados / diasPrevistos) * 100 : 0;

      const statusOrcamento = 
        desvioPercentual > 10 ? 'critico' : 
        desvioPercentual > 5 ? 'atencao' : 
        'normal';

      const statusPrazo = 
        diasExecutados > diasPrevistos * 1.1 ? 'critico' :
        diasExecutados > diasPrevistos * 1.05 ? 'atencao' :
        'normal';

      const percentualCustoTotal = totalCost > 0 ? (custoOrcado / totalCost) * 100 : 0;

      return {
        etapa_nome: stageInfo?.nome_etapa || `Etapa ${stage.etapa_id}`,
        custo_orcado: custoOrcado,
        custo_real: custoReal,
        desvio_orcamentario: desvioOrcamentario,
        desvio_percentual: desvioPercentual,
        dias_previstos: diasPrevistos,
        dias_executados: diasExecutados,
        eficiencia_temporal: eficienciaTemp,
        status_orcamento: statusOrcamento,
        status_prazo: statusPrazo,
        percentual_custo_total: percentualCustoTotal
      };
    });
  }, [taskSummary, stages]);

  return {
    data: comparison,
    isLoading: loadingSummary || loadingStages,
    totals: taskSummary?.totals
  };
}
