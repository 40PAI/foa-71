// Patrimony and assets domain types

export type PatrimonyStatus = "Disponível" | "Em Uso" | "Em Manutenção" | "Inativo";
export type PatrimonyType = "Gerador" | "Betoneira" | "Andaime" | "Ferramenta" | "Outros";

export interface Patrimony {
  id?: string;
  codigo: string;
  nome: string;
  tipo: PatrimonyType;
  status: PatrimonyStatus;
  alocado_projeto_id?: number;
  created_at?: string;
  updated_at?: string;
}
