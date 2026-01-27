import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaterialMovementHistory {
  id: string;
  tipo_movimentacao: string;
  quantidade: number;
  data_movimentacao: string;
  responsavel: string;
  observacoes: string | null;
  projeto_origem_id: number | null;
  projeto_destino_id: number | null;
  documento_referencia: string | null;
  custo_unitario: number | null;
  motivo_devolucao: string | null;
  estado_material: string | null;
  movimentacao_origem_id: string | null;
  projeto_origem_nome?: string;
  projeto_destino_nome?: string;
  created_at: string;
}

export interface MaterialAllocation {
  id: string;
  material_id: string;
  projeto_id: number;
  quantidade_alocada: number;
  quantidade_consumida: number;
  quantidade_devolvida: number;
  quantidade_pendente: number;
  status: string;
  etapa_id: number | null;
  created_at: string;
  projeto_nome?: string;
  etapa_nome?: string;
}

export interface MaterialHistorySummary {
  total_entradas: number;
  total_saidas: number;
  total_consumos: number;
  total_devolucoes: number;
  total_ajustes_positivos: number;
  total_ajustes_negativos: number;
  stock_atual: number;
}

export interface MaterialHistoryData {
  material: {
    id: string;
    codigo_interno: string;
    nome_material: string;
    quantidade_stock: number;
    unidade_medida: string;
    categoria_principal: string | null;
  } | null;
  resumo: MaterialHistorySummary;
  alocacoes_activas: MaterialAllocation[];
  timeline: MaterialMovementHistory[];
}

export function useMaterialHistory(materialId: string | null) {
  return useQuery({
    queryKey: ["material-history", materialId],
    queryFn: async (): Promise<MaterialHistoryData> => {
      if (!materialId) {
        return {
          material: null,
          resumo: {
            total_entradas: 0,
            total_saidas: 0,
            total_consumos: 0,
            total_devolucoes: 0,
            total_ajustes_positivos: 0,
            total_ajustes_negativos: 0,
            stock_atual: 0,
          },
          alocacoes_activas: [],
          timeline: [],
        };
      }

      // Fetch material info
      const { data: material, error: materialError } = await supabase
        .from("materiais_armazem")
        .select("id, codigo_interno, nome_material, quantidade_stock, unidade_medida, categoria_principal")
        .eq("id", materialId)
        .single();

      if (materialError) throw materialError;

      // Fetch movements
      const { data: movements, error: movementsError } = await supabase
        .from("materiais_movimentacoes")
        .select("*")
        .eq("material_id", materialId)
        .order("data_movimentacao", { ascending: false });

      if (movementsError) throw movementsError;

      // Fetch allocations
      const { data: allocations, error: allocationsError } = await supabase
        .from("materiais_alocados")
        .select("*")
        .eq("material_id", materialId)
        .order("created_at", { ascending: false });

      if (allocationsError) throw allocationsError;

      // Fetch project names for movements and allocations
      const projectIds = new Set<number>();
      movements?.forEach((m) => {
        if (m.projeto_origem_id) projectIds.add(m.projeto_origem_id);
        if (m.projeto_destino_id) projectIds.add(m.projeto_destino_id);
      });
      allocations?.forEach((a) => {
        if (a.projeto_id) projectIds.add(a.projeto_id);
      });

      let projectsMap: Record<number, string> = {};
      if (projectIds.size > 0) {
        const { data: projects } = await supabase
          .from("projetos")
          .select("id, nome")
          .in("id", Array.from(projectIds));

        projects?.forEach((p) => {
          projectsMap[p.id] = p.nome;
        });
      }

      // Fetch etapas for allocations
      const etapaIds = allocations?.map((a) => a.etapa_id).filter(Boolean) || [];
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

      // Calculate summary
      const resumo: MaterialHistorySummary = {
        total_entradas: 0,
        total_saidas: 0,
        total_consumos: 0,
        total_devolucoes: 0,
        total_ajustes_positivos: 0,
        total_ajustes_negativos: 0,
        stock_atual: material?.quantidade_stock || 0,
      };

      movements?.forEach((m) => {
        switch (m.tipo_movimentacao) {
          case "entrada":
            resumo.total_entradas += m.quantidade;
            break;
          case "saida":
            resumo.total_saidas += m.quantidade;
            break;
          case "consumo":
            resumo.total_consumos += m.quantidade;
            break;
          case "devolucao":
            resumo.total_devolucoes += m.quantidade;
            break;
          case "ajuste_positivo":
            resumo.total_ajustes_positivos += m.quantidade;
            break;
          case "ajuste_negativo":
            resumo.total_ajustes_negativos += m.quantidade;
            break;
        }
      });

      // Enrich timeline with project names
      const timeline: MaterialMovementHistory[] = (movements || []).map((m) => ({
        ...m,
        projeto_origem_nome: m.projeto_origem_id ? projectsMap[m.projeto_origem_id] : undefined,
        projeto_destino_nome: m.projeto_destino_id ? projectsMap[m.projeto_destino_id] : undefined,
      }));

      // Enrich allocations with project and etapa names
      const alocacoes_activas: MaterialAllocation[] = (allocations || [])
        .filter((a) => a.status !== "devolvido" && a.status !== "consumido")
        .map((a) => ({
          ...a,
          quantidade_pendente: a.quantidade_alocada - a.quantidade_consumida - a.quantidade_devolvida,
          projeto_nome: projectsMap[a.projeto_id],
          etapa_nome: a.etapa_id ? etapasMap[a.etapa_id] : undefined,
        }));

      return {
        material,
        resumo,
        alocacoes_activas,
        timeline,
      };
    },
    enabled: !!materialId,
    staleTime: 30000,
  });
}
