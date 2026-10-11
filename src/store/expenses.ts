import { create } from "zustand";
import type { CategoryId } from "@/lib/categories";
import {
  loadLedger,
  saveLedger,
  type StoredExpense,
  type StoredLedger,
} from "@/lib/ledger-storage";
import type { MarkId } from "@/lib/marks";

export type Expense = StoredExpense;

export type ExpenseDraft = {
  amount: number;
  category: CategoryId;
  note: string;
  date: string;
  payer: string;
  mark: MarkId | "";
};

type ExpenseState = StoredLedger & {
  addExpense: (draft: ExpenseDraft) => void;
  updateExpense: (id: string, draft: ExpenseDraft) => void;
  deleteExpense: (id: string) => void;
  setBudget: (amount: number) => void;
  clearAll: () => void;
  seedIfEmpty: () => void;
};

function persist(state: ExpenseState) {
  saveLedger({
    expenses: state.expenses,
    monthlyBudget: state.monthlyBudget,
    hasSeeded: state.hasSeeded,
    lastPayer: state.lastPayer,
  });
}

function fromDraft(draft: ExpenseDraft): Omit<Expense, "id" | "createdAt"> {
  return {
    amount: draft.amount,
    category: draft.category,
    note: draft.note.trim(),
    date: draft.date,
    payer: draft.payer.trim() || "Saya",
    mark: draft.mark,
  };
}

export const useExpenseStore = create<ExpenseState>()((set, get) => ({
  expenses: [],
  monthlyBudget: 4_000_000,
  hasSeeded: false,
  lastPayer: "",
  addExpense: (draft) => {
    const fields = fromDraft(draft);
    const expense: Expense = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...fields,
    };
    set({
      expenses: [expense, ...get().expenses],
      lastPayer: fields.payer,
      hasSeeded: true,
    });
    persist(get());
  },
  updateExpense: (id, draft) => {
    const fields = fromDraft(draft);
    set({
      expenses: get().expenses.map((item) =>
        item.id === id ? { ...item, ...fields } : item,
      ),
      lastPayer: fields.payer,
    });
    persist(get());
  },
  deleteExpense: (id) => {
    set({ expenses: get().expenses.filter((item) => item.id !== id) });
    persist(get());
  },
  setBudget: (amount) => {
    set({ monthlyBudget: Math.max(0, Math.round(amount)) });
    persist(get());
  },
  clearAll: () => {
    set({ expenses: [], hasSeeded: true });
    persist(get());
  },
  seedIfEmpty: () => {
    // Demo seeding dihapus sesuai instruksi
  },
}));

let didHydrate = false;

export function hydrateLedgerStore() {
  if (didHydrate || typeof window === "undefined") return;
  didHydrate = true;
  useExpenseStore.setState(loadLedger());
}

// Compatibility shim for any code expecting Zustand's persist API
Object.defineProperty(useExpenseStore, "persist", {
  value: {
    hasHydrated: () => true,
    rehydrate: () => {
      hydrateLedgerStore();
    },
    onFinishHydration: (cb: () => void) => {
      cb();
      return () => {};
    },
  },
  configurable: true,
  writable: true,
});

if (typeof window !== "undefined") {
  hydrateLedgerStore();
}

