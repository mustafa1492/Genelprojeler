"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { addEvent, deleteEvent, listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, type Expense } from "@/core/expenses/api";
import { listItems, updateItem, type Item } from "@/core/inventory/api";
import { formatTL } from "@/core/ledger/api";
import { mutate } from "@/core/offline/store";
import { addPlace, listPlaces, type Place } from "@/core/places/api";
import { BackButton, BottomNav, Card, Chip, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, TextField } from "@/core/ui";
import { config } from "../config";
import { dayText, dayYear, GELIR, harvestFrom, ISLEM, num, thisYear, todayStr, VERIM, year } from "../kayit";
import { HistoryLink, navItems } from "../nav";

type View = { v: "list" } | { v: "yeni"; edit?: Place } | { v: "tarla"; id: string } | { v: "islem"; id: string; type?: string } | { v: "verim"; id: string };
type Done = { message: string; undo?: () => Promise<void> } | null;

export default function Tarlalar() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Done>(null);
  const [y, setY] = useState(thisYear());

  const load = useCallback(() => {
    Promise.all([listPlaces(biz.id), listEvents(biz.id, ISLEM), listEvents(biz.id, VERIM), listEvents(biz.id, GELIR), listExpenses(biz.id), listItems(biz.id)])
      .then(([p, a, b, c, x, i]) => { setPlaces(p.sort((m, n) => m.name.localeCompare(n.name, "tr"))); setEvents([...a, ...b, ...c]); setExpenses(x); setItems(i); });
  }, [biz.id]);
  useEffect(load, [load]);
  useEffect(() => { try { const q = new URLSearchParams(location.search); const t = q.get("tarla"); if (t) setView({ v: q.get("islem") ? "islem" : "tarla", id: t }); } catch { /* yok */ } }, []);

  const find = (id: string) => (places ?? []).find((p) => p.id === id);
  const statsOf = (p: Place, yy: string) => {
    const m = expenses.filter((e) => e.place_id === p.id && year(e.occurred_on) === yy).reduce((t, e) => t + e.amount, 0);
    const g = events.filter((e) => e.kind === GELIR && e.place_id === p.id && year(e.occurred_on) === yy).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
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
    if (p) return <IslemForm place={p} items={items} initialType={view.type} onCancel={() => setView({ v: "tarla", id: p.id })}
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
    if (p) return <VerimForm place={p} onCancel={() => setView({ v: "tarla", id: p.id })}
      onSave={async (yy, crop, amount, unit) => {
        const ev = await addEvent(biz.id, { kind: VERIM, occurred_on: todayStr(), place_id: p.id, person_id: null, quantity: amount, data: { year: yy, crop, unit } });
        setDone({ message: `Kaydettim: ${p.name} ${yy} verimi ${amount.toLocaleString("tr-TR")} ${unit}.`, undo: () => deleteEvent(ev.id) });
        setView({ v: "tarla", id: p.id }); load();
      }} />;
  }

  if (view.v === "tarla") {
    const p = find(view.id);
    if (p) {
      const st = statsOf(p, y);
      const ops = events.filter((e) => e.kind === ISLEM && e.place_id === p.id).sort((a, b) => (b.occurred_on + (b.created_at ?? "")).localeCompare(a.occurred_on + (a.created_at ?? "")));
      const yields = events.filter((e) => e.kind === VERIM && e.place_id === p.id).sort((a, b) => String(b.data.year).localeCompare(String(a.data.year)));
      const wait = ops.map((e) => ({ e, h: harvestFrom(e) })).filter((x) => x.h && x.h > todayStr()).sort((a, b) => b.h!.localeCompare(a.h!))[0];
      const pExp = expenses.filter((e) => e.place_id === p.id && year(e.occurred_on) === y);
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
          <div className="ui-tiles">
            <button type="button" onClick={() => { setDone(null); setView({ v: "islem", id: p.id }); }}><b>+ İşlem</b><small>ilaç, gübre, sulama…</small></button>
            <button type="button" onClick={() => { setDone(null); setView({ v: "islem", id: p.id, type: "İlaçlama" }); }}><b>+ İlaçlama</b><small>ilaç, doz, bekleme</small></button>
            <button type="button" onClick={() => { setDone(null); setView({ v: "verim", id: p.id }); }}><b>+ Verim</b><small>bu yıl kaç kg</small></button>
            <a href={`/ciftci/masraf?yeni=1`}><b>+ Masraf</b><small>bu tarla için</small></a>
          </div>

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

          <h2 className="ui-section">{y} masrafları</h2>
          {pExp.length === 0 ? <div className="ui-empty">Bu tarlaya bu yıl masraf girilmedi.</div>
            : <Card><InfoRows rows={pExp.map((e) => [`${dayText(e.occurred_on)} · ${e.category}`, formatTL(e.amount)] as [string, string])} /></Card>}
          <MainButton secondary onClick={() => setView({ v: "yeni", edit: p })}>Tarla bilgilerini değiştir</MainButton>
        </main>
      );
    }
  }

  // --- Liste
  const years = [...new Set([thisYear(), ...expenses.map((e) => year(e.occurred_on)), ...events.map((e) => year(e.occurred_on))])].sort().reverse();
  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={`${(places ?? []).length} tarla`} title="Tarlalar" right={<HistoryLink />} />
      {doneCard}
      {years.length > 1 && <div className="ui-chips">{years.map((x) => <Chip key={x} selected={x === y} onClick={() => setY(x)}>{x}</Chip>)}</div>}
      {places?.length === 0 && <div className="ui-empty">Henüz tarla yok. İlk tarlanı ekle.</div>}
      {(places ?? []).map((p) => {
        const st = statsOf(p, y);
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
          </button>
        );
      })}
      <MainButton onClick={() => { setDone(null); setView({ v: "yeni" }); }}>+ Tarla ekle</MainButton>
      <BottomNav items={navItems} current="/ciftci/tarlalar" />
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

