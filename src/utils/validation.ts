import { z } from "zod";

// Common validation schemas
export const commonSchemas = {
  id: z.number().positive("ID deve ser um número positivo"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome deve ter no máximo 255 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Telefone inválido").optional(),
  currency: z.number().min(0, "Valor deve ser positivo"),
  percentage: z.number().min(0).max(100, "Percentagem deve estar entre 0 e 100"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida"),
  description: z.string().max(1000, "Descrição deve ter no máximo 1000 caracteres").optional()
};

// Project validation schema
export const projectSchema = z.object({
  nome: commonSchemas.name,
  cliente: commonSchemas.name,
  encarregado: commonSchemas.name,
  data_inicio: commonSchemas.date,
  data_fim_prevista: commonSchemas.date,
  orcamento: commonSchemas.currency,
  limite_aprovacao: commonSchemas.currency,
  status: z.enum(["Em Andamento", "Atrasado", "Concluído", "Pausado", "Planeado", "Cancelado"]),
  provincia: z.string().min(1, "Província é obrigatória"),
  municipio: z.string().min(1, "Município é obrigatório"),
  zona_bairro: z.string().optional(),
  tipo_projeto: z.enum(["Residencial", "Comercial", "Industrial", "Infraestrutura", "Reforma"]),
  numero_etapas: z.number().min(1, "Deve ter pelo menos 1 etapa").max(20, "Máximo 20 etapas")
}).refine((data) => {
  return new Date(data.data_fim_prevista) > new Date(data.data_inicio);
}, {
  message: "Data fim deve ser posterior à data início",
  path: ["data_fim_prevista"]
});

// Employee validation schema
export const employeeSchema = z.object({
  nome: commonSchemas.name,
  cargo: commonSchemas.name,
  categoria: z.enum(["Oficial", "Auxiliar", "Técnico Superior"]),
  custo_hora: z.number().min(0, "Custo por hora deve ser positivo"),
  tipo_colaborador: z.enum(["Fixo", "Temporário"]).optional(),
  numero_funcional: z.string().optional(),
  bi: z.string().optional(),
  morada: z.string().optional(),
  hora_entrada: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido").optional(),
  hora_saida: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido").optional()
});

// Requisition validation schema
export const requisitionSchema = z.object({
  nome_comercial_produto: commonSchemas.name,
  categoria_principal: z.enum(["Material", "Mão de Obra", "Património", "Custos Indiretos"]),
  subcategoria: z.string().optional(),
  quantidade_requisitada: z.number().positive("Quantidade deve ser positiva"),
  valor: commonSchemas.currency,
  valor_unitario: z.number().positive("Valor unitário deve ser positivo").optional(),
  urgencia_prioridade: z.enum(["Alta", "Média", "Baixa"]).default("Média"),
  requisitante: commonSchemas.name,
  observacoes: commonSchemas.description,
  codigo_produto: z.string().optional(),
  descricao_tecnica: commonSchemas.description,
  fornecedor_preferencial: z.string().optional()
});

// Finance validation schema
export const financeSchema = z.object({
  categoria: commonSchemas.name,
  orcamentado: commonSchemas.currency,
  gasto: commonSchemas.currency.optional().default(0)
});

// Material validation schema
export const materialSchema = z.object({
  nome_material: commonSchemas.name,
  codigo_interno: z.string().min(1, "Código interno é obrigatório"),
  categoria_principal: z.enum(["Material", "Património", "Custos Indiretos"]).optional(),
  subcategoria: z.string().min(1, "Subcategoria é obrigatória"),
  quantidade_stock: z.number().min(0, "Quantidade deve ser positiva"),
  unidade_medida: z.enum(["Unidade", "Metro", "Metro Quadrado", "Metro Cúbico", "Quilograma", "Litro", "Saco", "Caixa"]),
  descricao_tecnica: commonSchemas.description,
  localizacao_fisica: z.string().optional(),
  fornecedor: z.string().optional()
});

// Validation helper functions
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
};

export const getFieldError = (errors: z.ZodError, fieldName: string): string | undefined => {
  const error = errors.errors.find(err => err.path.includes(fieldName));
  return error?.message;
};