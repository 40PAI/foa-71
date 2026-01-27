import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Enums } from "@/integrations/supabase/types";

export type UserRole = Enums<'app_role'>;

export interface UserProfile extends Tables<'profiles'> {}

interface UserRoleRecord {
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  userRoles: UserRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isDirector: () => boolean;
  canAccessModule: (module: string) => boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user roles from the authoritative user_roles table
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return (data as UserRoleRecord[])?.map(r => r.role) || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }, []);

  // Fetch profile and roles
  const fetchProfileAndRoles = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch roles from user_roles table (authoritative source)
      const roles = await fetchUserRoles(userId);
      setUserRoles(roles);
    } catch (error) {
      console.error('Error in fetchProfileAndRoles:', error);
    }
  }, [fetchUserRoles]);

  const refreshRoles = useCallback(async () => {
    if (user?.id) {
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
    }
  }, [user?.id, fetchUserRoles]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid deadlock with Supabase auth
          setTimeout(() => {
            fetchProfileAndRoles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRoles(session.user.id);
      }
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRoles]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Always clear local state first
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRoles([]);
      
      // Attempt to sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      // Even if signOut fails, we've already cleared local state
      console.log('Sign out error (local state cleared):', error);
    }
  };

  // Check role against the authoritative user_roles table
  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role) && profile?.ativo === true;
  };

  const isDirector = (): boolean => {
    return hasRole('diretor_tecnico');
  };

  const canAccessModule = (module: string): boolean => {
    if (!profile || !profile.ativo) return false;

    // Use userRoles from user_roles table (authoritative source)
    const hasDirector = userRoles.includes('diretor_tecnico');
    const hasCoord = userRoles.includes('coordenacao_direcao');
    const hasEncarregado = userRoles.includes('encarregado_obra');
    const hasAssistente = userRoles.includes('assistente_compras');
    const hasDepartamentoHST = userRoles.includes('departamento_hst');
    
    switch (module) {
      case 'projetos':
        return hasDirector || hasCoord;
      case 'requisicoes':
        return hasDirector || hasEncarregado || hasDepartamentoHST;
      case 'armazem':
        return hasDirector || hasAssistente || hasCoord;
      case 'rh':
        return hasDirector || hasCoord;
      case 'seguranca':
        return hasDirector || hasDepartamentoHST || hasCoord;
      case 'tarefas':
        return hasDirector || hasEncarregado || hasCoord;
      case 'financas':
        return hasDirector || hasCoord;
      case 'graficos':
        return hasDirector || hasCoord;
      case 'compras':
        return hasDirector || hasAssistente || hasCoord;
      case 'user_management':
        return hasDirector || hasCoord;
      default:
        return hasCoord;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isDirector,
    canAccessModule,
    refreshRoles,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
