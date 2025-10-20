import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CashFlowMovement, CashFlowSummary } from '@/types/cashflow';
import { toast } from 'sonner';

// Fetch all movements
export function useCashFlowMovements(projectId?: number) {
  return useQuery({
    queryKey: ['cashflow-movements', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fluxo_caixa')
        .select('*')
        .eq('projeto_id', projectId!)
        .order('data_movimento', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CashFlowMovement[];
    },
    enabled: !!projectId,
  });
}

// Fetch summary
export function useCashFlowSummary(projectId?: number) {
  return useQuery({
    queryKey: ['cashflow-summary', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_fluxo_caixa_summary', { project_id: projectId });
      
      if (error) throw error;
      return data[0] as CashFlowSummary;
    },
    enabled: !!projectId,
  });
}

// Create movement
export function useCreateCashFlowMovement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movement: Omit<CashFlowMovement, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('fluxo_caixa')
        .insert(movement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashflow-movements', variables.projeto_id] });
      queryClient.invalidateQueries({ queryKey: ['cashflow-summary', variables.projeto_id] });
      toast.success('Movimento registrado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating cash flow movement:', error);
      toast.error('Erro ao registrar movimento');
    },
  });
}

// Update movement
export function useUpdateCashFlowMovement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...movement }: CashFlowMovement) => {
      const { data, error } = await supabase
        .from('fluxo_caixa')
        .update(movement)
        .eq('id', id!)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cashflow-movements', data.projeto_id] });
      queryClient.invalidateQueries({ queryKey: ['cashflow-summary', data.projeto_id] });
      toast.success('Movimento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating cash flow movement:', error);
      toast.error('Erro ao atualizar movimento');
    },
  });
}

// Delete movement
export function useDeleteCashFlowMovement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: number }) => {
      const { error } = await supabase
        .from('fluxo_caixa')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, projeto_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cashflow-movements', data.projeto_id] });
      queryClient.invalidateQueries({ queryKey: ['cashflow-summary', data.projeto_id] });
      toast.success('Movimento excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting cash flow movement:', error);
      toast.error('Erro ao excluir movimento');
    },
  });
}
