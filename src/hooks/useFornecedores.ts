import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Fornecedor, ContratoFornecedor, FornecedoresKPIs } from "@/types/contasCorrentes";

// Fetch all suppliers
export function useFornecedores(projectId?: number) {
  return useQuery({
    queryKey: ["fornecedores", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Fornecedor[];
    },
  });
}

// Fetch single supplier
export function useFornecedor(fornecedorId?: string) {
  return useQuery({
    queryKey: ["fornecedores", fornecedorId],
    queryFn: async () => {
      if (!fornecedorId) return null;
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .eq("id", fornecedorId)
        .single();
      if (error) throw error;
      return data as Fornecedor;
    },
    enabled: !!fornecedorId,
  });
}

// Create supplier
export function useCreateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fornecedor: Omit<Fornecedor, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("fornecedores")
        .insert(fornecedor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar fornecedor: ${error.message}`);
    },
  });
}

// Update supplier
export function useUpdateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fornecedor> & { id: string }) => {
      const { data, error } = await supabase
        .from("fornecedores")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar fornecedor: ${error.message}`);
    },
  });
}

// Delete supplier
export function useDeleteFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fornecedores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir fornecedor: ${error.message}`);
    },
  });
}

// Fetch supplier contracts
export function useContratosFornecedor(fornecedorId?: string) {
  return useQuery({
    queryKey: ["contratos_fornecedores", fornecedorId],
    queryFn: async () => {
      if (!fornecedorId) return [];
      const { data, error } = await supabase
        .from("contratos_fornecedores")
        .select("*")
        .eq("fornecedor_id", fornecedorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContratoFornecedor[];
    },
    enabled: !!fornecedorId,
  });
}

// Fetch all supplier contracts by project
export function useContratosFornecedoresByProject(projectId?: number) {
  return useQuery({
    queryKey: ["contratos_fornecedores", "project", projectId],
    queryFn: async () => {
      let query = supabase
        .from("contratos_fornecedores")
        .select(`
          *,
          fornecedor:fornecedores(nome, nif, tipo_fornecedor)
        `)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Create supplier contract
export function useCreateContratoFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contrato: Omit<ContratoFornecedor, "id" | "created_at" | "updated_at" | "saldo_pagar">) => {
      const { data, error } = await supabase
        .from("contratos_fornecedores")
        .insert(contrato)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos_fornecedores"] });
      toast.success("Contrato criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar contrato: ${error.message}`);
    },
  });
}

// Update supplier contract
export function useUpdateContratoFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContratoFornecedor> & { id: string }) => {
      const { data, error } = await supabase
        .from("contratos_fornecedores")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos_fornecedores"] });
      toast.success("Contrato atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar contrato: ${error.message}`);
    },
  });
}

// Delete supplier contract
export function useDeleteContratoFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contratos_fornecedores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos_fornecedores"] });
      toast.success("Contrato excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir contrato: ${error.message}`);
    },
  });
}

// Fetch suppliers KPIs
export function useFornecedoresKPIs(projectId?: number) {
  return useQuery({
    queryKey: ["fornecedores_kpis", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_fornecedores_kpis", {
        project_id: projectId || null,
      });
      if (error) throw error;
      return (data && data.length > 0 ? data[0] : {
        total_fornecedores: 0,
        total_contratado: 0,
        total_pago: 0,
        saldo_pagar: 0,
        taxa_pagamento: 0,
        prazo_medio_pagamento: 0,
      }) as FornecedoresKPIs;
    },
  });
}
