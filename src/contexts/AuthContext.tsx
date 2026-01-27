import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type UserRole = 'diretor_tecnico' | 'encarregado_obra' | 'assistente_compras' | 'departamento_hst' | 'coordenacao_direcao';

export interface UserProfile extends Tables<'profiles'> {}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isDirector: () => boolean;
  canAccessModule: (module: string) => boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setProfile(profile);
          }, 0);
        } else {
          setProfile(null);
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
      
      // Attempt to sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      // Even if signOut fails, we've already cleared local state
      console.log('Sign out error (local state cleared):', error);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.cargo === role && profile?.ativo === true;
  };

  const isDirector = (): boolean => {
    return hasRole('diretor_tecnico');
  };

  const canAccessModule = (module: string): boolean => {
    if (!profile || !profile.ativo) return false;

    const role = profile.cargo;
    
    switch (module) {
      case 'projetos':
        return ['diretor_tecnico', 'coordenacao_direcao'].includes(role);
      case 'requisicoes':
        return ['diretor_tecnico', 'encarregado_obra', 'departamento_hst'].includes(role);
      case 'armazem':
        return ['diretor_tecnico', 'assistente_compras', 'coordenacao_direcao'].includes(role);
      case 'rh':
        return ['diretor_tecnico', 'coordenacao_direcao'].includes(role);
      case 'seguranca':
        return ['diretor_tecnico', 'departamento_hst', 'coordenacao_direcao'].includes(role);
      case 'tarefas':
        return ['diretor_tecnico', 'encarregado_obra', 'coordenacao_direcao'].includes(role);
      case 'financas':
        return ['diretor_tecnico', 'coordenacao_direcao'].includes(role);
      case 'graficos':
        return ['diretor_tecnico', 'coordenacao_direcao'].includes(role);
      case 'compras':
        return ['diretor_tecnico', 'assistente_compras', 'coordenacao_direcao'].includes(role);
      case 'user_management':
        return ['diretor_tecnico', 'coordenacao_direcao'].includes(role);
      default:
        return ['coordenacao_direcao'].includes(role);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isDirector,
    canAccessModule,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}