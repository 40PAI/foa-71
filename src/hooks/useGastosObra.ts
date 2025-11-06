import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GastoObra {
  id: string;
  data_movimento: string;
  descricao: string;
  categoria?: string;
  recebimento_foa: number;
  fof_financiamento: number;
  foa_auto: number;
  saida: number;
  observacoes?: string;
  comprovante_url?: string;
  projeto_id: number;
  centro_custo_id?: string;
  centro_custo_nome?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  created_at: string;
}

export interface GastoObraSummary {
  total_recebimento_foa: number;
  total_fof_financiamento: number;
  total_foa_auto: number;
  total_saidas: number;
  total_custos: number;
  saldo_atual: number;
  total_movimentos: number;
}

export function useGastosObra(projectId: number, centroCustoId?: string) {
  return useQuery({
    queryKey: ["gastos-obra", projectId, centroCustoId],
    queryFn: async () => {
      let query = supabase
        .from("gastos_obra_view")
        .select("*")
        .eq("projeto_id", projectId);
      
      if (centroCustoId) {
        query = query.eq("centro_custo_id", centroCustoId);
      }
      
      const { data, error } = await query.order("data_movimento", { ascending: false });
      
      if (error) throw error;
      return data as GastoObra[];
    },
    enabled: !!projectId,
  });
}

export function useGastosObraSummary(projectId: number, mes?: number, ano?: number, centroCustoId?: string) {
  return useQuery({
    queryKey: ["gastos-obra-summary", projectId, mes, ano, centroCustoId],
    queryFn: async () => {
      // Calcular sempre do movimentos_financeiros para garantir totais corretos por fonte
      let query = supabase
        .from("movimentos_financeiros")
        .select("tipo_movimento, fonte_financiamento, valor, projeto_id, centro_custo_id, data_movimento")
        .eq("projeto_id", projectId);

      if (centroCustoId) {
        query = query.eq("centro_custo_id", centroCustoId);
      }

      if (mes && ano) {
        const startDate = new Date(ano, mes - 1, 1).toISOString();
        const endDate = new Date(ano, mes, 0, 23, 59, 59).toISOString();
        query = query.gte("data_movimento", startDate).lte("data_movimento", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const summary = (data || []).reduce(
        (acc, mov: any) => {
          const tipo = mov.tipo_movimento as string | null;
          const fonte = mov.fonte_financiamento as string | null;
          const valor = Number(mov.valor) || 0;

          // REC_FOA is only entrada
          if (tipo === "entrada" && fonte === "REC_FOA") {
            acc.total_recebimento_foa += valor;
          }

          // FOF_FIN and FOA_AUTO can be entrada or saida
          if (tipo === "entrada") {
            if (fonte === "FOF_FIN") {
              acc.total_fof_financiamento += valor;
            } else if (fonte === "FOA_AUTO") {
              acc.total_foa_auto += valor;
            }
          } else if (tipo === "saida") {
            // Accumulate ALL saidas for total_custos
            acc.total_custos += valor;
            
            if (fonte === "FOF_FIN") {
              acc.total_fof_financiamento -= valor; // Subtract saidas from FOF_FIN
            } else if (fonte === "FOA_AUTO") {
              acc.total_foa_auto -= valor; // Subtract saidas from FOA_AUTO
            } else {
              acc.total_saidas += valor; // Other saidas without specific source
            }
          }

          acc.total_movimentos += 1;
          return acc;
        },
        {
          total_recebimento_foa: 0,
          total_fof_financiamento: 0,
          total_foa_auto: 0,
          total_saidas: 0,
          total_custos: 0,
          saldo_atual: 0,
          total_movimentos: 0,
        } as GastoObraSummary
      );

      // Calculate final balance: REC_FOA + FOF_FIN (net) + FOA_AUTO (net) - Other saidas
      summary.saldo_atual = 
        summary.total_recebimento_foa + 
        summary.total_fof_financiamento + 
        summary.total_foa_auto - 
        summary.total_saidas;

      return summary as GastoObraSummary;
    },
    enabled: !!projectId,
  });
}

export function useCreateGastoObra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gasto: {
      projeto_id: number;
      data_movimento: string;
      descricao: string;
      tipo_movimento: "entrada" | "saida";
      fonte_financiamento?: "REC_FOA" | "FOF_FIN" | "FOA_AUTO";
      valor: number;
      observacoes?: string;
      categoria?: string;
      centro_custo_id?: string;
      comprovante_url?: string;
      responsavel_id?: string;
      responsavel_nome?: string;
    }) => {
      // Preparar os dados para inserção
      const insertData: any = {
        projeto_id: gasto.projeto_id,
        data_movimento: gasto.data_movimento,
        descricao: gasto.descricao,
        tipo_movimento: gasto.tipo_movimento,
        valor: gasto.valor,
        categoria: gasto.categoria || "Gastos da Obra",
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (gasto.fonte_financiamento) {
        insertData.fonte_financiamento = gasto.fonte_financiamento;
      } else if (gasto.tipo_movimento === "entrada") {
        // Se não especificou fonte, usar REC_FOA como padrão para entradas
        insertData.fonte_financiamento = "REC_FOA";
      }
      if (gasto.observacoes) {
        insertData.observacoes = gasto.observacoes;
      }
      if (gasto.centro_custo_id) {
        insertData.centro_custo_id = gasto.centro_custo_id;
      }
      if (gasto.comprovante_url) {
        insertData.comprovante_url = gasto.comprovante_url;
      }
      if (gasto.responsavel_id) {
        insertData.responsavel_id = gasto.responsavel_id;
      }
      if (gasto.responsavel_nome) {
        insertData.responsavel_nome = gasto.responsavel_nome;
      }

      const { data, error } = await supabase
        .from("movimentos_financeiros")
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error("Erro detalhado ao criar gasto:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos-obra"] });
      queryClient.invalidateQueries({ queryKey: ["gastos-obra-summary"] });
      queryClient.invalidateQueries({ queryKey: ["movimentos-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast.success("Movimento registrado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao registrar movimento:", error);
      toast.error("Erro ao registrar movimento da obra");
    },
  });
}

