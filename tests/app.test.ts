import { describe, it, expect, beforeEach } from "vitest";

let mockStore: Record<string, string> = {};
let throwOnGet = false;
let throwOnSet = false;

const mockLocalStorage = {
  getItem: (key: string) => {
    if (throwOnGet) throw new Error("SecurityError: Access is denied");
    return mockStore[key] ?? null;
  },
  setItem: (key: string, value: string) => {
    if (throwOnSet) throw new Error("QuotaExceededError");
    mockStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete mockStore[key];
  },
  clear: () => {
    mockStore = {};
  },
  get length() {
    return Object.keys(mockStore).length;
  },
  key: (index: number) => Object.keys(mockStore)[index] ?? null,
};

// @ts-expect-error Mocking for test
globalThis.localStorage = mockLocalStorage;
// @ts-expect-error Mocking for test
globalThis.window = { localStorage: mockLocalStorage };

import {
  loadLedger,
  saveLedger,
  LEDGER_KEY,
  recentPayers,
  normalizeExpense,
} from "@/lib/ledger-storage";
import { useExpenseStore } from "@/store/expenses";
import {
  formatRupiah,
  formatRupiahPlain,
  isoDate,
  monthPrefix,
} from "@/lib/format";

describe("Ledger Storage & Error Handling", () => {
  beforeEach(() => {
    mockStore = {};
    throwOnGet = false;
    throwOnSet = false;
    useExpenseStore.setState({
      expenses: [],
      monthlyBudget: 4_000_000,
      hasSeeded: true,
      lastPayer: "",
      saveStatus: "saved",
    });
  });

  it("loadLedger returns a clean empty state when storage is empty", () => {
    const ledger = loadLedger();
    expect(ledger.expenses).toEqual([]);
    expect(ledger.monthlyBudget).toBe(4_000_000);
    expect(ledger.lastPayer).toBe("");
  });

  it("loadLedger handles corrupted JSON gracefully without throwing", () => {
    localStorage.setItem(LEDGER_KEY, "invalid-json-content-{{[[");
    expect(() => loadLedger()).not.toThrow();
    const ledger = loadLedger();
    expect(ledger.expenses).toEqual([]);
  });

  it("loadLedger handles localStorage read errors (e.g. security sandbox)", () => {
    throwOnGet = true;
    expect(() => loadLedger()).not.toThrow();
    const ledger = loadLedger();
    expect(ledger.expenses).toEqual([]);
  });

  it("loadLedger successfully migrates legacy ledger (v1) to current version (v2)", () => {
    const legacyData = {
      expenses: [
        {
          id: "leg-1",
          amount: 50000,
          category: "transport",
          note: "Bensin Pertamax",
          date: "2026-10-10",
          createdAt: 1000,
          payer: "Saya",
          mark: "",
        },
      ],
      monthlyBudget: 3_500_000,
      hasSeeded: true,
      lastPayer: "Saya",
    };
    localStorage.setItem("keluar-ledger-v1", JSON.stringify(legacyData));

    const ledger = loadLedger();
    expect(ledger.expenses.length).toBe(1);
    expect(ledger.expenses[0].amount).toBe(50000);
    expect(ledger.monthlyBudget).toBe(3_500_000);
    expect(localStorage.getItem(LEDGER_KEY)).toBeTruthy();
  });

  it("saveLedger returns true on success and catches errors on quota exceeded", () => {
    const validData = {
      expenses: [],
      monthlyBudget: 2_000_000,
      hasSeeded: true,
      lastPayer: "Saya",
    };

    expect(saveLedger(validData)).toBe(true);

    throwOnSet = true;
    expect(saveLedger(validData)).toBe(false);
  });

  it("recentPayers filters duplicates and empty names properly", () => {
    const sample = [
      { id: "1", amount: 100, category: "makanan" as const, note: "", date: "2026-10-10", createdAt: 1, payer: "Rudi", mark: "" as const },
      { id: "2", amount: 200, category: "makanan" as const, note: "", date: "2026-10-10", createdAt: 2, payer: "rudi", mark: "" as const },
      { id: "3", amount: 300, category: "makanan" as const, note: "", date: "2026-10-10", createdAt: 3, payer: "Dewi", mark: "" as const },
      { id: "4", amount: 400, category: "makanan" as const, note: "", date: "2026-10-10", createdAt: 4, payer: "   ", mark: "" as const },
    ];
    const payers = recentPayers(sample);
    expect(payers).toEqual(["Rudi", "Dewi"]);
  });
});

