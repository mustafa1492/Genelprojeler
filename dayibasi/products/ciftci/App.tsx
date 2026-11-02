"use client";
import { TabShell, type ShellTab } from "@/core/shell/TabShell";
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
import Vadeler from "./screens/Vadeler";
import { SeasonProvider } from "./sezon";

const icon = (href: string) => navItems.find((n) => n.href === href)?.icon;
const TABS: ShellTab[] = [
  { id: "ozet", label: "Özet", path: BASE, inNav: true, icon: icon(BASE), render: () => <Ana /> },
  { id: "tarlalar", label: "Tarlalar", path: `${BASE}/tarlalar`, inNav: true, icon: icon(`${BASE}/tarlalar`), render: () => <Tarlalar /> },
  { id: "masraf", label: "Masraf", path: `${BASE}/masraf`, inNav: true, icon: icon(`${BASE}/masraf`), render: () => <Masraf /> },
  { id: "gelir", label: "Gelir", path: `${BASE}/gelir`, inNav: true, icon: icon(`${BASE}/gelir`), render: () => <Gelir /> },
  { id: "depo", label: "Depo", path: `${BASE}/depo`, inNav: true, icon: icon(`${BASE}/depo`), render: () => <Depo /> },
  { id: "vadeler", label: "Borç ve vadeler", path: `${BASE}/vadeler`, inNav: false, render: () => <Vadeler /> },
  { id: "belgeler", label: "Belgeler", path: `${BASE}/belgeler`, inNav: false, render: () => <Belgeler /> },
  { id: "aile", label: "Aile", path: `${BASE}/aile`, inNav: false, render: () => <Aile /> },
  { id: "sezonlar", label: "Sezonlar", path: `${BASE}/sezonlar`, inNav: false, render: () => <Sezonlar /> },
  { id: "rapor", label: "Sezon raporu", path: `${BASE}/rapor`, inNav: false, render: () => <Rapor /> },
  { id: "gecmis", label: "Geçmiş", path: `${BASE}/gecmis`, inNav: false, render: () => <Gecmis /> },
];

/** Çiftçi defteri: tek sayfalık sekmeli uygulama (sekmeler kaldığı yerde kalır). */
export default function CiftciApp({ initial }: { initial: string }) {
  let start = initial, params: Record<string, string | number> | undefined;
  try { const q = new URLSearchParams(location.search); if (q.get("yeni")) params = { yeni: 1 }; } catch { /* sunucuda */ }
  if (!TABS.some((t) => t.id === start)) start = "ozet";
  return <SeasonProvider><TabShell tabs={TABS} initial={start} initialParams={params} /></SeasonProvider>;
}
