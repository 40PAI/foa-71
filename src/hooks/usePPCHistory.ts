import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PPCHistoryEntry {
  semana_inicio: string;
  semana_fim: string;
  ppc_percentual: number;
  tarefas_programadas: number;
  tarefas_concluidas: number;
  status_ppc: string;
}

export function usePPCHistory(projectId?: number) {
  return useQuery({
    queryKey: ["ppc-history", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Use the new function to get weekly PPC data with status
      const { data, error } = await supabase
        .rpc("get_weekly_ppc_data", { project_id: projectId });

      if (error) throw error;
      return data as PPCHistoryEntry[];
    },
    enabled: !!projectId,
  });
}

export function useCreatePPCEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      periodoInicio,
      periodoFim,
    }: {
      projectId: number;
      periodoInicio: string;
      periodoFim: string;
    }) => {
      // Calculate PPC for the period
      const { data: ppcData, error: ppcError } = await supabase
        .rpc('calculate_project_ppc', { project_id: projectId });

      if (ppcError) throw ppcError;

      // Count tasks for the period
      const { data: tasks, error: tasksError } = await supabase
        .from("tarefas_lean")
        .select("*")
        .eq("id_projeto", projectId)
        .gte("prazo", periodoInicio)
        .lte("prazo", periodoFim);

      if (tasksError) throw tasksError;

      const totalTasks = tasks.length;
      const completedOnTime = tasks.filter(
        task => task.status === 'Concluído' && 
        new Date(task.updated_at).toISOString().split('T')[0] <= task.prazo
      ).length;

      // Insert PPC history entry
      const { data, error } = await supabase
        .from("ppc_historico")
        .insert({
          projeto_id: projectId,
          periodo_inicio: periodoInicio,
          periodo_fim: periodoFim,
          ppc_percentual: ppcData || 0,
          tarefas_programadas: totalTasks,
          tarefas_concluidas_prazo: completedOnTime,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ppc-history", data.projeto_id] });
      toast({
        title: "Entrada PPC Criada",
        description: `PPC de ${data.ppc_percentual}% registrado para o período.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar entrada de PPC.",
        variant: "destructive",
      });
    },
  });
}