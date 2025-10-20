import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Cliente, ContratoCliente, ClientesKPIs } from "@/types/contasCorrentes";

// Fetch all clients
export function useClientes(projectId?: number) {
  return useQuery({
    queryKey: ["clientes", projectId],
    queryFn: async () => {
      let query = supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Cliente[];
    },
  });
}

// Fetch single client
export function useCliente(clienteId?: string) {
  return useQuery({
    queryKey: ["clientes", clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", clienteId)
        .single();
      if (error) throw error;
      return data as Cliente;
    },
    enabled: !!clienteId,
  });
}

// Create client
export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cliente: Omit<Cliente, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("clientes")
        .insert(cliente)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });
}

// Update client
export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await supabase
        .from("clientes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    },
  });
}

// Delete client
export function useDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir cliente: ${error.message}`);
    },
  });
}

// Fetch client contracts
export function useContratosCliente(clienteId?: string) {
  return useQuery({
    queryKey: ["contratos_clientes", clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      const { data, error } = await supabase
        .from("contratos_clientes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContratoCliente[];
    },
    enabled: !!clienteId,
  });
}

// Fetch all client contracts by project
export function useContratosClientesByProject(projectId?: number) {
  return useQuery({
    queryKey: ["contratos_clientes", "project", projectId],
    queryFn: async () => {
      let query = supabase
        .from("contratos_clientes")
        .select(`
          *,
          cliente:clientes(nome, nif)
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

// Create client contract
export function useCreateContratoCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contrato: Omit<ContratoCliente, "id" | "created_at" | "updated_at" | "saldo_receber">) => {
      const { data, error } = await supabase
        .from("contratos_clientes")
        .insert(contrato)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos_clientes"] });
      toast.success("Contrato criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar contrato: ${error.message}`);
    },
  });
}

// Update client contract
export function useUpdateContratoCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContratoCliente> & { id: string }) => {
      const { data, error } = await supabase
        .from("contratos_clientes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos_clientes"] });
      toast.success("Contrato atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar contrato: ${error.message}`);
    },
  });
}

// Delete client contract
export function useDeleteContratoCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contratos_clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos_clientes"] });
      toast.success("Contrato excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir contrato: ${error.message}`);
    },
  });
}

// Fetch clients KPIs
export function useClientesKPIs(projectId?: number) {
  return useQuery({
    queryKey: ["clientes_kpis", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_clientes_kpis", {
        project_id: projectId || null,
      });
      if (error) throw error;
      return (data && data.length > 0 ? data[0] : {
        total_clientes: 0,
        total_contratado: 0,
        total_recebido: 0,
        saldo_receber: 0,
        taxa_recebimento: 0,
        prazo_medio_recebimento: 0,
      }) as ClientesKPIs;
    },
  });
}
