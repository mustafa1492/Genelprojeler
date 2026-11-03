"use client";
import { useEffect, useState } from "react";

const KEY = "ko:gizli";
const apply = (on: boolean) => { if (typeof document !== "undefined") document.body.classList.toggle("gizli", on); };

/** Gizli mod: tutarlar bulanıklaşır (birine telefonu gösterirken). Telefonda hatırlanır. */
export function usePrivacy() {
  const [on, setOn] = useState(false);
  useEffect(() => { let v = false; try { v = localStorage.getItem(KEY) === "1"; } catch { /* yok */ } setOn(v); apply(v); }, []);
  const toggle = () => { const v = !on; setOn(v); apply(v); try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* yok */ } };
  return { on, toggle };
}

/** Kartın sağ üstündeki göz düğmesi. */
export function PrivacyButton() {
  const { on, toggle } = usePrivacy();
  return (
    <button type="button" className="ui-privacy" aria-pressed={on} aria-label={on ? "Rakamları göster" : "Rakamları gizle"} onClick={toggle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {on ? <><path d="M3 3l18 18" /><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.7 8.5 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>
          : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
      </svg>
      <span>{on ? "Göster" : "Gizle"}</span>
    </button>
  );
}
