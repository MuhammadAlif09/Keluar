import type { LucideIcon } from "lucide-react";
import { Building2, Flag, Handshake, Users } from "lucide-react";

export const MARK_IDS = ["penting", "kantor", "patungan", "utang"] as const;

export type MarkId = (typeof MARK_IDS)[number];

export type Mark = {
  id: MarkId;
  label: string;
  icon: LucideIcon;
};

export const MARKS: Mark[] = [
  { id: "penting", label: "Penting", icon: Flag },
  { id: "kantor", label: "Kantor", icon: Building2 },
  { id: "patungan", label: "Patungan", icon: Users },
  { id: "utang", label: "Utang", icon: Handshake },
];

export const MARK_MAP: Record<MarkId, Mark> = Object.fromEntries(
  MARKS.map((item) => [item.id, item]),
) as Record<MarkId, Mark>;

export function isMarkId(value: unknown): value is MarkId {
  return typeof value === "string" && (MARK_IDS as readonly string[]).includes(value);
}
