import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Hook para obter requisições pendentes de aprovação
export function usePendingApprovals(projectId: number) {
  return useQuery({
    queryKey: ["pending-approvals", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_pending_approvals', { project_id: projectId });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

// Hook para detectar discrepâncias financeiras
export function useFinancialDiscrepancies(projectId: number) {
  return useQuery({
    queryKey: ["financial-discrepancies", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('detect_financial_discrepancies', { project_id: projectId });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

// Hook para aprovar/rejeitar requisições
export function useApproveRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      requisitionId, 
      newStatus,
      approveQuality = false 
    }: { 
      requisitionId: number; 
      newStatus: string;
      approveQuality?: boolean;
    }) => {
      const updates: any = { status_fluxo: newStatus };
      if (approveQuality) {
        updates.aprovacao_qualidade = true;
      }
      
      const { data, error } = await supabase
        .from("requisicoes")
        .update(updates)
        .eq("id", requisitionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-breakdown"] });
    },
  });
}

// Hook para escutar mudanças em tempo real
export function useRealtimeFinancialSync(projectId: number, enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !projectId) return;

    const channel = supabase
      .channel('financial-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requisicoes',
          filter: `id_projeto=eq.${projectId}`
        },
        (payload) => {
          console.log('Requisition updated:', payload);
          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ["pending-approvals", projectId] });
          queryClient.invalidateQueries({ queryKey: ["purchase-breakdown", projectId] });
          queryClient.invalidateQueries({ queryKey: ["requisitions"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financas',
          filter: `id_projeto=eq.${projectId}`
        },
        (payload) => {
          console.log('Finance updated:', payload);
          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ["finances", "project", projectId] });
          queryClient.invalidateQueries({ queryKey: ["financial-discrepancies", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, enabled, queryClient]);
}