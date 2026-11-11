"use client";
import { useCList } from "../lists";
import { listLots, type Lot } from "@/core/lots/api";
import { AKTARIM, FIDAN_SATIS, hasFidan, lotStats, SAYIM } from "../fidan";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { addEvent, deleteEvent, listEvents, updateEvent, type EventRow } from "@/core/events/api";
import { addExpense, deleteExpense, listExpenses, type Expense } from "@/core/expenses/api";
import { useRole } from "../rol";
import { searchPlace, Weather, type Spot } from "../hava";
import { ilceListe, ilListe, mahalleListe, parselBul, type Parsel, type Yer } from "../tapu";
import { listItems, updateItem, type Item } from "@/core/inventory/api";
import { formatTL } from "@/core/ledger/api";
import { mutate } from "@/core/offline/store";
import { addPlace, listPlaces, type Place } from "@/core/places/api";
import { BackButton, Card, Chip, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, TextField } from "@/core/ui";
import { config } from "../config";
import { breakEven, dayText, dayYear, GELIR, harvestFrom, ISLEM, num, thisYear, todayStr, VERIM, year } from "../kayit";
import { HistoryLink } from "../nav";
import { TabLink, useGo, useOnActivate, useTabParams } from "@/core/shell/TabShell";
import { inSeason, SeasonPicker, useSeason, type Season } from "../sezon";

type View = { v: "list" } | { v: "yeni"; edit?: Place } | { v: "tarla"; id: string } | { v: "islem"; id: string; type?: string; edit?: EventRow } | { v: "verim"; id: string };
type Done = { message: string; undo?: () => Promise<void> } | null;

