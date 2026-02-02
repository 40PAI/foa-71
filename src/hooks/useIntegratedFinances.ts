
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface IntegratedFinancialData {
  total_budget: number;
  material_expenses: number;
  payroll_expenses: number;
  patrimony_expenses: number;
  indirect_expenses: number;
  total_expenses: number;
  financial_progress: number;
  task_material_cost?: number;
  task_labor_cost?: number;
  task_real_expenses?: number;
}

export interface DetailedExpenseBreakdown {
  categoria: string;
  valor_calculado: number;
  valor_manual: number;
  discrepancia: number;
  percentual_orcamento: number;
}

export function useIntegratedFinancialProgress(projectId: number) {
  return useQuery({
    queryKey: ["integrated-financial-progress", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_integrated_financial_progress', { p_projeto_id: projectId });
      
      if (error) throw error;
      
      // Mapear a nova resposta da RPC para IntegratedFinancialData
      const result = data?.[0];
      if (!result) return null;
      
      return {
        total_budget: Number(result.orcamento_total) || 0,
        material_expenses: 0,
        payroll_expenses: 0,
        patrimony_expenses: 0,
        indirect_expenses: 0,
        total_expenses: Number(result.total_gasto) || 0,
        financial_progress: Number(result.percentual_progresso) || 0,
      } as IntegratedFinancialData;
    },
    enabled: !!projectId,
  });
}

export function useDetailedExpenseBreakdown(projectId: number) {
  return useQuery({
    queryKey: ["detailed-expense-breakdown", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_detailed_expense_breakdown', { p_project_id: projectId });
      
      if (error) throw error;
      return data as DetailedExpenseBreakdown[];
    },
    enabled: !!projectId,
  });
}

export function useDetailedExpenses(projectId?: number) {
  return useQuery({
    queryKey: ["detailed-expenses", projectId],
    queryFn: async () => {
      let query = supabase
        .from("gastos_detalhados")
        .select("*")
        .order("data_gasto", { ascending: false });
      
      if (projectId) {
        query = query.eq("projeto_id", projectId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar gastos detalhados:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateDetailedExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expense: {
      projeto_id: number;
      categoria_gasto: string;
      valor: number;
      data_gasto: string;
      descricao?: string | null;
      comprovante_url?: string | null;
    }) => {
      console.log("Criando gasto detalhado:", expense);
      
      // Validar dados antes de enviar
      if (!expense.projeto_id || !expense.categoria_gasto || !expense.valor) {
        throw new Error("Dados obrigatórios não fornecidos");
      }

      if (expense.valor <= 0) {
        throw new Error("Valor deve ser maior que zero");
      }

      const { data, error } = await supabase
        .from("gastos_detalhados")
        .insert({
          projeto_id: expense.projeto_id,
          categoria_gasto: expense.categoria_gasto,
          valor: expense.valor,
          data_gasto: expense.data_gasto,
          descricao: expense.descricao,
          comprovante_url: expense.comprovante_url,
          status_aprovacao: 'pendente'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Erro do Supabase ao criar gasto:", error);
        throw error;
      }

      console.log("Gasto criado com sucesso:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Gasto criado com sucesso, invalidando queries");
      queryClient.invalidateQueries({ queryKey: ["detailed-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["integrated-financial-progress", data.projeto_id] });
      queryClient.invalidateQueries({ queryKey: ["detailed-expense-breakdown", data.projeto_id] });
    },
    onError: (error) => {
      console.error("Erro na mutação de criação de gasto:", error);
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, aprovado_por }: { id: string; aprovado_por: string }) => {
      console.log("Aprovando gasto:", { id, aprovado_por });
      
      const { data, error } = await supabase
        .from("gastos_detalhados")
        .update({ 
          status_aprovacao: 'aprovado',
          aprovado_por,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao aprovar gasto:", error);
        throw error;
      }

      console.log("Gasto aprovado com sucesso:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["detailed-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["integrated-financial-progress", data.projeto_id] });
    },
    onError: (error) => {
      console.error("Erro na mutação de aprovação:", error);
    },
  });
}
