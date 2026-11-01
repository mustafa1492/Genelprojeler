import type { Business } from "@/core/auth/AuthGate";
import type { EventRow } from "@/core/events/api";
import type { LedgerEntry } from "@/core/ledger/api";
import type { Person } from "@/core/people/api";
import { config } from "./config";

// Hesap mantığı (docs/urun.md):
//   Çiftçinin borcu = Σ (kayıttaki kişi sayısı × kişi başı ücret) − Σ ödemeler
//   Kişi başı ücret işletme ayarında; çiftçiye göre değiştirilebilir.
// Ücret kayıt anında kaydın içine yazılır (data.rate); sonradan ücret değişirse eski kayıtlar değişmez.

export const PUANTAJ = "puantaj";

export const businessRate = (b: Business) => Number(b.settings?.daily_rate) || config.ledger.defaultDailyRate;
export const farmerRate = (f: Person | undefined, b: Business) => Number(f?.custom?.daily_rate) || businessRate(b);
export const eventRate = (e: EventRow, f: Person | undefined, b: Business) => Number(e.data?.rate) || farmerRate(f, b);

export type FarmerAccount = {
  farmer: Person;
  kisiGun: number;   // toplam kişi-gün
  tutar: number;     // toplam iş tutarı
  odenen: number;
  kalan: number;
  sonOdeme: string | null;  // YYYY-MM-DD
  sonIs: string | null;
};

export function farmerAccounts(farmers: Person[], events: EventRow[], entries: LedgerEntry[], b: Business): FarmerAccount[] {
  return farmers.map((f) => {
    const ev = events.filter((e) => e.person_id === f.id);
    const pay = entries.filter((e) => e.person_id === f.id && e.kind === "odeme");
    const kisiGun = ev.reduce((t, e) => t + (e.quantity ?? 0), 0);
    const tutar = ev.reduce((t, e) => t + (e.quantity ?? 0) * eventRate(e, f, b), 0);
    const odenen = pay.reduce((t, e) => t + e.amount, 0);
    const last = (xs: { occurred_on: string }[]) => xs.map((x) => x.occurred_on).sort().pop() ?? null;
    return { farmer: f, kisiGun, tutar, odenen, kalan: tutar - odenen, sonOdeme: last(pay), sonIs: last(ev) };
  });
}

/** "2026-10-20" → kaç gün önce (İstanbul'a göre). */
export function daysAgo(day: string) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  return Math.round((Date.parse(today) - Date.parse(day)) / 86400000);
}
export const agoText = (day: string) => { const n = daysAgo(day); return n <= 0 ? "bugün" : n === 1 ? "dün" : `${n} gün önce`; };
