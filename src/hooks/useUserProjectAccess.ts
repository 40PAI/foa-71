import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserProjectAccess {
  id: string;
  user_id: string;
  projeto_id: number;
  tipo_acesso: string;
  data_atribuicao: string;
  atribuido_por: string | null;
  created_at: string;
  updated_at: string;
  projeto?: {
    id: number;
    nome: string;
  };
  user?: {
    id: string;
    nome: string;
    email: string;
  };
}

// Hook para buscar projetos atribuídos ao utilizador atual
export function useMyProjectAccess() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-project-access", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_project_access")
        .select(`
          *,
          projeto:projetos(id, nome)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as UserProjectAccess[];
    },
    enabled: !!user?.id,
  });
}

// Hook para buscar todas as atribuições (para admin)
export function useAllProjectAccess() {
  return useQuery({
    queryKey: ["all-project-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_project_access")
        .select(`
          *,
          projeto:projetos(id, nome),
          user:profiles!user_project_access_user_id_fkey(id, nome, email)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserProjectAccess[];
    },
  });
}

// Hook para buscar atribuições de um utilizador específico
export function useUserProjectAccessByUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-project-access", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_project_access")
        .select(`
          *,
          projeto:projetos(id, nome)
        `)
        .eq("user_id", userId);
      
      if (error) throw error;
      return data as UserProjectAccess[];
    },
    enabled: !!userId,
  });
}

// Hook para atribuir projeto a utilizador
export function useAssignProjectToUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      projetoId, 
      tipoAcesso = "visualizacao" 
    }: { 
      userId: string; 
      projetoId: number; 
      tipoAcesso?: string;
    }) => {
      const { data, error } = await supabase
        .from("user_project_access")
        .insert({
          user_id: userId,
          projeto_id: projetoId,
          tipo_acesso: tipoAcesso,
          atribuido_por: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-project-access"] });
      queryClient.invalidateQueries({ queryKey: ["all-project-access"] });
      toast.success("Projeto atribuído com sucesso");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("Este projeto já está atribuído a este utilizador");
      } else {
        toast.error("Erro ao atribuir projeto: " + error.message);
      }
    },
  });
}

// Hook para remover atribuição
export function useRemoveProjectAccess() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (accessId: string) => {
      const { error } = await supabase
        .from("user_project_access")
        .delete()
        .eq("id", accessId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-project-access"] });
      queryClient.invalidateQueries({ queryKey: ["all-project-access"] });
      toast.success("Atribuição removida com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover atribuição: " + error.message);
    },
  });
}

// Hook para atribuir múltiplos projetos de uma vez
export function useBulkAssignProjects() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      projetoIds 
    }: { 
      userId: string; 
      projetoIds: number[];
    }) => {
      // Primeiro, remover todas as atribuições existentes
      await supabase
        .from("user_project_access")
        .delete()
        .eq("user_id", userId);
      
      // Depois, inserir as novas atribuições
      if (projetoIds.length > 0) {
        const { error } = await supabase
          .from("user_project_access")
          .insert(
            projetoIds.map(projetoId => ({
              user_id: userId,
              projeto_id: projetoId,
              tipo_acesso: "visualizacao",
              atribuido_por: user?.id,
            }))
          );
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-project-access"] });
      queryClient.invalidateQueries({ queryKey: ["all-project-access"] });
      toast.success("Projetos atualizados com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar projetos: " + error.message);
    },
  });
}
