import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CentroCusto, SaldoCentroCusto } from "@/types/centroCusto";

export function useCentrosCusto(projectId?: number) {
  return useQuery({
    queryKey: ["centros-custo", projectId],
    queryFn: async () => {
      let query = supabase
        .from("centros_custo")
        .select("*")
        .eq("ativo", true)
        .order("codigo");
      
      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CentroCusto[];
    },
  });
}

export function useSaldosCentrosCusto(projectId?: number) {
  return useQuery({
    queryKey: ["saldos-centros-custo", projectId],
    queryFn: async () => {
      let query = supabase
        .from("saldos_centros_custo")
        .select("*")
        .order("percentual_utilizado", { ascending: false });
      
      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SaldoCentroCusto[];
    },
  });
}

export function useCreateCentroCusto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (centroCusto: Omit<CentroCusto, "id" | "created_at" | "updated_at">) => {
      console.log("Hook: Criando centro de custo:", centroCusto);
      
      const { data, error } = await supabase
        .from("centros_custo")
        .insert(centroCusto)
        .select()
        .single();
      
      if (error) {
        console.error("Hook: Erro ao criar:", error);
        throw error;
      }
      
      console.log("Hook: Centro criado com sucesso:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centros-custo"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast({
        title: "Centro de Custo criado",
        description: "O centro de custo foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Hook: onError chamado:", error);
      
      let errorMessage = error.message;
      
      // Detectar erro de código duplicado (PostgreSQL error 23505)
      if (error.code === '23505' && error.message.includes('centros_custo_codigo_key')) {
        const match = error.message.match(/Key \(codigo\)=\(([^)]+)\)/);
        const duplicateCode = match ? match[1] : '';
        errorMessage = `Código '${duplicateCode}' já existe. Por favor, use um código diferente.`;
      }
      
      toast({
        title: "Erro ao criar centro de custo",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCentroCusto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CentroCusto> & { id: string }) => {
      const { data, error } = await supabase
        .from("centros_custo")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centros-custo"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast({
        title: "Centro de Custo atualizado",
        description: "O centro de custo foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar centro de custo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCentroCusto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await supabase
        .from("centros_custo")
        .update({ ativo: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centros-custo"] });
      queryClient.invalidateQueries({ queryKey: ["saldos-centros-custo"] });
      toast({
        title: "Centro de Custo desativado",
        description: "O centro de custo foi desativado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao desativar centro de custo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
