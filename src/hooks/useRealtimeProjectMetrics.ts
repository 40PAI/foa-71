import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single consolidated realtime channel per project.
 * Replaces 8 separate channels with one channel + multiple table listeners,
 * dramatically reducing WebSocket overhead and React re-renders.
 */
export function useRealtimeProjectMetrics(projectId?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const invalidateProject = () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-metrics", projectId] });
    };

    const channel = supabase
      .channel(`project-${projectId}-all`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projetos", filter: `id=eq.${projectId}` },
        invalidateProject
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "financas", filter: `id_projeto=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["finances", projectId] });
          invalidateProject();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tarefas_lean", filter: `id_projeto=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
          invalidateProject();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requisicoes", filter: `id_projeto=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["requisitions", projectId] });
          invalidateProject();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "colaboradores_projetos", filter: `projeto_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["employees-by-project", projectId] });
          queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patrimonio", filter: `alocado_projeto_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["patrimony-by-project", projectId] });
          queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ponto_diario", filter: `projeto_id=eq.${projectId}` },
        invalidateProject
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dashboard_kpis", filter: `projeto_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", projectId] });
          queryClient.invalidateQueries({ queryKey: ["project-details", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
}
