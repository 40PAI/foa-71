import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PagamentoRecebimento } from "@/types/contasCorrentes";

// Fetch all transactions
export function usePagamentosRecebimentos(projectId?: number, tipo?: 'pagamento' | 'recebimento') {
  return useQuery({
    queryKey: ["pagamentos_recebimentos", projectId, tipo],
    queryFn: async () => {
      let query = supabase
        .from("pagamentos_recebimentos")
        .select(`
          *,
          contrato_cliente:contratos_clientes(
            numero_contrato,
            descricao_servicos,
            cliente:clientes(nome)
          ),
          contrato_fornecedor:contratos_fornecedores(
            numero_contrato,
            descricao_produtos_servicos,
            fornecedor:fornecedores(nome)
          )
        `)
        .order("data_transacao", { ascending: false });

      if (tipo) {
        query = query.eq("tipo", tipo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Create transaction
export function useCreatePagamentoRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transacao: Omit<PagamentoRecebimento, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("pagamentos_recebimentos")
        .insert(transacao)
        .select()
        .single();
      if (error) throw error;

      // Update contract value based on transaction type
      if (transacao.tipo === 'recebimento' && transacao.contrato_cliente_id) {
        const { data: contrato } = await supabase
          .from("contratos_clientes")
          .select("valor_recebido")
          .eq("id", transacao.contrato_cliente_id)
          .single();

        if (contrato) {
          await supabase
            .from("contratos_clientes")
            .update({
              valor_recebido: (contrato.valor_recebido || 0) + transacao.valor,
              data_ultimo_recebimento: transacao.data_transacao,
            })
            .eq("id", transacao.contrato_cliente_id);
        }
      } else if (transacao.tipo === 'pagamento' && transacao.contrato_fornecedor_id) {
        const { data: contrato } = await supabase
          .from("contratos_fornecedores")
          .select("valor_pago")
          .eq("id", transacao.contrato_fornecedor_id)
          .single();

        if (contrato) {
          await supabase
            .from("contratos_fornecedores")
            .update({
              valor_pago: (contrato.valor_pago || 0) + transacao.valor,
              data_ultimo_pagamento: transacao.data_transacao,
            })
            .eq("id", transacao.contrato_fornecedor_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos_recebimentos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos_clientes"] });
      queryClient.invalidateQueries({ queryKey: ["contratos_fornecedores"] });
      queryClient.invalidateQueries({ queryKey: ["clientes_kpis"] });
      queryClient.invalidateQueries({ queryKey: ["fornecedores_kpis"] });
      toast.success("Transação registrada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao registrar transação: ${error.message}`);
    },
  });
}

// Update transaction
export function useUpdatePagamentoRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PagamentoRecebimento> & { id: string }) => {
      const { data, error } = await supabase
        .from("pagamentos_recebimentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos_recebimentos"] });
      toast.success("Transação atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar transação: ${error.message}`);
    },
  });
}

// Delete transaction
export function useDeletePagamentoRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get transaction details before deleting
      const { data: transacao } = await supabase
        .from("pagamentos_recebimentos")
        .select("*")
        .eq("id", id)
        .single();

      if (!transacao) throw new Error("Transação não encontrada");

      // Delete transaction
      const { error } = await supabase
        .from("pagamentos_recebimentos")
        .delete()
        .eq("id", id);
      if (error) throw error;

      // Update contract value
      if (transacao.tipo === 'recebimento' && transacao.contrato_cliente_id) {
        const { data: contrato } = await supabase
          .from("contratos_clientes")
          .select("valor_recebido")
          .eq("id", transacao.contrato_cliente_id)
          .single();

        if (contrato) {
          await supabase
            .from("contratos_clientes")
            .update({
              valor_recebido: Math.max(0, (contrato.valor_recebido || 0) - transacao.valor),
            })
            .eq("id", transacao.contrato_cliente_id);
        }
      } else if (transacao.tipo === 'pagamento' && transacao.contrato_fornecedor_id) {
        const { data: contrato } = await supabase
          .from("contratos_fornecedores")
          .select("valor_pago")
          .eq("id", transacao.contrato_fornecedor_id)
          .single();

        if (contrato) {
          await supabase
            .from("contratos_fornecedores")
            .update({
              valor_pago: Math.max(0, (contrato.valor_pago || 0) - transacao.valor),
            })
            .eq("id", transacao.contrato_fornecedor_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos_recebimentos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos_clientes"] });
      queryClient.invalidateQueries({ queryKey: ["contratos_fornecedores"] });
      queryClient.invalidateQueries({ queryKey: ["clientes_kpis"] });
      queryClient.invalidateQueries({ queryKey: ["fornecedores_kpis"] });
      toast.success("Transação excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir transação: ${error.message}`);
    },
  });
}
