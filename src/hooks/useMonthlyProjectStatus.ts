import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyProjectStatus {
  id: string;
  projeto_id: number;
  mes: number;
  ano: number;
  status: 'ativo' | 'pausado' | 'concluido';
  created_at: string;
  updated_at: string;
}

export const useMonthlyProjectStatus = () => {
  const [monthlyStatuses, setMonthlyStatuses] = useState<MonthlyProjectStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMonthlyStatuses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projeto_status_mensal')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;
      setMonthlyStatuses((data || []) as MonthlyProjectStatus[]);
    } catch (error) {
      console.error('Error fetching monthly statuses:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar status mensais dos projetos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectStatusForMonth = (projectId: number, month: number, year: number): string => {
    const status = monthlyStatuses.find(
      s => s.projeto_id === projectId && s.mes === month && s.ano === year
    );
    return status?.status || 'ativo';
  };

  const updateProjectStatus = async (projectId: number, month: number, year: number, status: 'ativo' | 'pausado' | 'concluido') => {
    try {
      const { error } = await supabase
        .from('projeto_status_mensal')
        .upsert({
          projeto_id: projectId,
          mes: month,
          ano: year,
          status: status
        }, {
          onConflict: 'projeto_id,mes,ano'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do projeto atualizado com sucesso",
      });

      await fetchMonthlyStatuses();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do projeto",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMonthlyStatuses();
  }, []);

  return {
    monthlyStatuses,
    isLoading,
    getProjectStatusForMonth,
    updateProjectStatus,
    refetch: fetchMonthlyStatuses,
  };
};