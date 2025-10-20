
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type DailyTimeEntry = Tables<"ponto_diario">;
type DailyTimeInsert = TablesInsert<"ponto_diario">;
type DailyTimeUpdate = TablesUpdate<"ponto_diario">;

export function useDailyTimeByProject(projectId: number, month: number, year: number = new Date().getFullYear()) {
  return useQuery({
    queryKey: ["daily-time", projectId, month, year],
    queryFn: async () => {
      console.log('Fetching daily time for project:', projectId, 'month:', month, 'year:', year);
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const { data, error } = await supabase
        .from("ponto_diario")
        .select(`
          *,
          colaborador:colaboradores!ponto_diario_colaborador_id_fkey(nome, numero_funcional, cargo)
        `)
        .eq("projeto_id", projectId)
        .gte("data", startDate.toISOString().split('T')[0])
        .lte("data", endDate.toISOString().split('T')[0])
        .order("data", { ascending: true });
      
      if (error) {
        console.error('Error fetching daily time:', error);
        throw error;
      }
      
      console.log('Daily time data fetched:', data);
      return data;
    },
    enabled: !!projectId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useEmployeesByProject(projectId: number) {
  return useQuery({
    queryKey: ["employees-by-project", projectId],
    queryFn: async () => {
      console.log('Fetching employees for project:', projectId);
      
      const { data, error } = await supabase
        .from("colaboradores")
        .select("*")
        .eq("projeto_id", projectId)
        .order("nome");
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      
      console.log('Employees data fetched:', data);
      return data;
    },
    enabled: !!projectId,
    refetchOnMount: true,
  });
}

export function useUpsertDailyTime() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (timeEntry: DailyTimeInsert) => {
      console.log('Upserting time entry:', timeEntry);
      
      const { data, error } = await supabase
        .from("ponto_diario")
        .upsert(timeEntry, {
          onConflict: "colaborador_id,projeto_id,data"
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error upserting time entry:', error);
        throw error;
      }
      
      console.log('Time entry upserted successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Invalidating queries after upsert...');
      
      // Invalidate all daily-time queries for this project
      queryClient.invalidateQueries({ 
        queryKey: ["daily-time", variables.projeto_id] 
      });
      
      // Refetch specific query for current month/year
      const currentDate = new Date(variables.data);
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      
      queryClient.invalidateQueries({ 
        queryKey: ["daily-time", variables.projeto_id, month, year] 
      });
      
      // Force refetch of employees for this project
      queryClient.invalidateQueries({ 
        queryKey: ["employees-by-project", variables.projeto_id] 
      });
      
      console.log('Queries invalidated successfully');
    },
    onError: (error) => {
      console.error('Upsert mutation error:', error);
    }
  });
}

export function useUpdateDailyTime() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      colaboradorId, 
      projetoId, 
      data, 
      horaEntrada, 
      horaSaida, 
      status 
    }: {
      colaboradorId: number;
      projetoId: number;
      data: string;
      horaEntrada?: string;
      horaSaida?: string;
      status?: string;
    }) => {
      console.log('Updating time entry:', {
        colaboradorId,
        projetoId, 
        data,
        horaEntrada,
        horaSaida,
        status
      });

      const updateData: any = {};
      if (horaEntrada !== undefined) updateData.hora_entrada = horaEntrada;
      if (horaSaida !== undefined) updateData.hora_saida = horaSaida;
      if (status !== undefined) updateData.status = status;

      const { data: result, error } = await supabase
        .from("ponto_diario")
        .upsert({
          colaborador_id: colaboradorId,
          projeto_id: projetoId,
          data: data,
          ...updateData
        }, {
          onConflict: "colaborador_id,projeto_id,data"
        })
        .select(`
          *,
          colaborador:colaboradores!ponto_diario_colaborador_id_fkey(nome, numero_funcional, cargo)
        `)
        .single();
      
      if (error) {
        console.error('Error updating time entry:', error);
        throw error;
      }
      
      console.log('Time entry updated successfully:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('Invalidating queries after update...');
      
      // Get date information for targeted invalidation
      const currentDate = new Date(variables.data);
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ 
        queryKey: ["daily-time"] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ["employees-by-project"] 
      });
      
      // Force immediate refetch of the specific query
      queryClient.refetchQueries({ 
        queryKey: ["daily-time", variables.projetoId, month, year],
        exact: true
      });
      
      console.log('Queries invalidated and refetched successfully');
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
    }
  });
}
