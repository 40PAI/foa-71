import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useRegisterWeeklyPPC() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: number) => {
      // Call the function to register weekly PPC entries
      const { error } = await supabase
        .rpc('register_weekly_ppc_entries', { project_id: projectId });

      if (error) throw error;

      // Get the updated weekly PPC data
      const { data, error: fetchError } = await supabase
        .rpc('get_weekly_ppc_data', { project_id: projectId });

      if (fetchError) throw fetchError;
      return data;
    },
    onSuccess: (data, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["ppc-history", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
      
      toast({
        title: "PPCs Semanais Registrados",
        description: `${data?.length || 0} semanas de PPC foram processadas automaticamente.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar PPCs semanais.",
        variant: "destructive",
      });
    },
  });
}

export function useCalculateWeeklyAveragePPC() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: number) => {
      // Calculate weekly average PPC
      const { data, error } = await supabase
        .rpc('calculate_weekly_average_ppc', { project_id: projectId });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
      
      toast({
        title: "PPC Médio Calculado",
        description: `PPC médio semanal: ${data}%`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao calcular PPC médio semanal.",
        variant: "destructive",
      });
    },
  });
}