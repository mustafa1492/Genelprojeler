"use client";
import { useBusiness } from "@/core/auth/AuthGate";
import { TabShell, type ShellTab } from "@/core/shell/TabShell";
import { hasFidan } from "./fidan";
import Fidan from "./screens/Fidan";
import { BASE } from "./config";
import { navItems } from "./nav";
import Aile from "./screens/Aile";
import Ana from "./screens/Ana";
import Belgeler from "./screens/Belgeler";
import Depo from "./screens/Depo";
import Gecmis from "./screens/Gecmis";
import Gelir from "./screens/Gelir";
import Masraf from "./screens/Masraf";
import Tarlalar from "./screens/Tarlalar";
import Sezonlar from "./screens/Sezonlar";
import Rapor from "./screens/Rapor";
import Listeler from "./lists";
import Vadeler from "./screens/Vadeler";
import Kayitlar from "./screens/Kayitlar";
import Takvim from "./screens/Takvim";
import Fis from "./screens/Fis";
import { SeasonProvider } from "./sezon";

const icon = (href: string) => navItems.find((n) => n.href === href)?.icon;
const TABS: ShellTab[] = [
  { id: "ozet", label: "Özet", path: BASE, inNav: true, icon: icon(BASE), render: () => <Ana /> },
  { id: "tarlalar", label: "Tarlalar", path: `${BASE}/tarlalar`, inNav: true, icon: icon(`${BASE}/tarlalar`), render: () => <Tarlalar /> },
  { id: "masraf", label: "Masraf", path: `${BASE}/masraf`, inNav: true, icon: icon(`${BASE}/masraf`), render: () => <Masraf /> },
  { id: "gelir", label: "Gelir", path: `${BASE}/gelir`, inNav: true, icon: icon(`${BASE}/gelir`), render: () => <Gelir /> },
  { id: "fidan", label: "Fidan", path: `${BASE}/fidan`, inNav: true, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="6" /><path d="M12 15v6M8 21h8" /><path d="M9 8c1 1 2 1 3 0s2-1 3 0" /></svg>, render: () => <Fidan /> },
  { id: "depo", label: "Depo", path: `${BASE}/depo`, inNav: true, icon: icon(`${BASE}/depo`), render: () => <Depo /> },
  { id: "vadeler", label: "Borç ve vadeler", path: `${BASE}/vadeler`, inNav: false, render: () => <Vadeler /> },
  { id: "belgeler", label: "Belgeler", path: `${BASE}/belgeler`, inNav: false, render: () => <Belgeler /> },
  { id: "aile", label: "Aile", path: `${BASE}/aile`, inNav: false, render: () => <Aile /> },
  { id: "sezonlar", label: "Sezonlar", path: `${BASE}/sezonlar`, inNav: false, render: () => <Sezonlar /> },
  { id: "listeler", label: "Listeler", path: `${BASE}/listeler`, inNav: false, render: () => <Listeler /> },
  { id: "rapor", label: "Sezon raporu", path: `${BASE}/rapor`, inNav: false, render: () => <Rapor /> },
  { id: "kayitlar", label: "Kayıtlar", path: `${BASE}/kayitlar`, inNav: false, render: () => <Kayitlar /> },
  { id: "fis", label: "Fiş yükle", path: `${BASE}/fis`, inNav: false, render: () => <Fis /> },
  { id: "takvim", label: "Takvim", path: `${BASE}/takvim`, inNav: false, render: () => <Takvim /> },
  { id: "gecmis", label: "Geçmiş", path: `${BASE}/gecmis`, inNav: false, render: () => <Gecmis /> },
];

/** Çiftçi defteri: tek sayfalık sekmeli uygulama (sekmeler kaldığı yerde kalır). */
export default function CiftciApp({ initial }: { initial: string }) {
  const biz = useBusiness();
  // Çalışan: para ekranları yok (veritabanı da izin vermez)
  const WORKER_HIDDEN = ["masraf", "gelir", "fidan", "rapor", "vadeler", "kayitlar", "gecmis", "sezonlar"];
  const tabs = TABS.filter((t) => (t.id !== "fidan" || hasFidan(biz)) && (biz.role !== "calisan" || !WORKER_HIDDEN.includes(t.id)));
  let start = initial, params: Record<string, string | number> | undefined;
  try { const q = new URLSearchParams(location.search); if (q.get("yeni")) params = { yeni: 1 }; } catch { /* sunucuda */ }
  if (!tabs.some((t) => t.id === start)) start = "ozet";
  return <SeasonProvider><TabShell tabs={tabs} initial={start} initialParams={params} /></SeasonProvider>;
}
