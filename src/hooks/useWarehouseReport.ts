import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, subQuarters } from "date-fns";
import { pt } from "date-fns/locale";

export type PeriodType = "week" | "month" | "quarter" | "semester" | "custom";

export interface MovementSummary {
  entradas: number;
  saidas: number;
  consumos: number;
  devolucoes: number;
  ajustes_positivos: number;
  ajustes_negativos: number;
  entradas_quantidade: number;
  saidas_quantidade: number;
  consumos_quantidade: number;
  devolucoes_quantidade: number;
}

export interface MaterialPeriodData {
  material_id: string;
  material_nome: string;
  material_codigo: string;
  unidade: string;
  entradas: number;
  saidas: number;
  consumos: number;
  devolucoes: number;
  saldo: number;
}

export interface TimeSeriesData {
  periodo: string;
  entradas: number;
  saidas: number;
  devolucoes: number;
}

export interface WarehouseReportData {
  periodo: {
    inicio: string;
    fim: string;
    label: string;
  };
  resumo: MovementSummary;
  por_material: MaterialPeriodData[];
  serie_temporal: TimeSeriesData[];
}

export function getPeriodDates(periodType: PeriodType, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const now = new Date();

  switch (periodType) {
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case "quarter":
      return {
        start: startOfQuarter(now),
        end: endOfQuarter(now),
      };
    case "semester":
      const semesterStart = now.getMonth() < 6
        ? new Date(now.getFullYear(), 0, 1)
        : new Date(now.getFullYear(), 6, 1);
      const semesterEnd = now.getMonth() < 6
        ? new Date(now.getFullYear(), 5, 30)
        : new Date(now.getFullYear(), 11, 31);
      return { start: semesterStart, end: semesterEnd };
    case "custom":
      return {
        start: customStart || startOfMonth(now),
        end: customEnd || endOfMonth(now),
      };
    default:
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
  }
}

export function useWarehouseReport(
  periodType: PeriodType,
  customStart?: Date,
  customEnd?: Date
) {
  const { start, end } = getPeriodDates(periodType, customStart, customEnd);

  return useQuery({
    queryKey: ["warehouse-report", periodType, start.toISOString(), end.toISOString()],
    queryFn: async (): Promise<WarehouseReportData> => {
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      // Fetch movements in period
      const { data: movements, error } = await supabase
        .from("materiais_movimentacoes")
        .select("*, materiais_armazem(id, nome_material, codigo_interno, unidade_medida)")
        .gte("data_movimentacao", startStr)
        .lte("data_movimentacao", endStr)
        .order("data_movimentacao", { ascending: true });

      if (error) throw error;

      // Calculate summary
      const resumo: MovementSummary = {
        entradas: 0,
        saidas: 0,
        consumos: 0,
        devolucoes: 0,
        ajustes_positivos: 0,
        ajustes_negativos: 0,
        entradas_quantidade: 0,
        saidas_quantidade: 0,
        consumos_quantidade: 0,
        devolucoes_quantidade: 0,
      };

      const materialData: Record<string, MaterialPeriodData> = {};

      movements?.forEach((m) => {
        const material = m.materiais_armazem as any;
        const materialId = m.material_id;

        // Initialize material data if not exists
        if (!materialData[materialId] && material) {
          materialData[materialId] = {
            material_id: materialId,
            material_nome: material.nome_material,
            material_codigo: material.codigo_interno,
            unidade: material.unidade_medida,
            entradas: 0,
            saidas: 0,
            consumos: 0,
            devolucoes: 0,
            saldo: 0,
          };
        }

        switch (m.tipo_movimentacao) {
          case "entrada":
            resumo.entradas++;
            resumo.entradas_quantidade += m.quantidade;
            if (materialData[materialId]) {
              materialData[materialId].entradas += m.quantidade;
              materialData[materialId].saldo += m.quantidade;
            }
            break;
          case "saida":
            resumo.saidas++;
            resumo.saidas_quantidade += m.quantidade;
            if (materialData[materialId]) {
              materialData[materialId].saidas += m.quantidade;
              materialData[materialId].saldo -= m.quantidade;
            }
            break;
          case "consumo":
            resumo.consumos++;
            resumo.consumos_quantidade += m.quantidade;
            if (materialData[materialId]) {
              materialData[materialId].consumos += m.quantidade;
            }
            break;
          case "devolucao":
            resumo.devolucoes++;
            resumo.devolucoes_quantidade += m.quantidade;
            if (materialData[materialId]) {
              materialData[materialId].devolucoes += m.quantidade;
              materialData[materialId].saldo += m.quantidade;
            }
            break;
          case "ajuste_positivo":
            resumo.ajustes_positivos++;
            if (materialData[materialId]) {
              materialData[materialId].saldo += m.quantidade;
            }
            break;
          case "ajuste_negativo":
            resumo.ajustes_negativos++;
            if (materialData[materialId]) {
              materialData[materialId].saldo -= m.quantidade;
            }
            break;
        }
      });

      // Generate time series data (grouped by week or day depending on period)
      const timeSeriesMap: Record<string, TimeSeriesData> = {};

      movements?.forEach((m) => {
        const date = new Date(m.data_movimentacao);
        let key: string;

        if (periodType === "week") {
          key = format(date, "EEE", { locale: pt });
        } else if (periodType === "month") {
          key = `Sem ${Math.ceil(date.getDate() / 7)}`;
        } else {
          key = format(date, "MMM", { locale: pt });
        }

        if (!timeSeriesMap[key]) {
          timeSeriesMap[key] = { periodo: key, entradas: 0, saidas: 0, devolucoes: 0 };
        }

        if (m.tipo_movimentacao === "entrada") {
          timeSeriesMap[key].entradas += m.quantidade;
        } else if (m.tipo_movimentacao === "saida") {
          timeSeriesMap[key].saidas += m.quantidade;
        } else if (m.tipo_movimentacao === "devolucao") {
          timeSeriesMap[key].devolucoes += m.quantidade;
        }
      });

      const periodLabel = `${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`;

      return {
        periodo: {
          inicio: startStr,
          fim: endStr,
          label: periodLabel,
        },
        resumo,
        por_material: Object.values(materialData),
        serie_temporal: Object.values(timeSeriesMap),
      };
    },
    staleTime: 60000,
    placeholderData: (prev) => prev,
  });
}
