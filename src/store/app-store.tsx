import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  sanitizeBankName, 
  sanitizeExpenseDescription, 
  sanitizeNumber, 
  sanitizeDate, 
  sanitizeCardBrand 
} from "@/lib/security";
import { encryptData, decryptData, isSessionExpired, clearEncryptionSession } from "@/lib/encryption";
import { validateAppState, createSafeFallbackState } from "@/lib/validation";
import { detectDataAnomaly, logInvalidInput } from "@/lib/security-monitor";

export type Bank = { id: string; name: string };
export type CardBrand = "Visa" | "MasterCard" | "American Express";
export type Expense = {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO
  bankId: string;
  card: CardBrand;
  cuotas: boolean;
  cuotasCount?: number; // número de cuotas cuando aplica
  isSubscription: boolean; // si es suscripción mensual
};
export type Salary = { 
  amountUSD: number; 
  rate: number; 
  amountARS: number; // parte en pesos del salario
};
export type FixedExpense = {
  alquiler: number;
  expensas: number;
  internet: number;
  luz: number;
};

type State = {
  banks: Bank[];
  expenses: Expense[];
  salary: Salary | null;
  fixedExpenses: FixedExpense;
};

const initialState: State = {
  banks: [],
  expenses: [],
  salary: null,
  fixedExpenses: {
    alquiler: 0,
    expensas: 0,
    internet: 0,
    luz: 0,
  },
};