describe("Expense Store Actions", () => {
  beforeEach(() => {
    mockStore = {};
    throwOnGet = false;
    throwOnSet = false;
    useExpenseStore.setState({
      expenses: [],
      monthlyBudget: 4_000_000,
      hasSeeded: true,
      lastPayer: "",
      saveStatus: "saved",
    });
  });

  it("addExpense adds expense and updates lastPayer", () => {
    const success = useExpenseStore.getState().addExpense({
      amount: 45000,
      category: "makanan",
      note: "Nasi Padang Rendang",
      date: "2026-10-11",
      payer: "Saya",
      mark: "",
    });

    expect(success).toBe(true);
    const state = useExpenseStore.getState();
    expect(state.expenses.length).toBe(1);
    expect(state.expenses[0].amount).toBe(45000);
    expect(state.expenses[0].note).toBe("Nasi Padang Rendang");
    expect(state.lastPayer).toBe("Saya");
    expect(state.saveStatus).toBe("saved");
  });

  it("updateExpense updates existing record by ID", () => {
    useExpenseStore.getState().addExpense({
      amount: 12000,
      category: "minuman",
      note: "Es Teh Manis",
      date: "2026-10-11",
      payer: "Saya",
      mark: "",
    });

    const id = useExpenseStore.getState().expenses[0].id;
    const success = useExpenseStore.getState().updateExpense(id, {
      amount: 15000,
      category: "minuman",
      note: "Es Teh Manis Jumbo",
      date: "2026-10-11",
      payer: "Saya",
      mark: "",
    });

    expect(success).toBe(true);
    const updated = useExpenseStore.getState().expenses[0];
    expect(updated.amount).toBe(15000);
    expect(updated.note).toBe("Es Teh Manis Jumbo");
  });

  it("deleteExpense removes transaction", () => {
    useExpenseStore.getState().addExpense({
      amount: 25000,
      category: "hiburan",
      note: "Tiket",
      date: "2026-10-11",
      payer: "Saya",
      mark: "",
    });

    const id = useExpenseStore.getState().expenses[0].id;
    expect(useExpenseStore.getState().expenses.length).toBe(1);

    const success = useExpenseStore.getState().deleteExpense(id);
    expect(success).toBe(true);
    expect(useExpenseStore.getState().expenses.length).toBe(0);
  });

  it("setBudget modifies the monthly budget", () => {
    const success = useExpenseStore.getState().setBudget(5_000_000);
    expect(success).toBe(true);
    expect(useExpenseStore.getState().monthlyBudget).toBe(5_000_000);
  });

  it("clearAll wipes all transactions", () => {
    useExpenseStore.getState().addExpense({
      amount: 10000,
      category: "belanja",
      note: "Sabun",
      date: "2026-10-11",
      payer: "Saya",
      mark: "",
    });

    expect(useExpenseStore.getState().expenses.length).toBe(1);
    const success = useExpenseStore.getState().clearAll();
    expect(success).toBe(true);
    expect(useExpenseStore.getState().expenses.length).toBe(0);
  });

  it("restoreData replaces all transactions, budget, and lastPayer", () => {
    useExpenseStore.getState().addExpense({
      amount: 5000,
      category: "makanan",
      note: "Permen",
      date: "2026-10-10",
      payer: "Saya",
      mark: "",
    });

    const restoredExpenses = [
      {
        id: "restored-1",
        amount: 75000,
        category: "kesehatan" as const,
        note: "Vitamin C",
        date: "2026-10-09",
        createdAt: 5000,
        payer: "Budi",
        mark: "" as const,
      },
    ];

    const success = useExpenseStore.getState().restoreData({
      expenses: restoredExpenses,
      monthlyBudget: 6_000_000,
      lastPayer: "Budi",
    });

    expect(success).toBe(true);
    const state = useExpenseStore.getState();
    expect(state.expenses.length).toBe(1);
    expect(state.expenses[0].id).toBe("restored-1");
    expect(state.expenses[0].amount).toBe(75000);
    expect(state.monthlyBudget).toBe(6_000_000);
    expect(state.lastPayer).toBe("Budi");
    expect(state.saveStatus).toBe("saved");
  });
});

describe("Expense Normalization", () => {
  it("normalizeExpense validates and sanitizes expense objects", () => {
    const valid = normalizeExpense({
      id: "exp-1",
      amount: 25000.7,
      category: "makanan",
      note: "Nasi",
      date: "2026-10-11",
      payer: " Ani ",
      mark: "kantor",
    });
    expect(valid).not.toBeNull();
    expect(valid?.amount).toBe(25001);
    expect(valid?.payer).toBe("Ani");
    expect(valid?.mark).toBe("kantor");

    // Invalid category
    expect(normalizeExpense({ id: "1", amount: 100, category: "invalid", date: "2026-10-11" })).toBeNull();
    // Invalid amount
    expect(normalizeExpense({ id: "1", amount: "not a number", category: "makanan", date: "2026-10-11" })).toBeNull();
    // Invalid date
    expect(normalizeExpense({ id: "1", amount: 100, category: "makanan", date: 12345 })).toBeNull();
  });
});

describe("Format & Parsing Helpers", () => {
  it("formatRupiahPlain formats numbers into IDR notation without prefix", () => {
    expect(formatRupiahPlain(0)).toBe("0");
    expect(formatRupiahPlain(1000)).toBe("1.000");
    expect(formatRupiahPlain(50000)).toBe("50.000");
    expect(formatRupiahPlain(1250000)).toBe("1.250.000");
  });

  it("formatRupiah formats correctly with Rp prefix", () => {
    expect(formatRupiah(50000)).toBe("Rp 50.000");
  });

  it("isoDate and monthPrefix generate expected date strings", () => {
    const date = new Date(2026, 9, 11); // October 11, 2026
    expect(isoDate(date)).toBe("2026-10-11");
    expect(monthPrefix(2026, 9)).toBe("2026-10");
  });
});
