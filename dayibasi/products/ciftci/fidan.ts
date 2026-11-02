import type { Business } from "@/core/auth/AuthGate";
import type { EventRow } from "@/core/events/api";
import type { Expense } from "@/core/expenses/api";
import type { Lot } from "@/core/lots/api";

// Fidan (şimşir) modülü — yalnız settings.modules içinde "fidan" olan defterlerde.
export const hasFidan = (b: Business) => Array.isArray(b.settings?.modules) && (b.settings!.modules as string[]).includes("fidan");

export const SAYIM = "sayim";     // data {lot_id, alive, sizes: {"20-30 cm": n, …}, note}
export const SIPARIS = "siparis"; // data {customer, lot_id?, size?, qty, price?, due_on?, status: bekliyor|teslim|iptal, note}
export const FOTO = "foto";       // data {lot_id, path, note}
export const FIDAN_SATIS = "Fidan satışı"; // gelir türü; data {lot_id, size, qty, price}

/** Boy sınıfları: kullanıcı belirler (settings.fidan_sizes); yoksa örnek liste. */
export const sizesOf = (b: Business) =>
  (Array.isArray(b.settings?.fidan_sizes) && (b.settings!.fidan_sizes as string[]).length ? b.settings!.fidan_sizes as string[] : ["20-30 cm", "30-40 cm", "40-60 cm", "60 cm üstü"]);

export type LotStats = {
  lot: Lot; alive: number; counted: string | null; sold: number; dead: number; firePct: number;
  bySize: Record<string, number>; cost: number; costDirect: number; costShare: number; perPlant: number;
  income: number; ageMonths: number | null;
};

/** Parti durumu: canlı = son sayım − sonrasında satılan; yoksa başlangıç − satılan. */
export function lotStats(lot: Lot, lots: Lot[], counts: EventRow[], sales: EventRow[], expenses: Expense[]): LotStats {
  const my = counts.filter((c) => c.data.lot_id === lot.id).sort((a, b) => (b.occurred_on + (b.created_at ?? "")).localeCompare(a.occurred_on + (a.created_at ?? "")));
  const last = my[0];
  const mySales = sales.filter((s) => s.data.lot_id === lot.id);
  const soldAfter = mySales.filter((s) => !last || s.occurred_on >= last.occurred_on);
  const soldAfterQty = soldAfter.reduce((t, s) => t + Number(s.data.qty ?? 0), 0);
  const sold = mySales.reduce((t, s) => t + Number(s.data.qty ?? 0), 0);
  const base = last ? Number(last.data.alive ?? 0) : lot.initial_count;
  const alive = Math.max(0, base - soldAfterQty);
  // Boy dağılımı: son sayımdan, sonradan satılanlar o boydan düşer
  const bySize: Record<string, number> = { ...((last?.data.sizes as Record<string, number>) ?? {}) };
  for (const s of soldAfter) { const k = String(s.data.size ?? ""); if (k && bySize[k] != null) bySize[k] = Math.max(0, bySize[k] - Number(s.data.qty ?? 0)); }
  const dead = Math.max(0, lot.initial_count - sold - alive);
  // Maliyet: alış + uygulama öncesi masraf + partiye girilen masraf + parsel masrafından canlı fidana göre pay
  const initialCost = Number(lot.data.initial_cost ?? 0), prior = Number(lot.data.prior_cost ?? 0);
  const direct = expenses.filter((e) => e.data?.lot_id === lot.id).reduce((t, e) => t + e.amount, 0);
  let share = 0;
  if (lot.place_id) {
    const parselExp = expenses.filter((e) => e.place_id === lot.place_id && !e.data?.lot_id).reduce((t, e) => t + e.amount, 0);
    const siblings = lots.filter((l) => l.place_id === lot.place_id && l.status === "aktif");
    const tot = siblings.reduce((t, l) => t + Math.max(1, l.id === lot.id ? alive || l.initial_count : l.initial_count), 0);
    share = siblings.length ? parselExp * (Math.max(1, alive || lot.initial_count) / Math.max(1, tot)) : 0;
  }
  const cost = initialCost + prior + direct + share;
  const income = mySales.reduce((t, s) => t + Number(s.quantity ?? 0), 0);
  const ageMonths = lot.planted_on ? Math.max(0, Math.round((Date.now() - Date.parse(lot.planted_on)) / (30.44 * 86400000))) : null;
  return {
    lot, alive, counted: last?.occurred_on ?? null, sold, dead, firePct: lot.initial_count ? (dead / lot.initial_count) * 100 : 0,
    bySize, cost, costDirect: initialCost + prior + direct, costShare: share, perPlant: alive ? cost / alive : 0, income, ageMonths,
  };
}

export const ageText = (m: number | null) => (m == null ? "" : m < 12 ? `${m} aylık` : `${Math.floor(m / 12)} yıl ${m % 12 ? `${m % 12} ay` : ""}`.trim());
