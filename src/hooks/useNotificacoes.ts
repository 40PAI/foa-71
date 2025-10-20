import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  projeto_id?: number;
  centro_custo_id?: string;
  severidade: string;
  lida: boolean;
  created_at: string;
}

export function useNotificacoes(lida?: boolean) {
  return useQuery({
    queryKey: ["notificacoes", lida],
    queryFn: async () => {
      let query = supabase
        .from("notificacoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (lida !== undefined) {
        query = query.eq("lida", lida);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Notificacao[];
    },
  });
}

export function useMarcarComoLida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificacaoId: string) => {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", notificacaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });
}

export function useVerificarOrcamentos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("check_budget_thresholds");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      toast.success("Verificação de orçamentos concluída");
    },
    onError: () => {
      toast.error("Erro ao verificar orçamentos");
    },
  });
}
