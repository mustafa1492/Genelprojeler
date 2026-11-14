"use client";
import { useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { clearLocal, flush, status } from "@/core/offline/store";
import { useGo } from "@/core/shell/TabShell";
import { supabase } from "@/core/supabase/client";
import { MainButton, PageHeader } from "@/core/ui";
import { usePrivacy } from "@/core/ui/privacy";
import { exportAll } from "../disaAktar";
import { useGorunum } from "../gorunum";
import { getRates, useDoviz, type Kur } from "@/core/fx";
import { useRole } from "../rol";

/** Ayarlar: kişi, defter ayarları, görünüm, veri, çıkış. */
export default function Ayarlar() {
  const biz = useBusiness();
  const go = useGo();
  const { members } = useMembers(biz.id);
  const { sees, writes, worker } = useRole();
  const off = (Array.isArray(biz.settings?.hidden_screens) ? biz.settings!.hidden_screens : []) as string[];
  const can = (s: string, w = 1) => !off.includes(s) && (w === 2 ? writes(s) : sees(s));
  const privacy = usePrivacy();
  const { large, setLarge } = useGorunum();
  const { doviz, setDoviz } = useDoviz();
  const [kurBugun, setKurBugun] = useState<Kur | null>(null);
  useEffect(() => { const t = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }); getRates([t]).then((r) => setKurBugun(r[t])).catch(() => {}); }, []);
  const [me, setMe] = useState<string | null>(null);
  const [isAdm, setIsAdm] = useState(false);
  const [msg, setMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    supabase().auth.getSession().then(({ data }) => setMe(data.session?.user.id ?? null));
    supabase().rpc("is_platform_admin").then(({ data }) => setIsAdm(data === true));
  }, []);
  const myName = members.find((m) => m.user_id === me)?.display_name || "Ben";
  const initials = myName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toLocaleUpperCase("tr-TR");

  const signOut = async () => {
    if (status().pending > 0) {
      await flush();
      if (status().pending > 0) { setMsg(`${status().pending} kayıt henüz gönderilmedi. İnternet gelince gönderilsin, sonra çıkış yap; yoksa bu kayıtlar kaybolur.`); return; }
    }
    clearLocal(); await supabase().auth.signOut(); location.href = "/";
  };
  const download = async () => {
    if (!navigator.onLine) { setMsg("İndirmek için internet lazım."); return; }
    setExporting(true); setMsg("");
    try { await exportAll(biz, { eur: doviz === "eur" }); setMsg("İndirildi: Excel (okumak için) ve .json (yedek). İkisini de iCloud'a ya da bilgisayara kaydet."); }
    catch { setMsg("İndiremedim, tekrar dene."); }
    setExporting(false);
  };
  const row = (id: string, title: string, sub?: string) => (
    <a href="#" onClick={(e) => { e.preventDefault(); go(id); }}><div>{title}{sub && <small>{sub}</small>}</div><i aria-hidden="true">›</i></a>
  );

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader title="Ayarlar" />
      <div className="ui-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="ui-avatar" style={{ width: 48, height: 48, borderRadius: 999, background: "var(--ana-acik)", color: "var(--ana-yazi)", display: "grid", placeItems: "center", fontWeight: 800 }}>{initials}</span>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <b>{myName}</b>
          <small style={{ color: "var(--sessiz2)", fontWeight: 600 }}>{biz.settings?.demo === true ? "Deneme hesabı" : worker ? "Çalışan" : "Defter sahibi / yönetici"} · {biz.name}</small>
        </div>
      </div>

      <div className="mn-grp"><span>Defter</span>
        <div className="mn-liste">
          {row("aile", "Aile ve çalışanlar", "Davet, kim ne görebilir")}
          {can("ayarlar", 2) && row("listeler", "Listeler", "Masraf türleri, tarla işleri, birimler")}
          {can("ayarlar", 2) && row("sezonlar", "Sezonlar", "Sezon başı ve sonu")}
        </div>
      </div>

      <div className="mn-grp"><span>Görünüm</span>
        <div className="mn-liste">
          <label><div>Büyük yazı<small>Bütün ekranlarda yazılar büyür</small></div><input type="checkbox" checked={large} onChange={(e) => setLarge(e.target.checked)} /></label>
          {row("duzenle", "Ekranımı düzenle", "Özet kartları, alt çubuk, kâr dönemi, hazır görünümler")}
          <label><div>Tutarları gizle<small>Telefonu birine gösterirken para yazan her yer *** olur</small></div><input type="checkbox" checked={privacy.on} onChange={privacy.toggle} /></label>
          <div className="mn-doviz"><div>Döviz karşılığı<small>{kurBugun ? `Bugün 1 $ = ${kurBugun.usd.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL · 1 € = ${kurBugun.eur.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL (TCMB)` : "Tutarların yanında, kaydın günündeki kurla"}</small></div>
            <div className="mn-seg" role="group" aria-label="Döviz karşılığı" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {([["kapali", "Kapalı"], ["usd", "Dolar"], ["eur", "Euro"]] as const).map(([k, l]) => <button key={k} type="button" aria-pressed={doviz === k} onClick={() => setDoviz(k)}>{l}</button>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mn-grp"><span>Veri</span>
        <div className="mn-liste">
          {can("rapor") && <button type="button" disabled={exporting} onClick={download}><div>{exporting ? "Hazırlanıyor…" : "Bütün verimi indir"}<small>Excel (özet, ay ay, dolar karşılığı) ve yedek dosyası</small></div><i aria-hidden="true">›</i></button>}
          {row("gecmis", "Geçmiş", "Kim ne zaman ne değiştirdi")}
          {isAdm && <a href="/panel"><div>Yönetim paneli<small>Bütün hesaplar ve defterler (bilgisayardan)</small></div><i aria-hidden="true">›</i></a>}
        </div>
      </div>

      {msg && <div className="ui-warn yakin"><div className="ui-warn-row"><span>{msg}</span></div></div>}
      <MainButton secondary onClick={signOut}>Çıkış yap</MainButton>
    </main>
  );
}
