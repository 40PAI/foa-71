import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const invalidateRealtimeData = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['dashboard-geral'] });
  queryClient.invalidateQueries({ queryKey: ['projects'] });
  queryClient.invalidateQueries({ queryKey: ['projetos'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
  queryClient.invalidateQueries({ queryKey: ['consolidated-financial-data'] });
};

export function useRealtimeDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Configurando realtime para dashboard...');

    const channelName = `dashboard-realtime-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const dashboardChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projetos',
        },
        () => {
          console.log('📊 Projeto atualizado - invalidando dados relacionados');
          invalidateRealtimeData(queryClient);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tarefas_lean',
        },
        () => {
          console.log('✅ Tarefa atualizada - invalidando dashboard e projetos');
          invalidateRealtimeData(queryClient);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requisicoes',
        },
        () => {
          console.log('🛒 Requisição atualizada - invalidando dashboard e finanças');
          invalidateRealtimeData(queryClient);
          queryClient.invalidateQueries({ queryKey: ['requisitions'] });
          queryClient.invalidateQueries({ queryKey: ['pending-approvals-optimized'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'movimentos_financeiros',
        },
        () => {
          console.log('💰 Movimento financeiro atualizado - invalidando dashboard e finanças');
          invalidateRealtimeData(queryClient);
          queryClient.invalidateQueries({ queryKey: ['movimentos-financeiros'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dashboardChannel);
    };
  }, [queryClient]);
}
