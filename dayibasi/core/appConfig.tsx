"use client";
// Yönetim panelinden değiştirilen genel ayarlar (app_config): duyuru, hazır listeler… Herkes okur.
import { useEffect, useState } from "react";
import { supabase } from "@/core/supabase/client";

const KEY = "ko:app_config";
let mem: Record<string, unknown> | null = null;
let loading: Promise<Record<string, unknown>> | null = null;
const subs = new Set<(c: Record<string, unknown>) => void>();

function fetchConfig() {
  loading ??= (async () => {
    const { data } = await supabase().from("app_config").select("key, value");
    const c = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    mem = c; try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* yok */ }
    subs.forEach((f) => f(c));
    return c;
  })().catch(() => mem ?? {}).finally(() => { setTimeout(() => { loading = null; }, 60_000); });
  return loading;
}

export function useAppConfig() {
  const [c, setC] = useState<Record<string, unknown>>(() => {
    if (mem) return mem;
    try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
  });
  useEffect(() => { subs.add(setC); fetchConfig(); return () => { subs.delete(setC); }; }, []);
  return c;
}

/** Herkesin görmesi için duyuru şeridi (yönetim panelinden). */
export function Announcement() {
  const c = useAppConfig();
  const d = c.duyuru as { text?: string; on?: boolean; tone?: string } | undefined;
  const [closed, setClosed] = useState<string | null>(() => { try { return sessionStorage.getItem("ko:duyuru_kapat"); } catch { return null; } });
  if (!d?.on || !d.text || closed === d.text) return null;
  const bg = d.tone === "acil" ? "#FDECEA" : d.tone === "uyari" ? "#FFF4D6" : "#E6F2E3";
  const fg = d.tone === "acil" ? "#8C1D18" : d.tone === "uyari" ? "#6B4A00" : "#1F4D1C";
  return (
    <div role="status" style={{ background: bg, color: fg, padding: "10px 14px", fontWeight: 700, display: "flex", gap: 10, alignItems: "flex-start", borderRadius: 12, margin: "8px 12px 0" }}>
      <span style={{ flex: 1 }}>{d.text}</span>
      <button type="button" aria-label="Kapat" style={{ all: "unset", cursor: "pointer", fontWeight: 800, padding: "0 4px" }} onClick={() => { setClosed(d.text!); try { sessionStorage.setItem("ko:duyuru_kapat", d.text!); } catch { /* yok */ } }}>✕</button>
    </div>
  );
}
