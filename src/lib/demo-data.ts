import type { CategoryId } from "@/lib/categories";
import { daysAgoIso } from "@/lib/format";
import type { MarkId } from "@/lib/marks";

type SeedRow = {
  amount: number;
  category: CategoryId;
  note: string;
  daysAgo: number;
  payer: string;
  mark?: MarkId;
};

const SEED: SeedRow[] = [
  { amount: 38000, category: "makanan", note: "Nasi Padang Roda", daysAgo: 0, payer: "Ayu" },
  { amount: 22000, category: "minuman", note: "Kopi Janji Jiwa", daysAgo: 0, payer: "Ayu" },
  { amount: 24000, category: "transport", note: "Gojek ke kantor", daysAgo: 0, payer: "Bimo", mark: "kantor" },
  { amount: 18000, category: "makanan", note: "Warteg makan siang", daysAgo: 1, payer: "Bimo" },
  { amount: 150000, category: "transport", note: "Isi bensin Pertamina", daysAgo: 1, payer: "Bimo", mark: "kantor" },
  { amount: 67500, category: "belanja", note: "Indomaret mingguan", daysAgo: 2, payer: "Ayu" },
  { amount: 200000, category: "tagihan", note: "Token listrik", daysAgo: 3, payer: "Ayu", mark: "penting" },
  { amount: 55000, category: "hiburan", note: "Tiket bioskop XXI", daysAgo: 3, payer: "Raka", mark: "patungan" },
  { amount: 48000, category: "kesehatan", note: "Apotek K-24", daysAgo: 4, payer: "Ayu" },
  { amount: 72000, category: "makanan", note: "GrabFood malam", daysAgo: 4, payer: "Raka", mark: "patungan" },
  { amount: 50000, category: "tagihan", note: "Pulsa Telkomsel", daysAgo: 5, payer: "Bimo" },
  { amount: 189000, category: "belanja", note: "Shopee kebutuhan rumah", daysAgo: 6, payer: "Ayu", mark: "penting" },
  { amount: 28000, category: "minuman", note: "Kopi Tuku", daysAgo: 6, payer: "Raka" },
  { amount: 35000, category: "rumah", note: "Laundry kiloan", daysAgo: 7, payer: "Ayu" },
  { amount: 145000, category: "makanan", note: "Makan malam sushi", daysAgo: 8, payer: "Raka", mark: "patungan" },
  { amount: 7000, category: "transport", note: "TransJakarta", daysAgo: 8, payer: "Bimo", mark: "kantor" },
  { amount: 79000, category: "hiburan", note: "Spotify Family", daysAgo: 10, payer: "Ayu", mark: "patungan" },
  { amount: 32000, category: "kesehatan", note: "Vitamin C", daysAgo: 11, payer: "Ayu" },
  { amount: 98000, category: "pendidikan", note: "Buku Gramedia", daysAgo: 12, payer: "Raka" },
  { amount: 85000, category: "tagihan", note: "Tagihan PDAM", daysAgo: 14, payer: "Ayu", mark: "penting" },
  { amount: 25000, category: "makanan", note: "Ayam Geprek Bensu", daysAgo: 14, payer: "Bimo" },
  { amount: 10000, category: "transport", note: "Parkir mall", daysAgo: 15, payer: "Raka" },
  { amount: 245000, category: "rumah", note: "Perlengkapan IKEA", daysAgo: 16, payer: "Ayu", mark: "utang" },
  { amount: 18000, category: "minuman", note: "Es kopi susu", daysAgo: 17, payer: "Bimo" },
  { amount: 320000, category: "belanja", note: "Baju diskon", daysAgo: 18, payer: "Raka" },
];

export function buildDemoExpenses() {
  const now = Date.now();
  return SEED.map((row, i) => ({
    id: `demo-${i + 1}`,
    amount: row.amount,
    category: row.category,
    note: row.note,
    date: daysAgoIso(row.daysAgo),
    createdAt: now - i * 36_000,
    payer: row.payer,
    mark: row.mark ?? "",
  }));
}
