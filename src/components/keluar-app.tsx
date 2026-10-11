import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Settings2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import {
  daysInMonth,
  formatMonthTitle,
  formatRupiah,
  formatRupiahPlain,
  isoDate,
  monthPrefix,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useExpenseStore, type Expense, type ExpenseDraft } from "@/store/expenses";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { WeekStrip } from "@/components/week-strip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FilterId = CategoryId | "all";

function currentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function KeluarApp() {
  const expenses = useExpenseStore((s) => s.expenses);
  const monthlyBudget = useExpenseStore((s) => s.monthlyBudget);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const setBudget = useExpenseStore((s) => s.setBudget);
  const clearAll = useExpenseStore((s) => s.clearAll);
  const [view, setView] = useState(currentMonth);
  const [filter, setFilter] = useState<FilterId>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");

  useEffect(() => {
    const finish = () => {
      useExpenseStore.getState().seedIfEmpty();
    };
    if (useExpenseStore.persist.hasHydrated()) {
      finish();
      return;
    }
    const unsub = useExpenseStore.persist.onFinishHydration(finish);
    void useExpenseStore.persist.rehydrate();
    return unsub;
  }, []);

  const prefix = monthPrefix(view.year, view.month);
  const monthExpenses = useMemo(
    () => expenses.filter((item) => item.date.startsWith(prefix)),
    [expenses, prefix],
  );
  const visible = useMemo(
    () =>
      filter === "all"
        ? monthExpenses
        : monthExpenses.filter((item) => item.category === filter),
    [monthExpenses, filter],
  );

  const total = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const now = new Date();
  const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();
  const elapsedDays = isCurrentMonth
    ? now.getDate()
    : daysInMonth(view.year, view.month);
  const dailyAvg = elapsedDays > 0 ? Math.round(total / elapsedDays) : 0;
  const budgetPct = monthlyBudget > 0 ? Math.min(999, (total / monthlyBudget) * 100) : 0;
  const overBudget = monthlyBudget > 0 && total > monthlyBudget;

  const todayIso = isoDate(now);
  const todayTotal = expenses
    .filter((item) => item.date === todayIso)
    .reduce((sum, item) => sum + item.amount, 0);

  function shiftMonth(delta: number) {
    setView((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setFilter("all");
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  function handleSubmit(draft: ExpenseDraft) {
    if (editing) {
      updateExpense(editing.id, draft);
      toast("Catatan diperbarui");
    } else {
      addExpense(draft);
      toast("Pengeluaran dicatat");
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!editing) return;
    deleteExpense(editing.id);
    setDeleteOpen(false);
    setFormOpen(false);
    setEditing(null);
    toast("Catatan dihapus");
  }

  function openBudget() {
    setBudgetDraft(monthlyBudget ? String(monthlyBudget) : "");
    setBudgetOpen(true);
  }

  function saveBudget() {
    const value = Number.parseInt(budgetDraft.replace(/\D/g, ""), 10) || 0;
    setBudget(value);
    setBudgetOpen(false);
    toast(value > 0 ? "Anggaran disimpan" : "Anggaran dihapus");
  }

  return (
    <div className="min-h-dvh bg-background pb-28 text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-6 pb-2">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Buku kas
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight">Keluar</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Pengaturan"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 />
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 pt-4 lg:grid-cols-2 lg:items-start">
        <section className="flex flex-col gap-4">
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Bulan sebelumnya"
                onClick={() => shiftMonth(-1)}
              >
                <ChevronLeft />
              </Button>
              <p className="text-sm font-medium">
                {formatMonthTitle(view.year, view.month)}
              </p>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Bulan berikutnya"
                onClick={() => shiftMonth(1)}
                disabled={isCurrentMonth}
              >
                <ChevronRight />
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">Pengeluaran bulan ini</p>
            <p className="font-display mt-1 text-4xl leading-none font-medium tracking-tight tabular-nums sm:text-5xl">
              {formatRupiah(total)}
            </p>

            <button
              type="button"
              onClick={openBudget}
              className="mt-5 flex w-full flex-col gap-2 text-left"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet className="size-3.5" />
                  {monthlyBudget > 0
                    ? `Anggaran ${formatRupiah(monthlyBudget)}`
                    : "Atur anggaran bulan ini"}
                </span>
                {monthlyBudget > 0 ? (
                  <span
                    className={cn(
                      "tabular-nums font-medium",
                      overBudget ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {Math.round(budgetPct)}%
                  </span>
                ) : null}
              </div>
              {monthlyBudget > 0 ? (
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      overBudget ? "bg-destructive" : "bg-primary",
                    )}
                    style={{ width: `${Math.min(100, budgetPct)}%` }}
                  />
                </div>
              ) : (
                <div className="h-1.5 rounded-full bg-muted" />
              )}
            </button>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div>
                <dt className="text-xs text-muted-foreground">Hari ini</dt>
                <dd className="mt-0.5 truncate text-sm font-medium tabular-nums">
                  {formatRupiah(isCurrentMonth ? todayTotal : 0)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Rata-rata / hari</dt>
                <dd className="mt-0.5 truncate text-sm font-medium tabular-nums">
                  {formatRupiah(dailyAvg)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Transaksi</dt>
                <dd className="mt-0.5 text-sm font-medium tabular-nums">
                  {monthExpenses.length}
                </dd>
              </div>
            </dl>
          </div>

          {isCurrentMonth ? (
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h2 className="mb-4 text-sm font-medium">Tujuh hari terakhir</h2>
              <WeekStrip expenses={expenses} />
            </div>
          ) : null}

          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium">Kategori</h2>
              {filter !== "all" ? (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="text-xs font-medium text-primary"
                >
                  Tampilkan semua
                </button>
              ) : null}
            </div>
            <CategoryBreakdown
              expenses={monthExpenses}
              active={filter}
              onSelect={(id) => setFilter((prev) => (prev === id ? "all" : id))}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 pb-4">
          <div className="flex items-end justify-between gap-3 px-1">
            <h2 className="font-display text-xl font-medium tracking-tight">
              {filter === "all"
                ? "Riwayat"
                : CATEGORIES.find((c) => c.id === filter)?.label}
            </h2>
            <p className="text-xs text-muted-foreground">
              {visible.length} catatan
            </p>
          </div>
          <ExpenseList expenses={visible} onSelect={openEdit} />
        </section>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto max-w-5xl px-4">
          <Button size="lg" className="h-12 w-full rounded-lg" onClick={openCreate}>
            <Plus className="size-4" />
            Catat pengeluaran
          </Button>
        </div>
      </div>

      <Drawer
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editing ? "Ubah catatan" : "Catat pengeluaran"}
            </DrawerTitle>
            <DrawerDescription>
              {editing
                ? "Perbarui jumlah, kategori, atau tanggal."
                : "Tulis jumlah, pilih kategori, simpan."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <ExpenseForm
              key={editing?.id ?? "new"}
              initial={editing}
              submitLabel={editing ? "Simpan perubahan" : "Simpan"}
              onSubmit={handleSubmit}
              onDelete={editing ? () => setDeleteOpen(true) : undefined}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anggaran bulanan</DialogTitle>
            <DialogDescription>
              Batas pengeluaran yang ingin kamu jaga setiap bulan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="budget" className="text-muted-foreground">
              Jumlah (Rp)
            </Label>
            <Input
              id="budget"
              inputMode="numeric"
              value={
                budgetDraft
                  ? formatRupiahPlain(Number.parseInt(budgetDraft, 10) || 0)
                  : ""
              }
              onChange={(e) =>
                setBudgetDraft(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))
              }
              placeholder="4.000.000"
            />
          </div>
          <Button onClick={saveBudget} className="w-full">
            Simpan anggaran
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pengaturan</DialogTitle>
            <DialogDescription>
              Data tersimpan di perangkat ini.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                setSettingsOpen(false);
                openBudget();
              }}
            >
              Atur anggaran
            </Button>
            <Button
              variant="outline"
              className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                setSettingsOpen(false);
                setClearOpen(true);
              }}
            >
              Hapus semua catatan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus catatan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengeluaran ini akan dihapus dari buku kas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus semua catatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh riwayat pengeluaran di perangkat ini akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearAll();
                setClearOpen(false);
                toast("Semua catatan dihapus");
              }}
            >
              Hapus semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
