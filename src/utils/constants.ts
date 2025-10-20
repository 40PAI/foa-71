// Application constants

export const APP_CONFIG = {
  name: "FOA SmartSite",
  description: "Sistema de Gestão de Obras e Projetos",
  version: "1.0.0"
} as const;

// Cache times in milliseconds
export const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes  
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000  // 1 hour
} as const;

// Status configurations
export const PROJECT_STATUS = {
  EM_ANDAMENTO: "Em Andamento",
  ATRASADO: "Atrasado", 
  CONCLUIDO: "Concluído",
  PAUSADO: "Pausado",
  PLANEADO: "Planeado",
  CANCELADO: "Cancelado"
} as const;

export const REQUISITION_STATUS = {
  PENDENTE: "Pendente",
  COTACOES: "Cotações",
  APROVACAO_QUALIDADE: "Aprovação Qualidade",
  APROVACAO_DIRECAO: "Aprovação Direção",
  OC_GERADA: "OC Gerada",
  RECEPCIONADO: "Recepcionado",
  LIQUIDADO: "Liquidado"
} as const;

// Color mappings for consistent styling
export const STATUS_COLORS = {
  [PROJECT_STATUS.EM_ANDAMENTO]: "status-info",
  [PROJECT_STATUS.ATRASADO]: "status-danger",
  [PROJECT_STATUS.CONCLUIDO]: "status-success",
  [PROJECT_STATUS.PAUSADO]: "status-warning",
  [PROJECT_STATUS.PLANEADO]: "status-info",
  [PROJECT_STATUS.CANCELADO]: "status-neutral"
} as const;

export const URGENCY_COLORS = {
  Alta: "status-danger",
  Média: "status-warning", 
  Baixa: "status-success"
} as const;

// Approval limits
export const APPROVAL_LIMITS = {
  AUTOMATIC: 3000000,     // ≤ 3M Kz - automatic approval
  FINANCIAL: 10000000,    // 3-10M Kz - financial approval
  DIRECTION: Infinity     // >10M Kz - direction approval
} as const;

// Responsive breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Table configurations
export const TABLE_CONFIG = {
  MIN_WIDTHS: {
    SMALL: "800px",
    MEDIUM: "1000px", 
    LARGE: "1200px",
    EXTRA_LARGE: "1400px"
  },
  ROWS_PER_PAGE: [10, 25, 50, 100]
} as const;