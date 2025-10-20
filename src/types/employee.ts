// Employee and HR domain types

export type EmployeeCategory = "Oficial" | "Auxiliar" | "Técnico Superior";
export type WorkScheduleType = "integral" | "meio_periodo" | "turno";
export type AttendanceStatus = "presente" | "falta" | "atraso" | "justificado";

export interface Employee {
  id?: number;
  nome: string;
  cargo: string;
  categoria: EmployeeCategory;
  custo_hora: number;
  projeto_id?: number;
  hora_entrada?: string;
  hora_saida?: string;
  tipo_colaborador?: string;
  numero_funcional?: string;
  bi?: string;
  morada?: string;
  cv_link?: string;
  offline_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeAllocation {
  id?: string;
  colaborador_id: number;
  projeto_id: number;
  funcao: string;
  horario_tipo: WorkScheduleType;
  data_alocacao: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyEmployeeAllocation {
  id?: string;
  colaborador_id: number;
  projeto_id: number;
  mes: number;
  ano: number;
  funcao: string;
  horario_tipo: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DailyAttendance {
  id?: string;
  colaborador_id: number;
  projeto_id: number;
  data: string;
  hora_entrada?: string;
  hora_saida?: string;
  status: AttendanceStatus;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HRAnalytics {
  attendance_by_front: any[];
  work_hours_by_type: any[];
  hr_kpis: {
    total_atrasos: number;
    total_faltas: number;
    produtividade_score: number;
    rotatividade: number;
  };
  attendance_trends: any[];
}
