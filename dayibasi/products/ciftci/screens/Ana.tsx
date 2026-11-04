"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { daysLeft, listDocs, type Doc } from "@/core/documents/api";
import { listDues, remaining, type Due } from "@/core/dues/api";
import { listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, owed, type Expense } from "@/core/expenses/api";
import { isLow, listItems, type Item } from "@/core/inventory/api";
import { formatTL } from "@/core/ledger/api";
import { listPlaces, type Place } from "@/core/places/api";
import { MainButton, PageHeader } from "@/core/ui";
import { PrivacyButton } from "@/core/ui/privacy";
import { clearLocal, flush, status } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";
import { TabLink, useGo, useOnActivate } from "@/core/shell/TabShell";
import { inSeason, SeasonPicker, useSeason } from "../sezon";
import { config } from "../config";
import { addDays, dayText, dayYear, GELIR, harvestFrom, HATIRLAT, incomeOpen, ISLEM, MAKINE, todayStr } from "../kayit";
import { bakimDurumu } from "./Makineler";
import { updateEvent } from "@/core/events/api";
import { HistoryLink } from "../nav";
import { exportAll } from "../disaAktar";
import { Weather } from "../hava";
import { useRole } from "../rol";

/** Özet: yılın kârı, hızlı ekle, uyarılar (hasat bekleme, vadeler, belgeler, biten stok), bağlantılar. */
export default function Ana() {
  const biz = useBusiness();
  const { nameOf, members } = useMembers(biz.id);
  const [exp, setExp] = useState<Expense[]>([]);
  const [ev, setEv] = useState<EventRow[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const { selected: S, seasons } = useSeason();
  const go = useGo();
  const { sees, writes } = useRole();
  const off = (Array.isArray(biz.settings?.hidden_screens) ? biz.settings!.hidden_screens : []) as string[];
  const can = (s: string, w = 1) => !off.includes(s) && (w === 2 ? writes(s) : sees(s));
  const load = useCallback(() => {
    listExpenses(biz.id).then(setExp).catch(() => {});
    Promise.all([listEvents(biz.id, GELIR), listEvents(biz.id, ISLEM), listEvents(biz.id, HATIRLAT), listEvents(biz.id, MAKINE)]).then(([a, b, c, d]) => setEv([...a, ...b, ...c, ...d])).catch(() => {});
    listDues(biz.id).then(setDues).catch(() => {});
    listDocs(biz.id).then(setDocs).catch(() => {});
    listItems(biz.id).then(setItems).catch(() => {});
    listPlaces(biz.id).then(setPlaces).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  const today = todayStr();
  const [showAlerts, setShowAlerts] = useState(false);
  const [outMsg, setOutMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const [isAdm, setIsAdm] = useState(false);
  useEffect(() => { supabase().rpc("is_platform_admin").then(({ data }) => setIsAdm(data === true)); }, []);
  // Kim ne girdi: son "Gördüm"den beri başkalarının girdiği kayıtlar
  const [me, setMe] = useState<string | null>(null);
  const [seenAt, setSeenAt] = useState<string>("");
  useEffect(() => {
    supabase().auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null; setMe(id);
      try { setSeenAt(localStorage.getItem(`ko:gordu:${biz.id}:${id}`) ?? new Date(Date.now() - 3 * 86400000).toISOString()); } catch { /* yok */ }
    });
  }, [biz.id]);
  const signOut = async () => {
    if (status().pending > 0) {
      await flush();
      if (status().pending > 0) { setOutMsg(`${status().pending} kayıt henüz gönderilmedi. İnternet gelince gönderilsin, sonra çıkış yap; yoksa bu kayıtlar kaybolur.`); return; }
    }
    clearLocal(); await supabase().auth.signOut(); location.href = "/";
  };
  const masraf = exp.filter((e) => inSeason(e.occurred_on, S)).reduce((t, e) => t + e.amount, 0);
  const gelir = ev.filter((e) => e.kind === GELIR && inSeason(e.occurred_on, S)).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  const place = (id: string | null) => places.find((p) => p.id === id)?.name ?? "Tarla";

  // Uyarılar
  const waits = ev.filter((e) => e.kind === ISLEM).map((e) => ({ e, h: harvestFrom(e) })).filter((x) => x.h && x.h > today);
  const lastWait = Object.values(waits.reduce<Record<string, { e: EventRow; h: string }>>((m, x) => {
    const k = x.e.place_id ?? ""; if (!m[k] || m[k].h < x.h!) m[k] = { e: x.e, h: x.h! }; return m; }, {}));
  const borc = dues.filter((d) => d.direction === "borc").reduce((t, d) => t + remaining(d), 0) + exp.reduce((t, e) => t + owed(e), 0);
  const alacak = dues.filter((d) => d.direction === "alacak").reduce((t, d) => t + remaining(d), 0) + ev.filter((e) => e.kind === GELIR).reduce((t, e) => t + incomeOpen(e), 0);
  const dueSoon = !can("vadeler") ? [] : [
    ...dues.filter((d) => remaining(d) > 0 && d.due_on).map((d) => ({ who: d.party, dir: d.direction, left: remaining(d), due: d.due_on! })),
    ...ev.filter((e) => e.kind === GELIR && incomeOpen(e) > 0 && e.data.due_on).map((e) => ({ who: String(e.data.buyer || e.data.type), dir: "alacak" as const, left: incomeOpen(e), due: String(e.data.due_on) })),
  ].filter((x) => (Date.parse(x.due) - Date.parse(today)) / 86400000 <= config.remindDays.dues).sort((a, b) => a.due.localeCompare(b.due));
  const docSoon = docs.filter((d) => { const n = daysLeft(d.expires_on); return n !== null && n <= config.remindDays.documents; });
  const empty = items.filter(isLow);
  const remind = ev.filter((e) => e.kind === HATIRLAT && !e.data.done && e.occurred_on <= addDays(today, 3)).sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
  const recent = [...exp.map((e) => ({ at: e.created_at ?? e.occurred_on, t: `Masraf · ${e.category} ${formatTL(e.amount)}`, by: e.created_by, open: () => go("masraf", { duzenle: e.id }) })),
    ...ev.filter((e) => e.kind !== MAKINE).map((e) => ({ at: e.created_at ?? e.occurred_on, t: e.kind === GELIR ? `Gelir · ${String(e.data.type)} ${formatTL(Number(e.quantity))}` : `${place(e.place_id)} · ${String(e.data.type)}`, by: e.created_by,
      open: () => (e.kind === GELIR ? go("gelir", { duzenle: e.id }) : go("tarlalar", { islem: e.id })) }))]
    .filter((r) => (!r.t.startsWith("Masraf ·") || sees("masraf")) && (!r.t.startsWith("Gelir ·") || sees("gelir"))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  // Selam, önceki sezon kârı, yaklaşanlar
  const hr = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Istanbul" }));
  const selam = hr < 11 ? "Günaydın" : hr < 18 ? "İyi günler" : "İyi akşamlar";
  const myName = members.find((m) => m.user_id === me)?.display_name || "";
  const nMasraf = exp.filter((e) => inSeason(e.occurred_on, S)).length;
  const P = seasons.filter((x) => x.start < S.start).sort((a, b) => b.start.localeCompare(a.start))[0];
  const prevKar = P ? ev.filter((e) => e.kind === GELIR && inSeason(e.occurred_on, P)).reduce((t, e) => t + Number(e.quantity ?? 0), 0) - exp.filter((e) => inSeason(e.occurred_on, P)).reduce((t, e) => t + e.amount, 0) : null;
  type Up = { key: string; day: string; icon: string; tone: string; title: React.ReactNode; sub: string; right?: React.ReactNode; go?: () => void };
  const when = (d: string) => (d === today ? "Bugün" : d === addDays(today, 1) ? "Yarın" : d < today ? `${dayText(d)} (geçti)` : dayText(d));
  const upcoming: Up[] = [
    ...remind.map((e): Up => ({ key: e.id, day: e.occurred_on, icon: "🔔", tone: e.occurred_on < today ? "kirmizi" : "ilac", title: String(e.data.title), sub: [when(e.occurred_on), e.place_id ? place(e.place_id) : ""].filter(Boolean).join(" · "),
      right: <button type="button" className="ui-chip" onClick={async (x) => { x.stopPropagation(); await updateEvent(e.id, { data: { ...e.data, done: true } }); load(); }}>Yapıldı</button> })),
    ...lastWait.map(({ e, h }): Up => ({ key: "h" + e.id, day: h!, icon: "🌾", tone: "", title: "Hasat edilebilir", sub: `${when(h!)} · ${place(e.place_id)} (${String(e.data.product ?? "ilaç")} beklemesi)` })),
    ...dueSoon.map((d, i): Up => ({ key: "d" + i, day: d.due, icon: d.dir === "borc" ? "💳" : "💰", tone: d.due < today ? "kirmizi" : d.dir === "borc" ? "kirmizi" : "", title: `${d.dir === "borc" ? "Ödenecek" : "Alınacak"}: ${d.who}`, sub: when(d.due), right: <b className="ui-money">{formatTL(d.left)}</b>, go: () => go("vadeler") })),
    ...docSoon.map((d): Up => ({ key: "b" + d.id, day: d.expires_on!, icon: "📄", tone: (daysLeft(d.expires_on) ?? 0) < 0 ? "kirmizi" : "mavi", title: `${d.title} bitiyor`, sub: when(d.expires_on!), go: () => go("belgeler") })),
    ...bakimDurumu(ev).filter((b) => (b.nextOn && b.nextOn <= addDays(today, config.remindDays.makine)) || (b.left !== null && b.left <= 0)).map((b): Up => ({ key: "m" + b.makine, day: b.nextOn ?? today, icon: "🚜", tone: (b.nextOn && b.nextOn < today) || (b.left !== null && b.left <= 0) ? "kirmizi" : "ilac",
      title: `${b.makine} bakımı`, sub: [b.nextOn ? when(b.nextOn) : "", b.left !== null && b.left <= 0 ? "bakım saati geldi" : ""].filter(Boolean).join(" · "), go: () => go("makineler", { makine: b.makine }) })),
    ...(empty.length ? [{ key: "depo", day: "9999", icon: "📦", tone: "ilac", title: "Depoda az kalan", sub: empty.map((i) => `${i.name} (${i.quantity.toLocaleString("tr-TR")} ${i.unit})`).join(", "), go: () => go("depo") } as Up] : []),
  ].sort((a, b) => a.day.localeCompare(b.day));
  const fresh = me && seenAt ? [...exp.map((e) => ({ by: e.created_by, at: e.created_at ?? "", k: "masraf" })), ...ev.map((e) => ({ by: e.created_by, at: e.created_at ?? "", k: e.kind === GELIR ? "gelir" : e.kind === HATIRLAT ? "hatırlatma" : e.kind === MAKINE ? "makine bakımı" : "tarla işi" }))]
    .filter((x) => x.by && x.by !== me && x.at > seenAt) : [];
  const freshBy = Object.entries(fresh.reduce<Record<string, Record<string, number>>>((m, x) => { const n = nameOf(x.by); (m[n] ??= {})[x.k] = (m[n][x.k] ?? 0) + 1; return m; }, {}));

  return (
    <main className="ui-has-nav ui-stack">
      <div className="ozet-selam">{selam}{myName ? `, ${myName}` : ""}</div>
      <PageHeader title={biz.name} right={<span style={{ display: "flex", gap: 8, alignItems: "center" }}>{can("rapor") && <span className="ozet-gizle"><PrivacyButton /></span>}<HistoryLink /></span>} />
      {can("rapor") && <SeasonPicker onManage={() => go("sezonlar")} />}
      <div className="ozet-ust">
        <div className="ui-stack" style={{ gap: 12 }}>
          {can("rapor") && (
            <div className="ozet-k2">
              <div className="ui-card"><span>{S.name} kâr</span><b className="ui-money">{formatTL(gelir - masraf)}</b>{prevKar !== null && prevKar !== 0 && <small className={gelir - masraf < prevKar ? "kotu" : ""}>{gelir - masraf >= prevKar ? "▲" : "▼"} %{Math.abs(Math.round(((gelir - masraf - prevKar) / Math.abs(prevKar)) * 100))} geçen sezona göre</small>}</div>
              <div className="ui-card"><span>Masraf</span><b className="ui-money">{formatTL(masraf)}</b><small style={{ color: "var(--sessiz2)" }}>{nMasraf} kalem</small></div>
              <div className="ui-card"><span>Gelir</span><b className="ui-money">{formatTL(gelir)}</b></div>
              <div className="ui-card"><span>Borç / alacak</span><b className="ui-money">{formatTL(borc)}</b><small style={{ color: "var(--sessiz2)" }}>alacak <span className="ui-money">{formatTL(alacak)}</span></small></div>
            </div>
          )}
          <div className="ozet-btns">
            {can("masraf", 2) && <TabLink to="masraf" params={{ yeni: 1 }}>+ Masraf</TabLink>}
            {can("tarlalar", 2) && <TabLink to="tarlalar">+ Tarla işi</TabLink>}
            {can("gelir", 2) && <TabLink to="gelir" params={{ yeni: 1 }}>+ Gelir</TabLink>}
            {can("fis", 2) && <TabLink to="fis">📷 Fiş yükle</TabLink>}
          </div>
          {freshBy.length > 0 && (
            <div className="ui-card ui-stack" style={{ gap: 6 }}>
              <b>Yeni kayıtlar</b>
              {freshBy.map(([who, ks]) => <span key={who}><b>{who}</b>: {Object.entries(ks).map(([k, n]) => `${n} ${k}`).join(", ")}</span>)}
              <div style={{ display: "flex", gap: 8 }}>
                {can("kayitlar") && <button type="button" className="ui-chip" onClick={() => go("kayitlar")}>Kayıtlarda gör</button>}
                <button type="button" className="ui-chip" onClick={() => { const t = new Date().toISOString(); setSeenAt(t); try { localStorage.setItem(`ko:gordu:${biz.id}:${me}`, t); } catch { /* yok */ } }}>Gördüm</button>
              </div>
            </div>
          )}
        </div>
        <div className="ui-stack" style={{ gap: 12 }}>
          {(() => {
            const seen = new Set<string>();
            const spots = places.filter((p) => p.custom?.lat).filter((p) => { const k = `${Number(p.custom.lat).toFixed(1)},${Number(p.custom.lon).toFixed(1)}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 2);
            return spots.map((p) => <Weather key={p.id} lat={Number(p.custom.lat)} lon={Number(p.custom.lon)} title={p.custom.koy?.split(",")[0] || p.name} />);
          })()}
          {upcoming.length > 0 && (
            <div className="ui-card">
              <div className="kart-bas">Yaklaşanlar {can("takvim") && <TabLink to="takvim">Takvim ›</TabLink>}</div>
              <div className="liste-ic">
                {upcoming.slice(0, 6).map((u) => (
                  <div key={u.key} role={u.go ? "button" : undefined} onClick={u.go}>
                    <i className={`ic ${u.tone}`}>{u.icon}</i>
                    <div>{u.title}<small>{u.sub}</small></div>
                    {u.right}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ui-links">
        {can("rapor") && <TabLink to="rapor"><b>Sezon raporu</b><span>Gelir, masraf, tarla tarla kâr</span></TabLink>}
        {can("vadeler") && <TabLink to="vadeler"><b>Borç ve vadeler</b><span>Borç {formatTL(borc)} · Alacak {formatTL(alacak)}</span></TabLink>}
        {can("belgeler") && <TabLink to="belgeler"><b>Belgeler</b><span>{docs.length ? `${docs.length} belge` : "ÇKS, sigorta, kira…"}</span></TabLink>}
        {can("tarlalar") && <TabLink to="makineler"><b>Makineler</b><span>Traktör bakımı, motor saati, sonraki bakım</span></TabLink>}
        {can("takvim") && <TabLink to="takvim"><b>Takvim ve hatırlatmalar</b><span>Tarla işleri, hasat, vadeler; hatırlatma kur</span></TabLink>}
        {can("masraf", 2) && can("fis", 2) && <TabLink to="fis"><b>Fiş yükle</b><span>Fişin fotoğrafını çek, sonra tutarını gir</span></TabLink>}
        {can("kayitlar") && <TabLink to="kayitlar"><b>Kayıtlar</b><span>Bütün masraf, gelir, tarla işleri: ara, düzelt, sil</span></TabLink>}
        {can("ayarlar", 2) && <TabLink to="listeler"><b>Listeleri düzenle</b><span>Masraf türleri, tarla işleri, birimler… ekle / kaldır</span></TabLink>}
        {can("rapor") && <button type="button" disabled={exporting} onClick={async () => {
          if (!navigator.onLine) { setOutMsg("İndirmek için internet lazım."); return; }
          setExporting(true); setOutMsg("");
          try { await exportAll(biz); setOutMsg("İndirildi: Excel (okumak için) ve .json (yedek). İkisini de iCloud'a ya da bilgisayara kaydet."); }
          catch { setOutMsg("İndiremedim, tekrar dene."); }
          setExporting(false);
        }}><b>{exporting ? "Hazırlanıyor…" : "Bütün verimi indir"}</b><span>Yedek: bütün kayıtlar Excel ve yedek dosyası olarak</span></button>}
        {isAdm && <a href="/panel"><b>Yönetim paneli</b><span>Bütün hesaplar, defterler ve ayarlar (bilgisayardan)</span></a>}
        <TabLink to="aile"><b>Aile ve ortak defter</b><span>Kim girdi, davet</span></TabLink>
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="ui-section">Son kayıtlar</h2>
          <div className="ui-card ui-rows">
            {recent.map((r, i) => <button key={i} type="button" className="ui-row-btn" onClick={r.open}><span>{r.t}</span><span>{nameOf(r.by)} ›</span></button>)}
          </div>
          <button type="button" className="ui-link" onClick={() => go("kayitlar")}>Bütün kayıtlar ›</button>
        </>
      )}
      {outMsg && <div className="ui-warn yakin"><div className="ui-warn-row"><span>{outMsg}</span></div></div>}
      <MainButton secondary onClick={signOut}>Çıkış yap</MainButton>
    </main>
  );
}
