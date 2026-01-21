import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isCredito, type FonteCredito, type TipoMovimentoDivida, type StatusDivida } from "@/types/dividas";

export interface ReembolsoFOA {
  id: string;
  projeto_id: number;
  data_reembolso: string;
  descricao: string;
  valor: number;
  tipo: TipoMovimentoDivida;
  fonte_credito: FonteCredito;
  credor_nome?: string;
  fornecedor_id?: string;
  taxa_juro?: number;
  data_vencimento?: string;
  numero_contrato?: string;
  status_divida: StatusDivida;
  meta_total?: number;
  percentual_cumprido?: number;
  responsavel_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export type CreateReembolsoInput = Omit<ReembolsoFOA, "id" | "created_at" | "updated_at" | "percentual_cumprido">;

// Buscar reembolsos por projeto (se projectId = undefined, busca TODOS)
export function useReembolsosFOA(projectId?: number, fonteCredito?: FonteCredito) {
  return useQuery({
    queryKey: ["reembolsos-foa", projectId, fonteCredito],
    queryFn: async () => {
      let query = supabase
        .from("reembolsos_foa_fof")
        .select("*")
        .order("data_reembolso", { ascending: false });

      if (projectId !== undefined) {
        query = query.eq("projeto_id", projectId);
      }

      if (fonteCredito) {
        query = query.eq("fonte_credito", fonteCredito);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ReembolsoFOA[];
    },
  });
}

// Buscar resumo de dívidas agrupado por fonte/credor
export function useResumoDividas(projectId?: number) {
  return useQuery({
    queryKey: ["resumo-dividas", projectId],
    queryFn: async () => {
      let query = supabase
        .from("reembolsos_foa_fof")
        .select("*");

      if (projectId !== undefined) {
        query = query.eq("projeto_id", projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por fonte_credito + credor_nome
      const agrupado = (data as ReembolsoFOA[]).reduce((acc, mov) => {
        const chave = mov.fonte_credito === 'FOF' 
          ? 'FOF'
          : mov.fonte_credito === 'FORNECEDOR'
            ? `FORNECEDOR:${mov.fornecedor_id || 'desconhecido'}`
            : `${mov.fonte_credito}:${mov.credor_nome || 'desconhecido'}`;

        if (!acc[chave]) {
          acc[chave] = {
            fonte_credito: mov.fonte_credito,
            credor_nome: mov.credor_nome || (mov.fonte_credito === 'FOF' ? 'FOF' : 'Desconhecido'),
            fornecedor_id: mov.fornecedor_id,
            total_credito: 0,
            total_amortizado: 0,
            total_juros: 0,
            proxima_vencimento: undefined as string | undefined,
          };
        }

        if (isCredito(mov.tipo)) {
          acc[chave].total_credito += mov.valor;
        } else if (mov.tipo === 'amortizacao') {
          acc[chave].total_amortizado += mov.valor;
        } else if (mov.tipo === 'juro') {
          acc[chave].total_juros += mov.valor;
        }

        // Atualizar próxima data de vencimento
        if (mov.data_vencimento) {
          if (!acc[chave].proxima_vencimento || mov.data_vencimento < acc[chave].proxima_vencimento) {
            acc[chave].proxima_vencimento = mov.data_vencimento;
          }
        }

        return acc;
      }, {} as Record<string, {
        fonte_credito: FonteCredito;
        credor_nome: string;
        fornecedor_id?: string;
        total_credito: number;
        total_amortizado: number;
        total_juros: number;
        proxima_vencimento?: string;
      }>);

      return Object.values(agrupado).map(item => ({
        ...item,
        saldo_devedor: item.total_credito - item.total_amortizado,
        status: item.total_credito <= item.total_amortizado ? 'quitado' as StatusDivida : 'ativo' as StatusDivida,
      }));
    },
  });
}

// Criar reembolso
export function useCreateReembolso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reembolso: CreateReembolsoInput) => {
      // Map old 'aporte' type to new 'credito' type for backward compatibility
      const tipoNormalizado = reembolso.tipo === 'aporte' as any ? 'credito' : reembolso.tipo;
      
      const { data, error } = await supabase
        .from("reembolsos_foa_fof")
        .insert({
          ...reembolso,
          tipo: tipoNormalizado,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reembolsos-foa"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-foa"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-foa-geral"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-dividas"] });
      toast.success("Movimento registrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar movimento: ${error.message}`);
    },
  });
}

// Atualizar reembolso
export function useUpdateReembolso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReembolsoFOA> & { id: string }) => {
      const { data, error } = await supabase
        .from("reembolsos_foa_fof")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reembolsos-foa"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-foa"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-foa-geral"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-dividas"] });
      toast.success("Movimento atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar movimento: ${error.message}`);
    },
  });
}

// Deletar reembolso
export function useDeleteReembolso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reembolsos_foa_fof")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reembolsos-foa"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-foa"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-foa-geral"] });
      queryClient.invalidateQueries({ queryKey: ["resumo-dividas"] });
      toast.success("Movimento removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover movimento: ${error.message}`);
    },
  });
}

// Calcular totais acumulados
export function useReembolsosAcumulados(projectId: number) {
  return useQuery({
    queryKey: ["reembolsos-acumulados", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reembolsos_foa_fof")
        .select("tipo, valor")
        .eq("projeto_id", projectId);

      if (error) throw error;

      const totais = data.reduce(
        (acc, item) => {
          if (item.tipo === 'amortizacao') {
            acc.amortizacao += item.valor;
          } else if (item.tipo === 'credito' || item.tipo === 'aporte') {
            acc.credito += item.valor;
          } else if (item.tipo === 'juro') {
            acc.juros += item.valor;
          }
          return acc;
        },
        { amortizacao: 0, credito: 0, juros: 0 }
      );

      return {
        ...totais,
        saldo: totais.credito - totais.amortizacao,
      };
    },
    enabled: !!projectId,
  });
}
