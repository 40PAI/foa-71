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
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
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
      // Create the user account via admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: 'temp123456', // Temporary password - user will be asked to change
        email_confirm: true,
        user_metadata: {
          nome
        }
      });

      if (error) throw error;

      // Update the profile with the correct role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          cargo: cargo as any,
          nome 
        })
        .eq('id', data.user.id);

      if (profileError) throw profileError;

      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Sucesso",
        description: "Usuário convidado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao convidar usuário. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error inviting user:', error);
    },
  });
}