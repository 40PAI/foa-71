import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContaFornecedor {
  id: string;
  fornecedor_id: string;
  projeto_id: number;
  saldo_inicial: number;
  descricao?: string;
  data_vencimento?: string;
  categoria?: string;
  created_at: string;
  updated_at: string;
}

export interface LancamentoFornecedor {
  id: string;
  conta_fornecedor_id: string;
  data_lancamento: string;
  descricao: string;
  centro_custo_id?: string;
  credito: number;
  debito: number;
  saldo_corrente?: number;
  observacoes?: string;
  created_at: string;
}

// Buscar contas correntes por projeto com KPIs calculados
export function useContasFornecedores(projectId?: number) {
  return useQuery({
    queryKey: ["contas-fornecedores", projectId],
    queryFn: async () => {
      let query = supabase
        .from("contas_correntes_fornecedores")
        .select(`
          *,
          fornecedores (
            id,
            nome,
            nif,
            categoria_principal
          ),
          lancamentos:lancamentos_fornecedor(credito, debito)
        `)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calcular KPIs reais
      const contasComSaldo = data?.map((conta: any) => {
        const lancamentos = conta.lancamentos || [];
        const totalCredito = lancamentos.reduce((sum: number, l: any) => sum + (l.credito || 0), 0);
        const totalDebito = lancamentos.reduce((sum: number, l: any) => sum + (l.debito || 0), 0);
        const saldoAtual = (conta.saldo_inicial || 0) + totalCredito - totalDebito;

        return {
          ...conta,
          saldo: {
            saldo_inicial: conta.saldo_inicial,
            total_credito: totalCredito,
            total_debito: totalDebito,
            saldo_atual: saldoAtual,
          },
        };
      });

      return contasComSaldo;
    },
  });
}

// KPIs agregados de todas as contas
export function useKPIsContasFornecedores(projectId?: number) {
  const { data: contas } = useContasFornecedores(projectId);

  return {
    totalContas: contas?.length || 0,
    totalCredito: contas?.reduce((sum, c: any) => sum + (c.saldo?.total_credito || 0), 0) || 0,
    totalDebito: contas?.reduce((sum, c: any) => sum + (c.saldo?.total_debito || 0), 0) || 0,
    saldoLiquido: contas?.reduce((sum, c: any) => sum + (c.saldo?.saldo_atual || 0), 0) || 0,
  };
}

// Buscar lançamentos de uma conta
export function useLancamentosFornecedor(contaId?: string) {
  return useQuery({
    queryKey: ["lancamentos-fornecedor", contaId],
    queryFn: async () => {
      if (!contaId) return [];

      const { data, error } = await supabase
        .from("lancamentos_fornecedor")
        .select(`
          *,
          centros_custo (
            codigo,
            nome
          )
        `)
        .eq("conta_fornecedor_id", contaId)
        .order("data_lancamento", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!contaId,
  });
}

// Criar conta corrente
export function useCreateContaFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conta: Omit<ContaFornecedor, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("contas_correntes_fornecedores")
        .insert(conta)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-fornecedores"] });
      toast.success("Conta corrente criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar conta: ${error.message}`);
    },
  });
}

// Criar lançamento
export function useCreateLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lancamento: Omit<LancamentoFornecedor, "id" | "created_at" | "saldo_corrente">) => {
      const { data, error } = await supabase
        .from("lancamentos_fornecedor")
        .insert(lancamento)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos-fornecedor", variables.conta_fornecedor_id] });
      queryClient.invalidateQueries({ queryKey: ["contas-fornecedores"] });
      toast.success("Lançamento registrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar lançamento: ${error.message}`);
    },
  });
}

// Calcular saldo atual de uma conta
export function useSaldoContaFornecedor(contaId?: string) {
  return useQuery({
    queryKey: ["saldo-conta-fornecedor", contaId],
    queryFn: async () => {
      if (!contaId) return null;

      // Buscar saldo inicial
      const { data: conta, error: contaError } = await supabase
        .from("contas_correntes_fornecedores")
        .select("saldo_inicial")
        .eq("id", contaId)
        .single();

      if (contaError) throw contaError;

      // Buscar soma de lançamentos
      const { data: lancamentos, error: lancError } = await supabase
        .from("lancamentos_fornecedor")
        .select("credito, debito")
        .eq("conta_fornecedor_id", contaId);

      if (lancError) throw lancError;

      const totais = lancamentos.reduce(
        (acc, l) => ({
          credito: acc.credito + (l.credito || 0),
          debito: acc.debito + (l.debito || 0),
        }),
        { credito: 0, debito: 0 }
      );

      return {
        saldo_inicial: conta.saldo_inicial,
        total_credito: totais.credito,
        total_debito: totais.debito,
        saldo_atual: (conta.saldo_inicial || 0) + totais.credito - totais.debito,
      };
    },
    enabled: !!contaId,
  });
}
