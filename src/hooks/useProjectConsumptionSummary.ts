import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaterialConsumptionItem {
  material_id: string;
  material_nome: string;
  material_codigo: string;
  material_unidade: string;
  quantidade_alocada: number;
  quantidade_consumida: number;
  quantidade_devolvida: number;
  quantidade_pendente: number;
  status: string;
  etapa_nome?: string;
  allocation_id: string;
  created_at: string;
  movimento_count: number;
  primeiro_movimento?: string;
  ultimo_movimento?: string;
}

export interface ProjectConsumptionSummary {
  projeto: {
    id: number;
    nome: string;
  } | null;
  totais: {
    materiais_distintos: number;
    total_alocado: number;
    total_consumido: number;
    total_devolvido: number;
    total_pendente: number;
  };
  materiais: MaterialConsumptionItem[];
  periodo: {
    inicio: string | null;
    fim: string | null;
  };
}

export function useProjectConsumptionSummary(projectId: number | null) {
  return useQuery({
    queryKey: ["project-consumption-summary", projectId],
    queryFn: async (): Promise<ProjectConsumptionSummary> => {
      if (!projectId) {
        return {
          projeto: null,
          totais: {
            materiais_distintos: 0,
            total_alocado: 0,
            total_consumido: 0,
            total_devolvido: 0,
            total_pendente: 0,
          },
          materiais: [],
          periodo: { inicio: null, fim: null },
        };
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

      // Fetch all allocations for this project
      const { data: allocations, error: allocationsError } = await supabase
        .from("materiais_alocados")
        .select("*")
        .eq("projeto_id", projectId)
        .order("created_at", { ascending: false });

      if (allocationsError) {
        console.error("Error fetching allocations:", allocationsError);
      }

      if (!allocations || allocations.length === 0) {
        return {
          projeto: projeto ? { id: projeto.id, nome: projeto.nome } : null,
          totais: {
            materiais_distintos: 0,
            total_alocado: 0,
            total_consumido: 0,
            total_devolvido: 0,
            total_pendente: 0,
          },
          materiais: [],
          periodo: { inicio: null, fim: null },
        };
      }

      // Fetch material info
      const materialIds = [...new Set(allocations.map((a) => a.material_id))];
      const { data: materials } = await supabase
        .from("materiais_armazem")
        .select("id, nome_material, codigo_interno, unidade_medida")
        .in("id", materialIds);

      const materialsMap: Record<
        string,
        { nome: string; codigo: string; unidade: string }
      > = {};
      materials?.forEach((m) => {
        materialsMap[m.id] = {
          nome: m.nome_material,
          codigo: m.codigo_interno,
          unidade: m.unidade_medida,
        };
      });

      // Fetch etapas
      const etapaIds = allocations
        .map((a) => a.etapa_id)
        .filter(Boolean) as number[];
      let etapasMap: Record<number, string> = {};
      if (etapaIds.length > 0) {
        const { data: etapas } = await supabase
          .from("etapas_projeto")
          .select("id, nome_etapa")
          .in("id", etapaIds);
        etapas?.forEach((e) => {
          etapasMap[e.id] = e.nome_etapa;
        });
      }

      // Fetch movement counts and dates per material
      const { data: movements } = await supabase
        .from("materiais_movimentacoes")
        .select("material_id, data_movimentacao")
        .in("material_id", materialIds)
        .or(
          `projeto_origem_id.eq.${projectId},projeto_destino_id.eq.${projectId}`
        )
        .order("data_movimentacao", { ascending: true });

      const movementStats: Record<
        string,
        { count: number; primeiro?: string; ultimo?: string }
      > = {};
      movements?.forEach((m) => {
        if (!movementStats[m.material_id]) {
          movementStats[m.material_id] = {
            count: 0,
            primeiro: m.data_movimentacao,
          };
        }
        movementStats[m.material_id].count++;
        movementStats[m.material_id].ultimo = m.data_movimentacao;
      });

      // Build material list
      const materiais: MaterialConsumptionItem[] = allocations.map((a) => {
        const pendente =
          a.quantidade_alocada - a.quantidade_consumida - a.quantidade_devolvida;
        const stats = movementStats[a.material_id] || { count: 0 };

        return {
          material_id: a.material_id,
          material_nome: materialsMap[a.material_id]?.nome || "Desconhecido",
          material_codigo: materialsMap[a.material_id]?.codigo || "",
          material_unidade: materialsMap[a.material_id]?.unidade || "",
          quantidade_alocada: a.quantidade_alocada,
          quantidade_consumida: a.quantidade_consumida,
          quantidade_devolvida: a.quantidade_devolvida,
          quantidade_pendente: pendente,
          status: a.status,
          etapa_nome: a.etapa_id ? etapasMap[a.etapa_id] : undefined,
          allocation_id: a.id,
          created_at: a.created_at,
          movimento_count: stats.count,
          primeiro_movimento: stats.primeiro,
          ultimo_movimento: stats.ultimo,
        };
      });

      // Calculate totals
      const totais = {
        materiais_distintos: materiais.length,
        total_alocado: materiais.reduce(
          (sum, m) => sum + m.quantidade_alocada,
          0
        ),
        total_consumido: materiais.reduce(
          (sum, m) => sum + m.quantidade_consumida,
          0
        ),
        total_devolvido: materiais.reduce(
          (sum, m) => sum + m.quantidade_devolvida,
          0
        ),
        total_pendente: materiais.reduce(
          (sum, m) => sum + m.quantidade_pendente,
          0
        ),
      };

      // Find period
      const datas = materiais
        .flatMap((m) =>
          [m.primeiro_movimento, m.ultimo_movimento].filter(Boolean)
        )
        .sort();

      return {
        projeto: projeto ? { id: projeto.id, nome: projeto.nome } : null,
        totais,
        materiais,
        periodo: {
          inicio: datas[0] || null,
          fim: datas[datas.length - 1] || null,
        },
      };
    },
    enabled: !!projectId,
    staleTime: 30000,
  });
}
