import DOMPurify from 'dompurify';

// Maximum lengths for different input types
const INPUT_LIMITS = {
  BANK_NAME: 50,
  EXPENSE_DESCRIPTION: 200,
  FIXED_EXPENSE_NAME: 100,
  GENERAL_TEXT: 500,
} as const;

/**
 * Sanitizes text input by removing potential XSS vectors and enforcing length limits
 */
export function sanitizeInput(input: string, maxLength: number = INPUT_LIMITS.GENERAL_TEXT): string {
  if (typeof input !== 'string') return '';
  
  // Remove any HTML tags and trim
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
  
  // Enforce length limit
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes HTML content while preserving safe tags
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitizes bank name input
 */
export function sanitizeBankName(name: string): string {
  return sanitizeInput(name, INPUT_LIMITS.BANK_NAME);
}

/**
 * Sanitizes expense description
 */
export function sanitizeExpenseDescription(description: string): string {
  return sanitizeInput(description, INPUT_LIMITS.EXPENSE_DESCRIPTION);
}

/**
 * Sanitizes fixed expense name
 */
export function sanitizeFixedExpenseName(name: string): string {
  return sanitizeInput(name, INPUT_LIMITS.FIXED_EXPENSE_NAME);
}

/**
 * Validates and sanitizes numeric input
 */
export function sanitizeNumber(value: any): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(0, num);
}

/**
 * Validates and sanitizes date input
 */
export function sanitizeDate(date: string): string {
  if (typeof date !== 'string') return new Date().toISOString().split('T')[0];
  
  // Check if it's a valid date format (YYYY-MM-DD or ISO)
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  
  return date;
}

/**
 * Sanitizes card brand input to only allow valid values
 */
export function sanitizeCardBrand(brand: string): "Visa" | "MasterCard" | "American Express" {
  const validBrands = ["Visa", "MasterCard", "American Express"] as const;
  return validBrands.includes(brand as any) ? brand as any : "Visa";
}

/**
 * Sanitizes SEO meta content
 */
export function sanitizeSEOContent(content: string): string {
  return sanitizeInput(content, 200);
}