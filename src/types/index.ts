// ============= DOMAIN TYPE EXPORTS =============
// Centralized type exports organized by domain

// Project types
export * from "./project";

// Finance types
export * from "./finance";

// Employee and HR types
export * from "./employee";

// Warehouse and materials types
export * from "./warehouse";

// Requisition and procurement types
export * from "./requisition";

// Task and LEAN types
export * from "./task";

// Safety and incidents types
export * from "./safety";

// Patrimony types
export * from "./patrimony";

// Dashboard and KPIs types
export * from "./dashboard";

// ============= COMMON COMPONENT PROPS =============

// Base props for all components
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Modal props interface
export interface BaseModalProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  size?: "sm" | "default" | "lg" | "xl" | "2xl" | "full";
}

// Form props interface
export interface BaseFormProps<T = any> extends BaseComponentProps {
  initialData?: T;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Table props interface
export interface BaseTableProps<T = any> extends BaseComponentProps {
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

// ============= API RESPONSE TYPES =============

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============= UI COMPONENT TYPES =============

export type AlertVariant = "default" | "destructive" | "success" | "warning";
export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// ============= FORM VALIDATION TYPES =============

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// ============= NOTIFICATION TYPES =============

export interface NotificationConfig {
  title: string;
  description?: string;
  variant?: AlertVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============= SEARCH AND FILTER TYPES =============

export interface SearchFilters {
  query?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  projectId?: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}