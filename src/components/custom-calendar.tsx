import { useState } from "react";
import {
  addMonths,
  format,
  isSameDay,
  isToday,
  parseISO,
  subMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type CustomCalendarProps = {
  value: string; // ISO string YYYY-MM-DD
  onChange: (dateStr: string) => void;
  onClose?: () => void;
  className?: string;
};

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function CustomCalendar({
  value,
  onChange,
  onClose,
  className,
}: CustomCalendarProps) {
  // Parse nilai yang dipilih saat ini
  const selectedDate = (() => {
    try {
      const parsed = parseISO(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch {
      return new Date();
    }
  })();

  // State bulan yang sedang dilihat di kalender
  const [viewDate, setViewDate] = useState<Date>(selectedDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Hari pertama di bulan dan total hari
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Minggu
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigasi bulan
  const handlePrevMonth = () => setViewDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setViewDate((prev) => addMonths(prev, 1));

  // Pilih tanggal
  const handleSelectDay = (dayNumber: number) => {
    const picked = new Date(year, month, dayNumber);
    const isoString = format(picked, "yyyy-MM-dd");
    onChange(isoString);
    onClose?.();
  };

  // Pilih hari ini
  const handleSelectToday = () => {
    const today = new Date();
    setViewDate(today);
    onChange(format(today, "yyyy-MM-dd"));
    onClose?.();
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-popover text-popover-foreground p-2.5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 select-none ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
    >
      {/* Header Kalender: Bulan & Tahun + Tombol Panah */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/50">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex size-6.5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-90"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <span className="text-xs font-semibold capitalize tracking-tight text-foreground">
          {format(viewDate, "MMMM yyyy", { locale: localeId })}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex size-6.5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-90"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Baris Nama Hari */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAY_NAMES.map((name, i) => (
          <span
            key={name}
            className={cn(
              "text-[10px] font-semibold py-0.5",
              i === 0 ? "text-destructive/80" : "text-muted-foreground/80",
            )}
          >
            {name}
          </span>
        ))}
      </div>

      {/* Grid Hari dalam Sebulan */}
      <div className="grid grid-cols-7 gap-1">
        {/* Placeholder ruang kosong sebelum tanggal 1 */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="size-7" />
        ))}

        {/* Angka tanggal 1 sampai akhir bulan */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNum = index + 1;
          const currentDayDate = new Date(year, month, dayNum);
          const isSelected = isSameDay(currentDayDate, selectedDate);
          const isCurrentToday = isToday(currentDayDate);
          const isSunday = currentDayDate.getDay() === 0;

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handleSelectDay(dayNum)}
              className={cn(
                "relative flex size-7 items-center justify-center rounded-md text-xs font-medium transition-all active:scale-90",
                isSelected
                  ? "bg-primary text-primary-foreground font-bold shadow-xs scale-105 z-10"
                  : isCurrentToday
                    ? "bg-primary/10 text-primary font-bold border border-primary/30"
                    : isSunday
                      ? "text-destructive/90 hover:bg-muted"
                      : "text-foreground hover:bg-muted",
              )}
            >
              <span>{dayNum}</span>
              {isCurrentToday && !isSelected && (
                <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Kalender: Tombol Pintas Hari Ini & Tutup */}
      <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-border/50 text-xs">
        <button
          type="button"
          onClick={handleSelectToday}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline active:scale-95"
        >
          <RotateCcw className="size-3" />
          <span>Hari Ini</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground active:scale-95 px-1.5 py-0.5 rounded hover:bg-muted"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
}
