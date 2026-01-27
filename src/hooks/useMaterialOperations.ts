import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Material Entry (Acquisition)
export interface MaterialEntryInput {
  material_id: string;
  quantidade: number;
  responsavel: string;
  data_movimentacao?: string;
  documento_referencia?: string;
  custo_unitario?: number;
  observacoes?: string;
}

export function useMaterialEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MaterialEntryInput) => {
      const { data, error } = await supabase
        .from("materiais_movimentacoes")
        .insert({
          material_id: input.material_id,
          quantidade: input.quantidade,
          tipo_movimentacao: "entrada",
          responsavel: input.responsavel,
          data_movimentacao: input.data_movimentacao || new Date().toISOString().split("T")[0],
          documento_referencia: input.documento_referencia,
          custo_unitario: input.custo_unitario,
          observacoes: input.observacoes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Entrada registada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
      queryClient.invalidateQueries({ queryKey: ["material-history"] });
      queryClient.invalidateQueries({ queryKey: ["material-movements"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-report"] });
    },
    onError: (error) => {
      toast.error("Erro ao registar entrada: " + error.message);
    },
  });
}

// Material Exit (Allocation to Project)
export interface MaterialExitInput {
  material_id: string;
  projeto_id: number;
  quantidade: number;
  responsavel: string;
  data_movimentacao?: string;
  etapa_id?: number;
  observacoes?: string;
}

export function useMaterialExit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MaterialExitInput) => {
      // Check stock availability
      const { data: material, error: matError } = await supabase
        .from("materiais_armazem")
        .select("quantidade_stock")
        .eq("id", input.material_id)
        .single();

      if (matError) throw matError;

      if (material.quantidade_stock < input.quantidade) {
        throw new Error(`Stock insuficiente. Disponível: ${material.quantidade_stock}`);
      }

      // Create movement
      const { data: movement, error: movError } = await supabase
        .from("materiais_movimentacoes")
        .insert({
          material_id: input.material_id,
          quantidade: input.quantidade,
          tipo_movimentacao: "saida",
          responsavel: input.responsavel,
          data_movimentacao: input.data_movimentacao || new Date().toISOString().split("T")[0],
          projeto_destino_id: input.projeto_id,
          observacoes: input.observacoes,
        })
        .select()
        .single();

      if (movError) throw movError;

      // Create allocation record
      const { data: allocation, error: allocError } = await supabase
        .from("materiais_alocados")
        .insert({
          material_id: input.material_id,
          projeto_id: input.projeto_id,
          quantidade_alocada: input.quantidade,
          movimentacao_saida_id: movement.id,
          etapa_id: input.etapa_id,
          status: "alocado",
        })
        .select()
        .single();

      if (allocError) throw allocError;

      return { movement, allocation };
    },
    onSuccess: () => {
      toast.success("Saída registada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
      queryClient.invalidateQueries({ queryKey: ["material-history"] });
      queryClient.invalidateQueries({ queryKey: ["material-movements"] });
      queryClient.invalidateQueries({ queryKey: ["material-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-report"] });
    },
    onError: (error) => {
      toast.error("Erro ao registar saída: " + error.message);
    },
  });
}

// Material Consumption
export interface MaterialConsumptionInput {
  allocation_id: string;
  quantidade: number;
  responsavel: string;
  data_movimentacao?: string;
  guia_consumo_id?: string;
  observacoes?: string;
}

