import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HRAnalytics {
  attendance_by_front: Array<{
    data: string;
    frente: string;
    percentual_presenca: number;
    total_colaboradores: number;
    presentes: number;
  }>;
  work_hours_by_type: Array<{
    tipo_colaborador: string;
    horas_trabalhadas: number;
    numero_colaboradores: number;
    custo_total: number;
  }>;
  hr_kpis: {
    total_atrasos: number;
    total_faltas: number;
    horas_extras: number;
    absentismo_percentual: number;
    variacao_semanal_atrasos: number;
    variacao_semanal_faltas: number;
  };
  attendance_trend: Array<{
    semana: string;
    assiduidade: number;
    meta: number;
  }>;
}

export function useHRAnalytics(projectId?: number) {
  return useQuery({
    queryKey: ["hr-analytics", projectId],
    queryFn: async (): Promise<HRAnalytics> => {
      if (!projectId) {
        return {
          attendance_by_front: [],
          work_hours_by_type: [],
          hr_kpis: {
            total_atrasos: 0,
            total_faltas: 0,
            horas_extras: 0,
            absentismo_percentual: 0,
            variacao_semanal_atrasos: 0,
            variacao_semanal_faltas: 0,
          },
          attendance_trend: [],
        };
      }

      const { data, error } = await supabase
        .rpc('get_hr_analytics', { project_id: projectId });
      
      if (error) {
        console.error('HR analytics error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          attendance_by_front: [],
          work_hours_by_type: [],
          hr_kpis: {
            total_atrasos: 0,
            total_faltas: 0,
            horas_extras: 0,
            absentismo_percentual: 0,
            variacao_semanal_atrasos: 0,
            variacao_semanal_faltas: 0,
          },
          attendance_trend: [],
        };
      }

      const result = data[0];
      const hrKpis = result.hr_kpis as any || {};
      
      // Transformar dados para corresponder à interface existente
      const attendanceByFront = Array.isArray(result.attendance_by_front) 
        ? (result.attendance_by_front as any[]).map((item, index) => ({
            data: new Date().toISOString().split('T')[0],
            frente: item.frente || `Frente ${index + 1}`,
            percentual_presenca: item.presencas > 0 ? 
              Math.round((item.presencas / (item.presencas + item.faltas + item.atrasos)) * 100) : 0,
            total_colaboradores: item.presencas + item.faltas + item.atrasos,
            presentes: item.presencas || 0,
          }))
        : [];

      const workHoursByType = Array.isArray(result.work_hours_by_type)
        ? (result.work_hours_by_type as any[]).map(item => ({
            tipo_colaborador: item.tipo_horario || 'Indefinido',
            horas_trabalhadas: item.total_horas || 0,
            numero_colaboradores: item.colaboradores || 0,
            custo_total: (item.total_horas || 0) * 25, // Estimativa de custo por hora
          }))
        : [];

      const attendanceTrend = Array.isArray(result.attendance_trends)
        ? (result.attendance_trends as any[]).map(item => ({
            semana: item.semana || 'S1',
            assiduidade: item.taxa_presenca || 0,
            meta: 85,
          }))
        : [];

      return {
        attendance_by_front: attendanceByFront,
        work_hours_by_type: workHoursByType,
        hr_kpis: {
          total_atrasos: hrKpis.total_atrasos || 0,
          total_faltas: hrKpis.total_faltas || 0,
          horas_extras: 0, // Não implementado na RPC
          absentismo_percentual: hrKpis.total_faltas > 0 ? 
            Math.round((hrKpis.total_faltas / (hrKpis.total_faltas + hrKpis.produtividade_score)) * 100) : 0,
          variacao_semanal_atrasos: 0, // Não implementado na RPC
          variacao_semanal_faltas: 0, // Não implementado na RPC
        },
        attendance_trend: attendanceTrend,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  });
}