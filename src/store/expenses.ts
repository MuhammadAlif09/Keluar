import { create } from "zustand";
import type { CategoryId } from "../lib/categories";
import {
  loadLedger,
  saveLedger,
  type StoredExpense,
  type StoredLedger,
} from "../lib/ledger-storage";
import type { MarkId } from "../lib/marks";

export type Expense = StoredExpense;

export type ExpenseDraft = {
  amount: number;
  category: CategoryId;
  note: string;
  date: string;
  payer: string;
  mark: MarkId | "";
};

export type SaveStatus = "saved" | "saving" | "error";

type ExpenseState = StoredLedger & {
  saveStatus: SaveStatus;
  addExpense: (draft: ExpenseDraft) => boolean;
  updateExpense: (id: string, draft: ExpenseDraft) => boolean;
  deleteExpense: (id: string) => boolean;
  setBudget: (amount: number) => boolean;
  clearAll: () => boolean;
  retrySave: () => boolean;
  seedIfEmpty: () => void;
};

function persist(
  state: ExpenseState,
  set: (partial: Partial<ExpenseState>) => void,
): boolean {
  const ok = saveLedger({
    expenses: state.expenses,
    monthlyBudget: state.monthlyBudget,
    hasSeeded: state.hasSeeded,
    lastPayer: state.lastPayer,
  });
  set({ saveStatus: ok ? "saved" : "error" });
  return ok;
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
  saveStatus: "saved",
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
      saveStatus: "saving",
    });
    return persist(get(), set);
  },
  updateExpense: (id, draft) => {
    const fields = fromDraft(draft);
    set({
      expenses: get().expenses.map((item) =>
        item.id === id ? { ...item, ...fields } : item,
      ),
      lastPayer: fields.payer,
      saveStatus: "saving",
    });
    return persist(get(), set);
  },
  deleteExpense: (id) => {
    set({
      expenses: get().expenses.filter((item) => item.id !== id),
      saveStatus: "saving",
    });
    return persist(get(), set);
  },
  setBudget: (amount) => {
    set({
      monthlyBudget: Math.max(0, Math.round(amount)),
      saveStatus: "saving",
    });
    return persist(get(), set);
  },
  clearAll: () => {
    set({
      expenses: [],
      hasSeeded: true,
      saveStatus: "saving",
    });
    return persist(get(), set);
  },
  retrySave: () => {
    return persist(get(), set);
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

