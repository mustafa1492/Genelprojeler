"use client";
import { useEffect, useMemo, useState } from "react";
import { usePrefs } from "@/core/prefs";
import { MASK, moneyHidden } from "@/core/ui/privacy";

/**
 * Döviz karşılığı: kaydın kendi tarihindeki TCMB döviz satış kuruyla.
 * Kurlar telefonda saklanır (geçmiş günün kuru değişmez); internet yoksa bilinmeyenler boş kalır.
 */
export type Kur = { usd: number; eur: number; kaynak: string };
export type Doviz = "kapali" | "usd" | "eur";

const KEY = "ko:kur";
let cache: Record<string, Kur | null> | null = null;
const load = () => { if (cache) return cache; try { cache = JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { cache = {}; } return cache!; };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* dolu */ } };
const todayTR = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
const listeners = new Set<() => void>();
const inflight = new Set<string>();

const fresh = new Set<string>();   // bu açılışta sunucuya sorulmuş günler
/** Verilen günlerin kurlarını getirir (eksikleri sunucudan, 60'ar 60'ar). Bugünün ve bulunamayanların kuru bir açılışta bir kez tazelenir. */
export async function getRates(dates: string[]): Promise<Record<string, Kur | null>> {
  const c = load(); const t = todayTR();
  const need = [...new Set(dates)].filter((d) => d && !inflight.has(d) && !fresh.has(d) && (!(d in c) || d >= t || c[d] === null));
  for (let i = 0; i < need.length; i += 60) {
    const part = need.slice(i, i + 60); part.forEach((d) => inflight.add(d));
    try {
      const r = await fetch(`/api/kur?t=${part.join(",")}`);
      if (r.ok) { Object.assign(c, await r.json()); save(); part.forEach((d) => fresh.add(d)); listeners.forEach((f) => f()); }
    } catch { /* internet yok */ }
    part.forEach((d) => inflight.delete(d));
  }
  return Object.fromEntries(dates.map((d) => [d, c[d] ?? null]));
}
// Ekrandaki satırların istekleri tek seferde toplanır
let queued = new Set<string>(); let timer: ReturnType<typeof setTimeout> | null = null;
const request = (dates: string[]) => {
  dates.forEach((d) => queued.add(d));
  if (!timer) timer = setTimeout(() => { const q = [...queued]; queued = new Set(); timer = null; void getRates(q); }, 60);
};

/** Kişinin seçtiği döviz (Ayarlar). Varsayılan: dolar. */
export function useDoviz(): { doviz: Doviz; setDoviz: (d: Doviz) => void } {
  const { prefs, set } = usePrefs();
  const v = prefs.doviz;
  return { doviz: v === "kapali" || v === "eur" ? v : "usd", setDoviz: (d) => set({ doviz: d }) };
}

/** Ekranda: tarihleri verilen kayıtlar için kur haritası (geldikçe güncellenir). */
export function useRates(dates: string[]) {
  const { doviz } = useDoviz();
  const key = useMemo(() => [...new Set(dates)].sort().join(","), [dates]);
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((x) => x + 1); listeners.add(f); return () => { listeners.delete(f); }; }, []);
  useEffect(() => { if (doviz !== "kapali" && key) request(key.split(",")); }, [key, doviz]);
  const c = load();
  return {
    doviz,
    /** TL tutarın o günkü kurla karşılığı; kur bilinmiyorsa null. */
    conv: (tl: number, date: string) => { const k = c[date]; if (doviz === "kapali" || !k) return null; return tl / (doviz === "usd" ? k.usd : k.eur); },
  };
}

export const SYM: Record<Exclude<Doviz, "kapali">, string> = { usd: "$", eur: "€" };
export const fmtFx = (v: number | null, d: Doviz) => (v == null || d === "kapali" ? "" : `≈ ${moneyHidden() ? MASK : Math.round(v).toLocaleString("tr-TR")} ${SYM[d]}`);

/** Küçük gri satır: "≈ 1.234 $". Kur yoksa hiçbir şey göstermez. */
export function FxNote({ tl, date, className }: { tl: number; date: string; className?: string }) {
  const { doviz, conv } = useRates(useMemo(() => [date], [date]));
  const t = fmtFx(conv(tl, date), doviz);
  return t ? <small className={`ui-fx ui-money ${className ?? ""}`}>{t}</small> : null;
}
