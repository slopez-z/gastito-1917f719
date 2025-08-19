import { z } from 'zod';

/**
 * Zod validation schemas for runtime data validation
 */

// Bank validation schema
export const BankSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50)
});

// Card brand validation
export const CardBrandSchema = z.enum(['Visa', 'MasterCard', 'American Express']);

// Expense validation schema
export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().min(0).max(1000000),
  description: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  bankId: z.string().uuid(),
  card: CardBrandSchema,
  cuotas: z.boolean(),
  cuotasCount: z.number().min(1).max(60).optional(),
  isSubscription: z.boolean()
});

// Salary validation schema
export const SalarySchema = z.object({
  amountUSD: z.number().min(0).max(1000000),
  rate: z.number().min(0).max(10000),
  amountARS: z.number().min(0).max(100000000)
});

// Fixed expenses validation schema
export const FixedExpenseSchema = z.object({
  alquiler: z.number().min(0).max(10000000),
  expensas: z.number().min(0).max(10000000),
  internet: z.number().min(0).max(1000000),
  luz: z.number().min(0).max(1000000)
});

// App state validation schema
export const AppStateSchema = z.object({
  banks: z.array(BankSchema),
  expenses: z.array(ExpenseSchema),
  salary: SalarySchema.nullable(),
  fixedExpenses: FixedExpenseSchema
});

/**
 * Validate and sanitize app state data
 */
export function validateAppState(data: unknown): {
  isValid: boolean;
  data?: z.infer<typeof AppStateSchema>;
  errors?: string[];
} {
  try {
    const validatedData = AppStateSchema.parse(data);
    return { isValid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('App state validation failed:', error.issues);
      return { isValid: false, errors: error.issues.map(i => i.message) };
    }
    return { isValid: false };
  }
}

/**
 * Validate individual expense data
 */
export function validateExpense(data: unknown): {
  isValid: boolean;
  data?: z.infer<typeof ExpenseSchema>;
  errors?: string[];
} {
  try {
    const validatedData = ExpenseSchema.parse(data);
    return { isValid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.issues.map(i => i.message) };
    }
    return { isValid: false };
  }   
}

/**
 * Validate bank data
 */
export function validateBank(data: unknown): {
  isValid: boolean;
  data?: z.infer<typeof BankSchema>;
  errors?: string[];
} {
  try {
    const validatedData = BankSchema.parse(data);
    return { isValid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.issues.map(i => i.message) };
    }
    return { isValid: false };
  }
}

/**
 * Create safe fallback data when validation fails
 */
export function createSafeFallbackState(): {
  banks: z.infer<typeof BankSchema>[];
  expenses: z.infer<typeof ExpenseSchema>[];
  salary: z.infer<typeof SalarySchema> | null;
  fixedExpenses: z.infer<typeof FixedExpenseSchema>;
} {
  return {
    banks: [],
    expenses: [],
    salary: null,
    fixedExpenses: {
      alquiler: 0,
      expensas: 0,
      internet: 0,
      luz: 0
    }
  };
}