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
