import { useEffect, useRef, useState } from "react";
import { addDays, format, isToday, isYesterday, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coins,
  Gift,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  User,
  Users,
} from "lucide-react";
import { CATEGORIES, CATEGORY_MAP, type CategoryId } from "@/lib/categories";
import { daysAgoIso, formatRupiah, formatRupiahPlain, isoDate } from "@/lib/format";
import { MARKS, type MarkId } from "@/lib/marks";
import { cn } from "@/lib/utils";
import type { Expense, ExpenseDraft } from "@/store/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomCalendar } from "@/components/custom-calendar";

// Opsi tanda tanpa patungan karena patungan diisi otomatis jika mode pembayar patungan
const MANUAL_MARKS = MARKS.filter((item) => item.id !== "patungan");

function formatDateFriendly(iso: string) {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return `Hari ini (${format(d, "d MMM", { locale: localeId })})`;
    if (isYesterday(d)) return `Kemarin (${format(d, "d MMM", { locale: localeId })})`;
    return format(d, "EEE, d MMM yyyy", { locale: localeId });
  } catch {
    return iso;
  }
}

// Contoh nama barang dinamis per kategori
const CATEGORY_ITEM_PLACEHOLDERS: Record<CategoryId, string> = {
  makanan: "Nama makanan (misal: Nasi Padang, Ayam Geprek)",
  minuman: "Nama minuman (misal: Es Kopi Susu, Matcha, Es Teh)",
  transport: "Kebutuhan transport (misal: Bensin, Ojek Online, Kereta)",
  belanja: "Barang belanjaan (misal: Sabun, Snack, Belanja Pasar)",
  tagihan: "Jenis tagihan (misal: Listrik PLN, WiFi, Pulsa)",
  hiburan: "Nama hiburan (misal: Tiket Bioskop, Beli Game)",
  kesehatan: "Kebutuhan kesehatan (misal: Obat, Vitamin, Masker)",
  pendidikan: "Kebutuhan belajar (misal: Buku Catatan, Kursus)",
  rumah: "Kebutuhan rumah (misal: Galon Air, Gas Elpiji, Sapu)",
  lainnya: "Nama pengeluaran (misal: Parkir Motor, Donasi, Tip)",
};

// Pilihan nominal kelipatan tombol (-) dan (+)
const STEP_SIZES = [
  { label: "500", value: 500 },
  { label: "1 rb", value: 1000 },
  { label: "2 rb", value: 2000 },
  { label: "5 rb", value: 5000 },
  { label: "10 rb", value: 10000 },
  { label: "20 rb", value: 20000 },
  { label: "50 rb", value: 50000 },
  { label: "100 rb", value: 100000 },
];

type FormStep = "category" | "amount" | "details";
type StepDirection = "forward" | "backward";
type PayerMode = "saya" | "dibayarin" | "patungan";

function parsePayerInitial(raw?: string): { mode: PayerMode; custom: string } {
  if (!raw || raw.trim().toLowerCase() === "saya") {
    return { mode: "saya", custom: "" };
  }
  const clean = raw.trim();
  if (clean.toLowerCase().startsWith("patungan")) {
    const match = clean.match(/^patungan(?:\s*\(|\s*:\s*|\s+)(.*?)\)?$/i);
    return { mode: "patungan", custom: match ? match[1].trim() : "" };
  }
  if (clean.toLowerCase().startsWith("dibayarin")) {
    const match = clean.match(/^dibayarin(?:\s*\(|\s*:\s*|\s+)(.*?)\)?$/i);
    return { mode: "dibayarin", custom: match ? match[1].trim() : "" };
  }
  return { mode: "dibayarin", custom: clean };
}

type ExpenseFormProps = {
  initial?: Expense | null;
  knownPayers: string[];
  defaultPayer: string;
  onSubmit: (draft: ExpenseDraft) => void;
  onDelete?: () => void;
  submitLabel: string;
  onStepChange?: (step: FormStep) => void;
};

