import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MovimentoFinanceiro, RelatorioMensal } from "@/types/centroCusto";

export function useMovimentosFinanceiros(projectId?: number, filters?: {
  centroCustoId?: string;
  dataInicio?: string;
  dataFim?: string;
  tipo?: string;
}) {
  const query = useQuery({
    queryKey: ["movimentos-financeiros", projectId, filters],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("movimentos_financeiros")
        .select("*")
        .order("data_movimento", { ascending: false });
      
      if (projectId) {
        queryBuilder = queryBuilder.eq("projeto_id", projectId);
      }
      
      if (filters?.centroCustoId) {
        queryBuilder = queryBuilder.eq("centro_custo_id", filters.centroCustoId);
      }
      
      if (filters?.dataInicio) {
        queryBuilder = queryBuilder.gte("data_movimento", filters.dataInicio);
      }
      
      if (filters?.dataFim) {
        queryBuilder = queryBuilder.lte("data_movimento", filters.dataFim);
      }
      
      if (filters?.tipo) {
        queryBuilder = queryBuilder.eq("tipo_movimento", filters.tipo);
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return data as MovimentoFinanceiro[];
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateMovimentoFinanceiro() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (movimento: Omit<MovimentoFinanceiro, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("movimentos_financeiros")
        .insert(movimento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentos-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      queryClient.invalidateQueries({ queryKey: ["integrated-financial-progress"] });
      toast({
        title: "Movimento registrado",
        description: "O movimento financeiro foi registrado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar movimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMovimentoFinanceiro() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MovimentoFinanceiro> & { id: string }) => {
      const { data, error } = await supabase
        .from("movimentos_financeiros")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentos-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast({
        title: "Movimento atualizado",
        description: "O movimento financeiro foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar movimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMovimentoFinanceiro() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("movimentos_financeiros")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentos-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast({
        title: "Movimento deletado",
        description: "O movimento financeiro foi deletado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar movimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRelatorioMensal(projectId: number, mes: number, ano: number) {
  return useQuery({
    queryKey: ["relatorio-mensal", projectId, mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("generate_monthly_report", {
          p_projeto_id: projectId,
          p_mes: mes,
          p_ano: ano
        });
      
      if (error) throw error;
      return data as RelatorioMensal[];
    },
    enabled: !!projectId && !!mes && !!ano,
  });
}

export function useApproveMovimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, aprovadoPor }: { id: string; aprovadoPor: string }) => {
      const { data, error } = await supabase
        .from("movimentos_financeiros")
        .update({
          status_aprovacao: "aprovado",
          aprovado_por: aprovadoPor,
          data_aprovacao: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentos-financeiros"] });
      toast({
        title: "Movimento aprovado",
        description: "O movimento financeiro foi aprovado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aprovar movimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
