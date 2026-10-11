import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bus,
  Clapperboard,
  Coffee,
  Ellipsis,
  HeartPulse,
  House,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

export const CATEGORY_IDS = [
  "makanan",
  "minuman",
  "transport",
  "belanja",
  "tagihan",
  "hiburan",
  "kesehatan",
  "pendidikan",
  "rumah",
  "lainnya",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  { id: "makanan", label: "Makanan", icon: UtensilsCrossed },
  { id: "minuman", label: "Minuman", icon: Coffee },
  { id: "transport", label: "Transport", icon: Bus },
  { id: "belanja", label: "Belanja", icon: ShoppingBag },
  { id: "tagihan", label: "Tagihan", icon: Receipt },
  { id: "hiburan", label: "Hiburan", icon: Clapperboard },
  { id: "kesehatan", label: "Kesehatan", icon: HeartPulse },
  { id: "pendidikan", label: "Pendidikan", icon: BookOpen },
  { id: "rumah", label: "Rumah", icon: House },
  { id: "lainnya", label: "Lainnya", icon: Ellipsis },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
