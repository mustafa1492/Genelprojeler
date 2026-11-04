"use client";
import { useSyncExternalStore } from "react";

const KEY = "ko:gizli";
/**
 * Tutarları gizle: açıkken para yazan her yer "*** TL" görünür (birine telefonu gösterirken).
 * formatTL ve döviz karşılığı bu bayrağa bakar; uygulamanın kökü usePrivacy() ile dinler, değişince her şey yeniden çizilir.
 * Telefonda hatırlanır. Excel/yedek dosyaları etkilenmez (onlar ham sayı kullanır).
 */
let on = false, loaded = false;
const subs = new Set<() => void>();
const load = () => { if (loaded || typeof window === "undefined") return; loaded = true; try { on = localStorage.getItem(KEY) === "1"; } catch { /* yok */ } apply(); };
const apply = () => { if (typeof document !== "undefined") document.body.classList.toggle("gizli", on); };

/** Şu an tutarlar gizli mi? (biçimlendiriciler için) */
export const moneyHidden = () => { load(); return on; };
export const MASK = "***";

export function setPrivacy(v: boolean) {
  on = v; loaded = true; apply();
  try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* yok */ }
  subs.forEach((f) => f());
}

export function usePrivacy() {
  const v = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => { load(); return on; }, () => false);
  return { on: v, toggle: () => setPrivacy(!v) };
}

/** Göz düğmesi. `compact`: sadece simge (kâr kartının köşesi için). */
export function PrivacyButton({ compact, className }: { compact?: boolean; className?: string }) {
  const { on: hidden, toggle } = usePrivacy();
  return (
    <button type="button" className={`ui-privacy${compact ? " kompakt" : ""} ${className ?? ""}`} aria-pressed={hidden} aria-label={hidden ? "Tutarları göster" : "Tutarları gizle"} onClick={toggle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {hidden ? <><path d="M3 3l18 18" /><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.7 8.5 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>
          : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
      </svg>
      {!compact && <span>{hidden ? "Göster" : "Gizle"}</span>}
    </button>
  );
}
