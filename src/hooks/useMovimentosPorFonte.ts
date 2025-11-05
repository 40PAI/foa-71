import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MovimentoPorFonte {
  id: string;
  data_movimento: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  tipo_movimento: "entrada" | "saida";
  valor: number;
  fonte_financiamento?: "REC_FOA" | "FOF_FIN" | "FOA_AUTO";
  centro_custo_id?: string;
  centro_custo_nome?: string;
  observacoes?: string;
  comprovante_url?: string;
  responsavel_id?: string;
  
  // Colunas calculadas para exibição
  recebimento_foa: number;
  fof_financiamento: number;
  foa_auto: number;
  saida: number;
  fonte_saida?: string;
  
  // Saldos acumulados
  saldo_rec_foa: number;
  saldo_fof_fin: number;
  saldo_foa_auto: number;
  saldo_total: number;
}

interface UseMovimentosPorFonteOptions {
  projectId: number;
  centroCustoId?: string;
  dataInicio?: string;
  dataFim?: string;
  fonte?: "REC_FOA" | "FOF_FIN" | "FOA_AUTO";
}

export function useMovimentosPorFonte({
  projectId,
  centroCustoId,
  dataInicio,
  dataFim,
  fonte,
}: UseMovimentosPorFonteOptions) {
  return useQuery({
    queryKey: ["movimentos-por-fonte", projectId, centroCustoId, dataInicio, dataFim, fonte],
    queryFn: async () => {
      // 1. Buscar centros de custo para enriquecer os dados
      const { data: centros } = await supabase
        .from("centros_custo")
        .select("id, codigo, nome")
        .eq("projeto_id", projectId)
        .eq("ativo", true);

      const centrosMap = new Map(
        centros?.map((c) => [c.id, `${c.codigo} - ${c.nome}`]) || []
      );

      // 2. Buscar movimentos financeiros
      let query = supabase
        .from("movimentos_financeiros")
        .select("*")
        .eq("projeto_id", projectId)
        .order("data_movimento", { ascending: true });

      if (centroCustoId) {
        query = query.eq("centro_custo_id", centroCustoId);
      }

      if (dataInicio) {
        query = query.gte("data_movimento", dataInicio);
      }

      if (dataFim) {
        query = query.lte("data_movimento", dataFim);
      }

      if (fonte) {
        query = query.eq("fonte_financiamento", fonte);
      }

      const { data: movimentos, error } = await query;

      if (error) throw error;

      // 3. Processar movimentos e calcular saldos acumulados
      let saldoRecFoa = 0;
      let saldoFofFin = 0;
      let saldoFoaAuto = 0;

      const processedMovimentos: MovimentoPorFonte[] = (movimentos || []).map((mov) => {
        const isEntrada = mov.tipo_movimento === "entrada";
        const fonte = mov.fonte_financiamento;

        // Calcular valores por coluna
        const recebimento_foa = isEntrada && fonte === "REC_FOA" ? mov.valor : 0;
        const fof_financiamento = isEntrada && fonte === "FOF_FIN" ? mov.valor : 0;
        const foa_auto = isEntrada && fonte === "FOA_AUTO" ? mov.valor : 0;
        const saida = !isEntrada ? mov.valor : 0;

        // Atualizar saldos acumulados
        if (isEntrada) {
          if (fonte === "REC_FOA") saldoRecFoa += mov.valor;
          else if (fonte === "FOF_FIN") saldoFofFin += mov.valor;
          else if (fonte === "FOA_AUTO") saldoFoaAuto += mov.valor;
        } else {
          // Saída: subtrair do saldo da fonte específica
          if (fonte === "REC_FOA") saldoRecFoa -= mov.valor;
          else if (fonte === "FOF_FIN") saldoFofFin -= mov.valor;
          else if (fonte === "FOA_AUTO") saldoFoaAuto -= mov.valor;
        }

        const saldo_total = saldoRecFoa + saldoFofFin + saldoFoaAuto;

        return {
          id: mov.id,
          data_movimento: mov.data_movimento,
          descricao: mov.descricao,
          categoria: mov.categoria,
          subcategoria: mov.subcategoria,
          tipo_movimento: mov.tipo_movimento as "entrada" | "saida",
          valor: mov.valor,
          fonte_financiamento: mov.fonte_financiamento as any,
          centro_custo_id: mov.centro_custo_id,
          centro_custo_nome: mov.centro_custo_id
            ? centrosMap.get(mov.centro_custo_id)
            : undefined,
          observacoes: mov.observacoes,
          comprovante_url: mov.comprovante_url,
          responsavel_id: mov.responsavel_id,

          // Colunas calculadas
          recebimento_foa,
          fof_financiamento,
          foa_auto,
          saida,
          fonte_saida: !isEntrada ? fonte : undefined,

          // Saldos acumulados
          saldo_rec_foa: saldoRecFoa,
          saldo_fof_fin: saldoFofFin,
          saldo_foa_auto: saldoFoaAuto,
          saldo_total,
        };
      });

      return processedMovimentos;
    },
    enabled: !!projectId,
  });
}
