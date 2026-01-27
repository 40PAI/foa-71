import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type UserRole = 'diretor_tecnico' | 'encarregado_obra' | 'assistente_compras' | 'departamento_hst' | 'coordenacao_direcao';

export interface UserProfile extends Tables<'profiles'> {}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  granted_by: string | null;
  granted_at: string;
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

  // Função para buscar roles da tabela user_roles (SEGURO)
  const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return (data || []).map(r => r.role as UserRole);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  // Função para buscar profile
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Função para refresh de roles (útil após alterações)
  const refreshRoles = async () => {
    if (user?.id) {
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
    }
  };

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar profile e roles em paralelo (sem setTimeout)
          const [profileData, roles] = await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
          
          setProfile(profileData);
          setUserRoles(roles);
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
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // SEGURO: Verifica role a partir da tabela user_roles (não profiles.cargo)
  const hasRole = (role: UserRole): boolean => {
    // Também verificar se o profile está ativo
    if (!profile?.ativo) return false;
    return userRoles.includes(role);
  };

  const isDirector = (): boolean => {
    return hasRole('diretor_tecnico') || hasRole('coordenacao_direcao');
  };

  const canAccessModule = (module: string): boolean => {
    if (!profile || !profile.ativo) return false;
    if (userRoles.length === 0) return false;

    // Diretores e coordenação têm acesso a tudo
    if (isDirector()) return true;
    
    switch (module) {
      case 'projetos':
        return false; // Apenas diretores (já verificado acima)
      case 'requisicoes':
        return hasRole('encarregado_obra') || hasRole('departamento_hst');
      case 'armazem':
        return hasRole('assistente_compras');
      case 'rh':
        return false; // Apenas diretores
      case 'seguranca':
        return hasRole('departamento_hst');
      case 'tarefas':
        return hasRole('encarregado_obra');
      case 'financas':
        return false; // Apenas diretores
      case 'graficos':
        return false; // Apenas diretores
      case 'compras':
        return hasRole('assistente_compras');
      case 'user_management':
        return false; // Apenas diretores
      default:
        return false;
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
