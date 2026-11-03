import type { EventRow } from "@/core/events/api";

// Çiftçi defterindeki kayıt türleri (events.kind) ve yardımcılar.
export const ISLEM = "islem";   // tarla günlüğü: data {type, product?, dose?, wait_days?, item_id?, used?, unit?}
export const VERIM = "verim";   // quantity = miktar; data {year, crop, unit}
export const GELIR = "gelir";   // quantity = toplam TL; data {type, crop?, qty?, unit?, price?, buyer?, received (TL), due_on?}

export const year = (d: string) => d.slice(0, 4);
export const thisYear = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }).slice(0, 4);
export const todayStr = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
export const addDays = (d: string, n: number) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
export const dayText = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
export const dayYear = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
export const num = (s: string) => Number(String(s).replace(/\./g, "").replace(",", "."));

/** İlaçlamadan sonra hasat en erken ne zaman (bekleme süresi kullanıcının girdiği gün). */
export const harvestFrom = (e: EventRow) => (Number(e.data?.wait_days) > 0 ? addDays(e.occurred_on, Number(e.data.wait_days)) : null);
/** Gelirin tahsil edilmeyen kısmı. */
export const incomeOpen = (e: EventRow) => Math.max(0, Number(e.quantity ?? 0) - Number(e.data?.received ?? 0));

/** Başabaş: tarlanın sezondaki masrafı ÷ sezon verimi. ton → kg; kasa/adet kendi biriminde. */
export function breakEven(cost: number, yields: EventRow[]): { perUnit: number; unit: string; qty: number } | null {
  if (!yields.length || !(cost > 0)) return null;
  const toKg = (e: EventRow) => (String(e.data.unit) === "ton" ? Number(e.quantity) * 1000 : String(e.data.unit) === "kg" ? Number(e.quantity) : null);
  const kg = yields.map(toKg);
  if (kg.every((x) => x != null)) { const q = (kg as number[]).reduce((t, x) => t + x, 0); return q > 0 ? { perUnit: cost / q, unit: "kg", qty: q } : null; }
  const u = String(yields[0].data.unit);
  if (yields.every((e) => String(e.data.unit) === u)) { const q = yields.reduce((t, e) => t + Number(e.quantity), 0); return q > 0 ? { perUnit: cost / q, unit: u, qty: q } : null; }
  return null;
}

/** Kaydın hangi işe ait olduğu: kendi seçimi > tarlanın işi > fidan bağlantısı > genel (null). */
export function branchOf(e: { data?: Record<string, unknown> | null; place_id: string | null }, places: { id: string; custom: Record<string, string> }[]): string | null {
  const b = e.data?.branch as string | undefined;
  if (b) return b;
  if (e.data?.lot_id || e.data?.type === "Fidan satışı") return "Fidan";
  const p = places.find((x) => x.id === e.place_id);
  return p?.custom?.is || null;
}
