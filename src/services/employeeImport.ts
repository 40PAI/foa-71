import { supabase } from '@/integrations/supabase/client';
import { ExcelEmployeeData, EmployeeImportResult } from '@/types/employeeImport';

export class EmployeeImportService {
  async importEmployees(data: ExcelEmployeeData): Promise<EmployeeImportResult> {
    try {
      const { colaboradores, alocacoes } = data;

      if (!colaboradores || colaboradores.length === 0) {
        return {
          success: false,
          errors: ['Nenhum colaborador para importar']
        };
      }

      // Verificar números funcionais duplicados no arquivo
      const numerosFuncionais = colaboradores
        .map(c => c.numero_funcional)
        .filter(n => n && n.trim() !== '');
      
      const duplicados = numerosFuncionais.filter((item, index) => 
        numerosFuncionais.indexOf(item) !== index
      );
      
      if (duplicados.length > 0) {
        return {
          success: false,
          errors: [`Números funcionais duplicados no arquivo: ${duplicados.join(', ')}`]
        };
      }

      // Verificar se números funcionais já existem
      if (numerosFuncionais.length > 0) {
        const { data: existing } = await supabase
          .from('colaboradores')
          .select('numero_funcional')
          .in('numero_funcional', numerosFuncionais);

        if (existing && existing.length > 0) {
          const existingNumbers = existing.map(e => e.numero_funcional);
          return {
            success: false,
            errors: [`Números funcionais já existem: ${existingNumbers.join(', ')}`]
          };
        }
      }

      // Inserir colaboradores
      const { data: insertedEmployees, error: employeeError } = await supabase
        .from('colaboradores')
        .insert(colaboradores)
        .select();

      if (employeeError) {
        console.error('Erro ao inserir colaboradores:', employeeError);
        return {
          success: false,
          errors: [employeeError.message]
        };
      }

      let alocacoesCount = 0;

      // Processar alocações se existirem
      if (alocacoes && alocacoes.length > 0 && insertedEmployees) {
        // Mapear número funcional para ID do colaborador
        const funcionaisMap = new Map(
          insertedEmployees.map(emp => [emp.numero_funcional, emp.id])
        );

        const alocacoesData = alocacoes
          .map(aloc => {
            const colaboradorId = funcionaisMap.get(aloc.numero_funcional);
            if (!colaboradorId) return null;
            
            return {
              colaborador_id: colaboradorId,
              projeto_id: aloc.projeto_id,
              funcao: aloc.funcao,
              horario_tipo: aloc.horario_tipo,
              data_alocacao: aloc.data_alocacao
            };
          })
          .filter(Boolean);

        if (alocacoesData.length > 0) {
          const { data: insertedAllocations, error: allocationError } = await supabase
            .from('colaboradores_projetos')
            .insert(alocacoesData)
            .select();

          if (allocationError) {
            console.error('Erro ao inserir alocações:', allocationError);
            // Não falhar tudo por causa das alocações
            return {
              success: true,
              colaboradoresCount: insertedEmployees.length,
              alocacoesCount: 0,
              errors: [`Colaboradores inseridos, mas houve erro nas alocações: ${allocationError.message}`]
            };
          }

          alocacoesCount = insertedAllocations?.length || 0;
        }
      }

      return {
        success: true,
        colaboradoresCount: insertedEmployees.length,
        alocacoesCount
      };
    } catch (error: any) {
      console.error('Erro na importação:', error);
      return {
        success: false,
        errors: [error.message || 'Erro desconhecido na importação']
      };
    }
  }
}
