import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyEmployeeAllocation {
  id: string;
  projeto_id: number;
  colaborador_id: number;
  mes: number;
  ano: number;
  funcao: string;
  horario_tipo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  colaborador?: {
    nome: string;
    cargo: string;
  };
}

export const useMonthlyEmployeeAllocations = () => {
  const [allocations, setAllocations] = useState<MonthlyEmployeeAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAllocations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('alocacao_mensal_colaboradores')
        .select(`
          *,
          colaboradores (
            nome,
            cargo
          )
        `)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;
      setAllocations((data || []).map(item => ({
        ...item,
        colaborador: item.colaboradores ? {
          nome: item.colaboradores.nome,
          cargo: item.colaboradores.cargo
        } : { nome: '', cargo: '' }
      })) as MonthlyEmployeeAllocation[]);
    } catch (error) {
      console.error('Error fetching monthly allocations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar alocações mensais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAllocationsForMonth = (projectId: number, month: number, year: number) => {
    return allocations.filter(
      a => a.projeto_id === projectId && a.mes === month && a.ano === year && a.ativo
    );
  };

  const getEmployeeCountForMonth = (projectId: number, month: number, year: number): number => {
    return getAllocationsForMonth(projectId, month, year).length;
  };

  const addEmployeeToMonth = async (
    projectId: number, 
    colaboradorId: number, 
    month: number, 
    year: number, 
    funcao: string,
    horarioTipo: string = 'Integral'
  ) => {
    try {
      const { error } = await supabase
        .from('alocacao_mensal_colaboradores')
        .upsert({
          projeto_id: projectId,
          colaborador_id: colaboradorId,
          mes: month,
          ano: year,
          funcao: funcao,
          horario_tipo: horarioTipo,
          ativo: true
        }, {
          onConflict: 'projeto_id,colaborador_id,mes,ano'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Colaborador adicionado ao mês com sucesso",
      });

      await fetchAllocations();
    } catch (error) {
      console.error('Error adding employee to month:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar colaborador ao mês",
        variant: "destructive",
      });
    }
  };

  const removeEmployeeFromMonth = async (allocationId: string) => {
    try {
      const { error } = await supabase
        .from('alocacao_mensal_colaboradores')
        .update({ ativo: false })
        .eq('id', allocationId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Colaborador removido do mês com sucesso",
      });

      await fetchAllocations();
    } catch (error) {
      console.error('Error removing employee from month:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover colaborador do mês",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  return {
    allocations,
    isLoading,
    getAllocationsForMonth,
    getEmployeeCountForMonth,
    addEmployeeToMonth,
    removeEmployeeFromMonth,
    refetch: fetchAllocations,
  };
};