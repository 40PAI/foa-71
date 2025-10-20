import * as z from "zod";

export const projectSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cliente: z.string().min(1, "Cliente é obrigatório"),
  encarregado: z.string().min(1, "Encarregado é obrigatório"),
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_fim_prevista: z.string().min(1, "Data fim prevista é obrigatória"),
  orcamento: z.number().min(0, "Orçamento deve ser positivo").transform(val => Math.round(val)),
  limite_aprovacao: z.number().min(0, "Limite de aprovação deve ser positivo").transform(val => Math.round(val)),
  limite_gastos: z.number().min(0, "Limite de gastos deve ser positivo").default(0).transform(val => Math.round(val)),
  status: z.enum(["Em Andamento", "Atrasado", "Concluído", "Pausado"]),
  provincia: z.string().min(1, "Província é obrigatória"),
  municipio: z.string().min(1, "Município é obrigatório"),
  zona_bairro: z.string().optional(),
  tipo_projeto: z.enum(["Residencial", "Comercial", "Industrial", "Infraestrutura", "Reforma"]),
  numero_etapas: z.number().min(1, "Deve ter pelo menos 1 etapa"),
});

export type ProjectFormDataType = z.infer<typeof projectSchema>;

export interface ProjectStage {
  numero_etapa: number;
  nome_etapa: string;
  tipo_etapa: string;
  responsavel_etapa: string;
  data_inicio_etapa: string;
  data_fim_prevista_etapa: string;
  status_etapa: string;
  observacoes: string;
  orcamento_etapa: number;
  gasto_etapa: number;
  tempo_previsto_dias: number;
  tempo_real_dias: number;
}