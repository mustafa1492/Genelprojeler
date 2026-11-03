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

export const AKTARIM = "aktarim"; // taşıma / saksıya alma: data {from, to, qty, cost} (cost = taşınan fidanların maliyeti)

export type LotStats = {
  lot: Lot; alive: number; counted: string | null; sold: number; dead: number; firePct: number;
  bySize: Record<string, number>; cost: number; costDirect: number; costShare: number; costGeneral: number; costMoved: number;
  perPlant: number; income: number; ageMonths: number | null; movedIn: number; movedOut: number;
};

/** Yalnız adetler (maliyetsiz): canlı = son sayım − sonra satılan − sonra giden + sonra gelen. */
export function aliveOf(lot: Lot, counts: EventRow[], sales: EventRow[], moves: EventRow[] = []) {
  const my = counts.filter((c) => c.data.lot_id === lot.id).sort((a, b) => (b.occurred_on + (b.created_at ?? "")).localeCompare(a.occurred_on + (a.created_at ?? "")));
  const last = my[0];
  const after = (e: EventRow) => !last || e.occurred_on >= last.occurred_on;
  const mySales = sales.filter((s) => s.data.lot_id === lot.id);
  const out = moves.filter((m) => m.data.from === lot.id), inn = moves.filter((m) => m.data.to === lot.id);
  const q = (xs: EventRow[]) => xs.reduce((t, x) => t + Number(x.data.qty ?? 0), 0);
  const base = last ? Number(last.data.alive ?? 0) : lot.initial_count;
  const alive = Math.max(0, base - q(mySales.filter(after)) - q(out.filter(after)) + q(inn.filter(after)));
  const bySize: Record<string, number> = { ...((last?.data.sizes as Record<string, number>) ?? {}) };
  for (const s of [...mySales, ...out].filter(after)) { const k = String(s.data.size ?? ""); if (k && bySize[k] != null) bySize[k] = Math.max(0, bySize[k] - Number(s.data.qty ?? 0)); }
  for (const m of inn.filter(after)) { const k = String(m.data.size ?? ""); if (k) bySize[k] = (bySize[k] ?? 0) + Number(m.data.qty ?? 0); }
  return { alive, last, mySales, sold: q(mySales), movedOut: q(out), movedIn: q(inn), out, inn, bySize };
}

/**
 * Parti durumu ve maliyeti (Mustafa, 3 Kasım 2026):
 *  maliyet = alış + uygulama öncesi masraf + partiye özel masraf
 *          + tarla masrafı payı (tarladaki aktif partilerin CANLI fidan sayısına göre)
 *          + genel masraf payı (tarlası/partisi olmayan masraf; bütün aktif partilerin canlı fidan sayısına göre)
 *          + taşımayla gelen maliyet − taşımayla giden maliyet
 */
export function lotStats(lot: Lot, lots: Lot[], counts: EventRow[], sales: EventRow[], expenses: Expense[], moves: EventRow[] = []): LotStats {
  const a = aliveOf(lot, counts, sales, moves);
  const active = lots.filter((l) => l.status === "aktif");
  const aliveMap = new Map(active.map((l) => [l.id, l.id === lot.id ? a.alive : aliveOf(l, counts, sales, moves).alive]));
  const w = (l: Lot) => Math.max(0, aliveMap.get(l.id) ?? 0);
  const myW = lot.status === "aktif" ? a.alive : 0;

  const initialCost = Number(lot.data.initial_cost ?? 0), prior = Number(lot.data.prior_cost ?? 0);
  const direct = expenses.filter((e) => e.data?.lot_id === lot.id).reduce((t, e) => t + e.amount, 0);
  let share = 0;
  if (lot.place_id && myW > 0) {
    const parselExp = expenses.filter((e) => e.place_id === lot.place_id && !e.data?.lot_id).reduce((t, e) => t + e.amount, 0);
    const tot = active.filter((l) => l.place_id === lot.place_id).reduce((t, l) => t + w(l), 0);
    share = tot ? parselExp * (myW / tot) : 0;
  }
  let general = 0;
  if (myW > 0) {
    const genExp = expenses.filter((e) => !e.place_id && !e.data?.lot_id && !e.charge_to).reduce((t, e) => t + e.amount, 0);
    const tot = active.reduce((t, l) => t + w(l), 0);
    general = tot ? genExp * (myW / tot) : 0;
  }
  const moved = a.inn.reduce((t, m) => t + Number(m.data.cost ?? 0), 0) - a.out.reduce((t, m) => t + Number(m.data.cost ?? 0), 0);
  const cost = initialCost + prior + direct + share + general + moved;
  const income = a.mySales.reduce((t, s) => t + Number(s.quantity ?? 0), 0);
  const dead = Math.max(0, lot.initial_count + a.movedIn - a.sold - a.movedOut - a.alive);
  const ageMonths = lot.planted_on ? Math.max(0, Math.round((Date.now() - Date.parse(lot.planted_on)) / (30.44 * 86400000))) : null;
  const started = lot.initial_count + a.movedIn;
  return {
    lot, alive: a.alive, counted: a.last?.occurred_on ?? null, sold: a.sold, dead, firePct: started ? (dead / started) * 100 : 0,
    bySize: a.bySize, cost, costDirect: initialCost + prior + direct, costShare: share, costGeneral: general, costMoved: moved,
    perPlant: a.alive ? cost / a.alive : 0, income, ageMonths, movedIn: a.movedIn, movedOut: a.movedOut,
  };
}

export const ageText = (m: number | null) => (m == null ? "" : m < 12 ? `${m} aylık` : `${Math.floor(m / 12)} yıl ${m % 12 ? `${m % 12} ay` : ""}`.trim());

/** Kâr oranı (%): kullanıcı belirler (settings.fidan_margin); yoksa öneri gösterilmez. */
export const marginOf = (b: Business) => (Number(b.settings?.fidan_margin) > 0 ? Number(b.settings!.fidan_margin) : null);
export const suggestedPrice = (perPlant: number, margin: number | null) => (margin && perPlant > 0 ? Math.ceil(perPlant * (1 + margin / 100) * 100) / 100 : null);
