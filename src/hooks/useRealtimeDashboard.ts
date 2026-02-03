import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Configurando realtime para dashboard...');

    const projectsChannel = supabase
      .channel('dashboard-projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projetos',
        },
        () => {
          console.log('📊 Projeto atualizado - invalidando dashboard');
          queryClient.invalidateQueries({ queryKey: ['dashboard-geral'] });
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('dashboard-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tarefas_lean',
        },
        () => {
          console.log('✅ Tarefa atualizada - invalidando dashboard');
          queryClient.invalidateQueries({ queryKey: ['dashboard-geral'] });
        }
      )
      .subscribe();

    // NOVO: Escutar mudanças na tabela de requisições
    const requisitionsChannel = supabase
      .channel('dashboard-requisitions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requisicoes',
        },
        () => {
          console.log('🛒 Requisição atualizada - invalidando dashboard e finanças');
          queryClient.invalidateQueries({ queryKey: ['dashboard-geral'] });
          queryClient.invalidateQueries({ queryKey: ['consolidated-financial-data'] });
          queryClient.invalidateQueries({ queryKey: ['requisitions'] });
          queryClient.invalidateQueries({ queryKey: ['pending-approvals-optimized'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(requisitionsChannel);
    };
  }, [queryClient]);
}
