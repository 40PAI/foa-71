import { supabase } from "@/integrations/supabase/client";
import { ExcelProjectData, ImportResult } from "@/types/projectImport";

export class ProjectImportService {
  async importProject(data: ExcelProjectData): Promise<ImportResult> {
    try {
      // 1. Criar o projeto
      const { data: projeto, error: projectError } = await supabase
        .from('projetos')
        .insert([{
          nome: data.projeto.nome,
          cliente: data.projeto.cliente,
          encarregado: data.projeto.encarregado,
          data_inicio: data.projeto.data_inicio,
          data_fim_prevista: data.projeto.data_fim_prevista,
          orcamento: data.projeto.orcamento,
          limite_aprovacao: data.projeto.limite_aprovacao,
          limite_gastos: (data.projeto as any).limite_gastos || 0,
          status: data.projeto.status as any,
          provincia: data.projeto.provincia,
          municipio: data.projeto.municipio,
          zona_bairro: data.projeto.zona_bairro,
          tipo_projeto: data.projeto.tipo_projeto as any,
          numero_etapas: data.projeto.numero_etapas,
          metodo_calculo_temporal: 'linear',
          avanco_fisico: 0,
          avanco_financeiro: 0,
          avanco_tempo: 0,
          gasto: 0
        }])
        .select()
        .single();

      if (projectError) {
        console.error('Erro ao criar projeto:', projectError);
        throw new Error(`Erro ao criar projeto: ${projectError.message}`);
      }

      const projetoId = projeto.id;

      // 2. Gerar semanas do projeto
      const { error: weeksError } = await supabase.rpc('generate_project_weeks', {
        project_id: projetoId
      });

      if (weeksError) {
        console.error('Erro ao gerar semanas:', weeksError);
        // Não é crítico, continuar
      }

      // 3. Criar etapas
      let etapasCount = 0;
      const etapasMap = new Map<number, number>(); // numero_etapa -> id

      if (data.etapas && data.etapas.length > 0) {
        const etapasToInsert = data.etapas.map(etapa => ({
          projeto_id: projetoId,
          numero_etapa: etapa.numero_etapa,
          nome_etapa: etapa.nome_etapa,
          tipo_etapa: etapa.tipo_etapa,
          responsavel_etapa: etapa.responsavel_etapa,
          data_inicio_etapa: etapa.data_inicio_etapa,
          data_fim_prevista_etapa: etapa.data_fim_prevista_etapa,
          status_etapa: etapa.status_etapa,
          observacoes: etapa.observacoes,
          orcamento_etapa: etapa.orcamento_etapa,
          gasto_etapa: 0,
          tempo_previsto_dias: etapa.tempo_previsto_dias,
          tempo_real_dias: 0
        }));

        const { data: etapasCreated, error: stagesError } = await supabase
          .from('etapas_projeto')
          .insert(etapasToInsert as any)
          .select();

        if (stagesError) {
          console.error('Erro ao criar etapas:', stagesError);
          throw new Error(`Erro ao criar etapas: ${stagesError.message}`);
        }

        etapasCount = etapasCreated?.length || 0;

        // Mapear numero_etapa para id
        if (etapasCreated) {
          etapasCreated.forEach((etapa: any) => {
            etapasMap.set(etapa.numero_etapa, etapa.id);
          });
        }
      }

      // 4. Criar tarefas
      let tarefasCount = 0;
      if (data.tarefas && data.tarefas.length > 0) {
        const tarefasToInsert = data.tarefas.map(tarefa => ({
          id_projeto: projetoId,
          id_etapa: etapasMap.get(tarefa.id_etapa || 0) || null,
          descricao: tarefa.descricao,
          tipo: tarefa.tipo,
          responsavel: tarefa.responsavel,
          prazo: tarefa.prazo,
          status: tarefa.status,
          percentual_conclusao: tarefa.percentual_conclusao,
          custo_material: tarefa.custo_material || 0,
          custo_mao_obra: tarefa.custo_mao_obra || 0,
          preco_unitario: tarefa.preco_unitario || 0,
          tempo_real_dias: 0,
          gasto_real: 0,
          semana_programada: tarefa.semana_programada
        }));

        const { data: tarefasCreated, error: tasksError } = await supabase
          .from('tarefas_lean')
          .insert(tarefasToInsert as any)
          .select();

        if (tasksError) {
          console.error('Erro ao criar tarefas:', tasksError);
          throw new Error(`Erro ao criar tarefas: ${tasksError.message}`);
        }

        tarefasCount = tarefasCreated?.length || 0;
      }

      // 5. Atualizar métricas do projeto
      const { error: metricsError } = await supabase.rpc(
        'update_project_metrics_with_integrated_finance',
        { p_projeto_id: projetoId }
      );

      if (metricsError) {
        console.error('Erro ao atualizar métricas:', metricsError);
        // Não é crítico, continuar
      }

      return {
        success: true,
        projetoId,
        etapasCount,
        tarefasCount
      };
    } catch (error) {
      console.error('Erro na importação:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido na importação']
      };
    }
  }
}
