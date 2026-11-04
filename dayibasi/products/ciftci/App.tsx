"use client";
import { useBusiness } from "@/core/auth/AuthGate";
import { TabShell, type ShellTab } from "@/core/shell/TabShell";
import { hasFidan } from "./fidan";
import { useRole } from "./rol";
import Fidan from "./screens/Fidan";
import Kumes from "./hayvan/kanatli/Kumes";
import Hayvanlar from "./hayvan/Hayvanlar";
import { hasTur } from "./hayvan/hayvan";
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
import Makineler from "./screens/Makineler";
import Fis from "./screens/Fis";
import { SeasonProvider } from "./sezon";
import { PrefsProvider } from "@/core/prefs";
import Ayarlar from "./screens/Ayarlar";
import Duzenle from "./screens/Duzenle";
import Menu from "./Menu";
import { NAV_CHOICES, NAV_SLOTS, useGorunum } from "./gorunum";

const icon = (href: string) => navItems.find((n) => n.href === href)?.icon;
const TABS: ShellTab[] = [
  { id: "ozet", label: "Özet", group: "Genel", emoji: "🏠", path: BASE, inNav: true, icon: icon(BASE), render: () => <Ana /> },
  { id: "tarlalar", label: "Tarlalar", group: "Tarla", emoji: "🌾", path: `${BASE}/tarlalar`, inNav: true, icon: icon(`${BASE}/tarlalar`), render: () => <Tarlalar /> },
  { id: "masraf", label: "Masraf", group: "Para", emoji: "🧾", path: `${BASE}/masraf`, inNav: true, icon: icon(`${BASE}/masraf`), render: () => <Masraf /> },
  { id: "gelir", label: "Gelir", group: "Para", emoji: "💰", path: `${BASE}/gelir`, inNav: true, icon: icon(`${BASE}/gelir`), render: () => <Gelir /> },
  { id: "fidan", label: "Fidan", group: "Tarla", emoji: "🌱", path: `${BASE}/fidan`, inNav: true, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="6" /><path d="M12 15v6M8 21h8" /><path d="M9 8c1 1 2 1 3 0s2-1 3 0" /></svg>, render: () => <Fidan /> },
  { id: "kumes", label: "Kümes", group: "Hayvan", emoji: "🐔", path: `${BASE}/kumes`, inNav: true, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></svg>, render: () => <Kumes /> },
  { id: "buyukbas", label: "Büyükbaş", group: "Hayvan", emoji: "🐄", path: `${BASE}/buyukbas`, inNav: true, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8c0-2 1-3 3-3h10c2 0 3 1 3 3v3c0 4-3 8-8 8s-8-4-8-8z" /><path d="M9 12h.01M15 12h.01M10 16h4" /></svg>, render: () => <Hayvanlar species="buyukbas" /> },
  { id: "kucukbas", label: "Küçükbaş", group: "Hayvan", emoji: "🐑", path: `${BASE}/kucukbas`, inNav: true, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8c0-2 1-3 3-3h10c2 0 3 1 3 3v3c0 4-3 8-8 8s-8-4-8-8z" /><path d="M9 12h.01M15 12h.01M10 16h4" /></svg>, render: () => <Hayvanlar species="kucukbas" /> },
  { id: "depo", label: "Depo", group: "Tarla", emoji: "📦", path: `${BASE}/depo`, inNav: true, icon: icon(`${BASE}/depo`), render: () => <Depo /> },
  { id: "makineler", label: "Makineler", group: "Tarla", emoji: "🚜", path: `${BASE}/makineler`, inNav: false, render: () => <Makineler /> },
  { id: "vadeler", label: "Borç ve vadeler", group: "Para", emoji: "💳", path: `${BASE}/vadeler`, inNav: false, render: () => <Vadeler /> },
  { id: "belgeler", label: "Belgeler", group: "Diğer", emoji: "📄", path: `${BASE}/belgeler`, inNav: false, render: () => <Belgeler /> },
  { id: "aile", label: "Aile", group: "Diğer", emoji: "👪", path: `${BASE}/aile`, inNav: false, render: () => <Aile /> },
  { id: "sezonlar", label: "Sezonlar", path: `${BASE}/sezonlar`, inNav: false, render: () => <Sezonlar /> },
  { id: "listeler", label: "Listeler", group: "Diğer", emoji: "⚙️", path: `${BASE}/listeler`, inNav: false, render: () => <Listeler /> },
  { id: "rapor", label: "Sezon raporu", group: "Para", emoji: "📊", path: `${BASE}/rapor`, inNav: false, render: () => <Rapor /> },
  { id: "kayitlar", label: "Kayıtlar", group: "Para", emoji: "📋", path: `${BASE}/kayitlar`, inNav: false, render: () => <Kayitlar /> },
  { id: "fis", label: "Fiş yükle", group: "Para", emoji: "📷", path: `${BASE}/fis`, inNav: false, render: () => <Fis /> },
  { id: "takvim", label: "Takvim", group: "Genel", emoji: "📅", path: `${BASE}/takvim`, inNav: false, render: () => <Takvim /> },
  { id: "gecmis", label: "Geçmiş", path: `${BASE}/gecmis`, inNav: false, render: () => <Gecmis /> },
  { id: "ayarlar", label: "Ayarlar", group: "Diğer", emoji: "⚙️", path: `${BASE}/ayarlar`, inNav: false, render: () => <Ayarlar /> },
  { id: "duzenle", label: "Ekranımı düzenle", path: `${BASE}/duzenle`, inNav: false, render: () => null },
];

/** Çiftçi defteri: tek sayfalık sekmeli uygulama (sekmeler kaldığı yerde kalır). */
export default function CiftciApp({ initial }: { initial: string }) {
  const biz = useBusiness();
  return <PrefsProvider businessId={biz.id}><Inner initial={initial} /></PrefsProvider>;
}

function Inner({ initial }: { initial: string }) {
  const biz = useBusiness();
  const { g } = useGorunum();
  // Yetkiler: her sekmenin bağlı olduğu ekran izni (0 gizli, 1 sadece görür, 2 değiştirir). Defter ayarında kapatılan ekranlar da gizli.
  const { lvl } = useRole();
  const off = (Array.isArray(biz.settings?.hidden_screens) ? biz.settings!.hidden_screens : []) as string[];
  const SCREEN: Record<string, string> = { masraf: "masraf", gelir: "gelir", fidan: "fidan", kumes: "hayvan", buyukbas: "hayvan", kucukbas: "hayvan", depo: "depo", tarlalar: "tarlalar", makineler: "tarlalar", takvim: "takvim", rapor: "rapor",
    vadeler: "vadeler", belgeler: "belgeler", kayitlar: "kayitlar", fis: "fis", gecmis: "gecmis", listeler: "ayarlar", sezonlar: "ayarlar", aile: "uyeler" };
  const base = TABS.filter((t) => (t.id !== "fidan" || hasFidan(biz)) && (t.id !== "kumes" || hasTur(biz, "kanatli")) && (t.id !== "buyukbas" || hasTur(biz, "buyukbas")) && (t.id !== "kucukbas" || hasTur(biz, "kucukbas")) && !off.includes(SCREEN[t.id] ?? "") && (!SCREEN[t.id] || lvl(SCREEN[t.id]) >= 1 || t.id === "aile"))
    .map((t) => (SCREEN[t.id] && t.id !== "aile" && lvl(SCREEN[t.id]) === 1 ? { ...t, readOnly: true } : t));
  // Kişiye özel: alt çubuk (4 yer) ve Menü; "Ekranımı düzenle" seçilebilir sekmeleri bilir.
  const choices = NAV_CHOICES.map((id) => base.find((t) => t.id === id)).filter((t): t is ShellTab => !!t).map((t) => ({ id: t.id, label: t.label }));
  let navIds = g.nav.filter((id) => choices.some((c) => c.id === id));
  // Yetki ya da modül yüzünden boşalan yerleri görebildiği sekmelerle doldur (çalışan: Özet, Tarlalar, Depo, Takvim…)
  for (const c of choices) { if (navIds.length >= NAV_SLOTS) break; if (!navIds.includes(c.id)) navIds.push(c.id); }
  const tabs = base.map((t) => (t.id === "duzenle" ? { ...t, render: () => <Duzenle choices={choices} /> } : t));
  const menuTabs = tabs.map((t) => ({ id: t.id, label: t.label, emoji: t.emoji }));
  let start = initial, params: Record<string, string | number> | undefined;
  try { const q = new URLSearchParams(location.search); if (q.get("yeni")) params = { yeni: 1 }; } catch { /* sunucuda */ }
  if (!tabs.some((t) => t.id === start)) start = "ozet";
  return <SeasonProvider><TabShell tabs={tabs} initial={start} initialParams={params} navIds={navIds} menu={() => <Menu tabs={menuTabs} />} brand={<><img src="/icon-192.png" alt="" width={40} height={40} /><span><b>Çiftçi Defteri</b><small>{biz.name}</small></span></>} /></SeasonProvider>;
}
