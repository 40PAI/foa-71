import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjectContext } from "@/contexts/ProjectContext";

// ============================================
// PRELOAD JS CHUNKS (carrega código antes do clique)
// ============================================
const preloadChunks = {
  dashboard: () => import("@/pages/DashboardGeralPage"),
  projetos: () => import("@/pages/ProjetosPage"),
  financas: () => import("@/pages/FinancasPage"),
  centrosCusto: () => import("@/pages/CentrosCustoPage"),
  contasFornecedores: () => import("@/pages/ContasFornecedoresPage"),
  gastosObra: () => import("@/pages/GastosObraPage"),
  compras: () => import("@/pages/ComprasPage"),
  armazem: () => import("@/pages/ArmazemPage"),
  rh: () => import("@/pages/RhPage"),
  seguranca: () => import("@/pages/SegurancaPage"),
  tarefas: () => import("@/pages/TarefasPage"),
  graficos: () => import("@/pages/GraficosPage"),
  usuarios: () => import("@/pages/UserManagementPage"),
  dividaFOA: () => import("@/pages/DividaFOAPage"),
};

// Preload all critical chunks immediately after login
export function preloadAllCriticalChunks() {
  Object.values(preloadChunks).forEach(preload => preload());
}

/**
 * Hook para prefetch inteligente de dados de páginas
 * Carrega CÓDIGO JS + DADOS no hover/touch para transições instantâneas
 */
export function usePrefetchPage() {
  const queryClient = useQueryClient();
  const { selectedProjectId } = useProjectContext();

  const prefetchDashboard = () => {
    // Preload código JS
    preloadChunks.dashboard();
    
    // Prefetch dados
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
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchProjetos = () => {
    preloadChunks.projetos();
    
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
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchFinancas = () => {
    preloadChunks.financas();
    
    if (!selectedProjectId) return;

    queryClient.prefetchQuery({
      queryKey: ["consolidated-financial-data", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc("get_consolidated_financial_data" as any, {
          p_projeto_id: selectedProjectId,
        });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchCentrosCusto = () => {
    preloadChunks.centrosCusto();
    
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
      staleTime: 2 * 60 * 1000,
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
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchCompras = () => {
    preloadChunks.compras();
    
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
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchArmazem = () => {
    preloadChunks.armazem();
    
    queryClient.prefetchQuery({
      queryKey: ["materials-armazem"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("materiais_armazem")
          .select("*");
        if (error) throw error;
        return data;
      },
      staleTime: 3 * 60 * 1000,
    });
  };

  const prefetchRH = () => {
    preloadChunks.rh();
    
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
      staleTime: 3 * 60 * 1000,
    });
  };

  const prefetchSeguranca = () => {
    preloadChunks.seguranca();
    
    if (!selectedProjectId) return;

    queryClient.prefetchQuery({
      queryKey: ["incidents", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("incidentes")
          .select("*")
          .eq("id_projeto", selectedProjectId)
          .order("data", { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchTarefas = () => {
    preloadChunks.tarefas();
    
    if (!selectedProjectId) return;

    queryClient.prefetchQuery({
      queryKey: ["tasks", selectedProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("tarefas_lean")
          .select("*")
          .eq("id_projeto", selectedProjectId)
          .order("prazo", { ascending: true });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchContasFornecedores = () => {
    preloadChunks.contasFornecedores();
  };

  const prefetchDividaFOA = () => {
    preloadChunks.dividaFOA();
    
    queryClient.prefetchQuery({
      queryKey: ["resumo-foa-geral"],
      queryFn: async () => {
        const { data, error } = await supabase.rpc("calcular_resumo_foa", {
          p_projeto_id: null,
        });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000,
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
      staleTime: 2 * 60 * 1000,
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
