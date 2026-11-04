"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { daysLeft, listDocs, type Doc } from "@/core/documents/api";
import { listDues, remaining, type Due } from "@/core/dues/api";
import { listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, owed, type Expense } from "@/core/expenses/api";
import { isLow, listItems, type Item } from "@/core/inventory/api";
import { formatTL } from "@/core/ledger/api";
import { listPlaces, type Place } from "@/core/places/api";
import { PageHeader } from "@/core/ui";
import { PrivacyButton } from "@/core/ui/privacy";
import { supabase } from "@/core/supabase/client";
import { TabLink, useGo, useOnActivate } from "@/core/shell/TabShell";
import { inSeason, SeasonPicker, useSeason } from "../sezon";
import { config } from "../config";
import { addDays, dayText, dayYear, GELIR, harvestFrom, HATIRLAT, incomeOpen, ISLEM, MAKINE, todayStr } from "../kayit";
import { bakimDurumu } from "./Makineler";
import { updateEvent } from "@/core/events/api";
import { HistoryLink } from "../nav";
import { Weather } from "../hava";
import { useRole } from "../rol";
import { fmtFx, useRates } from "@/core/fx";
import { PERIODS, periodRange, useGorunum, type CardId } from "../gorunum";

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
  // Kim ne girdi: son "Gördüm"den beri başkalarının girdiği kayıtlar
  const [me, setMe] = useState<string | null>(null);
  const [seenAt, setSeenAt] = useState<string>("");
  useEffect(() => {
    supabase().auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null; setMe(id);
      try { setSeenAt(localStorage.getItem(`ko:gordu:${biz.id}:${id}`) ?? new Date(Date.now() - 3 * 86400000).toISOString()); } catch { /* yok */ }
    });
  }, [biz.id]);
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
    ...bakimDurumu(ev).filter((b) => b.nextOn && b.nextOn <= addDays(today, config.remindDays.makine)).map((b): Up => ({ key: "m" + b.makine, day: b.nextOn!, icon: "🚜", tone: b.nextOn! < today ? "kirmizi" : "ilac",
      title: `${b.makine} bakımı`, sub: when(b.nextOn!), go: () => go("makineler", { makine: b.makine }) })),
    ...(empty.length ? [{ key: "depo", day: "9999", icon: "📦", tone: "ilac", title: "Depoda az kalan", sub: empty.map((i) => `${i.name} (${i.quantity.toLocaleString("tr-TR")} ${i.unit})`).join(", "), go: () => go("depo") } as Up] : []),
  ].sort((a, b) => a.day.localeCompare(b.day));
  const fresh = me && seenAt ? [...exp.map((e) => ({ by: e.created_by, at: e.created_at ?? "", k: "masraf" })), ...ev.map((e) => ({ by: e.created_by, at: e.created_at ?? "", k: e.kind === GELIR ? "gelir" : e.kind === HATIRLAT ? "hatırlatma" : e.kind === MAKINE ? "makine bakımı" : "tarla işi" }))]
    .filter((x) => x.by && x.by !== me && x.at > seenAt) : [];
  const freshBy = Object.entries(fresh.reduce<Record<string, Record<string, number>>>((m, x) => { const n = nameOf(x.by); (m[n] ??= {})[x.k] = (m[n][x.k] ?? 0) + 1; return m; }, {}));

  // Kişiye özel görünüm: hangi kartlar, hangi sırayla; kâr kartının dönemi
  const { g, setG } = useGorunum();
  const { doviz, conv } = useRates(useMemo(() => [...exp.map((e) => e.occurred_on), ...ev.filter((e) => e.kind === GELIR).map((e) => e.occurred_on)], [exp, ev]));
  const [sel, setSel] = useState<CardId | null>(null);
  const press = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const hold = (id: CardId) => ({
    onPointerDown: () => { held.current = false; press.current = setTimeout(() => { held.current = true; setSel(id); try { navigator.vibrate?.(20); } catch { /* yok */ } }, 550); },
    onPointerUp: () => { if (press.current) clearTimeout(press.current); },
    onPointerLeave: () => { if (press.current) clearTimeout(press.current); },
    onPointerCancel: () => { if (press.current) clearTimeout(press.current); },
    onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); setSel(id); },
    // Uzun basıştan sonra parmak kalkınca gelen tıklama düğmeyi çalıştırmasın
    onClickCapture: (e: React.MouseEvent) => { if (held.current) { held.current = false; if (!(e.target as HTMLElement).closest(".ozet-blok-arac")) { e.preventDefault(); e.stopPropagation(); } } },
  });
  const moveCard = (id: CardId, d: -1 | 1) => { const a = g.cards.slice(); const i = a.indexOf(id), j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setG({ cards: a }); };

  // Kâr kartı: sezon ya da seçilen tarih aralığı
  const inRange = (d: string, a: string, b: string) => d >= a && d <= b;
  const sum = (a: string, b: string) => ({
    m: exp.filter((e) => inRange(e.occurred_on, a, b)).reduce((t, e) => t + e.amount, 0),
    g: ev.filter((e) => e.kind === GELIR && inRange(e.occurred_on, a, b)).reduce((t, e) => t + Number(e.quantity ?? 0), 0),
  });
  let kTitle = `${S.name} kârı`, kG = gelir, kM = masraf, kPrev: number | null = prevKar, kPrevLabel = "geçen sezona göre";
  if (g.period !== "sezon") {
    const r = periodRange(g.period, today); const c = sum(r.from, r.to), p = sum(r.prev[0], r.prev[1]);
    kTitle = `${r.label} kâr`; kG = c.g; kM = c.m; kPrev = p.g || p.m ? p.g - p.m : null; kPrevLabel = r.prevLabel;
  }
  const kar = kG - kM;
  // Döviz: her kayıt kendi günündeki kurla; kâr = gelir karşılığı − masraf karşılığı
  const inK = (d: string) => (g.period === "sezon" ? inSeason(d, S) : (() => { const r = periodRange(g.period, today); return d >= r.from && d <= r.to; })());
  const fxOf = (L: { a: number; d: string }[]) => (doviz === "kapali" ? null : L.reduce<number | null>((t, x) => { const v = conv(x.a, x.d); return t == null || v == null ? null : t + v; }, 0));
  const kFxG = fxOf(ev.filter((e) => e.kind === GELIR && inK(e.occurred_on)).map((e) => ({ a: Number(e.quantity ?? 0), d: e.occurred_on })));
  const kFxM = fxOf(exp.filter((e) => inK(e.occurred_on)).map((e) => ({ a: e.amount, d: e.occurred_on })));
  const kFx = kFxG != null && kFxM != null && (kG || kM) ? kFxG - kFxM : null;
  const nextPeriod = () => { const i = PERIODS.findIndex((p) => p.id === g.period); setG({ period: PERIODS[(i + 1) % PERIODS.length].id }); };

  const blocks: Record<CardId, React.ReactNode> = {
    kar: can("rapor") ? (
      <div className="ozet-kar">
        <div>
          <span className="bas">{kTitle}<button type="button" onClick={nextPeriod} aria-label="Dönemi değiştir">{PERIODS.find((p) => p.id === g.period)!.label} ▾</button></span>
          <span className="tutar ui-money">{formatTL(kar)}</span>
          {kFx != null && <span className="ozet-kar-fx ui-money">{fmtFx(kFx, doviz)}</span>}
          {kPrev !== null && kPrev !== 0 && <small className={kar < kPrev ? "kotu" : ""}>{kar >= kPrev ? "▲" : "▼"} %{Math.abs(Math.round(((kar - kPrev) / Math.abs(kPrev)) * 100))} {kPrevLabel}</small>}
        </div>
        <div className="alt">
          <span>Gelir<b className="ui-money">{formatTL(kG)}</b></span>
          <span>Masraf<b className="ui-money">{formatTL(kM)}</b></span>
          <span>{alacak >= borc ? "Alacak" : "Borç"}<b className="ui-money">{formatTL(alacak >= borc ? alacak : borc)}</b></span>
        </div>
      </div>
    ) : null,
    hizli: (
      <div className="ozet-hizli">
        {can("masraf", 2) && <TabLink to="masraf" params={{ yeni: 1 }}><em aria-hidden="true">🧾</em>+ Masraf</TabLink>}
        {can("gelir", 2) && <TabLink to="gelir" params={{ yeni: 1 }}><em aria-hidden="true">💰</em>+ Gelir</TabLink>}
        {can("tarlalar", 2) && <TabLink to="tarlalar"><em aria-hidden="true">🌾</em>Tarla işi</TabLink>}
        {can("fis", 2) && <TabLink to="fis"><em aria-hidden="true">📷</em>Fiş</TabLink>}
      </div>
    ),
    yeni: freshBy.length > 0 ? (
      <div className="ui-card ui-stack" style={{ gap: 6 }}>
        <b>Yeni kayıtlar</b>
        {freshBy.map(([who, ks]) => <span key={who}><b>{who}</b>: {Object.entries(ks).map(([k, n]) => `${n} ${k}`).join(", ")}</span>)}
        <div style={{ display: "flex", gap: 8 }}>
          {can("kayitlar") && <button type="button" className="ui-chip" onClick={() => go("kayitlar")}>Kayıtlarda gör</button>}
          <button type="button" className="ui-chip" onClick={() => { const t = new Date().toISOString(); setSeenAt(t); try { localStorage.setItem(`ko:gordu:${biz.id}:${me}`, t); } catch { /* yok */ } }}>Gördüm</button>
        </div>
      </div>
    ) : null,
    yakin: upcoming.length > 0 ? (
      <div className="ui-card">
        <div className="kart-bas">Yaklaşanlar {can("takvim") && <TabLink to="takvim">Takvim ›</TabLink>}</div>
        <div className="liste-ic">
          {upcoming.slice(0, 5).map((u) => (
            <div key={u.key} role={u.go ? "button" : undefined} onClick={u.go}>
              <i className={`ic ${u.tone}`}>{u.icon}</i>
              <div>{u.title}<small>{u.sub}</small></div>
              {u.right}
            </div>
          ))}
        </div>
      </div>
    ) : null,
    hava: (() => {
      const seen = new Set<string>();
      const spots = places.filter((p) => p.custom?.lat).filter((p) => { const k = `${Number(p.custom.lat).toFixed(1)},${Number(p.custom.lon).toFixed(1)}`; if (seen.has(k)) return false; seen.add(k); return true; });
      if (!spots.length) return null;
      return <div className="ui-stack" style={{ gap: 12 }}>{spots.map((p) => <Weather key={p.id} lat={Number(p.custom.lat)} lon={Number(p.custom.lon)} title={p.custom.koy?.split(",")[0] || p.name} />)}</div>;
    })(),
    son: recent.length > 0 ? (
      <div className="ui-card">
        <div className="kart-bas">Son kayıtlar <button type="button" onClick={() => go("kayitlar")}>Tümü ›</button></div>
        <div className="ui-rows">
          {recent.slice(0, 4).map((r, i) => <button key={i} type="button" className="ui-row-btn" onClick={r.open}><span>{r.t}</span><span>{nameOf(r.by)} ›</span></button>)}
        </div>
      </div>
    ) : null,
  };
  const shown = g.cards.filter((id) => blocks[id]);

  return (
    <main className="ui-has-nav ui-stack ozet-izgara" onClick={(e) => { if (sel && !(e.target as HTMLElement).closest(".ozet-blok.secili")) setSel(null); }}>
      <div className="ozet-selam">{selam}{myName ? `, ${myName}` : ""}</div>
      <PageHeader title={biz.name} right={<span style={{ display: "flex", gap: 8, alignItems: "center" }}>{can("rapor") && <span className="ozet-gizle"><PrivacyButton /></span>}<HistoryLink /></span>} />
      {can("rapor") && g.period === "sezon" && g.cards.includes("kar") && <SeasonPicker onManage={() => go("sezonlar")} />}
      {shown.map((id) => {
        const i = g.cards.indexOf(id);
        return (
          <div key={id} className={`ozet-blok${sel === id ? " secili" : ""}`} {...hold(id)}>
            {blocks[id]}
            {sel === id && (
              <div className="ozet-blok-arac">
                <button type="button" onClick={() => { setG({ cards: g.cards.filter((c) => c !== id) }); setSel(null); }}>Gizle</button>
                <button type="button" className="ikincil" disabled={i === 0} onClick={() => moveCard(id, -1)}>↑ Yukarı</button>
                <button type="button" className="ikincil" disabled={i === g.cards.length - 1} onClick={() => moveCard(id, 1)}>↓ Aşağı</button>
                <button type="button" className="ikincil" onClick={() => { setSel(null); go("duzenle"); }}>Düzenle</button>
                <button type="button" className="ikincil" onClick={() => setSel(null)}>Tamam</button>
              </div>
            )}
          </div>
        );
      })}
      {shown.length === 0 && <div className="ui-empty">Özette kart yok. <button type="button" className="ui-link" onClick={() => go("duzenle")}>Kart ekle</button></div>}
      <p className="ozet-ipucu">Bir karta uzun basarak gizleyebilir ya da yerini değiştirebilirsin.</p>
    </main>
  );
}