export function ExpenseForm({
  initial,
  knownPayers,
  defaultPayer: _defaultPayer,
  onSubmit,
  onDelete,
  submitLabel,
  onStepChange,
}: ExpenseFormProps) {
  const [step, setStep] = useState<FormStep>(initial ? "details" : "category");
  const [direction, setDirection] = useState<StepDirection>("forward");

  const [amountRaw, setAmountRaw] = useState(
    initial ? String(initial.amount) : "",
  );
  const [category, setCategory] = useState<CategoryId>(
    initial?.category ?? "makanan",
  );
  const [hasPickedCategory, setHasPickedCategory] = useState(Boolean(initial));
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(initial?.date ?? isoDate(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);

  // Pilihan pembayar: Saya (sendiri), Dibayarin (orang lain), Patungan (split)
  const initialPayer = parsePayerInitial(initial?.payer);
  const [payerMode, setPayerMode] = useState<PayerMode>(initialPayer.mode);
  const [treatedBy, setTreatedBy] = useState(
    initialPayer.mode === "dibayarin" ? initialPayer.custom : "",
  );
  const [splitWith, setSplitWith] = useState(
    initialPayer.mode === "patungan" ? initialPayer.custom : "",
  );

  const [mark, setMark] = useState<MarkId | "">(initial?.mark ?? "");

  // Nilai nominal kelipatan untuk tombol (-) dan (+)
  const [stepSize, setStepSize] = useState<number>(1000);

  // Animasi counter angka yang super smooth
  const [displayAmount, setDisplayAmount] = useState<number>(
    initial ? initial.amount : 0,
  );
  const displayAmountRef = useRef<number>(initial ? initial.amount : 0);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const animRef = useRef<number | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  const stepDate = (delta: number) => {
    try {
      const current = parseISO(date);
      if (!isNaN(current.getTime())) {
        const next = addDays(current, delta);
        setDate(isoDate(next));
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    setAmountRaw(initial ? String(initial.amount) : "");
    setDisplayAmount(initial ? initial.amount : 0);
    displayAmountRef.current = initial ? initial.amount : 0;
    setCategory(initial?.category ?? "makanan");
    setHasPickedCategory(Boolean(initial));
    setNote(initial?.note ?? "");
    setDate(initial?.date ?? isoDate(new Date()));
    const parsed = parsePayerInitial(initial?.payer);
    setPayerMode(parsed.mode);
    setTreatedBy(parsed.mode === "dibayarin" ? parsed.custom : "");
    setSplitWith(parsed.mode === "patungan" ? parsed.custom : "");
    setMark(initial?.mark ?? "");
    const nextStep = initial ? "details" : "category";
    setStep(nextStep);
    onStepChange?.(nextStep);
    setDirection("forward");
  }, [initial, onStepChange]);

  const amount = amountRaw ? Number.parseInt(amountRaw, 10) || 0 : 0;
  // Boleh simpan tanpa harus isi nama pembayar (karena kosong = bayar sendiri)
  const canSave = amount > 0 && Boolean(date);

  function goToStep(target: FormStep) {
    const stepRank: Record<FormStep, number> = {
      category: 1,
      amount: 2,
      details: 3,
    };
    setDirection(stepRank[target] >= stepRank[step] ? "forward" : "backward");
    setStep(target);
    onStepChange?.(target);
  }

  // Animasi counter angka yang sangat halus & natural
  useEffect(() => {
    if (isEditingManual) {
      displayAmountRef.current = amount;
      setDisplayAmount(amount);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const startVal = displayAmountRef.current;
    const endVal = amount;

    if (startVal === endVal) return;

    const delta = endVal - startVal;
    const startTime = performance.now();
    const duration = 350; // durasi ideal yang gesit & mengalir mulus

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + delta * ease);

      displayAmountRef.current = current;
      setDisplayAmount(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        displayAmountRef.current = endVal;
        setDisplayAmount(endVal);
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [amount, isEditingManual]);

  function handleSelectCategory(catId: CategoryId) {
    setCategory(catId);
    setHasPickedCategory(true);
    goToStep("amount");
  }

  function handleAmountChange(value: string) {
    const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setAmountRaw(digits);
  }

  function handleDecrement() {
    setIsEditingManual(false);
    const next = Math.max(0, amount - stepSize);
    setAmountRaw(next > 0 ? String(next) : "");
  }

  function handleIncrement() {
    setIsEditingManual(false);
    const next = amount + stepSize;
    setAmountRaw(String(next));
  }

  function handleProceedToDetails() {
    if (amount <= 0) return;
    goToStep("details");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    let finalPayer = "";
    if (payerMode === "saya") {
      finalPayer = "";
    } else if (payerMode === "dibayarin") {
      finalPayer = treatedBy.trim() ? `Dibayarin (${treatedBy.trim()})` : "Dibayarin";
    } else if (payerMode === "patungan") {
      finalPayer = splitWith.trim() ? `Patungan (${splitWith.trim()})` : "Patungan";
    }
    // Jika mode pembayar patungan, otomatis tanda patungan aktif
    const finalMark = payerMode === "patungan" ? "patungan" : (mark === "patungan" ? "" : mark);
    onSubmit({ amount, category, note, date, payer: finalPayer, mark: finalMark });
  }

  const currentCat = CATEGORY_MAP[category] ?? CATEGORIES[0];
  const CurrentCatIcon = currentCat.icon;

  const displayValue = isEditingManual
    ? (amount ? formatRupiahPlain(amount) : "")
    : (displayAmount ? formatRupiahPlain(displayAmount) : "");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 pb-4 pt-1 overflow-x-hidden w-full">
      {/* STEP 1: PILIH KATEGORI (BERSIH & BERBASIS IKON) */}
      {step === "category" && (
        <div
          key="step-category"
          className={cn(
            "flex flex-col gap-2.5 min-h-[220px] w-full overflow-x-hidden",
            direction === "forward" ? "step-transition-forward" : "step-transition-backward",
          )}
        >
          <div className="grid grid-cols-5 gap-2 pt-1">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              const isSelected = hasPickedCategory && category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectCategory(item.id)}
                  className={cn(
                    "group flex min-h-18 flex-col items-center justify-center gap-1.5 rounded-xl p-2 text-center transition-all duration-150 active:scale-95",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  title={item.label}
                >
                  <Icon
                    className={cn(
                      "size-5 transition-transform duration-150 group-hover:scale-110",
                      isSelected ? "text-primary-foreground" : "text-foreground/80 group-hover:text-foreground",
                    )}
                    strokeWidth={1.85}
                  />
                  <span className="text-xs leading-tight font-medium">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {hasPickedCategory && (
            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep("amount")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Lanjut</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: NOMINAL (BARIS ATAS: KATEGORI & KETIK NAMA BARANG; STEPPER KOTAK TUMPUL ROUNDED-[10px]; RP RAPAT BORDERLESS) */}
      {step === "amount" && (
        <div
          key="step-amount"
          className={cn(
            "flex flex-col gap-3 min-h-[220px] w-full overflow-x-hidden",
            direction === "forward" ? "step-transition-forward" : "step-transition-backward",
          )}
        >
          {/* Baris Atas: Badge Kategori + Input Ketik Nama Barang yang Dibeli */}
          <div className="flex items-center gap-2">
            {/* Badge Kategori Terpilih */}
            <button
              type="button"
              onClick={() => goToStep("category")}
              className="flex shrink-0 items-center gap-1.5 rounded-[10px] border border-border/70 bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95"
              title="Ganti kategori"
            >
              <CurrentCatIcon className="size-3.5 text-primary" strokeWidth={2} />
              <span>{currentCat.label}</span>
              <Pencil className="size-2.5 text-muted-foreground ml-0.5" />
            </button>

            {/* Input Ketik Nama Barang Langsung dengan Contoh Sesuai Kategori */}
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={60}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={CATEGORY_ITEM_PLACEHOLDERS[category] ?? "Nama barang"}
                className="h-9 w-full rounded-[10px] border border-border/70 bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Stepper Utama: [- Kotak Tumpul] [ Rp x ] [+ Kotak Tumpul] */}
          <div className="relative flex items-center justify-between gap-2 py-1">
            {/* Tombol Minus Kotak Tumpul (w-12 h-12 rounded-[10px] - bukan bulat) */}
            <button
              type="button"
              disabled={amount <= 0}
              onClick={handleDecrement}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-border/80 bg-card text-foreground transition-all duration-150 active:scale-95 hover:bg-muted disabled:opacity-20 disabled:pointer-events-none shadow-xs"
              title={`Kurangi Rp ${formatRupiahPlain(stepSize)}`}
              aria-label="Kurangi nominal"
            >
              <Minus className="size-4.5 stroke-[2.5]" />
            </button>

            {/* Area Tengah (x): Tanpa Border, Rp Rapat, Counter Super Smooth */}
            <div className="relative flex flex-1 items-center justify-center py-1">
              {/* Nilai Utama: Rp dan Angka Menyatu Rapat */}
              <div className="inline-flex items-baseline justify-center gap-1">
                <span className="font-display text-xl sm:text-2xl font-bold text-muted-foreground/60 select-none">
                  Rp
                </span>
                <input
                  ref={amountInputRef}
                  id="amount"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0"
                  value={displayValue}
                  onFocus={() => setIsEditingManual(true)}
                  onBlur={() => setIsEditingManual(false)}
                  onChange={(e) => {
                    setIsEditingManual(true);
                    handleAmountChange(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && amount > 0) {
                      e.preventDefault();
                      handleProceedToDetails();
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleIncrement();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleDecrement();
                    }
                  }}
                  style={{
                    width: `${Math.max(1.3, (displayValue.length || 1) + 0.25)}ch`,
                  }}
                  className="bg-transparent text-left font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/25 tabular-nums"
                  aria-label="Nominal"
                />
              </div>

              {/* Tombol Reset Ikon Kecil */}
              {amount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingManual(false);
                    setAmountRaw("");
                  }}
                  className="absolute right-0 rounded-full p-1 text-muted-foreground/40 transition hover:bg-muted hover:text-foreground active:scale-90"
                  title="Reset 0"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}
            </div>

            {/* Tombol Plus Kotak Tumpul (w-12 h-12 rounded-[10px] - bukan bulat) */}
            <button
              type="button"
              onClick={handleIncrement}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-xs transition-all duration-150 active:scale-95 hover:bg-primary/90"
              title={`Tambah Rp ${formatRupiahPlain(stepSize)}`}
              aria-label="Tambah nominal"
            >
              <Plus className="size-4.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Baris Kelipatan Berbasis Ikon & Chips */}
          <div className="flex flex-col gap-1.5 rounded-lg bg-muted/40 p-2 border border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <SlidersHorizontal className="size-3 text-muted-foreground" />
                <span>Kelipatan</span>
              </span>
              <span className="tabular-nums text-xs font-semibold text-primary">
                ±{formatRupiahPlain(stepSize)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
              {STEP_SIZES.map((item) => {
                const isSelected = stepSize === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStepSize(item.value)}
                    className={cn(
                      "flex h-7.5 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-all active:scale-95",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigasi Aksi */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => goToStep("category")}
              className="px-3 rounded-[10px] transition-transform active:scale-95"
              title="Kembali ke Kategori"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="default"
              disabled={amount <= 0}
              onClick={handleProceedToDetails}
              className="flex-1 gap-1.5 rounded-[10px] font-medium transition-transform active:scale-95"
            >
              <span>Lanjut</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAIL (TANPA FIELD CATATAN; DEFAULT PEMBAYAR KOSONG = BAYAR SENDIRI) */}
      {step === "details" && (
        <div
          key="step-details"
          className={cn(
            "flex flex-col gap-3 min-h-[220px] w-full overflow-x-hidden",
            direction === "forward" ? "step-transition-forward" : "step-transition-backward",
          )}
        >
          {/* Ringkasan Kategori & Nominal di Atas Detail (Catatan ditiadakan di sini) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => goToStep("category")}
              className="flex items-center gap-1.5 rounded-[10px] bg-muted/60 px-2.5 py-1 text-xs text-foreground transition-all hover:bg-muted active:scale-95"
              title="Ubah kategori"
            >
              <CurrentCatIcon className="size-3.5 text-primary" strokeWidth={2} />
              <span className="font-medium">{currentCat.label}</span>
              <Pencil className="size-2.5 text-muted-foreground ml-0.5" />
            </button>

            {amount > 0 && (
              <button
                type="button"
                onClick={() => goToStep("amount")}
                className="flex items-center gap-1.5 rounded-[10px] bg-muted/60 px-2.5 py-1 text-xs text-foreground transition-all hover:bg-muted active:scale-95"
                title="Ubah nominal"
              >
                <Coins className="size-3.5 text-primary" strokeWidth={2} />
                <span className="font-semibold tabular-nums text-primary">
                  {formatRupiah(amount)}
                </span>
                <Pencil className="size-2.5 text-muted-foreground ml-0.5" />
              </button>
            )}
          </div>

          {/* Opsi Pembayar: Tombol [Saya] [Dibayarin] [Patungan] */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="size-3.5 text-primary" />
                <span>Pembayar</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                {payerMode === "saya" && "Sendiri"}
                {payerMode === "dibayarin" && (treatedBy.trim() ? treatedBy : "Dibayarin")}
                {payerMode === "patungan" && (splitWith.trim() ? splitWith : "Patungan")}
              </span>
            </div>

            {/* 3 Tombol Mode Pembayar (Simetris sempurna dengan sliding indicator pill beranimasi halus) */}
            <div className="relative grid grid-cols-3 rounded-xl bg-muted/60 p-1 border border-border/60 gap-1 w-full overflow-hidden">
              {/* Sliding Active Pill Indicator */}
              <div
                aria-hidden="true"
                className={cn(
                  "absolute top-1 bottom-1 w-[calc((100%-8px)/3)] rounded-lg bg-primary shadow-xs transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none",
                  payerMode === "saya" && "left-1",
                  payerMode === "dibayarin" && "left-[calc(1px+((100%-8px)/3)+2px)]",
                  payerMode === "patungan" && "left-[calc(1px+(((100%-8px)/3)*2)+4px)]",
                )}
              />

              <button
                type="button"
                onClick={() => setPayerMode("saya")}
                className={cn(
                  "relative z-10 h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 active:scale-[0.98]",
                  payerMode === "saya"
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <User className="size-3.5" />
                <span>Saya</span>
              </button>

              <button
                type="button"
                onClick={() => setPayerMode("dibayarin")}
                className={cn(
                  "relative z-10 h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 active:scale-[0.98]",
                  payerMode === "dibayarin"
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Gift className="size-3.5" />
                <span>Dibayarin</span>
              </button>

              <button
                type="button"
                onClick={() => setPayerMode("patungan")}
                className={cn(
                  "relative z-10 h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 active:scale-[0.98]",
                  payerMode === "patungan"
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Users className="size-3.5" />
                <span>Patungan</span>
              </button>
            </div>

            {/* Form Tambahan Hanya Muncul Jika Dibayarin (Animasi Halus) */}
            {payerMode === "dibayarin" && (
              <div className="flex flex-col gap-1.5 pt-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-200 ease-out">
                <Input
                  maxLength={40}
                  placeholder="Siapa yang bayarin? (misal: Bos, Teman, Ayah)"
                  value={treatedBy}
                  onChange={(e) => setTreatedBy(e.target.value)}
                  className="rounded-[10px] text-xs"
                  autoFocus
                />
                {knownPayers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {knownPayers.slice(0, 5).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setTreatedBy(name)}
                        className={cn(
                          "h-6.5 rounded-[7px] px-2 text-[11px] font-medium transition-all active:scale-95",
                          treatedBy === name
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Form Tambahan Hanya Muncul Jika Patungan (Animasi Halus) */}
            {payerMode === "patungan" && (
              <div className="flex flex-col gap-1.5 pt-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-200 ease-out">
                <Input
                  maxLength={40}
                  placeholder="Patungan sama siapa? (misal: 3 orang, Bareng Budi)"
                  value={splitWith}
                  onChange={(e) => setSplitWith(e.target.value)}
                  className="rounded-[10px] text-xs"
                  autoFocus
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  {["2 orang", "3 orang", "4 orang", "Teman kantor"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSplitWith(preset)}
                      className={cn(
                        "h-6.5 rounded-[7px] px-2 text-[11px] font-medium transition-all active:scale-95",
                        splitWith === preset
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tanggal Pengeluaran (Simple, Enteng, Modern & Floating Custom Calendar) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Calendar className="size-3.5 text-primary" />
                <span>Tanggal</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCalendar((prev) => !prev)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
                title="Pilih tanggal di kalender"
              >
                <span>{formatDateFriendly(date)}</span>
              </button>
            </div>

            {/* Navigasi Tanggal Cepat: [<] Hari ini, Kemarin, 2 hr lalu [>] + Tombol Kalender Popover */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => stepDate(-1)}
                className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                title="Mundur 1 hari"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              {[
                { label: "Hari ini", val: daysAgoIso(0) },
                { label: "Kemarin", val: daysAgoIso(1) },
                { label: "2 hr lalu", val: daysAgoIso(2) },
              ].map((chip) => {
                const isSelected = date === chip.val;
                return (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => {
                      setDate(chip.val);
                      setShowCalendar(false);
                    }}
                    className={cn(
                      "flex-1 h-8 rounded-[8px] text-xs font-medium transition-all active:scale-95",
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => stepDate(1)}
                className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                title="Maju 1 hari"
              >
                <ChevronRight className="size-3.5" />
              </button>

              {/* Tombol Toggle Kalender Custom dengan Panel Mengambang (Floating Popover) */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCalendar((prev) => !prev)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-[8px] border transition-all active:scale-95",
                    showCalendar
                      ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                      : "border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  title={showCalendar ? "Tutup kalender" : "Buka kalender"}
                  aria-label="Pilih tanggal dari kalender"
                  aria-expanded={showCalendar}
                >
                  <Calendar className="size-3.5" />
                </button>

                {/* Panel Mengambang (Floating Popover) di dekat tombol kalender */}
                {showCalendar && (
                  <>
                    {/* Klik luar backdrop transparan untuk menutup otomatis */}
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowCalendar(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 z-50 w-[240px] drop-shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
                      <CustomCalendar
                        value={date}
                        onChange={(newDate) => {
                          setDate(newDate);
                          setShowCalendar(false);
                        }}
                        onClose={() => setShowCalendar(false)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tanda (Opsi patungan dihilangkan karena otomatis terpasang saat mode pembayar patungan) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Tag className="size-3.5 text-primary" />
                <span>Tanda</span>
              </span>
              {payerMode === "patungan" && (
                <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                  <Users className="size-3" />
                  <span>Otomatis Patungan</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {MANUAL_MARKS.map((item) => {
                const Icon = item.icon;
                const selected = mark === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMark(selected ? "" : item.id)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-[9px] px-3 text-xs font-medium transition-colors active:scale-95",
                      selected
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={1.75} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tombol Simpan & Hapus */}
          <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
            <Button
              type="submit"
              size="lg"
              disabled={!canSave}
              className="w-full rounded-[10px] font-medium active:scale-[0.98] transition-transform"
            >
              {submitLabel}
            </Button>

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep("amount")}
                className="text-xs text-muted-foreground active:scale-95"
              >
                <ChevronLeft className="size-3.5 mr-0.5" />
                Nominal
              </Button>

              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-95"
                  onClick={onDelete}
                >
                  Hapus
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