type Action =
  | { type: "ADD_BANK"; name: string }
  | { type: "EDIT_BANK"; id: string; name: string }
  | { type: "REMOVE_BANK"; id: string }
  | { type: "ADD_EXPENSE"; payload: Omit<Expense, "id"> }
  | { type: "EDIT_EXPENSE"; id: string; payload: Omit<Expense, "id"> }
  | { type: "REMOVE_EXPENSE"; id: string }
  | { type: "CLEAN_MONTHLY_EXPENSES" }
  | { type: "SET_SALARY"; payload: Salary }
  | { type: "SET_FIXED_EXPENSES"; payload: FixedExpense }
  | { type: "HYDRATE"; payload: State };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "ADD_BANK": {
      const id = crypto.randomUUID();
      const sanitizedName = sanitizeBankName(action.name);
      return { ...state, banks: [...state.banks, { id, name: sanitizedName }] };
    }
    case "EDIT_BANK": {
      const sanitizedName = sanitizeBankName(action.name);
      return {
        ...state,
        banks: state.banks.map((b) => (b.id === action.id ? { ...b, name: sanitizedName } : b)),
      };
    }
    case "REMOVE_BANK": {
      return {
        ...state,
        banks: state.banks.filter((b) => b.id !== action.id),
        expenses: state.expenses.filter((e) => e.bankId !== action.id),
      };
    }
    case "ADD_EXPENSE": {
      const id = crypto.randomUUID();
      const sanitizedExpense = {
        ...action.payload,
        amount: sanitizeNumber(action.payload.amount),
        description: sanitizeExpenseDescription(action.payload.description),
        date: sanitizeDate(action.payload.date),
        card: sanitizeCardBrand(action.payload.card),
        cuotasCount: action.payload.cuotasCount ? sanitizeNumber(action.payload.cuotasCount) : undefined,
      };
      return { ...state, expenses: [{ id, ...sanitizedExpense }, ...state.expenses] };
    }
    case "EDIT_EXPENSE": {
      const sanitizedExpense = {
        ...action.payload,
        amount: sanitizeNumber(action.payload.amount),
        description: sanitizeExpenseDescription(action.payload.description),
        date: sanitizeDate(action.payload.date),
        card: sanitizeCardBrand(action.payload.card),
        cuotasCount: action.payload.cuotasCount ? sanitizeNumber(action.payload.cuotasCount) : undefined,
      };
      return {
        ...state,
        expenses: state.expenses.map((e) => 
          e.id === action.id ? { ...e, ...sanitizedExpense } : e
        ),
      };
    }
    case "REMOVE_EXPENSE": {
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.id),
      };
    }
    case "CLEAN_MONTHLY_EXPENSES": {
      // Mantener solo cuotas y suscripciones del mes anterior
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      return {
        ...state,
        expenses: state.expenses.filter((e) => {
          const expenseDate = new Date(e.date);
          const expenseMonth = expenseDate.getMonth();
          const expenseYear = expenseDate.getFullYear();
          
          // Si es del mes actual, mantener
          if (expenseYear === currentYear && expenseMonth === currentMonth) {
            return true;
          }
          
          // Si es una suscripción o tiene cuotas, mantener
          if (e.isSubscription || (e.cuotas && e.cuotasCount)) {
            return true;
          }
          
          // Eliminar gastos de meses anteriores que no son cuotas ni suscripciones
          return false;
        })
      };
    }
    case "SET_SALARY": {
      const sanitizedSalary = {
        amountUSD: sanitizeNumber(action.payload.amountUSD),
        rate: sanitizeNumber(action.payload.rate),
        amountARS: sanitizeNumber(action.payload.amountARS),
      };
      return { ...state, salary: sanitizedSalary };
    }
    case "SET_FIXED_EXPENSES": {
      const sanitizedFixedExpenses = {
        alquiler: sanitizeNumber(action.payload.alquiler),
        expensas: sanitizeNumber(action.payload.expensas),
        internet: sanitizeNumber(action.payload.internet),
        luz: sanitizeNumber(action.payload.luz),
      };
      return { ...state, fixedExpenses: sanitizedFixedExpenses };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: State;
  addBank: (name: string) => void;
  editBank: (id: string, name: string) => void;
  removeBank: (id: string) => void;
  addExpense: (payload: Omit<Expense, "id">) => void;
  editExpense: (id: string, payload: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;
  cleanMonthlyExpenses: () => void;
  setSalary: (payload: Salary) => void;
  setFixedExpenses: (payload: FixedExpense) => void;
} | null>(null);

export const AppStoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate with encryption and validation
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Always try to load data, regardless of session expiration
        const raw = localStorage.getItem("app-store");
        if (!raw) return;

        // Try to decrypt data, fallback to unencrypted if needed
        let decryptedRaw: string;
        try {
          decryptedRaw = await decryptData(raw);
        } catch (error) {
          console.warn("Decryption failed, trying unencrypted data:", error);
          decryptedRaw = raw;
        }
        const parsed = JSON.parse(decryptedRaw);

        // Validate data structure
        const validation = validateAppState(parsed);
        
        if (validation.isValid && validation.data) {
          // Ensure data matches State interface exactly
          const validatedState: State = {
            banks: validation.data.banks,
            expenses: validation.data.expenses,
            salary: validation.data.salary || null,
            fixedExpenses: validation.data.fixedExpenses
          };
          dispatch({ type: "HYDRATE", payload: validatedState });
        } else {
          console.warn("Invalid stored data, using fallback state");
          const fallbackState = createSafeFallbackState();
          const safeState: State = {
            banks: fallbackState.banks,
            expenses: fallbackState.expenses,
            salary: fallbackState.salary,
            fixedExpenses: fallbackState.fixedExpenses
          };
          dispatch({ type: "HYDRATE", payload: safeState });
        }
      } catch (error) {
        console.error("Failed to load stored data:", error);
        // Use fallback state on any error
        const fallbackState = createSafeFallbackState();
        const safeState: State = {
          banks: fallbackState.banks,
          expenses: fallbackState.expenses,
          salary: fallbackState.salary,
          fixedExpenses: fallbackState.fixedExpenses
        };
        dispatch({ type: "HYDRATE", payload: safeState });
      }
    };

    loadStoredData();
  }, []);

  // Persist with encryption and monitoring
  useEffect(() => {
    const persistData = async () => {
      try {
        // Detect data anomalies
        detectDataAnomaly(state, 'app-store-persist');
        
        // Encrypt and store data
        const dataString = JSON.stringify(state);
        const encryptedData = await encryptData(dataString);
        localStorage.setItem("app-store", encryptedData);
      } catch (error) {
        console.error("Failed to persist data:", error);
        // Fallback to unencrypted storage
        localStorage.setItem("app-store", JSON.stringify(state));
      }
    };

    // Don't persist initial empty state
    if (state.banks.length > 0 || state.expenses.length > 0 || state.salary || 
        Object.values(state.fixedExpenses).some(val => val > 0)) {
      persistData();
    }
  }, [state]);

  const api = useMemo(() => ({
    state,
    addBank: (name: string) => {
      if (!name.trim()) {
        logInvalidInput(name, 'non-empty string', 'addBank');
        return;
      }
      dispatch({ type: "ADD_BANK", name: name.trim() });
      toast({ title: "Banco agregado" });
    },
    editBank: (id: string, name: string) => {
      if (!name.trim()) {
        logInvalidInput(name, 'non-empty string', 'editBank');
        return;
      }
      dispatch({ type: "EDIT_BANK", id, name: name.trim() });
      toast({ title: "Banco actualizado" });
    },
    removeBank: (id: string) => {
      dispatch({ type: "REMOVE_BANK", id });
      toast({ title: "Banco eliminado" });
    },
    addExpense: (payload: Omit<Expense, "id">) => {
      dispatch({ type: "ADD_EXPENSE", payload });
      toast({ title: "Gasto agregado" });
    },
    editExpense: (id: string, payload: Omit<Expense, "id">) => {
      dispatch({ type: "EDIT_EXPENSE", id, payload });
      toast({ title: "Gasto actualizado" });
    },
    removeExpense: (id: string) => {
      dispatch({ type: "REMOVE_EXPENSE", id });
      toast({ title: "Gasto eliminado" });
    },
    cleanMonthlyExpenses: () => {
      dispatch({ type: "CLEAN_MONTHLY_EXPENSES" });
      toast({ title: "Gastos del mes anterior limpiados" });
    },
    setSalary: (payload: Salary) => {
      dispatch({ type: "SET_SALARY", payload });
      toast({ title: "Salario guardado" });
    },
    setFixedExpenses: (payload: FixedExpense) => {
      dispatch({ type: "SET_FIXED_EXPENSES", payload });
      toast({ title: "Gastos fijos guardados" });
    },
  }), [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
};

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore debe usarse dentro de AppStoreProvider");
  return ctx;
}
