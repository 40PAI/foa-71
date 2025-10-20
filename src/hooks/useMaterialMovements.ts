import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMaterialMovements(projectId?: number) {
  return useQuery({
    queryKey: ["material-movements", projectId],
    queryFn: async () => {
      let query = supabase
        .from("materiais_movimentacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.or(`projeto_origem_id.eq.${projectId},projeto_destino_id.eq.${projectId}`);
      }

      const { data: movements, error } = await query;
      if (error) throw error;
      
      // Buscar dados relacionados separadamente
      const enrichedMovements = await Promise.all(
        (movements || []).map(async (movement) => {
          const [materialRes, origemRes, destinoRes] = await Promise.all([
            movement.material_id 
              ? supabase.from("materiais_armazem").select("nome_material, codigo_interno").eq("id", movement.material_id).single()
              : null,
            movement.projeto_origem_id 
              ? supabase.from("projetos").select("nome").eq("id", movement.projeto_origem_id).single()
              : null,
            movement.projeto_destino_id 
              ? supabase.from("projetos").select("nome").eq("id", movement.projeto_destino_id).single()
              : null,
          ]);

          return {
            ...movement,
            material: materialRes?.data,
            projeto_origem: origemRes?.data,
            projeto_destino: destinoRes?.data,
          };
        })
      );

      return enrichedMovements;
    },
    enabled: true,
  });
}

export function useMoveMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      materialId: string;
      projetoOrigemId?: number;
      projetoDestinoId?: number;
      quantidade: number;
      responsavel: string;
      observacoes?: string;
    }) => {
      const { data, error } = await supabase.rpc("move_material", {
        p_material_id: params.materialId,
        p_projeto_origem_id: params.projetoOrigemId || null,
        p_projeto_destino_id: params.projetoDestinoId || null,
        p_quantidade: params.quantidade,
        p_responsavel: params.responsavel,
        p_observacoes: params.observacoes || null,
      });

      if (error) {
        throw new Error(error.message || "Erro ao movimentar material");
      }
      
      if (!(data as any).success) {
        throw new Error((data as any).message || "Falha na movimentação de material");
      }

      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Material movimentado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["material-movements"] });
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao movimentar material");
    },
    onSettled: () => {
      // Garante que as queries sejam invalidadas mesmo em caso de erro
      queryClient.invalidateQueries({ queryKey: ["material-movements"] });
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
    },
  });
}