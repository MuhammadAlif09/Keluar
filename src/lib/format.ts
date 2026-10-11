import { format, isToday, isYesterday, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function formatRupiah(amount: number): string {
  return `Rp ${formatRupiahPlain(amount)}`;
}

export function formatRupiahPlain(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactId(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    const n = amount / 1_000_000_000;
    return `Rp ${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  }
  if (abs >= 1_000_000) {
    const n = amount / 1_000_000;
    return `Rp ${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  if (abs >= 1_000) {
    const n = amount / 1_000;
    return `Rp ${n.toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  }
  return formatRupiah(amount);
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgoIso(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

export function formatDayHeading(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return "Hari ini";
  if (isYesterday(d)) return "Kemarin";
  return format(d, "EEEE, d MMMM", { locale: localeId });
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  return format(d, "LLLL yyyy", { locale: localeId });
}

export function monthPrefix(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}
