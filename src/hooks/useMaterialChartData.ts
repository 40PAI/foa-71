import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, subDays } from "date-fns";
import { pt } from "date-fns/locale";
import { useMaterialsArmazem } from "./useMaterialsArmazem";

export interface MaterialFlowData {
  periodo: string;
  entradas: number;
  saidas: number;
  consumos: number;
  devolucoes: number;
}

export interface TopMaterialData {
  material_id: string;
  nome: string;
  codigo: string;
  total_movimentado: number;
  unidade: string;
}

export interface CriticalStockData {
  material_id: string;
  nome: string;
  codigo: string;
  stock_atual: number;
  stock_minimo: number;
  percentual: number;
  status: 'critico' | 'baixo' | 'normal';
}

export interface ConsumptionByProjectData {
  projeto_id: number;
  projeto_nome: string;
  total_consumido: number;
  materiais_diferentes: number;
  percentual: number;
}

export interface MovementTimelineData {
  id: string;
  data: string;
  tipo: string;
  material_nome: string;
  quantidade: number;
  projeto_destino?: string;
  responsavel?: string;
}

// Hook for material flow over time (stacked area chart)
// Expandido para incluir todos os tipos de movimentação
export function useMaterialFlow(projectId?: number, days: number = 90) {
  return useQuery({
    queryKey: ["material-flow", projectId, days],
    queryFn: async (): Promise<MaterialFlowData[]> => {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      let query = supabase
        .from("materiais_movimentacoes")
        .select("data_movimentacao, tipo_movimentacao, quantidade")
        .gte("data_movimentacao", format(startDate, "yyyy-MM-dd"))
        .lte("data_movimentacao", format(endDate, "yyyy-MM-dd"))
        .order("data_movimentacao");

      if (projectId) {
        query = query.or(`projeto_origem_id.eq.${projectId},projeto_destino_id.eq.${projectId}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by week
      const weeklyData: Record<string, MaterialFlowData> = {};

      data?.forEach((mov) => {
        const date = parseISO(mov.data_movimentacao);
        const weekKey = format(date, "dd/MM", { locale: pt });

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            periodo: weekKey,
            entradas: 0,
            saidas: 0,
            consumos: 0,
            devolucoes: 0,
          };
        }

        const qty = mov.quantidade || 0;
        const tipo = mov.tipo_movimentacao?.toLowerCase() || '';
        
        // Mapear todos os tipos de movimentação incluindo 'transferencia'
        if (tipo === 'entrada') {
          weeklyData[weekKey].entradas += qty;
        } else if (tipo === 'saida' || tipo === 'transferencia') {
          // Transferências são tratadas como saídas do armazém
          weeklyData[weekKey].saidas += qty;
        } else if (tipo === 'consumo') {
          weeklyData[weekKey].consumos += qty;
        } else if (tipo === 'devolucao') {
          weeklyData[weekKey].devolucoes += qty;
        }
      });

      return Object.values(weeklyData);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for top moved materials
export function useTopMaterials(projectId?: number, limit: number = 10) {
  return useQuery({
    queryKey: ["top-materials", projectId, limit],
    queryFn: async (): Promise<TopMaterialData[]> => {
      // Fetch movements with material info
      let query = supabase
        .from("materiais_movimentacoes")
        .select(`
          material_id,
          quantidade,
          materiais_armazem!fk_material_movimentacoes_material(
            id,
            nome_material,
            codigo_interno,
            unidade_medida
          )
        `);

      if (projectId) {
        query = query.or(`projeto_origem_id.eq.${projectId},projeto_destino_id.eq.${projectId}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by material
      const materialTotals: Record<string, { nome: string; codigo: string; total: number; unidade: string }> = {};

      data?.forEach((mov: any) => {
        const material = mov.materiais_armazem;
        if (!material) return;

        const id = mov.material_id;
        if (!materialTotals[id]) {
          materialTotals[id] = {
            nome: material.nome_material,
            codigo: material.codigo_interno,
            total: 0,
            unidade: material.unidade_medida,
          };
        }
        materialTotals[id].total += Math.abs(mov.quantidade || 0);
      });

      return Object.entries(materialTotals)
        .map(([id, data]) => ({
          material_id: id,
          nome: data.nome,
          codigo: data.codigo,
          total_movimentado: data.total,
          unidade: data.unidade,
        }))
        .sort((a, b) => b.total_movimentado - a.total_movimentado)
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for critical stock levels
export function useCriticalStock() {
  const { data: materials, isLoading } = useMaterialsArmazem();

  const criticalData: CriticalStockData[] = (materials || [])
    .map((m) => {
      const stockMinimo = 10; // Default minimum since field doesn't exist
      const percentual = stockMinimo > 0 ? (m.quantidade_stock / stockMinimo) * 100 : 100;
      let status: 'critico' | 'baixo' | 'normal' = 'normal';
      
      if (percentual <= 25) status = 'critico';
      else if (percentual <= 50) status = 'baixo';

      return {
        material_id: m.id,
        nome: m.nome_material,
        codigo: m.codigo_interno,
        stock_atual: m.quantidade_stock,
        stock_minimo: stockMinimo,
        percentual,
        status,
      };
    })
    .filter((m) => m.status !== 'normal')
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, 15);

  return { data: criticalData, isLoading };
}

// Hook for consumption by project (donut chart)
// Uses separate queries to avoid JOIN ambiguity issues
export function useConsumptionByProject() {
  return useQuery({
    queryKey: ["consumption-by-project"],
    queryFn: async (): Promise<ConsumptionByProjectData[]> => {
      // Step 1: Fetch movements (consumo + saida) without problematic JOINs
      const { data: movements, error: movError } = await supabase
        .from("materiais_movimentacoes")
        .select("projeto_destino_id, quantidade, material_id, tipo_movimentacao")
        .in("tipo_movimentacao", ["consumo", "saida"])
        .not("projeto_destino_id", "is", null);

      if (movError) {
        console.error("Error fetching movements:", movError);
        throw movError;
      }

      if (!movements || movements.length === 0) {
        return [];
      }

      // Step 2: Get unique project IDs
      const projectIds = [...new Set(movements.map(m => m.projeto_destino_id).filter(Boolean))] as number[];

      // Step 3: Fetch project names separately
      const { data: projects, error: projError } = await supabase
        .from("projetos")
        .select("id, nome")
        .in("id", projectIds);

      if (projError) {
        console.error("Error fetching projects:", projError);
      }

      // Step 4: Create project name map
      const projectMap: Record<number, string> = {};
      projects?.forEach(p => {
        projectMap[p.id] = p.nome;
      });

      // Step 5: Aggregate by project
      const projectTotals: Record<number, { nome: string; total: number; materiais: Set<string> }> = {};

      movements.forEach((mov) => {
        const projId = mov.projeto_destino_id;
        if (!projId) return;

        if (!projectTotals[projId]) {
          projectTotals[projId] = {
            nome: projectMap[projId] || `Projeto ${projId}`,
            total: 0,
            materiais: new Set(),
          };
        }
        projectTotals[projId].total += mov.quantidade || 0;
        if (mov.material_id) {
          projectTotals[projId].materiais.add(mov.material_id);
        }
      });

      const totalGeral = Object.values(projectTotals).reduce((sum, p) => sum + p.total, 0);

      return Object.entries(projectTotals)
        .map(([id, data]) => ({
          projeto_id: parseInt(id),
          projeto_nome: data.nome,
          total_consumido: data.total,
          materiais_diferentes: data.materiais.size,
          percentual: totalGeral > 0 ? (data.total / totalGeral) * 100 : 0,
        }))
        .sort((a, b) => b.total_consumido - a.total_consumido)
        .slice(0, 8);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for movement timeline
export function useMovementTimeline(projectId?: number, days: number = 30) {
  return useQuery({
    queryKey: ["movement-timeline", projectId, days],
    queryFn: async (): Promise<MovementTimelineData[]> => {
      const startDate = subDays(new Date(), days);

      let query = supabase
        .from("materiais_movimentacoes")
        .select(`
          id,
          data_movimentacao,
          tipo_movimentacao,
          quantidade,
          responsavel,
          materiais_armazem!fk_material_movimentacoes_material(nome_material),
          projetos!materiais_movimentacoes_projeto_destino_id_fkey(nome)
        `)
        .gte("data_movimentacao", format(startDate, "yyyy-MM-dd"))
        .order("data_movimentacao", { ascending: false })
        .limit(50);

      if (projectId) {
        query = query.or(`projeto_origem_id.eq.${projectId},projeto_destino_id.eq.${projectId}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((mov: any) => ({
        id: mov.id,
        data: mov.data_movimentacao,
        tipo: mov.tipo_movimentacao,
        material_nome: mov.materiais_armazem?.nome_material || "Material",
        quantidade: mov.quantidade,
        projeto_destino: mov.projetos?.nome,
        responsavel: mov.responsavel,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}
