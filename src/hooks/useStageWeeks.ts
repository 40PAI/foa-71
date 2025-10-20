import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addWeeks, startOfWeek, endOfWeek, format, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface StageWeek {
  numero_semana: number;
  data_inicio: string;
  data_fim: string;
  etapa_id: number;
}

export function useStageWeeks(projectId?: number, stageId?: number) {
  return useQuery({
    queryKey: ["stage-weeks", projectId, stageId],
    queryFn: async (): Promise<StageWeek[]> => {
      if (!projectId || !stageId) {
        return [];
      }

      // Buscar dados da etapa
      const { data: stage, error } = await supabase
        .from("etapas_projeto")
        .select("*")
        .eq("id", stageId)
        .eq("projeto_id", projectId)
        .single();

      if (error || !stage || !stage.data_inicio_etapa || !stage.data_fim_prevista_etapa) {
        return [];
      }

      const startDate = new Date(stage.data_inicio_etapa);
      const endDate = new Date(stage.data_fim_prevista_etapa);

      // Calcular todas as semanas do período da etapa
      const weeks = eachWeekOfInterval(
        {
          start: startDate,
          end: endDate
        },
        { weekStartsOn: 0 } // Domingo como início da semana
      );

      // Mapear para o formato esperado
      return weeks.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
        
        return {
          numero_semana: index + 1,
          data_inicio: format(weekStart, "yyyy-MM-dd"),
          data_fim: format(weekEnd > endDate ? endDate : weekEnd, "yyyy-MM-dd"),
          etapa_id: stageId
        };
      });
    },
    enabled: !!projectId && !!stageId,
  });
}