export default function Tarlalar() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const fidan = hasFidan(biz);
  const { money } = useRole();
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Done>(null);
  const { selected: S, seasons } = useSeason();
  const go = useGo();
  const y = S.name;

  const load = useCallback(() => {
    Promise.all([listPlaces(biz.id), listEvents(biz.id, ISLEM), listEvents(biz.id, VERIM), listEvents(biz.id, GELIR), listExpenses(biz.id), listItems(biz.id)])
      .then(([p, a, b, c, x, i]) => { setPlaces(p.sort((m, n) => m.name.localeCompare(n.name, "tr"))); setEvents((ev) => [...a, ...b, ...c, ...ev.filter((e) => e.kind === SAYIM || e.kind === AKTARIM)]); setExpenses(x); setItems(i); });
    if (fidan) {
      listLots(biz.id).then(setLots).catch(() => {});
      Promise.all([listEvents(biz.id, SAYIM), listEvents(biz.id, AKTARIM)]).then(([s1, s2]) => setEvents((ev) => [...ev.filter((e) => e.kind !== SAYIM && e.kind !== AKTARIM), ...s1, ...s2])).catch(() => {});
    }
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);
  const tp = useTabParams();
  useEffect(() => {
    if (tp.p.islem) { const e = events.find((x) => x.id === tp.p.islem); if (e?.place_id) { setDone(null); setView({ v: "islem", id: e.place_id, type: String(e.data.type), edit: e }); return; } }
    if (tp.p.tarla) setView({ v: "tarla", id: String(tp.p.tarla) });
  }, [tp.n, events.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const find = (id: string) => (places ?? []).find((p) => p.id === id);
  // Fidan modülü: tarladaki aktif partilerin canlı fidan sayısı ve maliyeti
  const multi = useCList("isler").length > 1;
  const fidanOf = (pid: string) => {
    if (!fidan || !money) return null;
    const counts = events.filter((e) => e.kind === SAYIM), sales = events.filter((e) => e.kind === GELIR && e.data.type === FIDAN_SATIS), moves = events.filter((e) => e.kind === AKTARIM);
    const S = lots.filter((l) => l.place_id === pid && l.status === "aktif").map((l) => lotStats(l, lots, counts, sales, expenses, moves, multi));
    if (!S.length) return null;
    const alive = S.reduce((t, x) => t + x.alive, 0), cost = S.reduce((t, x) => t + x.cost, 0);
    return { S, alive, cost, per: alive ? cost / alive : 0 };
  };
  const statsOf = (p: Place, ss: Season) => {
    const m = expenses.filter((e) => e.place_id === p.id && inSeason(e.occurred_on, ss)).reduce((t, e) => t + e.amount, 0);
    const g = events.filter((e) => e.kind === GELIR && e.place_id === p.id && inSeason(e.occurred_on, ss)).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
    const donum = Number(p.custom?.donum) || 0;
    return { m, g, kar: g - m, donum, perDonum: donum ? m / donum : 0 };
  };
  const doneCard = done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />;

  if (view.v === "yeni") return <TarlaForm edit={view.edit} onCancel={() => setView(view.edit ? { v: "tarla", id: view.edit.id } : { v: "list" })}
    onSave={async (name, custom) => {
      if (view.edit) {
        const old = view.edit;
        await mutate({ kind: "update", table: "places", key: old.id, values: { name, custom } });
        setDone({ message: `Değiştirdim: ${name}.`, undo: () => mutate({ kind: "update", table: "places", key: old.id, values: { name: old.name, custom: old.custom } }) });
        setView({ v: "tarla", id: old.id });
      } else {
        const p = await addPlace(biz.id, name, null);
        await mutate({ kind: "update", table: "places", key: p.id, values: { custom } });
        setDone({ message: `Tarla eklendi: ${name}.`, undo: () => mutate({ kind: "delete", table: "places", key: p.id }) });
        setView({ v: "tarla", id: p.id });
      }
      load();
    }} />;

  if (view.v === "islem") {
    const p = find(view.id);
    if (p) return <IslemForm place={p} items={items} history={events.filter((e) => e.kind === ISLEM)} initialType={view.type} edit={view.edit} onCancel={() => setView({ v: "tarla", id: p.id })}
      onDelete={view.edit ? async () => { const e = view.edit!; await deleteEvent(e.id); setDone({ message: `Sildim: ${String(e.data.type)}.`, undo: () => mutate({ kind: "insert", table: "events", values: e }) }); setView({ v: "tarla", id: p.id }); load(); } : undefined}
      onSave={async (type, day, data, use, fee) => {
        if (view.edit) {
          const old = view.edit;
          const keep = Object.fromEntries(Object.entries(old.data).filter(([k]) => ["item_id", "used", "unit"].includes(k)));
          await updateEvent(old.id, { occurred_on: day, data: { type, ...keep, ...data } });
          setDone({ message: `Değiştirdim: ${p.name}, ${type}.`, undo: () => updateEvent(old.id, { occurred_on: old.occurred_on, data: old.data }) });
          setView({ v: "tarla", id: p.id }); load(); return;
        }
        const ev = await addEvent(biz.id, { kind: ISLEM, occurred_on: day, place_id: p.id, person_id: null, quantity: null, data: { type, ...data } });
        let undoStock: (() => Promise<void>) | null = null;
        if (use) {
          const it = items.find((i) => i.id === use.id)!;
          await updateItem(it.id, { quantity: it.quantity - use.amount });
          undoStock = () => updateItem(it.id, { quantity: it.quantity });
        }
        const fx = fee ? await addExpense(biz.id, { occurred_on: day, category: "Sulama / elektrik", amount: fee, note: `Su ücreti${data.hours ? ` (${String(data.hours)} saat)` : ""}`, on_credit: false, vendor: null, paid_amount: 0, charge_to: null, place_id: p.id, photo_path: null, ...(p.custom?.is ? { data: { branch: p.custom.is } } : {}) }) : null;
        setDone({ message: `Kaydettim: ${p.name}, ${type}${data.product ? ` (${data.product})` : ""}${data.hours ? `, ${String(data.hours)} saat` : ""}${data.kwh ? `, ${String(data.kwh)} kWh` : ""}.${use ? ` Depodan ${use.amount} ${items.find((i) => i.id === use.id)?.unit} düştüm.` : ""}${fx ? ` Masraflara ${formatTL(fee!)} su ücreti eklendi.` : ""}`,
          undo: async () => { await deleteEvent(ev.id); if (undoStock) await undoStock(); if (fx) await deleteExpense(fx.id); } });
        setView({ v: "tarla", id: p.id }); load();
      }} />;
  }

  if (view.v === "verim") {
    const p = find(view.id);
    if (p) return <VerimForm place={p} seasons={seasons} current={S} onCancel={() => setView({ v: "tarla", id: p.id })}
      onSave={async (yy, crop, amount, unit) => {
        const ev = await addEvent(biz.id, { kind: VERIM, occurred_on: todayStr(), place_id: p.id, person_id: null, quantity: amount, data: { year: yy, crop, unit } });
        setDone({ message: `Kaydettim: ${p.name} ${yy} verimi ${amount.toLocaleString("tr-TR")} ${unit}.`, undo: () => deleteEvent(ev.id) });
        setView({ v: "tarla", id: p.id }); load();
      }} />;
  }

  if (view.v === "tarla") {
    const p = find(view.id);
    if (p) {
      const st = statsOf(p, S);
      const ops = events.filter((e) => e.kind === ISLEM && e.place_id === p.id).sort((a, b) => (b.occurred_on + (b.created_at ?? "")).localeCompare(a.occurred_on + (a.created_at ?? "")));
      const yields = events.filter((e) => e.kind === VERIM && e.place_id === p.id).sort((a, b) => String(b.data.year).localeCompare(String(a.data.year)));
      const wait = ops.map((e) => ({ e, h: harvestFrom(e) })).filter((x) => x.h && x.h > todayStr()).sort((a, b) => b.h!.localeCompare(a.h!))[0];
      const pExp = expenses.filter((e) => e.place_id === p.id && inSeason(e.occurred_on, S));
      const be = breakEven(st.m, yields.filter((e) => String(e.data.year) === S.name));
      return (
        <main className="ui-stack">
          <BackButton onClick={() => { setDone(null); setView({ v: "list" }); }} label="Tarlalar" />
          <PageHeader sub={[p.custom?.urun, st.donum ? `${st.donum} dekar` : "", p.custom?.ada ? `Ada ${p.custom.ada} / Parsel ${p.custom.parsel}` : ""].filter(Boolean).join(" · ") || "Tarla"} title={p.name} />
          {doneCard}
          {wait && <div className="ui-warn yakin"><div className="ui-warn-row"><span>Hasat en erken <b>{dayYear(wait.h!)}</b> ({String(wait.e.data.product ?? "ilaç")}, {dayText(wait.e.occurred_on)} ilaçlaması).</span></div></div>}
          {money && <div className="ui-split">
            <div><span>{y} masraf</span><b>{formatTL(st.m)}</b>{st.donum ? <small>dekar başı {formatTL(Math.round(st.perDonum))}</small> : <small>&nbsp;</small>}</div>
            <div className="mine"><span>{y} {st.kar < 0 ? "zarar" : "kâr"}</span><b>{formatTL(Math.abs(st.kar))}</b><small>gelir {formatTL(st.g)}</small></div>
          </div>}
          {!money ? null : be ? (
            <div className="ui-card ui-stack" style={{ gap: 4 }}>
              <span className="ui-note" style={{ margin: 0 }}>Başabaş fiyatı ({y})</span>
              <b style={{ fontSize: "1.5rem" }}>{formatTL(Math.round(be.perUnit * 100) / 100)} / {be.unit}</b>
              <span className="ui-note" style={{ margin: 0 }}>{formatTL(st.m)} masraf ÷ {be.qty.toLocaleString("tr-TR")} {be.unit} verim. Bundan aşağıya satarsan bu tarlada zarar edersin.</span>
            </div>
          ) : <button type="button" className="ui-empty" style={{ font: "inherit", cursor: "pointer", width: "100%" }} onClick={() => { setDone(null); setView({ v: "verim", id: p.id }); }}>Başabaş fiyatını görmek için bu sezonun verimini gir ›</button>}
          <div className="ui-tiles">
            <button type="button" onClick={() => { setDone(null); setView({ v: "islem", id: p.id }); }}><b>+ İşlem</b><small>ilaç, gübre, sulama…</small></button>
            <button type="button" onClick={() => { setDone(null); setView({ v: "islem", id: p.id, type: "İlaçlama" }); }}><b>+ İlaçlama</b><small>ilaç, doz, bekleme</small></button>
            <button type="button" onClick={() => { setDone(null); setView({ v: "verim", id: p.id }); }}><b>+ Verim</b><small>bu yıl kaç kg</small></button>
            {money ? <TabLink to="masraf" params={{ yeni: 1, tarla: p.id }}><b>+ Masraf</b><small>bu tarla için</small></TabLink>
              : <TabLink to="fis"><b>Fiş yükle</b><small>fotoğrafını gönder</small></TabLink>}
          </div>

          {(() => { const f = fidanOf(p.id); if (!f) return null; return (
            <div className="ui-card ui-stack" style={{ gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>Bu tarladaki fidanlar</b><span className="ui-amount">{f.alive.toLocaleString("tr-TR")}</span></div>
              <span className="ui-note" style={{ margin: 0 }}>Toplam maliyet {formatTL(Math.round(f.cost))} · fidan başı {formatTL(Math.round(f.per * 100) / 100)}</span>
              {f.S.map((x) => <div key={x.lot.id} className="ui-moneyrow"><b>{String(x.lot.data.batch_name ?? x.lot.name)}<small>{x.lot.planted_on ? dayYear(x.lot.planted_on) : ""} · fidan başı {formatTL(Math.round(x.perPlant * 100) / 100)}</small></b><strong>{x.alive.toLocaleString("tr-TR")}</strong></div>)}
              <button type="button" className="ui-link" onClick={() => go("fidan")}>Fidan sekmesinde aç ›</button>
            </div>); })()}
          {p.custom?.lat && <Weather lat={Number(p.custom.lat)} lon={Number(p.custom.lon)} title={p.custom.koy?.split(",")[0] || p.name} />}
          {(() => {
            const su = ops.filter((e) => e.data.type === "Sulama" && inSeason(e.occurred_on, S));
            if (!su.length) return null;
            const h = su.reduce((t, e) => t + Number(e.data.hours ?? 0), 0), k = su.reduce((t, e) => t + Number(e.data.kwh ?? 0), 0), f = pExp.filter((e) => e.note?.startsWith("Su ücreti")).reduce((t, e) => t + e.amount, 0);
            return <Card><InfoRows rows={[["Sulama (bu sezon)", `${su.length} kez`], ...(h ? [["Toplam süre", `${h.toLocaleString("tr-TR")} saat`] as [string, string]] : []), ...(k ? [["Elektrik", `${k.toLocaleString("tr-TR")} kWh`] as [string, string]] : []), ...(f && money ? [["Su ücreti", formatTL(f)] as [string, string]] : []), ["Son sulama", `${dayYear(su[0].occurred_on)}${su[0].data.method ? ` · ${String(su[0].data.method)}` : ""}`]]} /></Card>;
          })()}
          <h2 className="ui-section">Tarla günlüğü</h2>
          {ops.length === 0 && <div className="ui-empty">Henüz işlem yok.</div>}
          {ops.map((e) => (
            <div key={e.id} className="ui-moneyrow" role="button" style={{ cursor: "pointer", justifyContent: "flex-start" }} onClick={() => { setDone(null); setView({ v: "islem", id: p.id, type: String(e.data.type), edit: e }); }}>
              {(() => { const t = String(e.data.type); const [ic, tone] = t === "Sulama" ? ["💧", "su"] : t === "İlaçlama" ? ["🧪", "ilac"] : t === "Gübreleme" ? ["🌿", "gubre"] : t === "Hasat" ? ["🌾", ""] : t.startsWith("Ekim") ? ["🌱", ""] : t === "Budama" ? ["✂️", "gubre"] : ["🚜", "mavi"]; return <i className={`ic ${tone}`} aria-hidden="true">{ic}</i>; })()}
              <b style={{ minWidth: 0, flex: 1 }}>{String(e.data.type)}{e.data.product ? ` · ${String(e.data.product)}` : ""}
                <small>{[dayYear(e.occurred_on), e.data.method ? String(e.data.method) : "", e.data.hours ? `${String(e.data.hours)} saat` : "", e.data.kwh ? `${String(e.data.kwh)} kWh` : "", e.data.dose ? `doz ${String(e.data.dose)}` : "", harvestFrom(e) ? `hasat ≥ ${dayText(harvestFrom(e)!)}` : "", e.data.note ? String(e.data.note) : "", nameOf(e.created_by)].filter(Boolean).join(" · ")}</small></b>
              <button type="button" className="ui-link inline" style={{ color: "var(--tehlike)" }} onClick={async (x) => {
                x.stopPropagation(); await deleteEvent(e.id); setDone({ message: `Sildim: ${String(e.data.type)}.`, undo: () => mutate({ kind: "insert", table: "events", values: e }) }); load();
              }}>Sil</button>
            </div>
          ))}

          <h2 className="ui-section">Verim</h2>
          {yields.length === 0 && <div className="ui-empty">Henüz verim girilmedi.</div>}
          {yields.length > 0 && <Card><InfoRows rows={yields.map((e) => [`${String(e.data.year)} · ${String(e.data.crop || p.custom?.urun || "")}`,
            `${Number(e.quantity).toLocaleString("tr-TR")} ${String(e.data.unit)}${st.donum ? ` · dekar başı ${Math.round(Number(e.quantity) / st.donum).toLocaleString("tr-TR")}` : ""}`] as [string, string])} /></Card>}

          {money && <h2 className="ui-section">{y} sezonu masrafları</h2>}
          {money && (pExp.length === 0 ? <div className="ui-empty">Bu tarlaya bu sezon masraf girilmedi.</div>
            : <Card><InfoRows rows={pExp.map((e) => [`${dayText(e.occurred_on)} · ${e.category}`, formatTL(e.amount)] as [string, string])} /></Card>)}
          <MainButton secondary onClick={() => setView({ v: "yeni", edit: p })}>Tarla bilgilerini değiştir</MainButton>
        </main>
      );
    }
  }

  // --- Liste
  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={`${(places ?? []).length} tarla`} title="Tarlalar" right={<HistoryLink />} />
      {doneCard}
      <SeasonPicker onManage={() => go("sezonlar")} />
      {places?.length === 0 && <div className="ui-empty">Henüz tarla yok. İlk tarlanı ekle.</div>}
      {(places ?? []).map((p) => {
        const st = statsOf(p, S);
        const last = events.filter((e) => e.kind === ISLEM && e.place_id === p.id).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on))[0];
        return (
          <button key={p.id} type="button" className="ui-card ui-stack" style={{ gap: 6 }} onClick={() => { setDone(null); setView({ v: "tarla", id: p.id }); }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <b style={{ fontSize: "1.15rem" }}>{p.name}</b>
              {money && <span className={st.kar >= 0 ? "ui-amount" : "ui-amount borc"}>{formatTL(Math.abs(st.kar))} {st.kar < 0 ? "zarar" : "kâr"}</span>}
            </span>
            <span className="ui-note" style={{ margin: 0 }}>
              {[p.custom?.urun, st.donum ? `${st.donum} dekar` : "", money ? `masraf ${formatTL(st.m)}` : "", money ? `gelir ${formatTL(st.g)}` : ""].filter(Boolean).join(" · ")}
            </span>
            {last && <span className="ui-note" style={{ margin: 0 }}>Son iş: {String(last.data.type)} · {dayText(last.occurred_on)}</span>}
            {(() => { const f = fidanOf(p.id); return f ? <span style={{ fontWeight: 800, color: "var(--ana-yazi)" }}>{f.alive.toLocaleString("tr-TR")} fidan · fidan başı {formatTL(Math.round(f.per * 100) / 100)}</span> : null; })()}
          </button>
        );
      })}
      <MainButton onClick={() => { setDone(null); setView({ v: "yeni" }); }}>+ Tarla ekle</MainButton>
    </main>
  );
}

function TarlaForm({ edit, onSave, onCancel }: { edit?: Place; onSave: (name: string, custom: Record<string, string>) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(edit?.name ?? "");
  const [donum, setDonum] = useState(edit?.custom?.donum ?? "");
  const [urun, setUrun] = useState(edit?.custom?.urun ?? "");
  const [note, setNote] = useState(edit?.custom?.not ?? "");
  const isler = useCList("isler");
  const [is, setIs] = useState(edit?.custom?.is ?? "");
  const [koy, setKoy] = useState(edit?.custom?.koy ?? "");
  const [spot, setSpot] = useState<Spot | null>(edit?.custom?.lat ? { name: edit.custom.koy ?? "", lat: Number(edit.custom.lat), lon: Number(edit.custom.lon), area: "" } : null);
  const [found, setFound] = useState<Spot[] | null>(null);
  const [geoErr, setGeoErr] = useState("");
  const [tapu, setTapu] = useState<Parsel | null>(null);
  const tapuGeldi = (t: Parsel) => {
    setTapu(t);
    setDonum(t.dekar ? String(t.dekar).replace(".", ",") : "");
    if (!name.trim()) setName(`${t.mahalle} ${t.ada}/${t.parsel}`);
    if (t.lat) { const k = `${t.mahalle}, ${t.ilce}`; setKoy(k); setSpot({ name: t.mahalle, lat: t.lat, lon: t.lon, area: t.ilce }); setFound(null); }
  };
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      {!tapu && edit?.custom?.ada && <span className="ui-note" style={{ margin: 0 }}>Kayıtlı: {[edit.custom.mahalle, edit.custom.ilce].filter(Boolean).join(", ")} · Ada {edit.custom.ada} / Parsel {edit.custom.parsel}</span>}
      <TapuBolum onFound={tapuGeldi} />
      <PageHeader sub="Tarla" title={edit ? "Tarlayı düzenle" : "Yeni tarla"} />
      <TextField id="t_ad" label="Tarlanın adı" placeholder="Örnek: Kınık yolu, Dere kenarı" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="t_donum" label="Kaç dekar? (isteğe bağlı)" inputMode="decimal" placeholder="Örnek: 12" maxLength={8} value={donum} onChange={(e) => setDonum(e.target.value)} />
      <TextField id="t_urun" label="Ürün (isteğe bağlı)" placeholder="Örnek: Zeytin, Pamuk, Domates" maxLength={40} value={urun} onChange={(e) => setUrun(e.target.value)} />
      {isler.length > 1 && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">Bu tarlada hangi iş?</span>
          <div className="ui-chips wrap">
            <Chip selected={!is} onClick={() => setIs("")}>Belli değil</Chip>
            {isler.map((b) => <Chip key={b} selected={is === b} onClick={() => setIs(b)}>{b}</Chip>)}
          </div>
          <span className="ui-note" style={{ margin: 0 }}>Bu tarlanın masrafları o işe sayılır.</span>
        </div>
      )}
      <div className="ui-stack" style={{ gap: 8 }}>
        <div className="ui-quickadd">
          <TextField id="t_koy" label="Köy / ilçe (hava durumu için, isteğe bağlı)" placeholder="Örnek: Yeniköy, Bergama" maxLength={60} value={koy}
            onChange={(e) => { setKoy(e.target.value); setSpot(null); setFound(null); }} />
          <button type="button" disabled={koy.trim().length < 2} onClick={async () => {
            setGeoErr(""); setFound(null);
            try { const r = await searchPlace(koy.split(",")[0]); setFound(r); if (!r.length) setGeoErr("Bulamadım. Sadece köyün ya da ilçenin adını yaz."); }
            catch { setGeoErr("Arayamadım, internet lazım."); }
          }}>Bul</button>
        </div>
        {spot && <span className="ui-note" style={{ margin: 0 }}>✓ Hava durumu bu yere göre: <b>{spot.name}{spot.area ? `, ${spot.area}` : ""}</b></span>}
        {found && found.length > 0 && !spot && (
          <div className="ui-chips wrap">{found.map((f, i) => <Chip key={i} onClick={() => { setSpot(f); setKoy(`${f.name}${f.area ? `, ${f.area}` : ""}`); setFound(null); }}>{f.name}{f.area ? ` (${f.area})` : ""}</Chip>)}</div>
        )}
        {geoErr && <span className="ui-note" style={{ margin: 0 }}>{geoErr}</span>}
      </div>
      <TextField id="t_not" label="Not (isteğe bağlı)" placeholder="Örnek: Ada 105 parsel 3" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      <MainButton disabled={!name.trim()} onClick={() => onSave(name.trim(), {
        ...(edit?.custom ?? {}), donum: donum ? String(num(donum)) : "", urun: urun.trim(), not: note.trim(), is, koy: koy.trim(), lat: spot ? String(spot.lat) : "", lon: spot ? String(spot.lon) : "",
        ...(tapu ? { il: tapu.il, ilce: tapu.ilce, mahalle: tapu.mahalle, ada: tapu.ada, parsel: tapu.parsel, tapu_m2: String(tapu.m2), nitelik: tapu.nitelik } : {}) })}>Kaydet</MainButton>
    </main>
  );
}

function TapuBolum({ onFound }: { onFound: (p: Parsel) => void }) {
  const [acik, setAcik] = useState(false);
  const [iller, setIller] = useState<Yer[]>([]);
  const [ilceler, setIlceler] = useState<Yer[]>([]);
  const [mahalleler, setMahalleler] = useState<Yer[]>([]);
  const [il, setIl] = useState(0); const [ilce, setIlce] = useState(0); const [mah, setMah] = useState(0);
  const [ada, setAda] = useState(""); const [parsel, setParsel] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [bulunan, setBulunan] = useState<Parsel | null>(null);
  const yukle = async (f: () => Promise<Yer[]>, set: (l: Yer[]) => void) => {
    setMsg(""); try { set(await f()); } catch { setMsg("Tapuya ulaşamadım, internet lazım. Bilgileri elle de yazabilirsin."); }
  };
  useEffect(() => { if (acik && !iller.length) yukle(ilListe, setIller); }, [acik]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!acik) return <button type="button" className="ui-link" onClick={() => setAcik(true)}>📄 Parsel sorgula (isteğe bağlı)</button>;
  const sec = (id: string, label: string, list: Yer[], value: number, on: (v: number) => void) => (
    <label className="ui-stack" style={{ gap: 4 }}>
      <span className="ui-label">{label}</span>
      <select id={id} className="ui-select" value={value || ""} disabled={!list.length} onChange={(e) => on(Number(e.target.value))}>
        <option value="">Seç</option>
        {list.map((y) => <option key={y.id} value={y.id}>{y.ad}</option>)}
      </select>
    </label>
  );
  return (
    <Card>
      <div className="ui-stack" style={{ gap: 10 }}>
        <span className="ui-label">Parsel sorgula</span>
        {sec("tp_il", "İl", iller, il, (v) => { setIl(v); setIlce(0); setMah(0); setIlceler([]); setMahalleler([]); if (v) yukle(() => ilceListe(v), setIlceler); })}
        {sec("tp_ilce", "İlçe", ilceler, ilce, (v) => { setIlce(v); setMah(0); setMahalleler([]); if (v) yukle(() => mahalleListe(v), setMahalleler); })}
        {sec("tp_mah", "Mahalle / köy", mahalleler, mah, setMah)}
        <TextField id="tp_ada" label="Ada no" inputMode="numeric" maxLength={8} value={ada} onChange={(e) => setAda(e.target.value)} />
        <TextField id="tp_parsel" label="Parsel no" inputMode="numeric" maxLength={8} value={parsel} onChange={(e) => setParsel(e.target.value)} />
        <MainButton disabled={!mah || !ada.trim() || !parsel.trim() || busy} onClick={async () => {
          setBusy(true); setMsg(""); setBulunan(null);
          try { const p = await parselBul(mah, ada, parsel); if (!p) setMsg("Bu ada/parseli bulamadım. Numaraları kontrol et."); else { setBulunan(p); onFound(p); } }
          catch { setMsg("Tapuya ulaşamadım, internet lazım. Bilgileri elle de yazabilirsin."); }
          finally { setBusy(false); }
        }}>{busy ? "Arıyorum…" : "Parseli bul"}</MainButton>
        {bulunan && <span className="ui-note" style={{ margin: 0 }}>✓ {bulunan.mahalle}, {bulunan.ilce} · Ada {bulunan.ada} / Parsel {bulunan.parsel} · {bulunan.m2.toLocaleString("tr-TR")} m² = <b>{bulunan.dekar.toLocaleString("tr-TR")} dekar</b>{bulunan.nitelik ? ` · ${bulunan.nitelik}` : ""}</span>}
        {msg && <span className="ui-note" style={{ margin: 0 }}>{msg}</span>}
      </div>
    </Card>
  );
}

function IslemForm({ place, items, history, initialType, edit, onSave, onCancel, onDelete }: {
  place: Place; items: Item[]; history: EventRow[]; initialType?: string; edit?: EventRow; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (type: string, day: string, data: Record<string, unknown>, use: { id: string; amount: number } | null, fee?: number) => Promise<void>;
}) {
  const operations = useCList("operations");
  const go = useGo();
  const { money } = useRole();
  const [type, setType] = useState<string | null>(initialType ?? null);
  const ed = edit?.data ?? {};
  const [day, setDay] = useState(edit?.occurred_on ?? todayStr());
  const [product, setProduct] = useState(String(ed.product ?? ""));
  const [itemId, setItemId] = useState<string | null>(null);
  const [dose, setDose] = useState(String(ed.dose ?? ""));
  const [wait, setWait] = useState(ed.wait_days ? String(ed.wait_days) : "");
  const [used, setUsed] = useState("");
  const [note, setNote] = useState(String(ed.note ?? ""));
  // Sulama
  const isSu = type === "Sulama";
  const [method, setMethod] = useState(String(ed.method ?? ""));
  const [tStart, setTStart] = useState(String(ed.t_start ?? ""));
  const [tEnd, setTEnd] = useState(String(ed.t_end ?? ""));
  const [hours, setHours] = useState(ed.hours ? String(ed.hours) : "");
  const [m1, setM1] = useState(ed.meter_start != null ? String(ed.meter_start) : "");
  const [m2, setM2] = useState(ed.meter_end != null ? String(ed.meter_end) : "");
  const lastSu = history.filter((e) => e.data.type === "Sulama" && e.place_id === place.id).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on))[0];
  const [waterFee, setWaterFee] = useState("");   // tutar tarla işine yazılmaz (çalışan görmesin); masraf olarak kaydedilir
  const [feeToExpense, setFeeToExpense] = useState(!edit);
  const calcHours = (() => { if (!tStart || !tEnd) return 0; const [a1, a2] = tStart.split(":").map(Number), [b1, b2] = tEnd.split(":").map(Number); let d = b1 * 60 + b2 - (a1 * 60 + a2); if (d < 0) d += 24 * 60; return Math.round((d / 60) * 10) / 10; })();
  const kwh = m1 && m2 && num(m2) >= num(m1) ? Math.round((num(m2) - num(m1)) * 10) / 10 : 0;
  const [error, setError] = useState("");
  const needsProduct = type === "İlaçlama" || type === "Gübreleme";
  const stock = items.filter((i) => (type === "İlaçlama" ? i.category === "İlaç" : type === "Gübreleme" ? i.category === "Gübre" : false));
  const item = items.find((i) => i.id === itemId);
  // İlaç hafızası: bu ürünün en son kullanımı (doz, bekleme) + depodaki ilaç kartı (etiket bilgileri)
  const lastUse = (name: string) => history.filter((e) => String(e.data.product ?? "").toLocaleLowerCase("tr") === name.toLocaleLowerCase("tr"))
    .sort((a, b) => b.occurred_on.localeCompare(a.occurred_on))[0];
  const card = (item?.data ?? items.find((i) => i.name.toLocaleLowerCase("tr") === product.trim().toLocaleLowerCase("tr"))?.data ?? {}) as Record<string, string | number | null>;
  const last = product.trim() ? lastUse(product.trim()) : undefined;
  const pick = (name: string, it?: Item) => {
    setProduct(name);
    const c = (it?.data ?? {}) as Record<string, string | number | null>;
    const l = lastUse(name);
    setDose(String(l?.data.dose ?? c.label_dose ?? ""));
    const w = l?.data.wait_days ?? c.wait_days;
    setWait(w ? String(w) : "");
  };
  const usedBefore = [...new Set(history.filter((e) => e.data.type === type && e.data.product).map((e) => String(e.data.product)))].filter((n) => !stock.some((i) => i.name === n));

  if (!type) {
    return (
      <main className="ui-stack">
        <BackButton onClick={onCancel} label="Vazgeç" />
        <PageHeader sub={place.name} title="Ne yapıldı?" />
        <div className="ui-tiles">{operations.map((o) => <button key={o} type="button" onClick={() => setType(o)}><b>{o}</b></button>)}
          <button type="button" className="add" onClick={() => go("listeler", { liste: "operations", geri: "tarlalar" })}><b>İşleri düzenle</b></button></div>
      </main>
    );
  }
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={() => (initialType ? onCancel() : setType(null))} />
      <PageHeader sub={edit ? `${place.name} · işlemi düzenle` : place.name} title={type} />
      <TextField id="i_gun" label="Tarih" type="date" max={todayStr()} value={day} onChange={(e) => setDay(e.target.value)} />
      {needsProduct && (
        <>
          {stock.length > 0 && (
            <div className="ui-stack" style={{ gap: 8 }}>
              <span className="ui-label">Depodan seç</span>
              <div className="ui-chips wrap">
                {stock.map((i) => <Chip key={i.id} selected={itemId === i.id} onClick={() => { setItemId(itemId === i.id ? null : i.id); pick(i.name, i); }}>{i.name} · {i.quantity.toLocaleString("tr-TR")} {i.unit}</Chip>)}
                {usedBefore.map((n) => <Chip key={n} selected={product === n && !itemId} onClick={() => { setItemId(null); pick(n); }}>{n} (önceden)</Chip>)}
              </div>
            </div>
          )}
          <TextField id="i_urun" label={type === "İlaçlama" ? "Hangi ilaç?" : "Hangi gübre?"} placeholder={type === "İlaçlama" ? "Örnek: Decis" : "Örnek: 20-20-0"} maxLength={60}
            value={product} onChange={(e) => { setProduct(e.target.value); setItemId(null); }}
            onBlur={() => { if (product.trim() && !dose && !wait) { const l = lastUse(product.trim()); if (l) pick(product.trim()); } }} />
          {(card.label_dose || card.target || card.method || card.wait_days || last) && (
            <div className="ui-card ui-stack ilac-kart" style={{ gap: 4 }}>
              <b>{product} · ilaç kartı</b>
              {card.label_dose ? <span>Etiketteki doz: <b>{String(card.label_dose)}</b></span> : null}
              {card.wait_days ? <span>Hasat öncesi bekleme: <b>{String(card.wait_days)} gün</b></span> : null}
              {card.target ? <span>Neye karşı: {String(card.target)}</span> : null}
              {card.method ? <span>Uygulama: {String(card.method)}</span> : null}
              {last && <span className="ui-note" style={{ margin: 0 }}>En son {dayYear(last.occurred_on)} kullanıldı{last.data.dose ? `, doz ${String(last.data.dose)}` : ""}{last.data.wait_days ? `, bekleme ${String(last.data.wait_days)} gün` : ""}.</span>}
              <span className="ui-note" style={{ margin: 0 }}>Bu bilgiler senin girdiklerin; emin değilsen ilacın etiketine bak.</span>
            </div>
          )}
          <TextField id="i_doz" label="Doz (isteğe bağlı)" placeholder="Örnek: 50 ml / 100 litre suya" maxLength={60} value={dose} onChange={(e) => setDose(e.target.value)} />
          {type === "İlaçlama" && (
            <TextField id="i_bekleme" label="Hasat öncesi bekleme süresi (gün, ilacın etiketinde yazar)" inputMode="numeric" placeholder="Örnek: 14" maxLength={3}
              value={wait} onChange={(e) => setWait(e.target.value.replace(/\D/g, ""))} />
          )}
          {item && !edit && (
            <TextField id="i_kullanilan" label={`Depodan ne kadar kullanıldı? (${item.unit}, depodan düşer)`} inputMode="decimal" placeholder="Örnek: 2" maxLength={10}
              value={used} onChange={(e) => setUsed(e.target.value)} />
          )}
        </>
      )}
      {isSu && (
        <>
          <div className="ui-stack" style={{ gap: 8 }}>
            <span className="ui-label">Nasıl sulandı?</span>
            <div className="ui-chips wrap">{["Damla", "Salma", "Yağmurlama", "Diğer"].map((x) => <Chip key={x} selected={method === x} onClick={() => setMethod(method === x ? "" : x)}>{x}</Chip>)}</div>
          </div>
          <div className="ui-quickadd">
            <TextField id="su_bas" label="Başladı (saat)" type="time" value={tStart} onChange={(e) => setTStart(e.target.value)} />
            <TextField id="su_bit" label="Bitti (saat)" type="time" value={tEnd} onChange={(e) => setTEnd(e.target.value)} />
          </div>
          {calcHours > 0 ? <span className="ui-note" style={{ margin: 0 }}>Süre: <b>{calcHours.toLocaleString("tr-TR")} saat</b></span>
            : <TextField id="su_saat" label="Ya da kaç saat sürdü?" inputMode="decimal" placeholder="Örnek: 6" maxLength={5} value={hours} onChange={(e) => setHours(e.target.value)} />}
          <div className="ui-quickadd">
            <TextField id="su_s1" label="Sayaç başta (isteğe bağlı)" inputMode="decimal" placeholder={lastSu?.data.meter_end != null ? `Son: ${String(lastSu.data.meter_end)}` : "Örnek: 12450"} maxLength={10} value={m1} onChange={(e) => setM1(e.target.value)} />
            <TextField id="su_s2" label="Sayaç sonda" inputMode="decimal" maxLength={10} value={m2} onChange={(e) => setM2(e.target.value)} />
          </div>
          {!m1 && lastSu?.data.meter_end != null && <Chip onClick={() => setM1(String(lastSu.data.meter_end))}>Geçen seferki son değer: {String(lastSu.data.meter_end)}</Chip>}
          {kwh > 0 && <span className="ui-note" style={{ margin: 0 }}>Harcanan elektrik: <b>{kwh.toLocaleString("tr-TR")} kWh</b></span>}
          {money && !edit && (
            <>
              <TextField id="su_ucret" label="Su ücreti ödendiyse (TL, kooperatif / DSİ)" inputMode="decimal" placeholder="Örnek: 600" maxLength={10} value={waterFee} onChange={(e) => setWaterFee(e.target.value)} />
              {!edit && num(waterFee) > 0 && <label className="ui-check"><input type="checkbox" checked={feeToExpense} onChange={(e) => setFeeToExpense(e.target.checked)} /> Masraflara ekle (Sulama / elektrik)</label>}
            </>
          )}
        </>
      )}
      <TextField id="i_not" label="Not (isteğe bağlı)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom">
        <MainButton onClick={async () => {
          const u = used ? num(used) : 0;
          if (used && !(u > 0)) { setError("Kullanılan miktarı doğru yaz."); return; }
          if (isSu && m1 && m2 && num(m2) < num(m1)) { setError("Sayacın son değeri baştakinden küçük olamaz."); return; }
          await onSave(type, day, {
            ...(product.trim() ? { product: product.trim() } : {}), ...(dose.trim() ? { dose: dose.trim() } : {}),
            ...(wait ? { wait_days: Number(wait) } : {}), ...(note.trim() ? { note: note.trim() } : {}),
            ...(item && u ? { item_id: item.id, used: u, unit: item.unit } : {}),
            ...(isSu ? {
              ...(method ? { method } : {}), ...(tStart ? { t_start: tStart } : {}), ...(tEnd ? { t_end: tEnd } : {}),
              ...((calcHours || num(hours)) > 0 ? { hours: calcHours || num(hours) } : {}),
              ...(m1 ? { meter_start: num(m1) } : {}), ...(m2 ? { meter_end: num(m2) } : {}), ...(kwh ? { kwh } : {}),
            } : {}),
          }, item && u ? { id: item.id, amount: u } : null, isSu && !edit && feeToExpense && num(waterFee) > 0 ? num(waterFee) : 0);
        }}>Kaydet</MainButton>
      </div>
      {onDelete && <button type="button" className="ui-link" style={{ color: "var(--tehlike)" }} onClick={onDelete}>Bu işlemi sil</button>}
    </main>
  );
}

