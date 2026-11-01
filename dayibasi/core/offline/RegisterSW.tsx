"use client";
import { useEffect } from "react";

const CACHE = "dayibasi-v1"; // public/sw.js ile aynı

/** Service worker'ı kaydeder (yalnız yayında) ve ilk açılışta yüklenen dosyaları da telefona saklar. */
export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    navigator.serviceWorker.ready.then(async () => {
      // İlk açılışta dosyalar service worker devreye girmeden yüklendi; onları da sakla.
      const urls = performance.getEntriesByType("resource").map((e) => e.name)
        .filter((u) => u.startsWith(location.origin + "/_next/static/"));
      try { const c = await caches.open(CACHE); await c.addAll([...new Set(urls)]); } catch { /* sorun değil */ }
    });
  }, []);
  return null;
}
