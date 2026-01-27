import { useMemo } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

export interface UserPermissions {
  canViewAllProjects: boolean;
  canViewFinances: boolean;
  canViewPurchases: boolean;
  canViewTasks: boolean;
  canViewHR: boolean;
  canViewSecurity: boolean;
  canViewWarehouse: boolean;
  canManageUsers: boolean;
  role: UserRole | null;
  roles: UserRole[];
  roleLabel: string;
  isDirector: boolean;
}

export function useUserPermissions(): UserPermissions {
  const { profile, userRoles, hasRole, isDirector } = useAuth();

  return useMemo(() => {
    // Mapear roles para labels
    const roleLabels: Record<UserRole, string> = {
      diretor_tecnico: "Diretor Técnico",
      encarregado_obra: "Encarregado de Obra",
      assistente_compras: "Assistente de Compras",
      departamento_hst: "Departamento HST",
      coordenacao_direcao: "Coordenação/Direção"
    };

    // Role principal (primeiro role ou null)
    const primaryRole = userRoles.length > 0 ? userRoles[0] : null;
    const roleLabel = primaryRole ? roleLabels[primaryRole] : "Usuário";

    // Verificar se é diretor ou coordenação (acesso total)
    const isDirectorOrCoord = isDirector();

    return {
      canViewAllProjects: isDirectorOrCoord,
      canViewFinances: isDirectorOrCoord || hasRole('encarregado_obra'),
      canViewPurchases: isDirectorOrCoord || hasRole('encarregado_obra') || hasRole('assistente_compras'),
      canViewTasks: isDirectorOrCoord || hasRole('encarregado_obra'),
      canViewHR: isDirectorOrCoord,
      canViewSecurity: isDirectorOrCoord || hasRole('departamento_hst'),
      canViewWarehouse: isDirectorOrCoord || hasRole('encarregado_obra') || hasRole('assistente_compras'),
      canManageUsers: isDirectorOrCoord,
      role: primaryRole,
      roles: userRoles,
      roleLabel,
      isDirector: isDirectorOrCoord
    };
  }, [profile, userRoles, hasRole, isDirector]);
}
