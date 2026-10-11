import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Settings2,
  Upload,
  Wallet,
} from "lucide-react";
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
import {
  normalizeExpense,
  recentPayers,
  type StoredExpense,
} from "@/lib/ledger-storage";
import { cn } from "@/lib/utils";
import {
  hydrateLedgerStore,
  useExpenseStore,
  type Expense,
  type ExpenseDraft,
} from "@/store/expenses";
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
  const saveStatus = useExpenseStore((s) => s.saveStatus);
  const retrySave = useExpenseStore((s) => s.retrySave);
  const lastPayer = useExpenseStore((s) => s.lastPayer);
  const restoreData = useExpenseStore((s) => s.restoreData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState(currentMonth);
  const [filter, setFilter] = useState<FilterId>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<"category" | "amount" | "details">("category");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");

  useEffect(() => {
    hydrateLedgerStore();
  }, []);

  const prefix = monthPrefix(view.year, view.month);
  const knownPayers = useMemo(() => recentPayers(expenses), [expenses]);
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
    setFormStep("category");
    setFormOpen(true);
  }

  const bottomDragRef = useRef<{ startY: number; isTracking: boolean }>({
    startY: 0,
    isTracking: false,
  });

  function onBottomPointerDown(e: React.PointerEvent) {
    bottomDragRef.current = { startY: e.clientY, isTracking: true };
  }

  function onBottomPointerMove(e: React.PointerEvent) {
    if (!bottomDragRef.current.isTracking) return;
    const deltaY = e.clientY - bottomDragRef.current.startY;
    // Jika ditarik ke atas lebih dari 18px, buka menu catat pengeluaran
    if (deltaY < -18) {
      bottomDragRef.current.isTracking = false;
      openCreate();
    }
  }

  function onBottomPointerUp() {
    bottomDragRef.current.isTracking = false;
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormStep("details");
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

  function handleBackup() {
    try {
      const backupData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        expenses,
        monthlyBudget,
        lastPayer,
      };
      const today = isoDate(new Date());
      const fileName = `keluar-backup-${today}.json`;
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup data berhasil diunduh");
    } catch (err) {
      console.error("Gagal membuat backup:", err);
      toast.error("Gagal mengunduh backup data");
    }
  }

  function handleRestoreFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string" || !text.trim()) {
          toast.error("File backup kosong atau tidak dapat dibaca");
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          toast.error("Format file tidak valid (bukan JSON)");
          return;
        }

        if (!parsed || typeof parsed !== "object") {
          toast.error("Format data backup tidak valid");
          return;
        }

        const raw =
          "state" in parsed &&
          typeof (parsed as { state: unknown }).state === "object" &&
          (parsed as { state: unknown }).state
            ? (parsed as { state: unknown }).state
            : parsed;

        const row = raw as Record<string, unknown>;

        if (!Array.isArray(row.expenses)) {
          toast.error("File backup tidak memiliki daftar catatan pengeluaran");
          return;
        }

        const validExpenses = row.expenses
          .map(normalizeExpense)
          .filter((item): item is StoredExpense => item !== null);

        const newBudget =
          typeof row.monthlyBudget === "number" && Number.isFinite(row.monthlyBudget)
            ? Math.max(0, Math.round(row.monthlyBudget))
            : undefined;

        const newPayer = typeof row.lastPayer === "string" ? row.lastPayer : undefined;

        const success = restoreData({
          expenses: validExpenses,
          monthlyBudget: newBudget,
          lastPayer: newPayer,
        });

        if (success) {
          setSettingsOpen(false);
          toast.success(`${validExpenses.length} catatan dipulihkan`);
        } else {
          toast.error("Gagal menyimpan data yang dipulihkan ke penyimpanan");
        }
      } catch (err) {
        console.error("Gagal memulihkan file backup:", err);
        toast.error("Gagal memulihkan file backup");
      }
    };

    reader.onerror = () => {
      toast.error("Gagal membaca file backup");
    };

    reader.readAsText(file);
  }

  return (
    <div className="min-h-dvh bg-background pb-[max(7rem,calc(6rem+env(safe-area-inset-bottom)))] text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-2">
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

      {saveStatus === "error" && (
        <div className="mx-auto max-w-5xl px-4 pt-2">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
            <span>Penyimpanan lokal tidak tersedia atau gagal menyimpan data.</span>
            <button
              type="button"
              onClick={() => retrySave()}
              className="shrink-0 font-semibold underline hover:no-underline cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

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
                      "h-full w-full rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      overBudget ? "bg-destructive" : "bg-primary",
                    )}
                    style={{
                      transform: `translateX(-${100 - Math.min(100, Math.max(0, budgetPct))}%)`,
                    }}
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

          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium">Tujuh hari terakhir</h2>
              <span className="text-xs text-muted-foreground font-normal">
                {isCurrentMonth ? "Minggu ini" : formatMonthTitle(view.year, view.month)}
              </span>
            </div>
            <WeekStrip expenses={expenses} monthExpenses={monthExpenses} view={view} />
          </div>

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

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="pointer-events-auto mx-auto max-w-5xl px-4">
          <Button
            ref={createButtonRef}
            size="lg"
            className="h-12 w-full rounded-xl font-medium shadow-md shadow-primary/15 transition-all duration-200 active:scale-[0.97] hover:shadow-lg hover:shadow-primary/25 cursor-pointer touch-none"
            onClick={openCreate}
            onPointerDown={onBottomPointerDown}
            onPointerMove={onBottomPointerMove}
            onPointerUp={onBottomPointerUp}
            onPointerCancel={onBottomPointerUp}
            title="Klik atau tarik ke atas untuk mencatat pengeluaran"
          >
            <Plus className="size-4 stroke-[2.5]" />
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
        triggerRef={createButtonRef}
      >
        <DrawerContent>
          <DrawerHeader className="text-center pt-2.5 pb-1">
            <DrawerTitle className="text-center font-display text-lg font-semibold tracking-tight">
              {formStep === "category" ? "Kategori" : formStep === "amount" ? "Nominal" : "Detail"}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Form {formStep === "category" ? "kategori" : formStep === "amount" ? "nominal" : "detail"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto overflow-x-hidden">
            <ExpenseForm
              key={editing?.id ?? "new"}
              initial={editing}
              knownPayers={knownPayers}
              defaultPayer=""
              submitLabel={editing ? "Simpan perubahan" : "Simpan"}
              onStepChange={setFormStep}
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".json,application/json"
            className="hidden"
          />
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
              className="justify-start"
              onClick={handleBackup}
            >
              <Download className="mr-2 size-4" />
              Backup data (unduh file)
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 size-4" />
              Pulihkan dari file backup
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
