import { Sparkles } from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { formatCompactId, formatRupiah } from "@/lib/format";
import type { Expense } from "@/store/expenses";

type CategoryBreakdownProps = {
  expenses: Expense[];
  onSelect?: (id: CategoryId) => void;
  active?: CategoryId | "all";
};

export function CategoryBreakdown({
  expenses,
  onSelect,
  active = "all",
}: CategoryBreakdownProps) {
  const totals = new Map<CategoryId, number>();
  for (const item of expenses) {
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
  }

  const rows = CATEGORIES.map((cat) => ({
    ...cat,
    total: totals.get(cat.id) ?? 0,
  }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);

  const max = rows[0]?.total ?? 0;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 border border-dashed border-border/70 px-4 py-7 text-center">
        <div className="mb-2.5 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4.5" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Kosong nih! ✨
        </p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
          Belum ada pengeluaran yang dicatat di bulan ini. Dompet kamu lagi aman sentosa dan istirahat dulu nih 🏖️
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => {
        const Icon = row.icon;
        const scale = max > 0 ? Math.max(0.06, row.total / max) : 0;
        const selected = active === row.id;
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect?.(row.id)}
              className="flex w-full flex-col gap-1.5 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm">
                  <Icon
                    className="size-3.5 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className={selected ? "font-medium" : ""}>
                    {row.label}
                  </span>
                </span>
                <span className="tabular-nums text-sm text-muted-foreground">
                  {formatCompactId(row.total)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full w-full origin-left rounded-full bg-primary transition-[transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `scaleX(${scale})` }}
                  title={formatRupiah(row.total)}
                />
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
