import { useMemo } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

export interface UserPermissions {
  canViewAllProjects: boolean;
  canViewFinances: boolean;
  canViewPurchases: boolean;
  canViewTasks: boolean;
  canViewHR: boolean;
  canViewSecurity: boolean;
  role: UserRole | null;
  roleLabel: string;
}

export function useUserPermissions(): UserPermissions {
  const { profile } = useAuth();

  return useMemo(() => {
    const role = profile?.cargo || null;

    // Mapear roles para labels
    const roleLabels: Record<UserRole, string> = {
      diretor_tecnico: "Diretor Técnico",
      encarregado_obra: "Encarregado de Obra",
      assistente_compras: "Assistente de Compras",
      departamento_hst: "Departamento HST",
      coordenacao_direcao: "Coordenação/Direção"
    };

    const roleLabel = role ? roleLabels[role] : "Usuário";

    // Definir permissões baseadas no role
    const isDirectorOrCoord = role === 'diretor_tecnico' || role === 'coordenacao_direcao';
    const isEncarregado = role === 'encarregado_obra';
    const isCompras = role === 'assistente_compras';
    const isHST = role === 'departamento_hst';

    return {
      canViewAllProjects: isDirectorOrCoord,
      canViewFinances: isDirectorOrCoord || isEncarregado,
      canViewPurchases: isDirectorOrCoord || isEncarregado || isCompras,
      canViewTasks: isDirectorOrCoord || isEncarregado,
      canViewHR: isDirectorOrCoord,
      canViewSecurity: isDirectorOrCoord || isHST,
      role,
      roleLabel
    };
  }, [profile]);
}
