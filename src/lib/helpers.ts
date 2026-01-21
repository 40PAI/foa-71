// Helper functions and utilities

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";
import { DATE_FORMATS } from "./constants";

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = "AOA"): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value ?? 0).toFixed(decimals)}%`;
}

/**
 * Clamp percentage for visualization (0-100)
 * Used to display progress bars and charts that shouldn't exceed 100%
 */
export function clampPercentage(value: number): number {
  return Math.min(Math.max(value ?? 0, 0), 100);
}

/**
 * Format percentage with excess indicator
 * Shows "100%+" when value exceeds 100%, with real value in parentheses
 */
export function formatPercentageWithExcess(value: number, decimals: number = 0): string {
  const safeValue = value ?? 0;
  if (safeValue > 100) {
    return `100%+ (${safeValue.toFixed(decimals)}%)`;
  }
  return `${safeValue.toFixed(decimals)}%`;
}

/**
 * Format date safely
 */
export function formatDate(date: string | Date | null | undefined, formatStr: string = DATE_FORMATS.DISPLAY): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : "-";
  } catch {
    return "-";
  }
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get status color based on value
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes("conclu") || statusLower.includes("aprovado")) {
    return "hsl(var(--success))";
  }
  if (statusLower.includes("atraso") || statusLower.includes("crítico")) {
    return "hsl(var(--destructive))";
  }
  if (statusLower.includes("pendente") || statusLower.includes("atenção")) {
    return "hsl(var(--warning))";
  }
  
  return "hsl(var(--muted))";
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  return Object.keys(obj).length === 0;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Round to decimals
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate project timeline progress
 */
export function calculateProjectTimeline(dataInicio: string, dataFimPrevista: string) {
  const startDate = new Date(dataInicio);
  const endDate = new Date(dataFimPrevista);
  const currentDate = new Date();
  
  // Calcular total de dias do projeto
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calcular dias passados desde o início
  let daysPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Se o projeto ainda não começou
  if (daysPassed < 0) {
    daysPassed = 0;
  }
  
  const displayText = `${daysPassed}/${totalDays}`;
  
  return {
    daysPassed,
    totalDays,
    displayText,
    isOverdue: daysPassed > totalDays
  };
}
