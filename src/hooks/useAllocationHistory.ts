import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AllocationMovement {
  id: string;
  tipo_movimentacao: string;
  quantidade: number;
  data_movimentacao: string;
  responsavel: string;
  observacoes: string | null;
  documento_referencia: string | null;
  custo_unitario: number | null;
  motivo_devolucao: string | null;
  estado_material: string | null;
  created_at: string;
  etapa_nome?: string;
}

export interface AllocationHistoryData {
  material: {
    id: string;
    nome: string;
    codigo: string;
    unidade: string;
  } | null;
  projeto: {
    id: number;
    nome: string;
  } | null;
  allocation: {
    id: string;
    quantidade_alocada: number;
    quantidade_consumida: number;
    quantidade_devolvida: number;
    quantidade_pendente: number;
    status: string;
    etapa_nome?: string;
    created_at: string;
  } | null;
  timeline: AllocationMovement[];
  primeira_entrada?: {
    data: string;
    quantidade: number;
    fornecedor?: string;
  };
}

export function useAllocationHistory(
  materialId: string | null,
  projectId: number | null
) {
  return useQuery({
    queryKey: ["allocation-history", materialId, projectId],
    queryFn: async (): Promise<AllocationHistoryData> => {
      if (!materialId || !projectId) {
        return {
          material: null,
          projeto: null,
          allocation: null,
          timeline: [],
        };
      }

      // Fetch material info
      const { data: material, error: materialError } = await supabase
        .from("materiais_armazem")
        .select("id, nome_material, codigo_interno, unidade_medida")
        .eq("id", materialId)
        .single();

      if (materialError && materialError.code !== "PGRST116") {
        console.error("Error fetching material:", materialError);
      }

      // Fetch project info
      const { data: projeto, error: projectError } = await supabase
        .from("projetos")
        .select("id, nome")
        .eq("id", projectId)
        .single();

      if (projectError && projectError.code !== "PGRST116") {
        console.error("Error fetching project:", projectError);
      }

      // Fetch allocation info
      const { data: allocation, error: allocationError } = await supabase
        .from("materiais_alocados")
        .select("*")
        .eq("material_id", materialId)
        .eq("projeto_id", projectId)
        .maybeSingle();

      if (allocationError) {
        console.error("Error fetching allocation:", allocationError);
      }

      // Fetch etapa name if allocation has etapa_id
      let etapaNome: string | undefined;
      if (allocation?.etapa_id) {
        const { data: etapa } = await supabase
          .from("etapas_projeto")
          .select("nome_etapa")
          .eq("id", allocation.etapa_id)
          .single();
        etapaNome = etapa?.nome_etapa;
      }

      // Fetch all movements for this material in this project
      const { data: movements, error: movementsError } = await supabase
        .from("materiais_movimentacoes")
        .select("*")
        .eq("material_id", materialId)
        .or(`projeto_origem_id.eq.${projectId},projeto_destino_id.eq.${projectId}`)
        .order("data_movimentacao", { ascending: true })
        .order("created_at", { ascending: true });

      if (movementsError) {
        console.error("Error fetching movements:", movementsError);
      }

      // Find first entry for this material (regardless of project)
      const { data: firstEntry } = await supabase
        .from("materiais_movimentacoes")
        .select("data_movimentacao, quantidade, documento_referencia")
        .eq("material_id", materialId)
        .eq("tipo_movimentacao", "entrada")
        .order("data_movimentacao", { ascending: true })
        .limit(1)
        .maybeSingle();

      return {
        material: material
          ? {
              id: material.id,
              nome: material.nome_material,
              codigo: material.codigo_interno,
              unidade: material.unidade_medida,
            }
          : null,
        projeto: projeto
          ? {
              id: projeto.id,
              nome: projeto.nome,
            }
          : null,
        allocation: allocation
          ? {
              id: allocation.id,
              quantidade_alocada: allocation.quantidade_alocada,
              quantidade_consumida: allocation.quantidade_consumida,
              quantidade_devolvida: allocation.quantidade_devolvida,
              quantidade_pendente:
                allocation.quantidade_alocada -
                allocation.quantidade_consumida -
                allocation.quantidade_devolvida,
              status: allocation.status,
              etapa_nome: etapaNome,
              created_at: allocation.created_at,
            }
          : null,
        timeline: (movements || []).map((m) => ({
          id: m.id,
          tipo_movimentacao: m.tipo_movimentacao,
          quantidade: m.quantidade,
          data_movimentacao: m.data_movimentacao,
          responsavel: m.responsavel,
          observacoes: m.observacoes,
          documento_referencia: m.documento_referencia,
          custo_unitario: m.custo_unitario,
          motivo_devolucao: m.motivo_devolucao,
          estado_material: m.estado_material,
          created_at: m.created_at,
        })),
        primeira_entrada: firstEntry
          ? {
              data: firstEntry.data_movimentacao,
              quantidade: firstEntry.quantidade,
              fornecedor: firstEntry.documento_referencia || undefined,
            }
          : undefined,
      };
    },
    enabled: !!materialId && !!projectId,
    staleTime: 30000,
  });
}
