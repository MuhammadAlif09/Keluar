import { useMemo } from "react";
import { format, startOfDay, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { formatRupiah, isoDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Expense } from "@/store/expenses";

type WeekStripProps = {
  expenses: Expense[];
  monthExpenses?: Expense[];
  view?: { year: number; month: number };
};

export function WeekStrip({ expenses, monthExpenses, view }: WeekStripProps) {
  const now = new Date();
  const isCurrentMonth = view
    ? view.year === now.getFullYear() && view.month === now.getMonth()
    : true;

  // Sumber pengeluaran bulan aktif: menjamin bar nurun atau ngosong sesuai bulan yang dipilih
  const activeExpenses = useMemo(() => {
    if (monthExpenses) return monthExpenses;
    if (!view) return expenses;
    return expenses.filter((e) => {
      const [y, m] = e.date.split("-").map(Number);
      return y === view.year && m === view.month + 1;
    });
  }, [monthExpenses, expenses, view]);

  // Tanggal acuan 7 hari:
  // - Bulan berjalan: 7 hari terakhir sampai hari ini
  // - Bulan lain: 7 hari terakhir dari bulan tersebut (tanggal akhir bulan)
  const referenceDate = useMemo(() => {
    if (!view) return startOfDay(new Date());
    const n = new Date();
    if (view.year === n.getFullYear() && view.month === n.getMonth()) {
      return startOfDay(n);
    }
    // Hari terakhir di bulan terpilih: new Date(year, month + 1, 0)
    return startOfDay(new Date(view.year, view.month + 1, 0));
  }, [view]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(referenceDate, 6 - i);
      const key = isoDate(d);
      const total = activeExpenses
        .filter((item) => item.date === key)
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        date: d,
        key,
        total,
        isToday: isCurrentMonth && i === 6,
      };
    });
  }, [referenceDate, activeExpenses, isCurrentMonth]);

  // Skala acuan proporsional terhadap pengeluaran bulan aktif:
  // Jika di bulan tersebut pengeluaran kecil, bar menurun secara akurat;
  // Jika bulan tersebut kosong, semua bar akan turun rata (3px ngosong)
  const maxScale = useMemo(() => {
    const dayTotals = days.map((d) => d.total);
    const maxDay = Math.max(...dayTotals, 0);
    return maxDay > 0 ? maxDay : 50_000;
  }, [days]);

  return (
    <div className="flex items-end justify-between gap-2">
      {days.map((day, i) => {
        // Jika total 0 (kosong/ngosong), bar berada di garis dasar rata minimal 3px (3/58)
        // Jika total > 0, bar proporsional terhadap pengeluaran bulan tersebut
        const scaleY =
          day.total === 0 ? 3 / 58 : Math.max(8, Math.round((day.total / maxScale) * 58)) / 58;

        return (
          // Gunakan key={i} agar elemen DOM dipertahankan saat pindah bulan,
          // sehingga transisi CSS transform menganimasikan bar menurun/ngosong dengan smooth!
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-full items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-7 h-[58px] origin-bottom rounded-sm transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  day.total === 0
                    ? "bg-muted/40"
                    : day.isToday
                      ? "bg-primary shadow-xs"
                      : "bg-primary/55",
                )}
                style={{ transform: `scaleY(${scaleY})` }}
                title={
                  day.total > 0
                    ? `${formatRupiah(day.total)} (${format(day.date, "d MMM yyyy", { locale: localeId })})`
                    : `${format(day.date, "d MMM yyyy", { locale: localeId })} (Rp 0)`
                }
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  day.isToday ? "text-primary font-semibold" : "text-foreground",
                )}
              >
                {format(day.date, "EEEEE", { locale: localeId })}
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground/75">
                {format(day.date, "d")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
