
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useUpdateProjectMetrics() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: number) => {
      console.log('Iniciando atualização de métricas para projeto:', projectId);
      
      // Use the updated integrated financial function
      const { error } = await supabase
        .rpc('update_project_metrics_with_integrated_finance', { project_id: projectId });

      if (error) {
        console.error('Erro ao atualizar métricas:', error);
        throw error;
      }

      // Fetch updated project data to confirm changes
      const { data, error: fetchError } = await supabase
        .from("projetos")
        .select(`
          id,
          nome,
          avanco_fisico,
          avanco_financeiro,
          avanco_tempo,
          gasto,
          orcamento
        `)
        .eq("id", projectId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar dados atualizados:', fetchError);
        throw fetchError;
      }

      console.log('Métricas atualizadas com sucesso:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Projeto atualizado:', data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-metrics", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-details", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-chart-data", data.id] });
      queryClient.invalidateQueries({ queryKey: ["project-stages", data.id] });
      queryClient.invalidateQueries({ queryKey: ["integrated-financial-progress", data.id] });
      queryClient.invalidateQueries({ queryKey: ["detailed-expense-breakdown", data.id] });
      
      toast({
        title: "Métricas Atualizadas",
        description: `Avanço Financeiro: ${data.avanco_financeiro}% | Gasto: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(data.gasto)}`,
      });
    },
    onError: (error) => {
      console.error('Erro completo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar métricas do projeto. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    },
  });
}
