/**
 * Currency Utilities for PT-AO Format
 * Format: 1.000.000,00 (. for thousands, , for decimals)
 */

/**
 * Format number to PT-AO currency string
 * @param value - Number to format
 * @returns Formatted string (e.g., "1.000.000,00")
 */
export function formatCurrencyInput(value: number | string): string {
  if (!value && value !== 0) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  
  // Format with 2 decimals
  const formatted = numValue.toFixed(2);
  const [integer, decimal] = formatted.split('.');
  
  // Add thousands separator (.)
  const integerWithSeparator = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Return with decimal separator (,)
  return `${integerWithSeparator},${decimal}`;
}

/**
 * Parse PT-AO formatted string to number
 * @param value - Formatted string (e.g., "1.000.000,00")
 * @returns Number value
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  
  // Remove thousands separator (.) and replace decimal separator (,) with (.)
  const normalized = value.replace(/\./g, '').replace(/,/g, '.');
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate and format input during typing
 * @param value - Current input value
 * @returns Cleaned value ready for formatting
 */
export function cleanCurrencyInput(value: string): string {
  // Allow only digits, dots, and commas
  return value.replace(/[^\d.,]/g, '');
}

/**
 * Format number to PT-AO currency string with Kz suffix
 * @param value - Number to format
 * @returns Formatted string (e.g., "1.000.000,00 Kz")
 */
export function formatCurrency(value: number | string): string {
  if (!value && value !== 0) return '0,00 Kz';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0,00 Kz';
  
  return `${formatCurrencyInput(numValue)} Kz`;
}

/**
 * Format input value in real-time while typing
 * @param value - Current input value
 * @returns Formatted value for display
 */
export function formatCurrencyRealtime(value: string): string {
  if (!value) return '';
  
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  
  // Parse as cents (last 2 digits are cents)
  const numValue = parseInt(digitsOnly) / 100;
  
  // Format with thousands and decimal separators
  return formatCurrencyInput(numValue);
}
