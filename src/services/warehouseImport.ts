import { supabase } from '@/integrations/supabase/client';
import { ExcelWarehouseData, WarehouseImportResult } from '@/types/warehouseImport';

export class WarehouseImportService {
  async importMaterials(data: ExcelWarehouseData): Promise<WarehouseImportResult> {
    try {
      const { materiais } = data;

      if (!materiais || materiais.length === 0) {
        return {
          success: false,
          errors: ['Nenhum material para importar']
        };
      }

      // Verificar códigos duplicados no arquivo
      const codigos = materiais.map(m => m.codigo_interno);
      const duplicados = codigos.filter((item, index) => codigos.indexOf(item) !== index);
      
      if (duplicados.length > 0) {
        return {
          success: false,
          errors: [`Códigos duplicados no arquivo: ${duplicados.join(', ')}`]
        };
      }

      // Verificar se códigos já existem no banco
      const { data: existingMaterials } = await supabase
        .from('materiais_armazem')
        .select('codigo_interno')
        .in('codigo_interno', codigos);

      if (existingMaterials && existingMaterials.length > 0) {
        const existingCodes = existingMaterials.map(m => m.codigo_interno);
        return {
          success: false,
          errors: [`Códigos já existem no sistema: ${existingCodes.join(', ')}`]
        };
      }

      // Inserir materiais
      const { data: insertedMaterials, error } = await supabase
        .from('materiais_armazem')
        .insert(materiais)
        .select();

      if (error) {
        console.error('Erro ao inserir materiais:', error);
        return {
          success: false,
          errors: [error.message]
        };
      }

      return {
        success: true,
        materiaisCount: insertedMaterials?.length || 0
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