function VerimForm({ place, seasons, current, onSave, onCancel }: { place: Place; seasons: Season[]; current: Season; onSave: (y: string, crop: string, amount: number, unit: string) => Promise<void>; onCancel: () => void }) {
  const units = useCList("units");
  const [yy, setYy] = useState(current.name);
  const [crop, setCrop] = useState(place.custom?.urun ?? "");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("kg");
  const [error, setError] = useState("");
  const ys = seasons.map((x) => x.name);
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={place.name} title="Verim" />
      <div className="ui-chips">{ys.map((x) => <Chip key={x} selected={x === yy} onClick={() => setYy(x)}>{x}</Chip>)}</div>
      <TextField id="v_urun" label="Ürün" placeholder="Örnek: Zeytin" maxLength={40} value={crop} onChange={(e) => setCrop(e.target.value)} />
      <TextField id="v_miktar" label="Ne kadar alındı?" inputMode="decimal" placeholder="Örnek: 4500" maxLength={12} value={amount} onChange={(e) => setAmount(e.target.value)} style={{ fontSize: "1.6rem", fontWeight: 800 }} />
      <div className="ui-chips">{units.map((u) => <Chip key={u} selected={u === unit} onClick={() => setUnit(u)}>{u}</Chip>)}</div>
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={async () => { const n = num(amount); if (!(n > 0)) { setError("Miktarı yaz."); return; } await onSave(yy, crop.trim(), n, unit); }}>Kaydet</MainButton>
    </main>
  );
}
