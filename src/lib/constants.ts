// Application-wide constants

export const APP_NAME = "Sistema de Gestão de Obras";
export const APP_VERSION = "2.0.0";

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  PROJECTS: ['projects'],
  PROJECT_DETAILS: (id: number) => ['project-details', id],
  PROJECT_METRICS: (id: number) => ['project-metrics', id],
  PROJECT_STAGES: (id: number) => ['project-stages', id],
  PROJECT_WEEKS: (id: number) => ['project-weeks', id],
  
  FINANCES: (id: number) => ['finances', id],
  FINANCIAL_OVERVIEW: (id: number) => ['financial-overview', id],
  PURCHASE_BREAKDOWN: (id: number) => ['purchase-breakdown-optimized', id],
  INTEGRATED_FINANCES: (id: number) => ['integrated-finances', id],
  FINANCIAL_DISCREPANCIES: (id: number) => ['financial-discrepancies', id],
  
  TASKS: (id: number) => ['tasks', id],
  WEEKLY_TASKS: (id: number) => ['weekly-tasks', id],
  PPC_HISTORY: (id: number) => ['ppc-history', id],
  
  EMPLOYEES: (id: number) => ['employees', id],
  EMPLOYEE_ALLOCATIONS: (id: number) => ['employee-allocations', id],
  DAILY_TRACKING: (id: number) => ['daily-tracking', id],
  HR_ANALYTICS: (id: number) => ['hr-analytics', id],
  
  MATERIALS: ['materials'],
  MATERIALS_ARMAZEM: ['materials-armazem'],
  WAREHOUSE_ANALYTICS: (id: number) => ['warehouse-analytics', id],
  
  REQUISITIONS: (id: number) => ['requisitions', id],
  PENDING_APPROVALS: (id: number) => ['pending-approvals', id],
  
  INCIDENTS: (id: number) => ['incidents', id],
  PATRIMONY: ['patrimony'],
  EPIS: ['epis'],
} as const;

// User roles
export const USER_ROLES = {
  DIRETOR_TECNICO: 'diretor_tecnico',
  ENCARREGADO_OBRA: 'encarregado_obra',
  ADMINISTRATIVO: 'administrativo',
  FINANCEIRO: 'financeiro',
  COMPRADOR: 'comprador',
} as const;

// Approval limits (in local currency)
export const APPROVAL_LIMITS = {
  ENCARREGADO: 500000,
  FINANCEIRO: 3000000,
  DIRETOR: Infinity,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// Status colors (using semantic tokens)
export const STATUS_COLORS = {
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))',
  info: 'hsl(var(--primary))',
  neutral: 'hsl(var(--muted))',
} as const;

// Project statuses
export const PROJECT_STATUSES = [
  'Em Andamento',
  'Atrasado',
  'Concluído',
  'Pausado',
  'Planeado',
  'Cancelado',
] as const;

// Task statuses
export const TASK_STATUSES = [
  'Pendente',
  'Em Andamento',
  'Concluído',
  'Cancelado',
  'Atrasado',
] as const;

// Requisition statuses
export const REQUISITION_STATUSES = [
  'Pendente',
  'Cotações',
  'Aprovação Qualidade',
  'Aprovação Direção',
  'OC Gerada',
  'Recepcionado',
  'Liquidado',
  'Cancelado',
] as const;
