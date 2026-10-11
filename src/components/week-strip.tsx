import { format, startOfDay, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { isoDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Expense } from "@/store/expenses";

type WeekStripProps = {
  expenses: Expense[];
};

export function WeekStrip({ expenses }: WeekStripProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = isoDate(d);
    const total = expenses
      .filter((item) => item.date === key)
      .reduce((sum, item) => sum + item.amount, 0);
    return { date: d, key, total, isToday: i === 6 };
  });

  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <div className="flex items-end justify-between gap-2">
      {days.map((day) => {
        const height = Math.max(6, Math.round((day.total / max) * 64));
        return (
          <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-full items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-7 rounded-sm transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  day.total === 0
                    ? "bg-muted"
                    : day.isToday
                      ? "bg-primary"
                      : "bg-primary/45",
                )}
                style={{ height }}
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                day.isToday ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {format(day.date, "EEEEE", { locale: localeId })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
