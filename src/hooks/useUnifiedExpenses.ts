import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UnifiedExpense {
  id: string;
  fonte: 'centro_custo' | 'requisicao' | 'tarefa' | 'manual';
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  documento?: string;
  comprovante_url?: string;
  responsavel?: string;
  status?: string;
  metadata?: any;
}

const categoryMap: Record<string, string[]> = {
  'material': ['Material', 'Materiais', 'material'],
  'mao_obra': ['Mão de Obra', 'Mao de Obra', 'mao_obra'],
  'patrimonio': ['Patrimônio', 'Patrimonio', 'Equipamento', 'patrimonio'],
  'indireto': ['Custos Indiretos', 'Indireto', 'indireto']
};

export function useUnifiedExpenses(projectId: number, category: string) {
  return useQuery({
    queryKey: ['unified-expenses', projectId, category],
    queryFn: async () => {
      if (!projectId || !category) return [];
      
      const expenses: UnifiedExpense[] = [];
      const categoryNames = categoryMap[category] || [category];
      
      // 1. CENTRO DE CUSTOS (movimentos_financeiros)
      const { data: movimentos } = await supabase
        .from('movimentos_financeiros')
        .select('*')
        .eq('projeto_id', projectId)
        .eq('tipo_movimento', 'saida')
        .eq('status_aprovacao', 'aprovado')
        .in('categoria', categoryNames as any);
      
      movimentos?.forEach(m => {
        expenses.push({
          id: `mov_${m.id}`,
          fonte: 'centro_custo',
          descricao: m.descricao,
          valor: Number(m.valor),
          data: m.data_movimento,
          categoria: m.categoria,
          documento: m.numero_documento,
          comprovante_url: m.comprovante_url || m.nota_fiscal_url,
          responsavel: m.responsavel_id,
          status: m.status_aprovacao,
          metadata: m
        });
      });
      
      // 2. REQUISIÇÕES APROVADAS
      const { data: requisicoes } = await supabase
        .from('requisicoes')
        .select('*')
        .eq('id_projeto', projectId)
        .in('status_fluxo', ['OC Gerada', 'Recepcionado', 'Liquidado'] as any)
        .in('categoria_principal', categoryNames as any);
      
      requisicoes?.forEach(r => {
        expenses.push({
          id: `req_${r.id}`,
          fonte: 'requisicao',
          descricao: r.nome_comercial_produto || r.descricao_tecnica || 'Requisição',
          valor: Number(r.valor_liquido || r.valor),
          data: r.data_requisicao,
          categoria: r.categoria_principal,
          responsavel: r.requisitante,
          status: r.status_fluxo,
          metadata: r
        });
      });
      
      // 3. GASTOS REAIS DAS TAREFAS (apenas com progresso >= 1%)
      const { data: tarefas } = await supabase
        .from('tarefas_lean')
        .select('*')
        .eq('id_projeto', projectId)
        .gt('gasto_real', 0)
        .gte('percentual_conclusao', 1);
      
      tarefas?.forEach(t => {
        // Para cada tarefa, criar entradas baseadas no tipo de custo
        if (category === 'material' && t.custo_material > 0) {
          expenses.push({
            id: `tar_mat_${t.id}`,
            fonte: 'tarefa',
            descricao: `${t.descricao} - Material`,
            valor: Number(t.custo_material),
            data: t.prazo,
            categoria: 'Material',
            responsavel: t.responsavel,
            metadata: t
          });
        }
        
        if (category === 'mao_obra' && t.custo_mao_obra > 0) {
          expenses.push({
            id: `tar_mao_${t.id}`,
            fonte: 'tarefa',
            descricao: `${t.descricao} - Mão de Obra`,
            valor: Number(t.custo_mao_obra),
            data: t.prazo,
            categoria: 'Mão de Obra',
            responsavel: t.responsavel,
            metadata: t
          });
        }
        
        // Se gasto_real > (material + mao_obra), adicionar diferença como indireto
        const totalCategorizado = (Number(t.custo_material) || 0) + (Number(t.custo_mao_obra) || 0);
        const gastoIndireto = Number(t.gasto_real) - totalCategorizado;
        
        if (category === 'indireto' && gastoIndireto > 0) {
          expenses.push({
            id: `tar_ind_${t.id}`,
            fonte: 'tarefa',
            descricao: `${t.descricao} - Custos Indiretos`,
            valor: gastoIndireto,
            data: t.prazo,
            categoria: 'Indireto',
            responsavel: t.responsavel,
            metadata: t
          });
        }
      });
      
      // 4. GASTOS MANUAIS
      const { data: manuais } = await supabase
        .from('gastos_detalhados')
        .select('*')
        .eq('projeto_id', projectId)
        .eq('categoria_gasto', category);
      
      manuais?.forEach(g => {
        expenses.push({
          id: `man_${g.id}`,
          fonte: 'manual',
          descricao: g.descricao || 'Gasto manual',
          valor: Number(g.valor),
          data: g.data_gasto,
          categoria: g.categoria_gasto,
          comprovante_url: g.comprovante_url,
          status: g.status_aprovacao,
          metadata: g
        });
      });
      
      // Ordenar por data (mais recente primeiro)
      return expenses.sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      );
    },
    enabled: !!projectId && !!category,
    staleTime: 30000,
  });
}
