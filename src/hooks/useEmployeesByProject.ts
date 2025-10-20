import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ColaboradorProjeto = Tables<"colaboradores_projetos"> & {
  colaborador: Tables<"colaboradores">;
};

export function useEmployeesByProject(projectId?: number) {
  return useQuery({
    queryKey: ["employees", "project", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("colaboradores_projetos")
        .select(`
          *,
          colaborador:colaboradores!inner(*)
        `)
        .eq("projeto_id", projectId);
      
      if (error) {
        console.error("Error fetching employees by project:", error);
        return [];
      }

      return data?.map((allocation: any) => {
        const colaborador = allocation.colaborador;
        if (!colaborador || typeof colaborador !== 'object') return null;
        
        return {
          ...colaborador,
          alocacao: allocation
        };
      }).filter(Boolean) || [];
    },
    enabled: !!projectId,
  });
}