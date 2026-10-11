import { CATEGORY_MAP, type CategoryId } from "@/lib/categories";
import { formatDayHeading, formatRupiah } from "@/lib/format";
import { MARK_MAP } from "@/lib/marks";
import { cn } from "@/lib/utils";
import type { Expense } from "@/store/expenses";

type ExpenseListProps = {
  expenses: Expense[];
  onSelect: (expense: Expense) => void;
};

function groupByDate(expenses: Expense[]): Array<[string, Expense[]]> {
  const map = new Map<string, Expense[]>();
  const sorted = [...expenses].sort((a, b) => {
    if (a.date === b.date) return b.createdAt - a.createdAt;
    return a.date < b.date ? 1 : -1;
  });
  for (const item of sorted) {
    const list = map.get(item.date) ?? [];
    list.push(item);
    map.set(item.date, list);
  }
  return Array.from(map.entries());
}

export function ExpenseList({ expenses, onSelect }: ExpenseListProps) {
  const groups = groupByDate(expenses);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl bg-card px-5 py-10 text-center shadow-card">
        <p className="font-display text-lg font-medium">Belum ada catatan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat pengeluaran pertama di bulan ini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(([date, items]) => {
        const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);
        return (
          <section key={date} className="flex flex-col gap-2">
            <header className="flex items-baseline justify-between px-1">
              <h3 className="text-sm font-medium">{formatDayHeading(date)}</h3>
              <p className="tabular-nums text-xs text-muted-foreground">
                {formatRupiah(dayTotal)}
              </p>
            </header>
            <ul className="overflow-hidden rounded-xl bg-card shadow-card">
              {items.map((item, index) => {
                const cat = CATEGORY_MAP[item.category as CategoryId];
                const Icon = cat.icon;
                const mark = item.mark ? MARK_MAP[item.mark] : null;
                const MarkIcon = mark?.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-[background-color] duration-150 hover:bg-muted/60",
                        index > 0 && "border-t border-border",
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-4" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {item.note || cat.label}
                        </span>
                        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="truncate">
                            {cat.label}
                            {item.payer ? ` · ${item.payer}` : ""}
                          </span>
                          {mark && MarkIcon ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                              <MarkIcon className="size-3" strokeWidth={1.75} />
                              {mark.label}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-sm font-medium">
                        {formatRupiah(item.amount)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