export function useUpdateGastoObra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GastoObra> & { id: string }) => {
      const updateData: any = {};
      
      if (updates.data_movimento) updateData.data_movimento = updates.data_movimento;
      if (updates.descricao) updateData.descricao = updates.descricao;
      if (updates.recebimento_foa || updates.fof_financiamento || updates.foa_auto || updates.saida) {
        updateData.valor = updates.recebimento_foa || updates.fof_financiamento || updates.foa_auto || updates.saida;
      }
      if (updates.observacoes !== undefined) updateData.observacoes = updates.observacoes;
      if (updates.categoria !== undefined) updateData.categoria = updates.categoria;
      if (updates.centro_custo_id !== undefined) updateData.centro_custo_id = updates.centro_custo_id;
      if (updates.comprovante_url !== undefined) updateData.comprovante_url = updates.comprovante_url;
      if (updates.responsavel_id !== undefined) updateData.responsavel_id = updates.responsavel_id;
      if (updates.responsavel_nome !== undefined) updateData.responsavel_nome = updates.responsavel_nome;

      const { data, error } = await supabase
        .from("movimentos_financeiros")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos-obra"] });
      queryClient.invalidateQueries({ queryKey: ["gastos-obra-summary"] });
      queryClient.invalidateQueries({ queryKey: ["movimentos-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast.success("Gasto atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao atualizar gasto:", error);
      toast.error("Erro ao atualizar gasto");
    },
  });
}

export function useDeleteGastoObra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("movimentos_financeiros")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos-obra"] });
      queryClient.invalidateQueries({ queryKey: ["gastos-obra-summary"] });
      queryClient.invalidateQueries({ queryKey: ["movimentos-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast.success("Gasto excluído com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao excluir gasto:", error);
      toast.error("Erro ao excluir gasto");
    },
  });
}
