import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeProjectMetrics(projectId?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const channels = [
      // Project changes
      supabase
        .channel(`project-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projetos',
            filter: `id=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
          }
        )
        .subscribe(),

      // Financial changes
      supabase
        .channel(`finances-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'financas',
            filter: `id_projeto=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["finances", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
          }
        )
        .subscribe(),

      // Tasks changes
      supabase
        .channel(`tasks-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tarefas_lean',
            filter: `id_projeto=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
          }
        )
        .subscribe(),

      // Requisitions changes (affects financial calculations)
      supabase
        .channel(`requisitions-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'requisicoes',
            filter: `id_projeto=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["requisitions", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
          }
        )
        .subscribe(),

      // Employee allocation changes
      supabase
        .channel(`employees-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'colaboradores_projetos',
            filter: `projeto_id=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["employees-by-project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
          }
        )
        .subscribe(),

      // Patrimony allocation changes
      supabase
        .channel(`patrimony-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patrimonio',
            filter: `alocado_projeto_id=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["patrimony-by-project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
          }
        )
        .subscribe(),

      // Daily attendance changes
      supabase
        .channel(`attendance-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ponto_diario',
            filter: `projeto_id=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
          }
        )
        .subscribe(),

      // Dashboard KPIs changes
      supabase
        .channel(`kpis-${projectId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dashboard_kpis',
            filter: `projeto_id=eq.${projectId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [projectId, queryClient]);
}