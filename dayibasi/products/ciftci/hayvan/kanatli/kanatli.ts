import type { Business } from "@/core/auth/AuthGate";
import type { EventRow } from "@/core/events/api";
import type { Lot } from "@/core/lots/api";

// Kanatlı (kümes) modülü — yalnız settings.modules içinde "kanatli" olan defterlerde.
// Hayvancılık ortak iskeleti (barınak, "hayvan" anahtarı) gelince birleştirilecek (bkz. docs/moduller/hayvancilik.md).
// Yeni tablo yok: kümes ve sürü `lots` tablosunda (data.kanatli ile ayrılır), günlük kayıt ve tartım `events` tablosunda.
export const hasKanatli = (b: Business) => Array.isArray(b.settings?.modules) && (b.settings!.modules as string[]).includes("kanatli");

/** lots.data.kanatli: "kumes" → kümes kartı {m2, capacity, isletme_no, kumes_no}; "suru" → sürü (dönem) {kumes_id, tur, firma, sozlesme_no, giris_g, bag_kg}. */
export const isKumes = (l: Lot) => l.data?.kanatli === "kumes";
export const isSuru = (l: Lot) => l.data?.kanatli === "suru";
export const isKanatliLot = (l: Lot) => isKumes(l) || isSuru(l);

export const GUNLUK = "kumes_gunluk"; // günde sürü başına bir kayıt: data {suru_id, dead, culled, bags, bag_kg, note}
export const TARTIM = "kumes_tartim"; // data {suru_id, n (kaç hayvan tartıldı), avg_g (ortalama gram)}

const DAY = 86400000;
/** Sürünün yaşı (gün): giriş günü 0. */
export const ageDays = (s: Lot, today: string) => (s.planted_on ? Math.max(0, Math.round((Date.parse(today) - Date.parse(s.planted_on)) / DAY)) : null);

export type SuruStats = {
  alive: number; dead: number; culled: number; lossPct: number; feedKg: number; feedBags: number;
  lastWeigh: EventRow | null; avgKg: number | null; liveKg: number | null; fcr: number | null; days: EventRow[];
};

/**
 * Sürü hesapları (v1, eşik/hedef yok — Mustafa 4 Kasım 2026: eşikleri kullanıcı girecek, veterinerle konuşulunca öneri eklenecek):
 *  kalan = giriş − ölü − ayıklanan
 *  kayıp % = (ölü + ayıklanan) / giriş
 *  yem kg = Σ çuval × çuval kg
 *  tahmini YDO = toplam yem kg / (kalan × son tartım ortalaması kg)  — ölenlerin yediği yem de içinde (rapordaki genel tanım)
 */
export function suruStats(s: Lot, gunluk: EventRow[], tartim: EventRow[]): SuruStats {
  const days = gunluk.filter((e) => e.data.suru_id === s.id).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
  const sum = (k: string) => days.reduce((t, e) => t + Number(e.data[k] ?? 0), 0);
  const dead = sum("dead"), culled = sum("culled"), feedBags = sum("bags");
  const feedKg = days.reduce((t, e) => t + Number(e.data.bags ?? 0) * Number(e.data.bag_kg ?? 0), 0);
  const alive = Math.max(0, s.initial_count - dead - culled);
  const w = tartim.filter((e) => e.data.suru_id === s.id).sort((a, b) => (b.occurred_on + (b.created_at ?? "")).localeCompare(a.occurred_on + (a.created_at ?? "")));
  const lastWeigh = w[0] ?? null;
  const avgKg = lastWeigh && Number(lastWeigh.data.avg_g) > 0 ? Number(lastWeigh.data.avg_g) / 1000 : null;
  const liveKg = avgKg != null ? alive * avgKg : null;
  const fcr = liveKg && feedKg > 0 ? feedKg / liveKg : null;
  return { alive, dead, culled, lossPct: s.initial_count ? ((dead + culled) / s.initial_count) * 100 : 0, feedKg, feedBags, lastWeigh, avgKg, liveKg, fcr, days };
}
