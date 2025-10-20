import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GastoObra {
  id: string;
  data_movimento: string;
  descricao: string;
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
  saldo_atual: number;
  total_movimentos: number;
}

export function useGastosObra(projectId: number) {
  return useQuery({
    queryKey: ["gastos-obra", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gastos_obra_view")
        .select("*")
        .eq("projeto_id", projectId)
        .order("data_movimento", { ascending: false });
      
      if (error) throw error;
      return data as GastoObra[];
    },
    enabled: !!projectId,
  });
}

export function useGastosObraSummary(projectId: number, mes?: number, ano?: number) {
  return useQuery({
    queryKey: ["gastos-obra-summary", projectId, mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_gastos_obra_summary", {
        p_projeto_id: projectId,
        p_mes: mes || null,
        p_ano: ano || null,
      });
      
      if (error) throw error;
      return (data?.[0] || {
        total_recebimento_foa: 0,
        total_fof_financiamento: 0,
        total_foa_auto: 0,
        total_saidas: 0,
        saldo_atual: 0,
        total_movimentos: 0,
      }) as GastoObraSummary;
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
      centro_custo_id?: string;
      comprovante_url?: string;
      responsavel_id?: string;
    }) => {
      // Preparar os dados para inserção
      const insertData: any = {
        projeto_id: gasto.projeto_id,
        data_movimento: gasto.data_movimento,
        descricao: gasto.descricao,
        tipo_movimento: gasto.tipo_movimento,
        valor: gasto.valor,
        categoria: "Gastos da Obra",
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (gasto.fonte_financiamento) {
        insertData.fonte_financiamento = gasto.fonte_financiamento;
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
      toast.success("Gasto registrado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao registrar gasto:", error);
      toast.error("Erro ao registrar gasto da obra");
    },
  });
}

export function useUpdateGastoObra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GastoObra> & { id: string }) => {
      const { data, error } = await supabase
        .from("movimentos_financeiros")
        .update({
          data_movimento: updates.data_movimento,
          descricao: updates.descricao,
          valor: updates.recebimento_foa || updates.fof_financiamento || updates.foa_auto || updates.saida,
          observacoes: updates.observacoes,
          centro_custo_id: updates.centro_custo_id,
          comprovante_url: updates.comprovante_url,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos-obra"] });
      queryClient.invalidateQueries({ queryKey: ["gastos-obra-summary"] });
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
      toast.success("Gasto excluído com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao excluir gasto:", error);
      toast.error("Erro ao excluir gasto");
    },
  });
}
