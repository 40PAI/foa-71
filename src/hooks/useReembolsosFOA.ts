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
// INCLUI FOF de movimentos_financeiros + outras fontes de reembolsos_foa_fof
export function useResumoDividas(projectId?: number) {
  return useQuery({
    queryKey: ["resumo-dividas", projectId, "v2-with-fof"],
    queryFn: async () => {
      // 1. Buscar FOF Financiamentos de movimentos_financeiros via RPC
      const { data: fofData, error: fofError } = await supabase
        .rpc('calcular_resumo_foa', { 
          p_projeto_id: projectId !== undefined ? projectId : null 
        });

      if (fofError) {
        console.error('Erro ao buscar resumo FOA:', fofError);
      }

      // 2. Buscar outras fontes de crédito (Bancos, Fornecedores, Outros) de reembolsos_foa_fof
      let query = supabase
        .from("reembolsos_foa_fof")
        .select("*");

      if (projectId !== undefined) {
        query = query.eq("projeto_id", projectId);
      }

      const { data: reembolsosData, error: reembolsosError } = await query;

      if (reembolsosError) throw reembolsosError;

      // 3. Agrupar reembolsos por fonte_credito + credor_nome (EXCETO FOF)
      const agrupado = (reembolsosData as ReembolsoFOA[]).reduce((acc, mov) => {
        // Ignorar FOF aqui pois será tratado separadamente de movimentos_financeiros
        if (mov.fonte_credito === 'FOF') return acc;

        const chave = mov.fonte_credito === 'FORNECEDOR'
          ? `FORNECEDOR:${mov.fornecedor_id || 'desconhecido'}`
          : `${mov.fonte_credito}:${mov.credor_nome || 'desconhecido'}`;

        if (!acc[chave]) {
          acc[chave] = {
            fonte_credito: mov.fonte_credito,
            credor_nome: mov.credor_nome || 'Desconhecido',
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

      // 4. Converter outras fontes para array
      const outrasFontes = Object.values(agrupado).map(item => ({
        ...item,
        saldo_devedor: item.total_credito - item.total_amortizado,
        status: item.total_credito <= item.total_amortizado ? 'quitado' as StatusDivida : 'ativo' as StatusDivida,
      }));

      // 5. Calcular totais FOF de movimentos_financeiros
      let fofTotal = {
        fonte_credito: 'FOF' as FonteCredito,
        credor_nome: 'FOF',
        fornecedor_id: undefined as string | undefined,
        total_credito: 0,
        total_amortizado: 0,
        total_juros: 0,
        saldo_devedor: 0,
        status: 'quitado' as StatusDivida,
        proxima_vencimento: undefined as string | undefined,
      };

      if (fofData && Array.isArray(fofData)) {
        fofData.forEach((projeto: { fof_financiamento: number; amortizacao: number }) => {
          fofTotal.total_credito += Number(projeto.fof_financiamento) || 0;
          fofTotal.total_amortizado += Number(projeto.amortizacao) || 0;
        });
        fofTotal.saldo_devedor = fofTotal.total_credito - fofTotal.total_amortizado;
        fofTotal.status = fofTotal.saldo_devedor > 0 ? 'ativo' : 'quitado';
      }

      // 6. Combinar: FOF + outras fontes
      const resultado = [];
      
      // Adicionar FOF se tiver saldo devedor
      if (fofTotal.saldo_devedor > 0) {
        resultado.push(fofTotal);
      }

      // Adicionar outras fontes
      resultado.push(...outrasFontes);

      return resultado;
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
