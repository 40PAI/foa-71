
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type DashboardKpi = Tables<"dashboard_kpis">;
type DashboardKpiInsert = TablesInsert<"dashboard_kpis">;
type DashboardKpiUpdate = TablesUpdate<"dashboard_kpis">;

export function useDashboardKpis() {
  return useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_kpis")
        .select(`
          *,
          projeto:projetos!fk_dashboard_kpis_projeto(nome)
        `)
        .order("data_calculo", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useDashboardKpisByProject(projectId?: number) {
  return useQuery({
    queryKey: ["dashboard-kpis", "project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_kpis")
        .select("*")
        .eq("projeto_id", projectId)
        .order("data_calculo", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useCreateDashboardKpi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kpi: DashboardKpiInsert) => {
      const { data, error } = await supabase
        .from("dashboard_kpis")
        .insert(kpi)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
    },
  });
}

export function useUpdateDashboardKpi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: DashboardKpiUpdate & { id: number }) => {
      const { data, error } = await supabase
        .from("dashboard_kpis")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
    },
  });
}
