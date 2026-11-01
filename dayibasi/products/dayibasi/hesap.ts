import type { Business } from "@/core/auth/AuthGate";
import type { EventRow } from "@/core/events/api";
import type { LedgerEntry } from "@/core/ledger/api";
import type { Person } from "@/core/people/api";
import { config } from "./config";

// Hesap kuralları (Mustafa, 1 Kasım 2026 + docs/urun.md):
//  - Dayıbaşı payı kişi başı sabit TL (işletme ayarı).
//  - Yevmiye piyasaya göre ±100 TL oynar: her kayıtta girilir, son değer hazır gelir.
//  - Çiftçiden kişi başı alınan = yevmiye + dayıbaşı payı.
//  - İşçilere parayı dayıbaşı öder.
//  - Çiftçinin borcu  = Σ (kişi × (yevmiye + pay)) − Σ çiftçiden alınan ödemeler
//  - İşçinin alacağı  = Σ çalıştığı günlerin yevmiyesi − avanslar − ödemeler
//  - Dayıbaşının kazancı = Σ (kişi × pay)
// Rakamlar kayıt anında kaydın içine yazılır (data.wage, data.fee); ayar sonradan değişse de eski kayıt değişmez.

export const PUANTAJ = "puantaj";

const feeOf = (b: Business) => (b.settings?.fee != null ? Number(b.settings.fee) : config.ledger.defaultFee);
export const defaults = (b: Business) => ({ wage: Number(b.settings?.wage) || config.ledger.defaultWage, fee: feeOf(b) });

/** Kaydın kişi başı rakamları. Eski kayıtlarda yalnız data.rate vardı: pay ayardan, yevmiye = rate − pay. */
export function split(e: EventRow, b: Business) {
  const d = e.data ?? {};
  if (d.wage != null) { const wage = Number(d.wage), fee = Number(d.fee ?? 0); return { wage, fee, rate: wage + fee }; }
  const fee = feeOf(b);
  const rate = Number(d.rate) || defaults(b).wage + fee;
  return { wage: rate - fee, fee, rate };
}
export const workersOf = (e: EventRow) => (Array.isArray(e.data?.workers) ? (e.data.workers as string[]) : []);

const last = (xs: { occurred_on: string }[]) => xs.map((x) => x.occurred_on).sort().pop() ?? null;

export type FarmerAccount = { farmer: Person; kisiGun: number; tutar: number; odenen: number; kalan: number; sonOdeme: string | null };
export function farmerAccounts(farmers: Person[], events: EventRow[], entries: LedgerEntry[], b: Business): FarmerAccount[] {
  return farmers.map((f) => {
    const ev = events.filter((e) => e.person_id === f.id);
    const pay = entries.filter((e) => e.person_id === f.id && e.kind === "odeme");
    const kisiGun = ev.reduce((t, e) => t + (e.quantity ?? 0), 0);
    const tutar = ev.reduce((t, e) => t + (e.quantity ?? 0) * split(e, b).rate, 0);
    const odenen = pay.reduce((t, e) => t + e.amount, 0);
    return { farmer: f, kisiGun, tutar, odenen, kalan: tutar - odenen, sonOdeme: last(pay) };
  });
}

export type WorkerAccount = { worker: Person; gun: number; kazanc: number; avans: number; odenen: number; kalan: number; gunler: EventRow[] };
export function workerAccounts(workers: Person[], events: EventRow[], entries: LedgerEntry[], b: Business): WorkerAccount[] {
  return workers.map((w) => {
    const gunler = events.filter((e) => workersOf(e).includes(w.id));
    const kazanc = gunler.reduce((t, e) => t + split(e, b).wage, 0);
    const mine = entries.filter((e) => e.person_id === w.id);
    const avans = mine.filter((e) => e.kind === "avans").reduce((t, e) => t + e.amount, 0);
    const odenen = mine.filter((e) => e.kind === "odeme").reduce((t, e) => t + e.amount, 0);
    return { worker: w, gun: gunler.length, kazanc, avans, odenen, kalan: kazanc - avans - odenen, gunler };
  });
}

/** Dayıbaşının kazancı (isteğe bağlı tarih aralığı, YYYY-MM-DD). */
export function myEarnings(events: EventRow[], b: Business, from?: string, to?: string) {
  return events.filter((e) => (!from || e.occurred_on >= from) && (!to || e.occurred_on <= to))
    .reduce((t, e) => t + (e.quantity ?? 0) * split(e, b).fee, 0);
}

export function daysAgo(day: string) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  return Math.round((Date.parse(today) - Date.parse(day)) / 86400000);
}
export const agoText = (day: string) => { const n = daysAgo(day); return n <= 0 ? "bugün" : n === 1 ? "dün" : `${n} gün önce`; };
export const monthStart = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }).slice(0, 8) + "01";
export const dayText = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
