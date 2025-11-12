import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReembolsoFOA {
  id: string;
  projeto_id: number;
  data_reembolso: string;
  descricao: string;
  valor: number;
  tipo: 'amortizacao' | 'aporte';
  meta_total?: number;
  percentual_cumprido?: number;
  responsavel_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Buscar reembolsos por projeto (se projectId = undefined, busca TODOS)
export function useReembolsosFOA(projectId?: number) {
  return useQuery({
    queryKey: ["reembolsos-foa", projectId],
    queryFn: async () => {
      let query = supabase
        .from("reembolsos_foa_fof")
        .select("*")
        .order("data_reembolso", { ascending: false });

      if (projectId !== undefined) {
        query = query.eq("projeto_id", projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ReembolsoFOA[];
    },
  });
}

// Criar reembolso
export function useCreateReembolso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reembolso: Omit<ReembolsoFOA, "id" | "created_at" | "updated_at" | "percentual_cumprido">) => {
      const { data, error } = await supabase
        .from("reembolsos_foa_fof")
        .insert(reembolso)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reembolsos-foa"] });
      toast.success("Reembolso registrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar reembolso: ${error.message}`);
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
      toast.success("Reembolso atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar reembolso: ${error.message}`);
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
      toast.success("Reembolso removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover reembolso: ${error.message}`);
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
          } else {
            acc.aporte += item.valor;
          }
          return acc;
        },
        { amortizacao: 0, aporte: 0 }
      );

      return {
        ...totais,
        saldo: totais.aporte - totais.amortizacao,
      };
    },
    enabled: !!projectId,
  });
}
