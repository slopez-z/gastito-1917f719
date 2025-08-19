import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  sanitizeBankName, 
  sanitizeExpenseDescription, 
  sanitizeNumber, 
  sanitizeDate, 
  sanitizeCardBrand 
} from "@/lib/security";

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
  setSalary: (payload: Salary) => void;
  setFixedExpenses: (payload: FixedExpense) => void;
} | null>(null);

export const AppStoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate
  useEffect(() => {
    const raw = localStorage.getItem("app-store");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as State;
        dispatch({ type: "HYDRATE", payload: parsed });
      } catch {}
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem("app-store", JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => ({
    state,
    addBank: (name: string) => {
      if (!name.trim()) return;
      dispatch({ type: "ADD_BANK", name: name.trim() });
      toast({ title: "Banco agregado" });
    },
    editBank: (id: string, name: string) => {
      if (!name.trim()) return;
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
