// Dashboard and KPIs domain types

export interface DashboardKPI {
  id?: number;
  projeto_id?: number;
  data_calculo: string;
  avanco_fisico_real: number;
  avanco_financeiro_real: number;
  desvio_prazo_dias: number;
  absentismo_percentual: number;
  lead_time_compras_medio: number;
  status_alerta: "Verde" | "Amarelo" | "Vermelho";
  created_at?: string;
  updated_at?: string;
}

export interface ManagementDashboard {
  performance_heatmap: any[];
  productivity_ranking: any[];
  consolidated_kpis: {
    total_projetos: number;
    projetos_ativos: number;
    media_avanco_fisico: number;
    total_orcamento: number;
    total_gasto: number;
    projetos_atrasados: number;
    projetos_acima_orcamento: number;
  };
  alerts: any[];
}

export interface IntegratedDashboardData {
  categoria: string;
  valor_orcamentado: number;
  valor_gasto: number;
  valor_pendente: number;
  percentual_execucao: number;
  status_alerta: string;
  limite_excedido: boolean;
}