export function useMaterialConsumption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MaterialConsumptionInput) => {
      // Get allocation
      const { data: allocation, error: allocError } = await supabase
        .from("materiais_alocados")
        .select("*")
        .eq("id", input.allocation_id)
        .single();

      if (allocError) throw allocError;

      const pendente = allocation.quantidade_alocada - allocation.quantidade_consumida - allocation.quantidade_devolvida;

      if (input.quantidade > pendente) {
        throw new Error(`Quantidade excede o pendente. Disponível: ${pendente}`);
      }

      // Create consumption movement
      const { data: movement, error: movError } = await supabase
        .from("materiais_movimentacoes")
        .insert({
          material_id: allocation.material_id,
          quantidade: input.quantidade,
          tipo_movimentacao: "consumo",
          responsavel: input.responsavel,
          data_movimentacao: input.data_movimentacao || new Date().toISOString().split("T")[0],
          projeto_destino_id: allocation.projeto_id,
          guia_consumo_id: input.guia_consumo_id,
          movimentacao_origem_id: allocation.movimentacao_saida_id,
          observacoes: input.observacoes,
        })
        .select()
        .single();

      if (movError) throw movError;

      // Update allocation
      const { error: updateError } = await supabase
        .from("materiais_alocados")
        .update({
          quantidade_consumida: allocation.quantidade_consumida + input.quantidade,
        })
        .eq("id", input.allocation_id);

      if (updateError) throw updateError;

      return movement;
    },
    onSuccess: () => {
      toast.success("Consumo registado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["material-history"] });
      queryClient.invalidateQueries({ queryKey: ["material-movements"] });
      queryClient.invalidateQueries({ queryKey: ["material-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-report"] });
    },
    onError: (error) => {
      toast.error("Erro ao registar consumo: " + error.message);
    },
  });
}

// Material Return
export interface MaterialReturnInput {
  allocation_id: string;
  quantidade: number;
  responsavel: string;
  data_movimentacao?: string;
  motivo_devolucao?: string;
  estado_material?: string;
  observacoes?: string;
}

export function useMaterialReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MaterialReturnInput) => {
      // Get allocation
      const { data: allocation, error: allocError } = await supabase
        .from("materiais_alocados")
        .select("*")
        .eq("id", input.allocation_id)
        .single();

      if (allocError) throw allocError;

      const pendente = allocation.quantidade_alocada - allocation.quantidade_consumida - allocation.quantidade_devolvida;

      if (input.quantidade > pendente) {
        throw new Error(`Quantidade excede o pendente. Disponível: ${pendente}`);
      }

      // Create return movement
      const { data: movement, error: movError } = await supabase
        .from("materiais_movimentacoes")
        .insert({
          material_id: allocation.material_id,
          quantidade: input.quantidade,
          tipo_movimentacao: "devolucao",
          responsavel: input.responsavel,
          data_movimentacao: input.data_movimentacao || new Date().toISOString().split("T")[0],
          projeto_origem_id: allocation.projeto_id,
          movimentacao_origem_id: allocation.movimentacao_saida_id,
          motivo_devolucao: input.motivo_devolucao,
          estado_material: input.estado_material || "bom",
          observacoes: input.observacoes,
        })
        .select()
        .single();

      if (movError) throw movError;

      // Update allocation
      const { error: updateError } = await supabase
        .from("materiais_alocados")
        .update({
          quantidade_devolvida: allocation.quantidade_devolvida + input.quantidade,
        })
        .eq("id", input.allocation_id);

      if (updateError) throw updateError;

      return movement;
    },
    onSuccess: () => {
      toast.success("Devolução registada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
      queryClient.invalidateQueries({ queryKey: ["material-history"] });
      queryClient.invalidateQueries({ queryKey: ["material-movements"] });
      queryClient.invalidateQueries({ queryKey: ["material-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-report"] });
    },
    onError: (error) => {
      toast.error("Erro ao registar devolução: " + error.message);
    },
  });
}

// Stock Adjustment
export interface StockAdjustmentInput {
  material_id: string;
  quantidade: number;
  tipo: "positivo" | "negativo";
  responsavel: string;
  data_movimentacao?: string;
  observacoes?: string;
}

export function useStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StockAdjustmentInput) => {
      const { data, error } = await supabase
        .from("materiais_movimentacoes")
        .insert({
          material_id: input.material_id,
          quantidade: input.quantidade,
          tipo_movimentacao: input.tipo === "positivo" ? "ajuste_positivo" : "ajuste_negativo",
          responsavel: input.responsavel,
          data_movimentacao: input.data_movimentacao || new Date().toISOString().split("T")[0],
          observacoes: input.observacoes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Ajuste registado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["materials-armazem"] });
      queryClient.invalidateQueries({ queryKey: ["material-history"] });
      queryClient.invalidateQueries({ queryKey: ["material-movements"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-report"] });
    },
    onError: (error) => {
      toast.error("Erro ao registar ajuste: " + error.message);
    },
  });
}
