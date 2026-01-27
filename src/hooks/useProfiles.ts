import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type UserProfile = Tables<'profiles'>;
export type UserProfileInsert = TablesInsert<'profiles'>;
export type UserProfileUpdate = TablesUpdate<'profiles'>;

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UserProfileUpdate }) => {
      // Only allow updating safe fields (not cargo/role)
      const safeUpdates: UserProfileUpdate = {
        nome: updates.nome,
        telefone: updates.telefone,
        foto_perfil_url: updates.foto_perfil_url,
        data_nascimento: updates.data_nascimento,
        departamento: updates.departamento,
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error updating profile:', error);
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, nome, cargo }: { email: string; nome: string; cargo: string }) => {
      // Call the secure edge function instead of client-side admin.createUser
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.access_token) {
        throw new Error('Não autenticado. Faça login novamente.');
      }

      const response = await supabase.functions.invoke('send-invitation', {
        body: { email, nome, cargo },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar convite');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Erro ao enviar convite');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso! O usuário receberá um email para criar sua conta.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao convidar usuário. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error inviting user:', error);
    },
  });
}
