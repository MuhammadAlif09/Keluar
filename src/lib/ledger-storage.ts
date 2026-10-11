import { CATEGORY_IDS, type CategoryId } from "./categories";
import { isMarkId, type MarkId } from "./marks";
import { toast } from "sonner";

export const LEDGER_KEY = "keluar-ledger-v2";
const LEGACY_KEY = "keluar-ledger-v1";

export type StoredExpense = {
  id: string;
  amount: number;
  category: CategoryId;
  note: string;
  date: string;
  createdAt: number;
  payer: string;
  mark: MarkId | "";
};

export type StoredLedger = {
  expenses: StoredExpense[];
  monthlyBudget: number;
  hasSeeded: boolean;
  lastPayer: string;
};

function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value);
}

export function normalizeExpense(raw: unknown): StoredExpense | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.amount !== "number" || !Number.isFinite(row.amount)) {
    return null;
  }
  if (!isCategoryId(row.category) || typeof row.date !== "string") return null;
  return {
    id: row.id,
    amount: Math.max(0, Math.round(row.amount)),
    category: row.category,
    note: typeof row.note === "string" ? row.note : "",
    date: row.date,
    createdAt: typeof row.createdAt === "number" ? row.createdAt : 0,
    payer: typeof row.payer === "string" ? row.payer.trim() : "",
    mark: isMarkId(row.mark) ? row.mark : "",
  };
}

function unwrapPersist(raw: string): unknown {
  const parsed: unknown = JSON.parse(raw);
  if (parsed && typeof parsed === "object" && "state" in parsed) {
    return (parsed as { state: unknown }).state;
  }
  return parsed;
}

function emptyLedger(): StoredLedger {
  return {
    expenses: [],
    monthlyBudget: 4_000_000,
    hasSeeded: true,
    lastPayer: "",
  };
}

export function saveLedger(data: StoredLedger): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!window.localStorage) return false;
    const payload: StoredLedger = {
      expenses: data.expenses,
      monthlyBudget: data.monthlyBudget,
      hasSeeded: data.hasSeeded,
      lastPayer: data.lastPayer,
    };
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error("Gagal menyimpan ke penyimpanan lokal:", err);
    toast.error("Gagal menyimpan data ke penyimpanan lokal");
    return false;
  }
}

export function loadLedger(): StoredLedger {
  if (typeof window === "undefined") return emptyLedger();

  try {
    const storage = window.localStorage;
    if (!storage) return emptyLedger();

    const raw = storage.getItem(LEDGER_KEY) ?? storage.getItem(LEGACY_KEY);
    if (!raw) {
      return emptyLedger();
    }

    const state = unwrapPersist(raw);
    if (!state || typeof state !== "object") return emptyLedger();
    const row = state as Record<string, unknown>;
    const expenses = Array.isArray(row.expenses)
      ? row.expenses.map(normalizeExpense).filter((item): item is StoredExpense => item !== null)
      : [];
    const ledger: StoredLedger = {
      expenses,
      monthlyBudget:
        typeof row.monthlyBudget === "number" && Number.isFinite(row.monthlyBudget)
          ? Math.max(0, Math.round(row.monthlyBudget))
          : 4_000_000,
      hasSeeded: Boolean(row.hasSeeded) || expenses.length > 0,
      lastPayer: typeof row.lastPayer === "string" ? row.lastPayer : "",
    };

    // Migrasi data lama jika membaca dari LEGACY_KEY
    if (!storage.getItem(LEDGER_KEY) && storage.getItem(LEGACY_KEY)) {
      try {
        storage.setItem(LEDGER_KEY, JSON.stringify(ledger));
      } catch {
        // Abaikan jika migrasi tulis gagal, data tetap aktif di memori
      }
    }

    return ledger;
  } catch (err) {
    console.warn("Gagal membaca dari penyimpanan lokal:", err);
    return emptyLedger();
  }
}

export function recentPayers(expenses: StoredExpense[], limit = 8): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of expenses) {
    const name = item.payer.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
    if (names.length >= limit) break;
  }
  return names;
}
