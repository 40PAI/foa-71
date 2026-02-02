
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedQuery } from "./useOptimizedQuery";

interface PendingApproval {
  id: number;
  nome_comercial_produto: string;
  categoria_principal: string;
  valor: number;
  status_fluxo: string;
  data_requisicao: string;
  requisitante: string;
  urgencia_prioridade: string;
}

interface FinancialDiscrepancy {
  categoria: string;
  gasto_manual: number;
  gasto_calculado: number;
  discrepancia: number;
  percentual_discrepancia: number;
}

// Optimized hook for pending approvals
export function useOptimizedPendingApprovals(projectId?: number) {
  return useOptimizedQuery<PendingApproval[]>({
    queryKey: ["pending-approvals-optimized", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      console.log('Fetching pending approvals for project:', projectId);
      
      const { data, error } = await supabase
        .rpc('get_pending_approvals', { project_id: projectId });
      
      if (error) {
        console.error('Pending approvals error:', error);
        return [];
      }
      
      // Converter valores para números para garantir compatibilidade
      const processedData = (data || []).map(item => ({
        id: item.id,
        nome_comercial_produto: item.nome_comercial_produto,
        categoria_principal: item.categoria_principal,
        valor: Number(item.valor) || 0,
        status_fluxo: item.status_fluxo,
        data_requisicao: item.data_requisicao,
        requisitante: item.requisitante,
        urgencia_prioridade: item.urgencia_prioridade,
      }));
      
      console.log('Processed pending approvals data:', processedData);
      return processedData;
    },
    projectSpecific: true,
    enabled: !!projectId,
    gcTime: 30 * 1000, // 30 seconds for approval data
  });
}

// Optimized hook for financial discrepancies
export function useOptimizedFinancialDiscrepancies(projectId?: number) {
  return useOptimizedQuery<FinancialDiscrepancy[]>({
    queryKey: ["financial-discrepancies-optimized", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .rpc('detect_financial_discrepancies', { p_project_id: projectId });
      
      if (error) {
        console.error('Financial discrepancies error:', error);
        return [];
      }
      
      // Converter valores para números para garantir compatibilidade
      const processedData = (data || []).map(item => ({
        categoria: item.categoria,
        gasto_manual: Number(item.gasto_manual) || 0,
        gasto_calculado: Number(item.gasto_calculado) || 0,
        discrepancia: Number(item.discrepancia) || 0,
        percentual_discrepancia: Number(item.percentual_discrepancia) || 0,
      }));
      
      return processedData;
    },
    projectSpecific: true,
    enabled: !!projectId,
    gcTime: 60 * 1000, // 1 minute for discrepancy data
  });
}

// Optimized mutation for approvals
export function useOptimizedApproveRequisition() {
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
      console.log('Iniciando mutação:', { requisitionId, newStatus, approveQuality });
      
      // Validar se o status é válido antes de fazer a requisição
      const validStatuses = ['Pendente', 'Cotações', 'Aprovação Qualidade', 'Aprovação Direção', 'OC Gerada', 'Recepcionado', 'Liquidado', 'Rejeitado'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Status '${newStatus}' não é válido`);
      }
      
      const updates: any = { status_fluxo: newStatus };
      if (approveQuality) {
        updates.aprovacao_qualidade = true;
      }
      
      console.log('Executando update na base de dados:', updates);
      
      const { data, error } = await supabase
        .from("requisicoes")
        .update(updates)
        .eq("id", requisitionId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro na base de dados:', error);
        
        // Mensagens de erro mais específicas
        if (error.code === 'PGRST116') {
          throw new Error('Requisição não encontrada');
        } else if (error.code === '23514') {
          throw new Error('Status inválido para esta requisição');
        } else if (error.message.includes('status_fluxo')) {
          throw new Error(`Status '${newStatus}' não é válido`);
        } else {
          throw new Error(`Erro na base de dados: ${error.message}`);
        }
      }
      
      if (!data) {
        throw new Error('Nenhuma requisição foi atualizada');
      }
      
      console.log('Requisição atualizada com sucesso:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Sucesso na mutação, invalidando queries');
      
      // Selective invalidation for better performance
      const projectId = data.id_projeto;
      
      // Only invalidate specific queries
      queryClient.invalidateQueries({ 
        queryKey: ["pending-approvals-optimized", projectId],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["purchase-breakdown-optimized", projectId],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["financial-discrepancies-optimized", projectId],
        exact: false 
      });
      
      // Update cache directly for immediate UI response
      queryClient.setQueryData(
        ["pending-approvals-optimized", projectId],
        (old: PendingApproval[]) => old?.filter(item => item.id !== data.id) || []
      );
    },
    onError: (error) => {
      console.error('Erro na mutação:', error);
    }
  });
}

// Optimized selective realtime sync
export function useOptimizedRealtimeSync(projectId?: number, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const debouncedInvalidate = useCallback(
    debounce((queries: string[]) => {
      console.log('Debounced invalidation for queries:', queries);
      queries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey, projectId] });
      });
    }, 1000),
    [queryClient, projectId]
  );

  useEffect(() => {
    if (!enabled || !projectId) return;

    console.log('Setting up realtime sync for project:', projectId);

    const channel = supabase
      .channel(`financial-sync-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requisicoes',
          filter: `id_projeto=eq.${projectId}`
        },
        (payload) => {
          console.log('Requisition updated (optimized):', payload.eventType);
          debouncedInvalidate(['pending-approvals-optimized', 'purchase-breakdown-optimized']);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime sync');
      supabase.removeChannel(channel);
    };
  }, [projectId, enabled, debouncedInvalidate]);
}

// Debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
