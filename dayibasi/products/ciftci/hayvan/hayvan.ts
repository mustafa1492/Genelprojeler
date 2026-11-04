import type { Business } from "@/core/auth/AuthGate";
import type { Herd, HerdDay, Species } from "./api";

// Türlere göre adlar ve modül anahtarları. Her tür panelden ayrı açılır (settings.modules).
export type Tur = {
  species: Species; module: string; barn: string; barns: string; animal: string; kinds: string[];
  contract: boolean; // entegre firma / sözleşme alanları (sözleşmeli etlik)
};
export const TURLER: Record<Species, Tur> = {
  kanatli: { species: "kanatli", module: "kanatli", barn: "Kümes", barns: "Kümesler", animal: "civciv", kinds: ["etlik"], contract: true },
  kucukbas: { species: "kucukbas", module: "kucukbas", barn: "Ağıl", barns: "Ağıllar", animal: "hayvan", kinds: [], contract: false },
  buyukbas: { species: "buyukbas", module: "buyukbas", barn: "Ahır", barns: "Ahırlar", animal: "hayvan", kinds: [], contract: false },
};
export const hasTur = (b: Business, s: Species) => Array.isArray(b.settings?.modules) && (b.settings!.modules as string[]).includes(TURLER[s].module);

const DAYMS = 86400000;
/** Sürünün yaşı (gün): giriş günü 0. */
export const ageDays = (h: Herd, today: string) => Math.max(0, Math.round((Date.parse(today) - Date.parse(h.started_on)) / DAYMS));

export type HerdStats = {
  alive: number; dead: number; culled: number; lossPct: number; feedKg: number; feedBags: number;
  lastWeigh: HerdDay | null; avgKg: number | null; liveKg: number | null; fcr: number | null; feedComplete: boolean; days: HerdDay[];
};

/**
 * Sürü hesapları (eşik/hedef yok — Mustafa 4 Kasım 2026: eşikleri kullanıcı girecek, veterinerle konuşulunca öneri eklenecek):
 *  kalan = giriş − ölü − ayıklanan
 *  kayıp % = (ölü + ayıklanan) / giriş
 *  yem kg = Σ çuval × çuval kg
 *  tahmini YDO = toplam yem kg / (kalan × son tartım ortalaması kg) — ölenlerin yediği yem de içinde
 *  Uygulamaya ortadan başlanırsa önceki yem/ölü sürü kartında toplam girilir (data.prior_feed_kg, data.prior_dead).
 *  Yem girişten beri eksiksiz değilse (ilk kayıt girişten 2 günden sonra ve önceki yem girilmemiş) YDO gösterilmez.
 */
export function herdStats(h: Herd, all: HerdDay[]): HerdStats {
  const days = all.filter((d) => d.herd_id === h.id).sort((a, b) => b.day.localeCompare(a.day));
  const priorFeed = Number(h.data.prior_feed_kg ?? 0), priorDead = Number(h.data.prior_dead ?? 0);
  const dead = priorDead + days.reduce((t, d) => t + d.dead, 0), culled = days.reduce((t, d) => t + d.culled, 0);
  const feedBags = days.reduce((t, d) => t + d.feed_bags, 0);
  const feedKg = priorFeed + days.reduce((t, d) => t + d.feed_bags * (d.bag_kg ?? 0), 0);
  const alive = Math.max(0, h.initial_count - dead - culled);
  const lastWeigh = days.find((d) => (d.avg_weight_g ?? 0) > 0) ?? null;
  const avgKg = lastWeigh ? lastWeigh.avg_weight_g! / 1000 : null;
  const liveKg = avgKg != null ? alive * avgKg : null;
  const first = days.length ? days[days.length - 1].day : null;
  const feedComplete = priorFeed > 0 || (!!first && Date.parse(first) - Date.parse(h.started_on) <= 2 * DAYMS);
  const fcr = feedComplete && liveKg && feedKg > 0 ? feedKg / liveKg : null;
  return { alive, dead, culled, lossPct: h.initial_count ? ((dead + culled) / h.initial_count) * 100 : 0, feedKg, feedBags, lastWeigh, avgKg, liveKg, fcr, feedComplete, days };
}
