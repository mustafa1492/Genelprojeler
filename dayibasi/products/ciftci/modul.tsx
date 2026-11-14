"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Business } from "@/core/auth/AuthGate";
import { hasFidan } from "./fidan";

// Bölümler (modüller): girişte seçilir, her birinin kendi rengi var. Tarlalar, Depo, Makineler, Takvim, Borç, Belgeler hepsinde ortak.
export type Modul = "tarla" | "fidan";
type Renk = { ana: string; koyu: string; acik: string; yazi: string; orta: string; zemin: string; zeminCizgi: string; zeminYazi: string };
export const MODULLER: Record<Modul, { ad: string; alt: string; renk: Renk; ana: string[] }> = {
  tarla: { ad: "Tarla", alt: "Tarla işleri, hasat, verim", renk: { ana: "#2e6a2b", koyu: "#245622", acik: "#e1efda", yazi: "#1b4519", orta: "#a7c99c", zemin: "#16351c", zeminCizgi: "#2e5534", zeminYazi: "#c9dcc6" }, ana: ["tarlalar"] },
  fidan: { ad: "Fidan", alt: "Dikim, sayım, stok, müşteri", renk: { ana: "#146c7c", koyu: "#0f5562", acik: "#dceff2", yazi: "#0b4450", orta: "#93c6cf", zemin: "#0c3a43", zeminCizgi: "#22545e", zeminYazi: "#bfdde3" }, ana: ["fidan"] },
};
/** Bölüme özel sekmeler: başka bölümdeyken gizlenir. Geri kalan her şey ortak. */
const OZEL: Record<string, Modul> = { fidan: "fidan" };
export const tabInModul = (id: string, m: Modul) => !OZEL[id] || OZEL[id] === m;

/** Deftere açık bölümler. Tarla her defterde var (tarlalar ortak); fidan ayarla açılır. */
export function modulsOf(b: Business): Modul[] {
  const l: Modul[] = ["tarla"];
  if (hasFidan(b)) l.push("fidan");
  return l;
}

function boya(m: Modul) {
  const r = MODULLER[m].renk, s = document.documentElement.style;
  s.setProperty("--ana", r.ana); s.setProperty("--ana-koyu", r.koyu); s.setProperty("--ana-acik", r.acik); s.setProperty("--ana-yazi", r.yazi); s.setProperty("--ana-orta", r.orta); s.setProperty("--koyu", r.zemin); s.setProperty("--koyu-cizgi", r.zeminCizgi); s.setProperty("--koyu-yazi2", r.zeminYazi);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", r.ana);
}

type Ctx = { modul: Modul; moduller: Modul[]; sec: () => void };
const C = createContext<Ctx>({ modul: "tarla", moduller: ["tarla"], sec: () => {} });
export const useModul = () => useContext(C);

/** Seçili bölümü tutar (cihazda, deftere göre). Birden çok bölüm varsa ve seçilmemişse seçim ekranını gösterir. */
export function ModulProvider({ biz, children }: { biz: Business; children: (m: Modul) => React.ReactNode }) {
  const moduller = modulsOf(biz);
  const key = `ko:modul:${biz.id}`;
  const [modul, setModul] = useState<Modul | null | undefined>(undefined);
  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem(key); } catch { /* yok */ }
    // Adres başka bölümün ekranıysa (ör. /ciftci/kumes) o bölümle aç
    const yol = location.pathname.split("/").filter(Boolean).pop() ?? "";
    const adrestenModul = OZEL[yol];
    if (adrestenModul && moduller.includes(adrestenModul)) { try { localStorage.setItem(key, adrestenModul); } catch { /* yok */ } setModul(adrestenModul); return; }
    setModul(moduller.length === 1 ? moduller[0] : moduller.includes(v as Modul) ? (v as Modul) : null);
  }, [key, moduller.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (modul) boya(modul); }, [modul]);
  if (modul === undefined) return null;
  const pick = (m: Modul) => { try { localStorage.setItem(key, m); } catch { /* yok */ } setModul(m); window.scrollTo(0, 0); };
  if (!modul) return <ModulSec moduller={moduller} onPick={pick} />;
  return <C.Provider key={modul} value={{ modul, moduller, sec: () => setModul(null) }}>{children(modul)}</C.Provider>;
}

const IKON: Record<Modul, React.ReactNode> = {
  tarla: <><path d="M3 20h18" /><path d="M5 20c0-6 3-9 7-11" /><path d="M12 9c4 2 7 5 7 11" /><path d="M12 3v6" /></>,
  fidan: <><circle cx="12" cy="9" r="6" /><path d="M12 15v6M8 21h8" /><path d="M9 8c1 1 2 1 3 0s2-1 3 0" /></>,
};

function ModulSec({ moduller, onPick }: { moduller: Modul[]; onPick: (m: Modul) => void }) {
  return (
    <main className="ui-stack modul-sec">
      <h1 className="ui-title">Bugün ne ile ilgileneceksin?</h1>
      {moduller.map((m) => (
        <button key={m} type="button" className="modul-kart" style={{ background: MODULLER[m].renk.ana }} onClick={() => onPick(m)}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{IKON[m]}</svg>
          <span><b>{MODULLER[m].ad}</b><small>{MODULLER[m].alt}</small></span>
        </button>
      ))}
      <p className="ui-note">Seçtiğini hatırlarım. Değiştirmek için üstteki bölüm adına dokun.</p>
    </main>
  );
}

/** Üstte bölüm adı: dokununca seçim ekranı açılır. Tek bölüm varsa görünmez. */
export function ModulChip() {
  const { modul, moduller, sec } = useModul();
  if (moduller.length < 2) return null;
  return <button type="button" className="modul-chip" onClick={sec} aria-label={`Bölüm: ${MODULLER[modul].ad}. Değiştir`}>{MODULLER[modul].ad} <span aria-hidden="true">▾</span></button>;
}
