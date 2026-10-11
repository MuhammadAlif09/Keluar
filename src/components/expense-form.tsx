import { useEffect, useState } from "react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { formatRupiahPlain, isoDate } from "@/lib/format";
import { MARKS, type MarkId } from "@/lib/marks";
import { cn } from "@/lib/utils";
import type { Expense, ExpenseDraft } from "@/store/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

type ExpenseFormProps = {
  initial?: Expense | null;
  knownPayers: string[];
  defaultPayer: string;
  onSubmit: (draft: ExpenseDraft) => void;
  onDelete?: () => void;
  submitLabel: string;
};

export function ExpenseForm({
  initial,
  knownPayers,
  defaultPayer,
  onSubmit,
  onDelete,
  submitLabel,
}: ExpenseFormProps) {
  const [amountRaw, setAmountRaw] = useState(
    initial ? String(initial.amount) : "",
  );
  const [category, setCategory] = useState<CategoryId>(
    initial?.category ?? "makanan",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(initial?.date ?? isoDate(new Date()));
  const [payer, setPayer] = useState(initial?.payer || defaultPayer || "Saya");
  const [mark, setMark] = useState<MarkId | "">(initial?.mark ?? "");

  useEffect(() => {
    setAmountRaw(initial ? String(initial.amount) : "");
    setCategory(initial?.category ?? "makanan");
    setNote(initial?.note ?? "");
    setDate(initial?.date ?? isoDate(new Date()));
    setPayer(initial?.payer || defaultPayer || "Saya");
    setMark(initial?.mark ?? "");
  }, [initial, defaultPayer]);

  const amount = amountRaw ? Number.parseInt(amountRaw, 10) || 0 : 0;
  const canSave = amount > 0 && Boolean(date) && Boolean(payer.trim());

  function handleAmountChange(value: string) {
    const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setAmountRaw(digits);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    onSubmit({ amount, category, note, date, payer, mark });
  }

  const chips = knownPayers.filter(
    (name) => name.toLowerCase() !== payer.trim().toLowerCase(),
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount" className="text-muted-foreground">
          Jumlah
        </Label>
        <div className="flex items-baseline gap-2 rounded-lg bg-muted px-4 py-3">
          <span className="text-lg font-medium text-muted-foreground">Rp</span>
          <input
            id="amount"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={amount ? formatRupiahPlain(amount) : ""}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent font-display text-4xl font-medium tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40"
            aria-label="Jumlah pengeluaran"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmountRaw(String(amount + value))}
              className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-[background-color,color] duration-150 hover:bg-muted hover:text-foreground"
            >
              +{formatRupiahPlain(value)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="payer" className="text-muted-foreground">
          Siapa yang bayar
        </Label>
        <Input
          id="payer"
          maxLength={40}
          autoComplete="name"
          placeholder="Nama"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
        />
        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setPayer(name)}
                className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-[background-color,color] duration-150 hover:bg-muted hover:text-foreground"
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">Kategori</Label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            const selected = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-center transition-[background-color,color,box-shadow] duration-150",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                <span className="text-xs leading-tight font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">Tanda (opsional)</Label>
        <div className="flex flex-wrap gap-2">
          {MARKS.map((item) => {
            const Icon = item.icon;
            const selected = mark === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMark(selected ? "" : item.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-[background-color,color] duration-150",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="note" className="text-muted-foreground">
            Catatan
          </Label>
          <Input
            id="note"
            maxLength={80}
            placeholder="Mis. Nasi Padang"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="date" className="text-muted-foreground">
            Tanggal
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" size="lg" disabled={!canSave} className="w-full">
          {submitLabel}
        </Button>
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            Hapus catatan
          </Button>
        ) : null}
      </div>
    </form>
  );
}
