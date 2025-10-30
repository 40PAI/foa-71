
import { useQuery } from "@tanstack/react-query";
import { useProjectDetails } from "./useProjectDetails";
import { useFinancesByProject } from "./useFinances";
import { useEmployeesByProject } from "./useEmployeesByProject";
import { usePatrimonyByProject } from "./usePatrimony";
import { useTasks } from "./useTasks";
import { useProjectMetrics } from "./useProjectMetrics";
import { useMaterialArmazemByProject } from "./useMaterialsArmazem";
import { supabase } from "@/integrations/supabase/client";

export function useProjectChartData(projectId: number) {
  const { data: projectDetails } = useProjectDetails(projectId);
  const { data: finances } = useFinancesByProject(projectId);
  const { data: employees } = useEmployeesByProject(projectId);
  const { data: patrimony } = usePatrimonyByProject(projectId);
  const { data: allTasks } = useTasks(projectId);
  const { data: metrics } = useProjectMetrics(projectId);
  const { data: warehouseMaterials } = useMaterialArmazemByProject(projectId);

  return useQuery({
    queryKey: ["project-chart-data", projectId],
    queryFn: async () => {
      if (!projectDetails) return null;

      // Buscar dados adicionais para gráficos
      const [incidents, requisitions] = await Promise.all([
        supabase
          .from("incidentes")
          .select("*")
          .eq("id_projeto", projectId)
          .order("data", { ascending: true }),
        supabase
          .from("requisicoes")
          .select("*")
          .eq("id_projeto", projectId)
          .order("data_requisicao", { ascending: true })
      ]);

      const tasks = allTasks?.filter(task => task.id_projeto === projectId) || [];

      // Usar métricas automáticas calculadas
      const physicalProgress = metrics?.physicalProgress || projectDetails.project.avanco_fisico;
      const financialProgress = metrics?.financialProgress || projectDetails.project.avanco_financeiro;
      const timeProgress = metrics?.timeProgress || projectDetails.project.avanco_tempo;

      // Calcular métricas específicas
      const calculatePPC = () => {
        const completedOnTime = tasks.filter(task => 
          task.status === "Concluído" && 
          new Date(task.prazo) >= new Date()
        ).length;
        return tasks.length > 0 ? (completedOnTime / tasks.length) * 100 : 0;
      };

      const calculateLeadTime = () => {
        const completedRequisitions = requisitions.data?.filter(req => 
          req.status_fluxo === "Recepcionado" || req.status_fluxo === "Liquidado"
        ) || [];
        
        if (completedRequisitions.length === 0) return 0;
        
        const totalDays = completedRequisitions.reduce((acc, req) => {
          const start = new Date(req.data_requisicao);
          const end = new Date(req.updated_at!);
          return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        
        return totalDays / completedRequisitions.length;
      };

      const calculateUtilizationRate = () => {
        const inUse = patrimony?.filter(p => p.status === "Em Uso").length || 0;
        const total = patrimony?.length || 0;
        return total > 0 ? (inUse / total) * 100 : 0;
      };

      // Dados para S-Curve usando métricas automáticas
      const sCurveData = [
        { 
          periodo: "Início", 
          fisico: 0, 
          financeiro: 0, 
          tempo: 0 
        },
        { 
          periodo: "Atual", 
          fisico: physicalProgress, 
          financeiro: financialProgress, 
          tempo: timeProgress 
        },
        { 
          periodo: "Meta", 
          fisico: 100, 
          financeiro: 100, 
          tempo: 100 
        }
      ];

      // Dados financeiros por categoria
      const financeData = finances?.map(finance => ({
        categoria: finance.categoria,
        orcamentado: finance.orcamentado,
        gasto: finance.gasto,
        desvio: finance.gasto - finance.orcamentado
      })) || [];

      // Dados de incidentes por mês
      const incidentData = incidents.data?.reduce((acc, incident) => {
        const month = new Date(incident.data).toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
        const existing = acc.find(item => item.mes === month);
        
        if (existing) {
          existing.total += 1;
          existing[incident.tipo.toLowerCase()] = (existing[incident.tipo.toLowerCase()] || 0) + 1;
        } else {
          acc.push({
            mes: month,
            total: 1,
            [incident.tipo.toLowerCase()]: 1
          });
        }
        
        return acc;
      }, [] as any[]) || [];

      // Dados para burndown de tarefas
      const burndownData = tasks.map((task, index) => ({
        tarefa: `Tarefa ${index + 1}`,
        planejado: 100 - ((index + 1) / tasks.length) * 100,
        real: task.percentual_conclusao,
        status: task.status
      }));

      // Processar dados de materiais de armazém do projeto
      const materialsDisponivel = warehouseMaterials?.filter(m => m.status_item === "Disponível").length || 0;
      const materialsEmUso = warehouseMaterials?.filter(m => m.status_item === "Em uso").length || 0;
      const materialsReservado = warehouseMaterials?.filter(m => m.status_item === "Reservado").length || 0;
      const materialsTotal = warehouseMaterials?.length || 0;

      // Agrupar materiais por categoria
      const materialsByCategory = warehouseMaterials?.reduce((acc, material) => {
        const categoria = material.categoria_principal || "Sem Categoria";
        const existing = acc.find(item => item.categoria === categoria);
        
        if (existing) {
          existing.quantidade += 1;
          existing.quantidadeStock += material.quantidade_stock;
        } else {
          acc.push({
            categoria,
            quantidade: 1,
            quantidadeStock: material.quantidade_stock
          });
        }
        
        return acc;
      }, [] as any[]) || [];

      return {
        project: projectDetails.project,
        summary: projectDetails.summary,
        metrics: {
          ...metrics,
          physicalProgress,
          financialProgress,
          timeProgress
        },
        kpis: {
          ppc: calculatePPC(),
          leadTime: calculateLeadTime(),
          utilizationRate: calculateUtilizationRate(),
        },
        chartData: {
          sCurve: sCurveData,
          finance: financeData,
          incidents: incidentData,
          burndown: burndownData,
          patrimony: patrimony || [],
          employees: employees || [],
          tasks,
          requisitions: requisitions.data || [],
          warehouseMaterials: {
            total: materialsTotal,
            disponivel: materialsDisponivel,
            emUso: materialsEmUso,
            reservado: materialsReservado,
            byCategory: materialsByCategory,
            materials: warehouseMaterials || []
          }
        }
      };
    },
    enabled: !!projectId && !!projectDetails,
  });
}
