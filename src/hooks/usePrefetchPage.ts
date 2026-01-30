import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjectContext } from "@/contexts/ProjectContext";

/**
 * Hook para prefetch inteligente de dados de páginas
 * Carrega dados no hover do sidebar para transições instantâneas
 */
export function usePrefetchPage() {
  const queryClient = useQueryClient();
  const { selectedProjectId } = useProjectContext();

  const prefetchDashboard = () => {
    // Prefetch projetos como fallback (RPC pode não existir)
    queryClient.prefetchQuery({
      queryKey: ["projetos"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("projetos")
          .select("*")
          .order("nome", { ascending: true });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  const prefetchProjetos = () => {
    queryClient.prefetchQuery({
      queryKey: ["projetos"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("projetos")
          .select("*")
          .order("nome", { ascending: true });
        if (error) throw error;
        return data;
      },
      staleTime: 3 * 60 * 1000, // 3 minutos
    });
  };

  const prefetchFinancas = () => {
    if (!selectedProjectId) return;

    // Prefetch dados financeiros consolidados (substitui 9 queries individuais)
    queryClient.prefetchQuery({
      queryKey: ["consolidated-financial-data", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc("get_consolidated_financial_data" as any, {
          p_projeto_id: selectedProjectId,
        });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  const prefetchCentrosCusto = () => {
    if (!selectedProjectId) return;

    queryClient.prefetchQuery({
      queryKey: ["movimentos-financeiros", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("movimentos_financeiros")
          .select("*")
          .eq("projeto_id", selectedProjectId)
          .order("data_movimento", { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });

    queryClient.prefetchQuery({
      queryKey: ["centros-custo", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("centros_custo")
          .select("*")
          .eq("projeto_id", selectedProjectId)
          .eq("ativo", true);
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  const prefetchCompras = () => {
    if (!selectedProjectId) return;

    queryClient.prefetchQuery({
      queryKey: ["requisitions", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("requisicoes")
          .select("*")
          .eq("id_projeto", selectedProjectId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  const prefetchArmazem = () => {
    queryClient.prefetchQuery({
      queryKey: ["materials-armazem"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("materiais_armazem")
          .select("*");
        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos (dados estáticos)
    });
  };

  const prefetchRH = () => {
    queryClient.prefetchQuery({
      queryKey: ["employees"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("colaboradores")
          .select("*")
          .order("nome", { ascending: true });
        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos (dados estáticos)
    });
  };

  const prefetchSeguranca = () => {
    if (!selectedProjectId) return;

    queryClient.prefetchQuery({
      queryKey: ["incidents", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("incidentes")
          .select("*")
          .eq("id_projeto", selectedProjectId)
          .order("data_incidente", { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  const prefetchTarefas = () => {
    if (!selectedProjectId) return;

    queryClient.prefetchQuery({
      queryKey: ["tasks", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("tarefas_lean")
          .select("*")
          .eq("id_projeto", selectedProjectId)
          .order("data_inicio_prevista", { ascending: true });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  const prefetchContasFornecedores = () => {
    // Skip prefetch - queries serão carregadas sob demanda
    return;
  };

  const prefetchDividaFOA = () => {
    queryClient.prefetchQuery({
      queryKey: ["resumo-foa-geral"],
      queryFn: async () => {
        const { data, error } = await supabase.rpc("calcular_resumo_foa", {
          p_projeto_id: null,
        });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });

    queryClient.prefetchQuery({
      queryKey: ["reembolsos-foa"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("reembolsos_foa_fof")
          .select("*")
          .order("data_reembolso", { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  return {
    prefetchDashboard,
    prefetchProjetos,
    prefetchFinancas,
    prefetchCentrosCusto,
    prefetchCompras,
    prefetchArmazem,
    prefetchRH,
    prefetchSeguranca,
    prefetchTarefas,
    prefetchContasFornecedores,
    prefetchDividaFOA,
  };
}
