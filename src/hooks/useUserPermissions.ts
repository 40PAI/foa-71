import { useMemo } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

export interface UserPermissions {
  // Permissões de visualização
  canViewAllProjects: boolean;
  canViewFinances: boolean;
  canViewPurchases: boolean;
  canViewTasks: boolean;
  canViewHR: boolean;
  canViewSecurity: boolean;
  canViewWarehouse: boolean;
  canViewUserManagement: boolean;
  
  // Permissões de criação
  canCreateRequisitions: boolean;
  canCreateTasks: boolean;
  canCreateProjects: boolean;
  
  // Permissões de edição
  canEditWarehouse: boolean;
  canApproveRequisitions: boolean;
  canManageUsers: boolean;
  
  // Ancoragem
  isAnchored: boolean;
  
  // Info
  role: UserRole | null;
  roleLabel: string;
}

export function useUserPermissions(): UserPermissions {
  const { profile } = useAuth();

  return useMemo(() => {
    const role = profile?.cargo || null;

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
      // Visualização
      canViewAllProjects: isDirectorOrCoord || isCompras,
      canViewFinances: isDirectorOrCoord,
      canViewPurchases: isDirectorOrCoord || isCompras || isHST,
      canViewTasks: isDirectorOrCoord || isEncarregado,
      canViewHR: isDirectorOrCoord,
      canViewSecurity: isDirectorOrCoord || isHST,
      canViewWarehouse: isDirectorOrCoord || isCompras || isEncarregado,
      canViewUserManagement: isDirectorOrCoord,
      
      // Criação
      canCreateRequisitions: isDirectorOrCoord || isEncarregado || isCompras || isHST,
      canCreateTasks: isDirectorOrCoord || isEncarregado,
      canCreateProjects: isDirectorOrCoord,
      
      // Edição
      canEditWarehouse: isDirectorOrCoord || isCompras,
      canApproveRequisitions: isDirectorOrCoord,
      canManageUsers: isDirectorOrCoord,
      
      // Ancoragem - encarregados são "ancorados" a projetos específicos
      isAnchored: isEncarregado,
      
      role,
      roleLabel
    };
  }, [profile]);
}
