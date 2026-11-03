"use client";
import { useBusiness } from "@/core/auth/AuthGate";
import { TabShell, type ShellTab } from "@/core/shell/TabShell";
import { hasFidan } from "./fidan";
import { useRole } from "./rol";
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
  { id: "vadeler", label: "Borç ve vadeler", path: `${BASE}/vadeler`, inNav: false, side: true, render: () => <Vadeler /> },
  { id: "belgeler", label: "Belgeler", path: `${BASE}/belgeler`, inNav: false, side: true, render: () => <Belgeler /> },
  { id: "aile", label: "Aile", path: `${BASE}/aile`, inNav: false, side: true, render: () => <Aile /> },
  { id: "sezonlar", label: "Sezonlar", path: `${BASE}/sezonlar`, inNav: false, render: () => <Sezonlar /> },
  { id: "listeler", label: "Listeler", path: `${BASE}/listeler`, inNav: false, side: true, render: () => <Listeler /> },
  { id: "rapor", label: "Sezon raporu", path: `${BASE}/rapor`, inNav: false, side: true, render: () => <Rapor /> },
  { id: "kayitlar", label: "Kayıtlar", path: `${BASE}/kayitlar`, inNav: false, side: true, render: () => <Kayitlar /> },
  { id: "fis", label: "Fiş yükle", path: `${BASE}/fis`, inNav: false, side: true, render: () => <Fis /> },
  { id: "takvim", label: "Takvim", path: `${BASE}/takvim`, inNav: false, side: true, render: () => <Takvim /> },
  { id: "gecmis", label: "Geçmiş", path: `${BASE}/gecmis`, inNav: false, render: () => <Gecmis /> },
];

/** Çiftçi defteri: tek sayfalık sekmeli uygulama (sekmeler kaldığı yerde kalır). */
export default function CiftciApp({ initial }: { initial: string }) {
  const biz = useBusiness();
  // Yetkiler: her sekmenin bağlı olduğu ekran izni (0 gizli, 1 sadece görür, 2 değiştirir). Defter ayarında kapatılan ekranlar da gizli.
  const { lvl } = useRole();
  const off = (Array.isArray(biz.settings?.hidden_screens) ? biz.settings!.hidden_screens : []) as string[];
  const SCREEN: Record<string, string> = { masraf: "masraf", gelir: "gelir", fidan: "fidan", depo: "depo", tarlalar: "tarlalar", takvim: "takvim", rapor: "rapor",
    vadeler: "vadeler", belgeler: "belgeler", kayitlar: "kayitlar", fis: "fis", gecmis: "gecmis", listeler: "ayarlar", sezonlar: "ayarlar", aile: "uyeler" };
  const tabs = TABS.filter((t) => (t.id !== "fidan" || hasFidan(biz)) && !off.includes(SCREEN[t.id] ?? "") && (!SCREEN[t.id] || lvl(SCREEN[t.id]) >= 1 || t.id === "aile"))
    .map((t) => (SCREEN[t.id] && t.id !== "aile" && lvl(SCREEN[t.id]) === 1 ? { ...t, readOnly: true } : t));
  let start = initial, params: Record<string, string | number> | undefined;
  try { const q = new URLSearchParams(location.search); if (q.get("yeni")) params = { yeni: 1 }; } catch { /* sunucuda */ }
  if (!tabs.some((t) => t.id === start)) start = "ozet";
  return <SeasonProvider><TabShell tabs={tabs} initial={start} initialParams={params} brand={<><img src="/icon-192.png" alt="" width={40} height={40} /><span><b>Çiftçi Defteri</b><small>{biz.name}</small></span></>} /></SeasonProvider>;
}
