import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSaldosCentrosCusto } from "./useCentrosCusto";
import { useContasFornecedores } from "./useContasFornecedores";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

export interface CashFlowData {
  periodo: string;
  mes: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface CostCenterUtilization {
  codigo: string;
  nome: string;
  orcamento: number;
  gasto: number;
  percentual: number;
  status: 'critico' | 'atencao' | 'normal';
}

export interface SupplierBalance {
  fornecedor_id: string;
  nome: string;
  saldo: number;
  total_credito: number;
  total_debito: number;
}

// Hook for monthly cash flow
export function useCashFlowMonthly(projectId?: number, months: number = 12) {
  return useQuery({
    queryKey: ["cash-flow-monthly", projectId, months],
    queryFn: async (): Promise<CashFlowData[]> => {
      const endDate = endOfMonth(new Date());
      const startDate = startOfMonth(subMonths(endDate, months - 1));

      let query = supabase
        .from("movimentos_financeiros")
        .select("data_movimento, tipo_movimento, valor")
        .gte("data_movimento", format(startDate, "yyyy-MM-dd"))
        .lte("data_movimento", format(endDate, "yyyy-MM-dd"))
        .order("data_movimento");

      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, { entradas: number; saidas: number }> = {};

      data?.forEach((mov) => {
        const monthKey = format(parseISO(mov.data_movimento), "yyyy-MM");
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { entradas: 0, saidas: 0 };
        }
        if (mov.tipo_movimento === "entrada") {
          monthlyData[monthKey].entradas += mov.valor || 0;
        } else if (mov.tipo_movimento === "saida") {
          monthlyData[monthKey].saidas += mov.valor || 0;
        }
      });

      // Convert to array with cumulative balance
      let saldoAcumulado = 0;
      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([periodo, values]) => {
          saldoAcumulado += values.entradas - values.saidas;
          return {
            periodo,
            mes: format(parseISO(`${periodo}-01`), "MMM yyyy", { locale: pt }),
            entradas: values.entradas,
            saidas: values.saidas,
            saldo: saldoAcumulado,
          };
        });
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for cost center utilization chart
export function useCostCenterUtilization(projectId?: number) {
  const { data: saldos, isLoading } = useSaldosCentrosCusto(projectId);

  const chartData: CostCenterUtilization[] = saldos?.map((s) => ({
    codigo: s.codigo,
    nome: s.nome,
    orcamento: s.orcamento_mensal || 0,
    gasto: s.total_saidas || 0,
    percentual: s.percentual_utilizado || 0,
    status: s.percentual_utilizado >= 90 ? 'critico' : s.percentual_utilizado >= 70 ? 'atencao' : 'normal',
  })) || [];

  return { data: chartData, isLoading };
}

// Hook for supplier balances chart
export function useSupplierBalancesChart(projectId?: number) {
  const { data: contas, isLoading } = useContasFornecedores(projectId);

  const chartData: SupplierBalance[] = contas?.map((c: any) => ({
    fornecedor_id: c.fornecedor_id,
    nome: c.fornecedores?.nome || "Desconhecido",
    saldo: c.saldo?.saldo_atual || 0,
    total_credito: c.saldo?.total_credito || 0,
    total_debito: c.saldo?.total_debito || 0,
  }))
    .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo))
    .slice(0, 10) || [];

  return { data: chartData, isLoading };
}
