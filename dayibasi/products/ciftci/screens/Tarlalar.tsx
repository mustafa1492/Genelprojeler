"use client";
import { useCList } from "../lists";
import { listLots, type Lot } from "@/core/lots/api";
import { AKTARIM, FIDAN_SATIS, hasFidan, lotStats, SAYIM } from "../fidan";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { addEvent, deleteEvent, listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, type Expense } from "@/core/expenses/api";
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

type View = { v: "list" } | { v: "yeni"; edit?: Place } | { v: "tarla"; id: string } | { v: "islem"; id: string; type?: string } | { v: "verim"; id: string };
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
  useEffect(() => { if (tp.p.tarla) setView({ v: "tarla", id: String(tp.p.tarla) }); }, [tp.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const find = (id: string) => (places ?? []).find((p) => p.id === id);
  // Fidan modülü: tarladaki aktif partilerin canlı fidan sayısı ve maliyeti
  const fidanOf = (pid: string) => {
    if (!fidan) return null;
    const counts = events.filter((e) => e.kind === SAYIM), sales = events.filter((e) => e.kind === GELIR && e.data.type === FIDAN_SATIS), moves = events.filter((e) => e.kind === AKTARIM);
    const S = lots.filter((l) => l.place_id === pid && l.status === "aktif").map((l) => lotStats(l, lots, counts, sales, expenses, moves));
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
    if (p) return <IslemForm place={p} items={items} history={events.filter((e) => e.kind === ISLEM)} initialType={view.type} onCancel={() => setView({ v: "tarla", id: p.id })}
      onSave={async (type, day, data, use) => {
        const ev = await addEvent(biz.id, { kind: ISLEM, occurred_on: day, place_id: p.id, person_id: null, quantity: null, data: { type, ...data } });
        let undoStock: (() => Promise<void>) | null = null;
        if (use) {
          const it = items.find((i) => i.id === use.id)!;
          await updateItem(it.id, { quantity: it.quantity - use.amount });
          undoStock = () => updateItem(it.id, { quantity: it.quantity });
        }
        setDone({ message: `Kaydettim: ${p.name}, ${type}${data.product ? ` (${data.product})` : ""}.${use ? ` Depodan ${use.amount} ${items.find((i) => i.id === use.id)?.unit} düştüm.` : ""}`,
          undo: async () => { await deleteEvent(ev.id); if (undoStock) await undoStock(); } });
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
          <PageHeader sub={[p.custom?.urun, st.donum ? `${st.donum} dönüm` : ""].filter(Boolean).join(" · ") || "Tarla"} title={p.name} />
          {doneCard}
          {wait && <div className="ui-warn yakin"><div className="ui-warn-row"><span>Hasat en erken <b>{dayYear(wait.h!)}</b> ({String(wait.e.data.product ?? "ilaç")}, {dayText(wait.e.occurred_on)} ilaçlaması).</span></div></div>}
          <div className="ui-split">
            <div><span>{y} masraf</span><b>{formatTL(st.m)}</b>{st.donum ? <small>dönüm başı {formatTL(Math.round(st.perDonum))}</small> : <small>&nbsp;</small>}</div>
            <div className="mine"><span>{y} kâr</span><b>{formatTL(st.kar)}</b><small>gelir {formatTL(st.g)}</small></div>
          </div>
          {be ? (
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
            <TabLink to="masraf" params={{ yeni: 1, tarla: p.id }}><b>+ Masraf</b><small>bu tarla için</small></TabLink>
          </div>

          {(() => { const f = fidanOf(p.id); if (!f) return null; return (
            <div className="ui-card ui-stack" style={{ gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>Bu tarladaki fidanlar</b><span className="ui-amount">{f.alive.toLocaleString("tr-TR")}</span></div>
              <span className="ui-note" style={{ margin: 0 }}>Toplam maliyet {formatTL(Math.round(f.cost))} · fidan başı {formatTL(Math.round(f.per * 100) / 100)}</span>
              {f.S.map((x) => <div key={x.lot.id} className="ui-moneyrow"><b>{String(x.lot.data.batch_name ?? x.lot.name)}<small>{x.lot.planted_on ? dayYear(x.lot.planted_on) : ""} · fidan başı {formatTL(Math.round(x.perPlant * 100) / 100)}</small></b><strong>{x.alive.toLocaleString("tr-TR")}</strong></div>)}
              <button type="button" className="ui-link" onClick={() => go("fidan")}>Fidan sekmesinde aç ›</button>
            </div>); })()}
          <h2 className="ui-section">Tarla günlüğü</h2>
          {ops.length === 0 && <div className="ui-empty">Henüz işlem yok.</div>}
          {ops.map((e) => (
            <div key={e.id} className="ui-moneyrow">
              <b style={{ minWidth: 0 }}>{String(e.data.type)}{e.data.product ? ` · ${String(e.data.product)}` : ""}
                <small>{[dayYear(e.occurred_on), e.data.dose ? `doz ${String(e.data.dose)}` : "", harvestFrom(e) ? `hasat ≥ ${dayText(harvestFrom(e)!)}` : "", e.data.note ? String(e.data.note) : "", nameOf(e.created_by)].filter(Boolean).join(" · ")}</small></b>
              <button type="button" className="ui-link inline" style={{ color: "var(--tehlike)" }} onClick={async () => {
                await deleteEvent(e.id); setDone({ message: `Sildim: ${String(e.data.type)}.`, undo: () => mutate({ kind: "insert", table: "events", values: e }) }); load();
              }}>Sil</button>
            </div>
          ))}

          <h2 className="ui-section">Verim</h2>
          {yields.length === 0 && <div className="ui-empty">Henüz verim girilmedi.</div>}
          {yields.length > 0 && <Card><InfoRows rows={yields.map((e) => [`${String(e.data.year)} · ${String(e.data.crop || p.custom?.urun || "")}`,
            `${Number(e.quantity).toLocaleString("tr-TR")} ${String(e.data.unit)}${st.donum ? ` · dönüm başı ${Math.round(Number(e.quantity) / st.donum).toLocaleString("tr-TR")}` : ""}`] as [string, string])} /></Card>}

          <h2 className="ui-section">{y} sezonu masrafları</h2>
          {pExp.length === 0 ? <div className="ui-empty">Bu tarlaya bu sezon masraf girilmedi.</div>
            : <Card><InfoRows rows={pExp.map((e) => [`${dayText(e.occurred_on)} · ${e.category}`, formatTL(e.amount)] as [string, string])} /></Card>}
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
              <span className={st.kar >= 0 ? "ui-amount" : "ui-amount borc"}>{formatTL(st.kar)}</span>
            </span>
            <span className="ui-note" style={{ margin: 0 }}>
              {[p.custom?.urun, st.donum ? `${st.donum} dönüm` : "", `masraf ${formatTL(st.m)}`, `gelir ${formatTL(st.g)}`].filter(Boolean).join(" · ")}
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
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Tarla" title={edit ? "Tarlayı düzenle" : "Yeni tarla"} />
      <TextField id="t_ad" label="Tarlanın adı" placeholder="Örnek: Kınık yolu, Dere kenarı" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="t_donum" label="Kaç dönüm? (isteğe bağlı)" inputMode="decimal" placeholder="Örnek: 12" maxLength={8} value={donum} onChange={(e) => setDonum(e.target.value)} />
      <TextField id="t_urun" label="Ürün (isteğe bağlı)" placeholder="Örnek: Zeytin, Pamuk, Domates" maxLength={40} value={urun} onChange={(e) => setUrun(e.target.value)} />
      <TextField id="t_not" label="Not (isteğe bağlı)" placeholder="Örnek: Ada 105 parsel 3" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      <MainButton disabled={!name.trim()} onClick={() => onSave(name.trim(), {
        ...(edit?.custom ?? {}), donum: donum ? String(num(donum)) : "", urun: urun.trim(), not: note.trim() })}>Kaydet</MainButton>
    </main>
  );
}

function IslemForm({ place, items, history, initialType, onSave, onCancel }: {
  place: Place; items: Item[]; history: EventRow[]; initialType?: string; onCancel: () => void;
  onSave: (type: string, day: string, data: Record<string, unknown>, use: { id: string; amount: number } | null) => Promise<void>;
}) {
  const operations = useCList("operations");
  const go = useGo();
  const [type, setType] = useState<string | null>(initialType ?? null);
  const [day, setDay] = useState(todayStr());
  const [product, setProduct] = useState("");
  const [itemId, setItemId] = useState<string | null>(null);
  const [dose, setDose] = useState("");
  const [wait, setWait] = useState("");
  const [used, setUsed] = useState("");
  const [note, setNote] = useState("");
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
      <PageHeader sub={place.name} title={type} />
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
          {item && (
            <TextField id="i_kullanilan" label={`Depodan ne kadar kullanıldı? (${item.unit}, depodan düşer)`} inputMode="decimal" placeholder="Örnek: 2" maxLength={10}
              value={used} onChange={(e) => setUsed(e.target.value)} />
          )}
        </>
      )}
      <TextField id="i_not" label="Not (isteğe bağlı)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom">
        <MainButton onClick={async () => {
          const u = used ? num(used) : 0;
          if (used && !(u > 0)) { setError("Kullanılan miktarı doğru yaz."); return; }
          await onSave(type, day, {
            ...(product.trim() ? { product: product.trim() } : {}), ...(dose.trim() ? { dose: dose.trim() } : {}),
            ...(wait ? { wait_days: Number(wait) } : {}), ...(note.trim() ? { note: note.trim() } : {}),
            ...(item && u ? { item_id: item.id, used: u, unit: item.unit } : {}),
          }, item && u ? { id: item.id, amount: u } : null);
        }}>Kaydet</MainButton>
      </div>
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