function IslemForm({ place, items, initialType, onSave, onCancel }: {
  place: Place; items: Item[]; initialType?: string; onCancel: () => void;
  onSave: (type: string, day: string, data: Record<string, unknown>, use: { id: string; amount: number } | null) => Promise<void>;
}) {
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

  if (!type) {
    return (
      <main className="ui-stack">
        <BackButton onClick={onCancel} label="Vazgeç" />
        <PageHeader sub={place.name} title="Ne yapıldı?" />
        <div className="ui-tiles">{config.operations.map((o) => <button key={o} type="button" onClick={() => setType(o)}><b>{o}</b></button>)}</div>
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
                {stock.map((i) => <Chip key={i.id} selected={itemId === i.id} onClick={() => { setItemId(itemId === i.id ? null : i.id); setProduct(i.name); }}>{i.name} · {i.quantity.toLocaleString("tr-TR")} {i.unit}</Chip>)}
              </div>
            </div>
          )}
          <TextField id="i_urun" label={type === "İlaçlama" ? "Hangi ilaç?" : "Hangi gübre?"} placeholder={type === "İlaçlama" ? "Örnek: Decis" : "Örnek: 20-20-0"} maxLength={60}
            value={product} onChange={(e) => { setProduct(e.target.value); setItemId(null); }} />
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

function VerimForm({ place, onSave, onCancel }: { place: Place; onSave: (y: string, crop: string, amount: number, unit: string) => Promise<void>; onCancel: () => void }) {
  const [yy, setYy] = useState(thisYear());
  const [crop, setCrop] = useState(place.custom?.urun ?? "");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("kg");
  const [error, setError] = useState("");
  const ys = [0, 1, 2, 3].map((i) => String(Number(thisYear()) - i));
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={place.name} title="Verim" />
      <div className="ui-chips">{ys.map((x) => <Chip key={x} selected={x === yy} onClick={() => setYy(x)}>{x}</Chip>)}</div>
      <TextField id="v_urun" label="Ürün" placeholder="Örnek: Zeytin" maxLength={40} value={crop} onChange={(e) => setCrop(e.target.value)} />
      <TextField id="v_miktar" label="Ne kadar alındı?" inputMode="decimal" placeholder="Örnek: 4500" maxLength={12} value={amount} onChange={(e) => setAmount(e.target.value)} style={{ fontSize: "1.6rem", fontWeight: 800 }} />
      <div className="ui-chips">{config.units.map((u) => <Chip key={u} selected={u === unit} onClick={() => setUnit(u)}>{u}</Chip>)}</div>
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={async () => { const n = num(amount); if (!(n > 0)) { setError("Miktarı yaz."); return; } await onSave(yy, crop.trim(), n, unit); }}>Kaydet</MainButton>
    </main>
  );
}
