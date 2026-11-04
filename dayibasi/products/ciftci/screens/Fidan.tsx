"use client";
import { useCList } from "../lists";
import { useCallback, useEffect, useState } from "react";
import { useBusiness, useSetBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { addEvent, deleteEvent, listEvents, updateEvent, type EventRow } from "@/core/events/api";
import { listExpenses, receiptUrl, uploadReceipt, type Expense } from "@/core/expenses/api";
import { downloadXlsx } from "@/core/export/xlsx";
import { formatTL } from "@/core/ledger/api";
import { addLot, deleteLot, listLots, restoreLot, updateLot, type Lot } from "@/core/lots/api";
import { mutate } from "@/core/offline/store";
import { listPlaces, type Place } from "@/core/places/api";
import { useGo, useOnActivate } from "@/core/shell/TabShell";
import { supabase } from "@/core/supabase/client";
import { BackButton, Card, Chip, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, StatusPill, TextField } from "@/core/ui";
import { AKTARIM, ageText, custKey, FIDAN_SATIS, FOTO, lotStats, marginOf, pricesOf, SAYIM, SIPARIS, sizesOf, suggestedPrice, type LotStats } from "../fidan";
import { addDays, dayText, dayYear, GELIR, incomeOpen, ISLEM, num, todayStr } from "../kayit";
import { HistoryLink } from "../nav";

type Done = { message: string; undo?: () => Promise<void> } | null;
type View = { v: "list" } | { v: "lot"; id: string } | { v: "lotForm"; edit?: Lot } | { v: "sayim"; id: string } | { v: "islem"; id: string }
  | { v: "siparis"; edit?: EventRow } | { v: "foto"; id: string } | { v: "fotoGor"; url: string; back: string } | { v: "hatirlat"; id: string } | { v: "boylar" } | { v: "kar" } | { v: "sevk"; order: EventRow } | { v: "dikim" } | { v: "tasi"; id: string } | { v: "stok" } | { v: "musteriler" } | { v: "musteri"; key: string } | { v: "fiyat" } | { v: "odeme"; key: string };
const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");

/** Fidan (şimşir) partileri: sayım, fire, boy, fidan başı maliyet, sipariş, bakım hatırlatıcısı, fotoğraf. */
export default function Fidan() {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const go = useGo();
  const { nameOf } = useMembers(biz.id);
  const [lots, setLots] = useState<Lot[] | null>(null);
  const [ev, setEv] = useState<EventRow[]>([]);
  const [exp, setExp] = useState<Expense[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Done>(null);
  const sizes = sizesOf(biz);
  const margin = marginOf(biz);

  const load = useCallback(() => {
    listLots(biz.id).then(setLots).catch(() => setLots([]));
    Promise.all([listEvents(biz.id, AKTARIM), listEvents(biz.id, SAYIM), listEvents(biz.id, SIPARIS), listEvents(biz.id, FOTO), listEvents(biz.id, GELIR), listEvents(biz.id, ISLEM)])
      .then((r) => setEv(r.flat())).catch(() => {});
    listExpenses(biz.id).then(setExp).catch(() => {});
    listPlaces(biz.id).then(setPlaces).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  const all = lots ?? [];
  const counts = ev.filter((e) => e.kind === SAYIM);
  const sales = ev.filter((e) => e.kind === GELIR && e.data.type === FIDAN_SATIS);
  const orders = ev.filter((e) => e.kind === SIPARIS);
  const moves = ev.filter((e) => e.kind === AKTARIM);
  const multi = useCList("isler").length > 1;
  const stats = (l: Lot) => lotStats(l, all, counts, sales, exp, moves, multi);
  const [group, setGroupState] = useState<"dikim" | "tarla">("dikim");
  const [showAlerts, setShowAlerts] = useState(false);
  const batchOf = (l: Lot) => String(l.data.batch ?? l.id);
  const place = (id: string | null) => places.find((p) => p.id === id)?.name ?? "";
  const find = (id: string) => all.find((l) => l.id === id);
  const back = () => { setDone(null); setView({ v: "list" }); };
  const doneCard = done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />;

  // Bakım hatırlatmaları: parti başına "her N günde bir" (kullanıcı belirler)
  const dueOf = (l: Lot) => {
    const rem = (l.data.reminders ?? {}) as Record<string, number>;
    return Object.entries(rem).filter(([, n]) => Number(n) > 0).map(([type, n]) => {
      const last = ev.filter((e) => e.kind === ISLEM && e.data.lot_id === l.id && e.data.type === type).map((e) => e.occurred_on).sort().pop() ?? (l.data.reminders_from as string) ?? todayStr();
      const next = addDays(last, Number(n));
      return { lot: l, type, next, late: next <= todayStr() };
    });
  };

  // Boy stoku: aktif partilerin son sayımı (satılan / taşınan düşülmüş) ve bekleyen siparişler
  const stock = () => {
    const S = all.filter((l) => l.status === "aktif").map(stats);
    const ready: Record<string, number> = {}, byLot: Record<string, { lot: Lot; n: number }[]> = {};
    for (const s of S) for (const [k, v] of Object.entries(s.bySize)) { ready[k] = (ready[k] ?? 0) + v; if (v > 0) (byLot[k] ??= []).push({ lot: s.lot, n: v }); }
    const reserved: Record<string, number> = {};
    for (const o of orders.filter((o) => o.data.status === "bekliyor")) { const k = String(o.data.size ?? ""); if (k) reserved[k] = (reserved[k] ?? 0) + Number(o.data.qty ?? 0); }
    const unsized = S.filter((s) => s.alive > 0 && !Object.keys(s.bySize).length);
    return { S, ready, reserved, byLot, unsized };
  };

  if (view.v === "stok") {
    const { ready, reserved, byLot, unsized } = stock();
    const keys = [...sizes.filter((k) => ready[k] != null || reserved[k]), ...Object.keys(ready).filter((k) => !sizes.includes(k))];
    return (
      <main className="ui-stack">
        <BackButton onClick={back} label="Fidan" />
        <PageHeader sub="Son sayımlardan; satılan ve taşınan düşüldü" title="Stok" />
        {keys.length === 0 && <div className="ui-empty">Boy boy sayım yok. Partiye “+ Sayım” girip boyları yazınca burada görünür.</div>}
        {keys.map((k) => {
          const have = ready[k] ?? 0, res = reserved[k] ?? 0, free = have - res;
          return (
            <div key={k} className="ui-card ui-stack" style={{ gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b style={{ fontSize: "1.1rem" }}>{k}</b><span className="ui-amount">{fmt(Math.max(0, free))} satılabilir</span></div>
              <span className="ui-note" style={{ margin: 0 }}>elde {fmt(have)} · siparişte {fmt(res)}{free < 0 ? ` · ${fmt(-free)} adet eksik` : ""}</span>
              {(byLot[k] ?? []).map(({ lot, n }) => (
                <button key={lot.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left" }} onClick={() => setView({ v: "lot", id: lot.id })}>
                  <b>{lot.name}<small>{place(lot.place_id) || (lot.data.potted ? "Saksıda" : "")}</small></b><strong>{fmt(n)}</strong></button>))}
            </div>
          );
        })}
        {unsized.length > 0 && (
          <div className="ui-card ui-stack" style={{ gap: 6 }}>
            <b>Boyu sayılmamış</b>
            <span className="ui-note" style={{ margin: 0 }}>Bu partilerde boy boy sayım yok; toplam adet gösteriliyor.</span>
            {unsized.map((s) => (
              <button key={s.lot.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left" }} onClick={() => setView({ v: "lot", id: s.lot.id })}>
                <b>{s.lot.name}</b><strong>{fmt(s.alive)}</strong></button>))}
          </div>
        )}
      </main>
    );
  }

  // Müşteriler: fidan satışlarındaki alıcı + siparişlerdeki müşteri (ad eşleşmesi, büyük/küçük harf farkı yok)
  const customers = () => {
    const m = new Map<string, { key: string; name: string; sales: EventRow[]; orders: EventRow[]; total: number; open: number; qty: number; last: string }>();
    const get = (raw: unknown, day: string) => {
      const key = custKey(raw); if (!key) return null;
      let c = m.get(key); if (!c) { c = { key, name: String(raw).trim().replace(/\s+/g, " "), sales: [], orders: [], total: 0, open: 0, qty: 0, last: "" }; m.set(key, c); }
      if (day > c.last) c.last = day; return c;
    };
    for (const e of sales) { const c = get(e.data.buyer, e.occurred_on); if (!c) continue; c.sales.push(e); c.total += Number(e.quantity ?? 0); c.open += incomeOpen(e); c.qty += Number(e.data.qty ?? 0); }
    for (const o of orders.filter((o) => o.data.status === "bekliyor")) get(o.data.customer, o.occurred_on)?.orders.push(o);
    return [...m.values()].sort((a, b) => b.open - a.open || b.last.localeCompare(a.last));
  };

  if (view.v === "musteriler") {
    const cs = customers(), debt = cs.reduce((t, c) => t + c.open, 0);
    return (
      <main className="ui-stack">
        <BackButton onClick={back} label="Fidan" />
        <PageHeader sub={`${cs.length} müşteri`} title="Müşteriler" />
        <div className="ui-total"><span>Toplam alacak</span><b>{formatTL(debt)}</b></div>
        {cs.length === 0 && <div className="ui-empty">Henüz müşteri yok. Satışta “Kime sattın?” ya da siparişte müşteri adı yazınca burada çıkar.</div>}
        {cs.map((c) => (
          <button key={c.key} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left" }} onClick={() => setView({ v: "musteri", key: c.key })}>
            <b>{c.name}<small>{[c.qty ? `${fmt(c.qty)} fidan aldı` : "", c.total ? formatTL(c.total) : "", c.orders.length ? `${c.orders.length} bekleyen sipariş` : "", c.last ? dayYear(c.last) : ""].filter(Boolean).join(" · ")}</small></b>
            <strong>{c.open ? `${formatTL(c.open)} borç` : "borcu yok"}</strong>
          </button>))}
      </main>
    );
  }

  if (view.v === "odeme") {
    const c = customers().find((x) => x.key === view.key);
    if (c) return <OdemeForm name={c.name} open={c.open} onCancel={() => setView({ v: "musteri", key: c.key })} onSave={async (amt) => {
      // Ödeme en eski satıştan başlayarak düşer (Mustafa, 4 Kasım 2026).
      const due = c.sales.filter((e) => incomeOpen(e) > 0).sort((a, b) => (a.occurred_on + (a.created_at ?? "")).localeCompare(b.occurred_on + (b.created_at ?? "")));
      const before: EventRow[] = []; let left = amt;
      for (const e of due) {
        if (left <= 0) break;
        const take = Math.min(left, incomeOpen(e)); left = Math.round((left - take) * 100) / 100;
        before.push(e); await updateEvent(e.id, { data: { ...e.data, received: Math.round((Number(e.data.received ?? 0) + take) * 100) / 100 } });
      }
      setDone({ message: `Tahsil ettim: ${c.name}, ${formatTL(amt)}. Kalan borç ${formatTL(Math.max(0, Math.round((c.open - amt) * 100) / 100))}.`,
        undo: async () => { for (const e of before) await updateEvent(e.id, { data: e.data }); } });
      setView({ v: "musteri", key: c.key }); load();
    }} />;
  }

  if (view.v === "musteri") {
    const c = customers().find((x) => x.key === view.key);
    if (!c) return <main className="ui-stack"><BackButton onClick={() => setView({ v: "musteriler" })} label="Müşteriler" /><div className="ui-empty">Bu müşteri bulunamadı.</div></main>;
    const ss = c.sales.slice().sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
    const msg = [`Merhaba ${c.name},`, `${biz.name} fidan hesabınız:`,
      ...ss.filter((e) => incomeOpen(e) > 0).map((e) => `${dayYear(e.occurred_on)}: ${fmt(Number(e.data.qty ?? 0))} adet${e.data.size ? ` ${String(e.data.size)}` : ""}, ${formatTL(Number(e.quantity))}, kalan ${formatTL(incomeOpen(e))}`),
      `Toplam kalan: ${formatTL(c.open)}`].join("\n");
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setView({ v: "musteriler" })} label="Müşteriler" />
        <PageHeader sub={`${fmt(c.qty)} fidan · ${formatTL(c.total)}`} title={c.name} />
        {doneCard}
        <div className="ui-total"><span>Kalan borç</span><b>{formatTL(c.open)}</b></div>
        {c.open > 0 && <MainButton onClick={() => { setDone(null); setView({ v: "odeme", key: c.key }); }}>Ödeme al</MainButton>}
        {c.open > 0 && <MainButton secondary onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank")}>Hesabı WhatsApp’tan gönder</MainButton>}
        {c.orders.length > 0 && <><h2 className="ui-section">Bekleyen siparişler</h2>
          {c.orders.map((o) => <button key={o.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left" }} onClick={() => setView({ v: "siparis", edit: o })}>
            <b>{fmt(Number(o.data.qty))} adet{o.data.size ? ` · ${String(o.data.size)}` : ""}<small>{[o.data.due_on ? `teslim ${dayText(String(o.data.due_on))}` : "", o.data.deposit ? `kapora ${formatTL(Number(o.data.deposit))}` : ""].filter(Boolean).join(" · ")}</small></b>
            <strong>{o.data.price ? formatTL(Number(o.data.qty) * Number(o.data.price)) : ""}</strong></button>)}</>}
        <h2 className="ui-section">Satışlar</h2>
        {ss.length === 0 ? <div className="ui-empty">Henüz satış yok.</div> : ss.map((e) => (
          <div key={e.id} className="ui-moneyrow"><b>{fmt(Number(e.data.qty ?? 0))} adet{e.data.size ? ` · ${String(e.data.size)}` : ""}<small>{[dayYear(e.occurred_on), find(String(e.data.lot_id ?? ""))?.name, incomeOpen(e) ? `kalan ${formatTL(incomeOpen(e))}${e.data.due_on ? ` (${dayText(String(e.data.due_on))})` : ""}` : "ödendi"].filter(Boolean).join(" · ")}</small></b>
            <strong>{formatTL(Number(e.quantity))}</strong></div>))}
      </main>
    );
  }

  if (view.v === "fiyat") {
    const { S, ready, reserved } = stock();
    const alive = S.reduce((t, x) => t + x.alive, 0), cost = S.reduce((t, x) => t + x.cost, 0);
    return <FiyatListesi sizes={sizes} prices={pricesOf(biz)} suggested={suggestedPrice(alive ? cost / alive : 0, margin)} bizName={biz.name}
      free={Object.fromEntries(sizes.map((k) => [k, Math.max(0, (ready[k] ?? 0) - (reserved[k] ?? 0))]))} hasStock={Object.keys(ready).length > 0} onCancel={back}
      onSave={async (fidan_prices) => {
        const settings = { ...biz.settings, fidan_prices };
        const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
        if (error) throw error;
        setBiz({ ...biz, settings });
      }} />;
  }

  // --- Formlar
  if (view.v === "lotForm") return <LotForm edit={view.edit} places={places} onCancel={() => setView(view.edit ? { v: "lot", id: view.edit.id } : { v: "list" })}
    onDelete={view.edit ? async () => { const l = view.edit!; await deleteLot(l.id); setDone({ message: `Sildim: ${l.name}.`, undo: () => restoreLot(l) }); setView({ v: "list" }); load(); } : undefined}
    onSave={async (v) => {
      if (view.edit) { const b = { ...view.edit }; await updateLot(b.id, v); setDone({ message: `Değiştirdim: ${v.name}.`, undo: () => updateLot(b.id, b) }); setView({ v: "lot", id: b.id }); }
      else { const l = await addLot(biz.id, v); setDone({ message: `Parti eklendi: ${l.name}, ${fmt(l.initial_count)} fidan.`, undo: () => deleteLot(l.id) }); setView({ v: "lot", id: l.id }); }
      load();
    }} />;

  if (view.v === "boylar") return <Boylar sizes={sizes} onCancel={back} onSave={async (list) => {
    const settings = { ...biz.settings, fidan_sizes: list };
    const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
    if (error) throw error;
    setBiz({ ...biz, settings }); setDone({ message: "Boy sınıfları kaydedildi." }); setView({ v: "list" });
  }} />;

  if (view.v === "dikim") return <DikimForm places={places} onCancel={back} onSave={async (v, parts) => {
    const batch = crypto.randomUUID(), total = parts.reduce((t, x) => t + x.qty, 0);
    const created: Lot[] = [];
    for (const x of parts) {
      const k = total ? x.qty / total : 0;
      const name = parts.length > 1 ? `${v.name} · ${places.find((p) => p.id === x.place)?.name ?? "Yer yok"}` : v.name;
      created.push(await addLot(biz.id, { name, place_id: x.place, planted_on: v.planted, initial_count: x.qty, source: v.source || null, note: v.note || null,
        data: { batch, batch_name: v.name, initial_cost: Math.round(v.cost * k * 100) / 100, prior_cost: Math.round(v.prior * k * 100) / 100 } }));
    }
    setDone({ message: `Dikim eklendi: ${v.name}, ${fmt(total)} fidan${parts.length > 1 ? `, ${parts.length} tarlaya` : ""}.`, undo: async () => { for (const l of created) await deleteLot(l.id); } });
    setView({ v: "list" }); load();
  }} />;

  if (view.v === "tasi") {
    const from = find(view.id);
    if (from) { const st = stats(from); return <TasiForm lot={from} st={st} lots={all.filter((l) => l.status === "aktif" && l.id !== from.id)} places={places} sizes={sizes} onCancel={() => setView({ v: "lot", id: from.id })}
      onSave={async (qty, size, target, newPlace) => {
        let to = target;
        let createdLot: Lot | null = null;
        if (!to) {
          const pn = newPlace === "saksi" ? "Saksı" : places.find((p) => p.id === newPlace)?.name ?? "Yeni yer";
          createdLot = await addLot(biz.id, { name: `${String(from.data.batch_name ?? from.name)} · ${pn}`, place_id: newPlace === "saksi" ? null : newPlace, planted_on: from.planted_on,
            initial_count: 0, source: from.source, note: null, data: { batch: batchOf(from), batch_name: from.data.batch_name ?? from.name, ...(newPlace === "saksi" ? { potted: true } : {}) } });
          to = createdLot.id;
        }
        const cost = Math.round(qty * st.perPlant * 100) / 100;
        const e = await addEvent(biz.id, { kind: AKTARIM, occurred_on: todayStr(), place_id: from.place_id, person_id: null, quantity: qty, data: { from: from.id, to, qty, cost, ...(size ? { size } : {}) } });
        setDone({ message: `Taşındı: ${fmt(qty)} fidan → ${find(to)?.name ?? createdLot?.name}. Maliyeti (${formatTL(cost)}) yanında gitti.`,
          undo: async () => { await deleteEvent(e.id); if (createdLot) await deleteLot(createdLot.id); } });
        setView({ v: "lot", id: from.id }); load();
      }} />; }
  }

  if (view.v === "sevk") {
    const o = view.order; const l = find(String(o.data.lot_id ?? ""));
    const qty = Number(o.data.qty ?? 0), price = Number(o.data.price ?? 0), dep = Number(o.data.deposit ?? 0);
    return (
      <main className="ui-stack rapor">
        <div className="no-print ui-stack">
          <BackButton onClick={back} label="Fidan" />
          <MainButton onClick={() => window.print()}>PDF olarak kaydet / yazdır</MainButton>
        </div>
        <header className="rapor-head">
          <div><small>Sevk listesi</small><h1>{biz.name}</h1><span>Tarih: {dayYear(todayStr())}</span></div>
          <small>Müşteri: <b>{String(o.data.customer)}</b></small>
        </header>
        <div className="rapor-table"><table>
          <thead><tr><th>Ürün</th><th>Parti</th><th>Boy</th><th>Adet</th><th>Birim fiyat</th><th>Tutar</th></tr></thead>
          <tbody><tr><td>Şimşir fidanı</td><td>{l?.name ?? "—"}</td><td>{String(o.data.size ?? "—")}</td><td>{fmt(qty)}</td><td>{price ? formatTL(price) : "—"}</td><td>{price ? formatTL(qty * price) : "—"}</td></tr></tbody>
          {price > 0 && <tfoot>
            <tr><td colSpan={5}>Toplam</td><td>{formatTL(qty * price)}</td></tr>
            {dep > 0 && <tr><td colSpan={5}>Alınan kapora</td><td>− {formatTL(dep)}</td></tr>}
            {dep > 0 && <tr><td colSpan={5}>Kalan</td><td>{formatTL(qty * price - dep)}</td></tr>}
          </tfoot>}
        </table></div>
        <div className="ui-card"><InfoRows rows={[
          ["Bitki pasaportu no", String(l?.data.passport ?? "—")],
          ["Dikim tarihi", l?.planted_on ? dayYear(l.planted_on) : "—"],
          ["Not", String(o.data.note ?? "—")],
        ]} /></div>
        <div className="ui-split" style={{ marginTop: 30 }}>
          <div><span>Teslim eden</span><b style={{ minHeight: 50 }}>&nbsp;</b></div>
          <div><span>Teslim alan</span><b style={{ minHeight: 50 }}>&nbsp;</b></div>
        </div>
      </main>
    );
  }

  if (view.v === "kar") return <KarOrani value={margin} onCancel={back} onSave={async (n) => {
    const settings = { ...biz.settings, fidan_margin: n };
    const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
    if (error) throw error;
    setBiz({ ...biz, settings }); setDone({ message: n ? `Kâr oranı %${n}.` : "Fiyat önerisi kapatıldı." }); setView({ v: "list" });
  }} />;

  if (view.v === "siparis") return <SiparisForm edit={view.edit} lots={all} sizes={sizes} onCancel={back}
    onDelete={view.edit ? async () => { const e = view.edit!; await deleteEvent(e.id); setDone({ message: "Sipariş silindi.", undo: () => mutate({ kind: "insert", table: "events", values: e }) }); setView({ v: "list" }); load(); } : undefined}
    onSave={async (data, day) => {
      if (view.edit) { const b = { ...view.edit }; await updateEvent(b.id, { data: { ...b.data, ...data } }); setDone({ message: "Sipariş değişti.", undo: () => updateEvent(b.id, { data: b.data }) }); }
      else { const e = await addEvent(biz.id, { kind: SIPARIS, occurred_on: day, place_id: null, person_id: null, quantity: Number(data.qty), data: { status: "bekliyor", ...data } });
        setDone({ message: `Sipariş: ${String(data.customer)}, ${fmt(Number(data.qty))} adet.`, undo: () => deleteEvent(e.id) }); }
      setView({ v: "list" }); load();
    }} />;

  if (view.v === "fotoGor") return (
    <main className="ui-stack">
      <BackButton onClick={() => setView({ v: "lot", id: view.back })} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={view.url} alt="Parti fotoğrafı" style={{ width: "100%", borderRadius: 14 }} />
    </main>
  );

  const lotV = "id" in view ? find((view as { id: string }).id) : undefined;
  if (lotV && view.v === "sayim") return <SayimForm lot={lotV} st={stats(lotV)} sizes={sizes} onCancel={() => setView({ v: "lot", id: lotV.id })}
    onSave={async (day, alive, bySize, note, loss) => {
      const e = await addEvent(biz.id, { kind: SAYIM, occurred_on: day, place_id: lotV.place_id, person_id: null, quantity: alive, data: { lot_id: lotV.id, alive, sizes: bySize, ...(note ? { note } : {}), ...(Object.keys(loss).length ? { loss } : {}) } });
      setDone({ message: `Sayım: ${lotV.name}, ${fmt(alive)} canlı fidan.`, undo: () => deleteEvent(e.id) }); setView({ v: "lot", id: lotV.id }); load();
    }} />;
  if (lotV && view.v === "islem") return <BakimForm lot={lotV} onCancel={() => setView({ v: "lot", id: lotV.id })}
    onSave={async (day, type, data) => {
      const e = await addEvent(biz.id, { kind: ISLEM, occurred_on: day, place_id: lotV.place_id, person_id: null, quantity: null, data: { type, lot_id: lotV.id, ...data } });
      setDone({ message: `Kaydettim: ${lotV.name}, ${type}.`, undo: () => deleteEvent(e.id) }); setView({ v: "lot", id: lotV.id }); load();
    }} />;
  if (lotV && view.v === "foto") return <FotoForm onCancel={() => setView({ v: "lot", id: lotV.id })}
    onSave={async (file, note) => {
      const path = await uploadReceipt(biz.id, file);
      const e = await addEvent(biz.id, { kind: FOTO, occurred_on: todayStr(), place_id: lotV.place_id, person_id: null, quantity: null, data: { lot_id: lotV.id, path, ...(note ? { note } : {}) } });
      setDone({ message: "Fotoğraf eklendi.", undo: () => deleteEvent(e.id) }); setView({ v: "lot", id: lotV.id }); load();
    }} />;
  if (lotV && view.v === "hatirlat") return <HatirlatForm lot={lotV} onCancel={() => setView({ v: "lot", id: lotV.id })}
    onSave={async (rem) => { const b = { ...lotV }; await updateLot(lotV.id, { data: { ...lotV.data, reminders: rem, reminders_from: (lotV.data.reminders_from as string) ?? todayStr() } }); setDone({ message: "Hatırlatıcılar kaydedildi.", undo: () => updateLot(b.id, { data: b.data }) }); setView({ v: "lot", id: lotV.id }); load(); }} />;

  // --- Parti detayı
  if (lotV && view.v === "lot") {
    const st = stats(lotV);
    const ops = ev.filter((e) => e.kind === ISLEM && e.data.lot_id === lotV.id).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
    const myCounts = counts.filter((c) => c.data.lot_id === lotV.id).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
    const mySales = sales.filter((s) => s.data.lot_id === lotV.id);
    const myExp = exp.filter((e) => e.data?.lot_id === lotV.id);
    const photos = ev.filter((e) => e.kind === FOTO && e.data.lot_id === lotV.id).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
    const maxS = Math.max(1, ...Object.values(st.bySize));
    return (
      <main className="ui-stack">
        <BackButton onClick={back} label="Fidan" />
        <PageHeader sub={[place(lotV.place_id), lotV.planted_on ? `dikim ${dayYear(lotV.planted_on)}` : "", ageText(st.ageMonths), lotV.status === "bitti" ? "bitti" : ""].filter(Boolean).join(" · ")} title={lotV.name} />
        {doneCard}
        <Alerts open={showAlerts} setOpen={setShowAlerts} items={dueOf(lotV).filter((d) => d.next <= addDays(todayStr(), 3)).map((d) => ({
          key: d.type, red: d.late, text: <>{d.type}: {d.late ? "zamanı geldi" : "yaklaşıyor"} ({d.next.slice(0, 4) === todayStr().slice(0, 4) ? dayText(d.next) : dayYear(d.next)})</> }))} />
        <div className="ui-total">
          <span>Canlı fidan</span><b>{fmt(st.alive)} adet</b>
          <div className="ui-total-row">
            <div><span>Fidan başı maliyet</span><strong>{st.alive ? formatTL(Math.round(st.perPlant * 100) / 100) : "—"}</strong></div>
            <div><span>Toplam maliyet</span><strong>{formatTL(Math.round(st.cost))}</strong></div>
          </div>
        </div>
        <Card><InfoRows rows={[
          ["Dikilen", `${fmt(lotV.initial_count)} adet${lotV.source ? ` · ${lotV.source}` : ""}`],
          ...(st.movedIn || st.movedOut ? [["Taşınan", `gelen ${fmt(st.movedIn)} · giden ${fmt(st.movedOut)}`] as [string, string]] : []),
          ["Satılan", `${fmt(st.sold)} adet · ${formatTL(st.income)}`],
          ["Fire (ölen / kayıp)", `${fmt(st.dead)} adet · %${st.firePct.toFixed(1)}`],
          ["Son sayım", st.counted ? dayYear(st.counted) : "Sayım yok (dikilen adet esas)"],
          ["Partiye özel", formatTL(Math.round(st.costDirect))],
          ["Tarla masrafından payı", formatTL(Math.round(st.costShare))],
          ["Genel masraftan payı", formatTL(Math.round(st.costGeneral))],
          ...(st.costMoved ? [["Taşımayla gelen / giden maliyet", formatTL(Math.round(st.costMoved))] as [string, string]] : []),
          ["Kâr / zarar (şimdiye kadar)", formatTL(Math.round(st.income - st.cost))],
          ["Önerilen satış fiyatı", suggestedPrice(st.perPlant, margin) ? `${formatTL(suggestedPrice(st.perPlant, margin)!)} / adet (maliyet + %${margin})` : "Kâr oranı girilmedi"],
        ]} /></Card>
        {Object.keys(st.bySize).length > 0 && (
          <div className="ui-card ui-stack" style={{ gap: 8 }}>
            <b>Boy dağılımı (son sayım)</b>
            {sizes.filter((s) => st.bySize[s] != null).map((s) => <div key={s} className="rapor-bar"><span>{s}</span><i style={{ width: `${(st.bySize[s] / maxS) * 100}%` }} /><b>{fmt(st.bySize[s])}</b></div>)}
          </div>
        )}
        {(() => {
          const lossTot: Record<string, number> = {};
          for (const c of myCounts) for (const [k, v] of Object.entries((c.data.loss ?? {}) as Record<string, number>)) lossTot[k] = (lossTot[k] ?? 0) + Number(v);
          const ent = Object.entries(lossTot).sort((a, b) => b[1] - a[1]); if (!ent.length) return null;
          const mx = Math.max(...ent.map((e) => e[1]));
          return <div className="ui-card ui-stack" style={{ gap: 8 }}><b>Fire sebepleri</b>
            {ent.map(([k, v]) => <div key={k} className="rapor-bar"><span>{k}</span><i style={{ width: `${(v / mx) * 100}%`, background: "var(--tehlike)" }} /><b>{fmt(v)}</b></div>)}</div>;
        })()}
        {(() => {
          const chron = myCounts.slice().reverse().filter((c) => Object.keys((c.data.sizes ?? {}) as object).length);
          if (chron.length < 1) return null;
          const shares = (c: EventRow) => { const z = (c.data.sizes ?? {}) as Record<string, number>; const t = Object.values(z).reduce((a, b) => a + Number(b), 0) || 1; return sizes.map((k) => (Number(z[k] ?? 0) / t) * 100); };
          const top = sizes.length > 1 ? sizes.slice(Math.floor(sizes.length / 2)) : sizes;
          const topShare = (c: EventRow) => shares(c).slice(sizes.length - top.length).reduce((a, b) => a + b, 0);
          return <div className="ui-card ui-stack" style={{ gap: 8 }}><b>Büyüme (sayımdan sayıma boy dağılımı)</b>
            {chron.map((c) => (
              <div key={c.id} className="ui-stack" style={{ gap: 4 }}>
                <span className="ui-note" style={{ margin: 0 }}>{dayYear(c.occurred_on)} · {top.join(", ")}: %{Math.round(topShare(c))}</span>
                <div className="buyume">{shares(c).map((v, i) => <i key={i} style={{ width: `${v}%`, opacity: 0.35 + (0.65 * (i + 1)) / sizes.length }} title={`${sizes[i]} %${Math.round(v)}`} />)}</div>
              </div>
            ))}
            <span className="ui-note" style={{ margin: 0 }}>{sizes.map((k, i) => `${i + 1}. ${k}`).join(" · ")} (açıktan koyuya)</span>
            {chron.length > 1 && <span><b>{top.join(", ")}</b> oranı: %{Math.round(topShare(chron[0]))} → %{Math.round(topShare(chron[chron.length - 1]))}</span>}
          </div>;
        })()}
        <div className="ui-tiles">
          <button type="button" onClick={() => { setDone(null); setView({ v: "sayim", id: lotV.id }); }}><b>+ Sayım</b><small>canlı adet, boylar</small></button>
          <button type="button" onClick={() => { setDone(null); setView({ v: "islem", id: lotV.id }); }}><b>+ Bakım / işlem</b><small>budama, güve, ilaç…</small></button>
          <button type="button" onClick={() => go("masraf", { yeni: 1, ...(lotV.place_id ? { tarla: lotV.place_id } : {}), parti: lotV.id })}><b>+ Masraf</b><small>bu partiye</small></button>
          <button type="button" onClick={() => go("gelir", { yeni: 1, parti: lotV.id })}><b>+ Satış</b><small>adet × boy × fiyat</small></button>
          <button type="button" onClick={() => { setDone(null); setView({ v: "foto", id: lotV.id }); }}><b>+ Fotoğraf</b><small>gelişim günlüğü</small></button>
          <button type="button" onClick={() => { setDone(null); setView({ v: "hatirlat", id: lotV.id }); }}><b>Hatırlatıcılar</b><small>her kaç günde bir</small></button>
          <button type="button" onClick={() => { setDone(null); setView({ v: "tasi", id: lotV.id }); }}><b>Taşı / saksıya al</b><small>başka tarlaya, saksıya</small></button>
        </div>

        <h2 className="ui-section">Sayımlar</h2>
        {myCounts.length === 0 ? <div className="ui-empty">Henüz sayım yok.</div> : myCounts.map((c) => (
          <div key={c.id} className="ui-moneyrow"><b>{dayYear(c.occurred_on)}<small>{Object.entries((c.data.sizes ?? {}) as Record<string, number>).map(([k, v]) => `${k}: ${fmt(v)}`).join(" · ")}{c.data.note ? ` · ${String(c.data.note)}` : ""} · {nameOf(c.created_by)}</small></b><strong>{fmt(Number(c.data.alive))}</strong></div>
        ))}
        <h2 className="ui-section">Bakım / işlemler</h2>
        {ops.length === 0 ? <div className="ui-empty">Henüz işlem yok.</div> : ops.map((e) => (
          <div key={e.id} className="ui-moneyrow"><b>{String(e.data.type)}{e.data.product ? ` · ${String(e.data.product)}` : ""}<small>{[dayYear(e.occurred_on), e.data.dose ? String(e.data.dose) : "", e.data.note ? String(e.data.note) : "", nameOf(e.created_by)].filter(Boolean).join(" · ")}</small></b></div>
        ))}
        <h2 className="ui-section">Satışlar</h2>
        {mySales.length === 0 ? <div className="ui-empty">Henüz satış yok.</div> : mySales.map((s) => (
          <div key={s.id} className="ui-moneyrow"><b>{fmt(Number(s.data.qty))} adet · {String(s.data.size ?? "")}<small>{dayYear(s.occurred_on)} · {String(s.data.buyer ?? "")}</small></b><strong>{formatTL(Number(s.quantity))}</strong></div>
        ))}
        <h2 className="ui-section">Partiye girilen masraflar</h2>
        {myExp.length === 0 ? <div className="ui-empty">Bu partiye doğrudan masraf girilmedi{lotV.place_id ? "; parselin masraflarından pay alıyor" : ""}.</div>
          : <Card><InfoRows rows={myExp.map((e) => [`${dayText(e.occurred_on)} · ${e.category}`, formatTL(e.amount)] as [string, string])} /></Card>}
        {photos.length > 0 && (
          <>
            <h2 className="ui-section">Fotoğraflar</h2>
            {photos.map((p) => <button key={p.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left" }}
              onClick={async () => { const u = await receiptUrl(String(p.data.path)); if (u) setView({ v: "fotoGor", url: u, back: lotV.id }); }}>
              <b>{dayYear(p.occurred_on)}<small>{String(p.data.note ?? "Fotoğrafı gör")}</small></b><strong>Gör ›</strong></button>)}
          </>
        )}
        <MainButton secondary onClick={() => setView({ v: "lotForm", edit: lotV })}>Partiyi düzenle</MainButton>
        <MainButton secondary onClick={async () => { const b = { ...lotV }; const s2 = lotV.status === "aktif" ? "bitti" : "aktif"; await updateLot(lotV.id, { status: s2 }); setDone({ message: s2 === "bitti" ? "Parti bitti olarak işaretlendi." : "Parti yeniden aktif.", undo: () => updateLot(b.id, { status: b.status }) }); load(); }}>
          {lotV.status === "aktif" ? "Parti bitti (hepsi satıldı / söküldü)" : "Partiyi yeniden aktif yap"}</MainButton>
      </main>
    );
  }

  // --- Liste
  const active = all.filter((l) => l.status === "aktif");
  const { S, ready, reserved } = stock();
  const totAlive = S.reduce((t, s) => t + s.alive, 0);
  const totCost = S.reduce((t, s) => t + s.cost, 0);
  const dues = active.flatMap(dueOf).filter((d) => d.next <= addDays(todayStr(), 7)).sort((a, b) => a.next.localeCompare(b.next));
  const openOrders = orders.filter((o) => o.data.status === "bekliyor").sort((a, b) => String(a.data.due_on ?? "9").localeCompare(String(b.data.due_on ?? "9")));

  const excel = () => downloadXlsx(`${biz.name}-partiler`.replace(/\s+/g, "-"), [
    { name: "Partiler", title: `${biz.name} · Fidan partileri · ${new Date().toLocaleDateString("tr-TR")}`, rows: [
      ["Parti", "Parsel", "Dikim", "Yaş", "Dikilen", "Canlı", "Satılan", "Fire", "Fire %", "Toplam maliyet (TL)", "Fidan başı maliyet (TL)", "Önerilen fiyat (TL)", "Satış geliri (TL)", "Kâr / zarar (TL)", "Durum"],
      ...all.map(stats).map((s) => [s.lot.name, place(s.lot.place_id), s.lot.planted_on ? dayYear(s.lot.planted_on) : "", ageText(s.ageMonths), s.lot.initial_count, s.alive, s.sold, s.dead,
        Math.round(s.firePct * 10) / 10, Math.round(s.cost), Math.round(s.perPlant * 100) / 100, suggestedPrice(s.perPlant, margin) ?? "", s.income, Math.round(s.income - s.cost), s.lot.status]),
      ["Toplam (aktif)", "", "", "", "", totAlive, "", "", "", Math.round(totCost), totAlive ? Math.round((totCost / totAlive) * 100) / 100 : "", "", "", "", ""],
    ] },
    { name: "Boy stoku", title: "Satışa hazır (son sayımlardan, satılanlar düşülmüş)", rows: [["Boy", "Adet", "Siparişte ayrılan", "Serbest"],
      ...sizes.map((k) => [k, ready[k] ?? 0, reserved[k] ?? 0, (ready[k] ?? 0) - (reserved[k] ?? 0)])] },
    { name: "Siparişler", title: "Siparişler", rows: [["Tarih", "Müşteri", "Parti", "Boy", "Adet", "Fiyat (TL)", "Kapora (TL)", "Teslim", "Durum"],
      ...orders.map((o) => [dayYear(o.occurred_on), String(o.data.customer ?? ""), find(String(o.data.lot_id ?? ""))?.name ?? "", String(o.data.size ?? ""), Number(o.data.qty ?? 0), Number(o.data.price ?? 0) || "", Number(o.data.deposit ?? 0) || "", o.data.due_on ? dayYear(String(o.data.due_on)) : "", String(o.data.status)])] },
  ]);

  return (
    <main className="ui-stack">
      <PageHeader sub={`${active.length} aktif parti`} title="Fidan" right={<HistoryLink />} />
      {doneCard}
      <div className="ui-total">
        <span>Toplam canlı fidan</span><b>{fmt(totAlive)} adet</b>
        <div className="ui-total-row">
          <div><span>Ortalama fidan başı maliyet</span><strong>{totAlive ? formatTL(Math.round((totCost / totAlive) * 100) / 100) : "—"}</strong></div>
          <div><span>Toplam maliyet</span><strong>{formatTL(Math.round(totCost))}</strong></div>
        </div>
      </div>
      <div className="ui-seg">
        <button type="button" onClick={() => { setDone(null); setView({ v: "dikim" }); }}>+ Yeni dikim</button>
        <button type="button" onClick={() => { setDone(null); setView({ v: "siparis" }); }}>+ Sipariş</button>
      </div>
      <div className="ui-seg">
        <button type="button" onClick={() => { setDone(null); setView({ v: "stok" }); }}>Stok</button>
        <button type="button" onClick={() => { setDone(null); setView({ v: "musteriler" }); }}>Müşteriler</button>
        <button type="button" onClick={() => { setDone(null); setView({ v: "fiyat" }); }}>Fiyat listesi</button>
      </div>

      <Alerts open={showAlerts} setOpen={setShowAlerts} items={dues.map((d) => ({ key: d.lot.id + d.type, red: d.late, onClick: () => setView({ v: "lot", id: d.lot.id }),
        text: <><b>{d.lot.name}</b>: {d.type} {d.late ? "zamanı geldi" : `· ${dayText(d.next)}`}</> }))} />

      {Object.keys(ready).length > 0 && (
        <div className="ui-card ui-stack" style={{ gap: 6 }}>
          <b>Satışa hazır (boylara göre)</b>
          <div className="ui-rows">{sizes.filter((k) => ready[k] != null).map((k) => <div key={k}><span>{k}</span><span>{fmt(ready[k])} adet{reserved[k] ? ` · ${fmt(reserved[k])} siparişte` : ""}</span></div>)}</div>
          <button type="button" className="ui-link" onClick={() => { setDone(null); setView({ v: "stok" }); }}>Stoku ayrıntılı gör ›</button>
        </div>
      )}

      {openOrders.length > 0 && (
        <>
          <h2 className="ui-section">Bekleyen siparişler</h2>
          {openOrders.map((o) => {
            const late = o.data.due_on && String(o.data.due_on) < todayStr();
            return (
              <div key={o.id} className={`ui-card ui-stack${late ? " late" : ""}`} style={{ gap: 8 }}>
                <button type="button" className="ui-plain" onClick={() => setView({ v: "siparis", edit: o })}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{String(o.data.customer)}</b><span className="ui-amount">{fmt(Number(o.data.qty))} adet</span></span>
                  <span className="ui-note" style={{ margin: 0 }}>{[o.data.size, find(String(o.data.lot_id ?? ""))?.name, o.data.price ? `${formatTL(Number(o.data.price))}/adet` : "", o.data.due_on ? `teslim ${dayText(String(o.data.due_on))}` : "",
                    o.data.deposit ? `kapora ${formatTL(Number(o.data.deposit))}` : "", o.data.deposit && o.data.price ? `kalan ${formatTL(Number(o.data.qty) * Number(o.data.price) - Number(o.data.deposit))}` : ""].filter(Boolean).map(String).join(" · ")}</span>
                </button>
                <div className="ui-seg">
                  <button type="button" onClick={async () => {
                    await updateEvent(o.id, { data: { ...o.data, status: "teslim" } });
                    go("gelir", { yeni: 1, ...(o.data.lot_id ? { parti: String(o.data.lot_id) } : {}), ...(o.data.size ? { boy: String(o.data.size) } : {}), adet: Number(o.data.qty), ...(o.data.price ? { fiyat: Number(o.data.price) } : {}), alici: String(o.data.customer), ...(o.data.deposit ? { alinan: Number(o.data.deposit) } : {}) });
                  }}>Teslim et → satış</button>
                  <button type="button" onClick={() => setView({ v: "sevk", order: o })}>Sevk listesi</button>
                  <button type="button" onClick={async () => { await updateEvent(o.id, { data: { ...o.data, status: "iptal" } }); setDone({ message: "Sipariş iptal.", undo: () => updateEvent(o.id, { data: o.data }) }); load(); }}>İptal</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="ui-tabs" role="tablist" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <button type="button" role="tab" aria-selected={group === "dikim"} onClick={() => setGroupState("dikim")}>Dikime göre</button>
        <button type="button" role="tab" aria-selected={group === "tarla"} onClick={() => setGroupState("tarla")}>Tarlaya göre</button>
      </div>
      {lots && all.length === 0 && <div className="ui-empty">Henüz dikim yok. “+ Yeni dikim” ile ekle; geçmiş yıllarda diktiklerini de tarihiyle ekleyebilirsin.</div>}
      {(() => {
        const lotRow = (l: Lot, sub?: string) => { const st = stats(l); return (
          <button key={l.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left", cursor: "pointer", opacity: l.status === "bitti" ? 0.55 : 1 }} onClick={() => { setDone(null); setView({ v: "lot", id: l.id }); }}>
            <b style={{ minWidth: 0 }}>{sub ?? l.name}<small>{[ageText(st.ageMonths), `fire %${st.firePct.toFixed(1)}`, st.alive ? `fidan başı ${formatTL(Math.round(st.perPlant * 100) / 100)}` : "", l.status === "bitti" ? "bitti" : ""].filter(Boolean).join(" · ")}</small></b>
            <strong>{fmt(st.alive)}</strong>
          </button>); };
        const groupCard = (key: string, title: string, sub: string, ls: Lot[], rowLabel: (l: Lot) => string) => {
          const S = ls.filter((l) => l.status === "aktif").map(stats);
          const alive = S.reduce((t, x) => t + x.alive, 0), cost = S.reduce((t, x) => t + x.cost, 0), inc = ls.map(stats).reduce((t, x) => t + x.income, 0);
          return (
            <div key={key} className="ui-card ui-stack" style={{ gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b style={{ fontSize: "1.1rem" }}>{title}</b><span className="ui-amount">{fmt(alive)} fidan</span></div>
              <span className="ui-note" style={{ margin: 0 }}>{[sub, `maliyet ${formatTL(Math.round(cost))}`, alive ? `fidan başı ${formatTL(Math.round((cost / alive) * 100) / 100)}` : "", inc ? `satış ${formatTL(inc)}` : ""].filter(Boolean).join(" · ")}</span>
              {ls.map((l) => lotRow(l, rowLabel(l)))}
            </div>
          );
        };
        if (group === "tarla") {
          const keys = [...new Set(all.map((l) => l.place_id ?? (l.data.potted ? "saksi" : "yok")))];
          return keys.map((k) => {
            const ls = all.filter((l) => (l.place_id ?? (l.data.potted ? "saksi" : "yok")) === k);
            const pl = places.find((p) => p.id === k);
            return groupCard(k, pl?.name ?? (k === "saksi" ? "Saksıda" : "Tarlası seçilmemiş"), pl?.custom?.donum ? `${pl.custom.donum} dönüm` : "", ls,
              (l) => `${String(l.data.batch_name ?? l.name)}${l.planted_on ? ` (${l.planted_on.slice(0, 4)})` : ""}`);
          });
        }
        const batches = [...new Set(all.map(batchOf))];
        return batches.map((b) => {
          const ls = all.filter((l) => batchOf(l) === b);
          const f = ls[0];
          return groupCard(b, String(f.data.batch_name ?? f.name), [f.planted_on ? dayYear(f.planted_on) : "", f.source, `${fmt(ls.reduce((t, l) => t + l.initial_count, 0))} dikildi`].filter(Boolean).join(" · "), ls,
            (l) => (l.place_id ? place(l.place_id) : l.data.potted ? "Saksıda" : "Tarlası yok"));
        });
      })()}
      {all.length > 0 && <MainButton secondary onClick={excel}>Excel’e indir (partiler, boy stoku, siparişler)</MainButton>}
      <button type="button" className="ui-link" onClick={() => setView({ v: "kar" })}>{margin ? `Kâr oranı: %${margin} · değiştir` : "Satış fiyatı önerisi için kâr oranı gir"}</button>
      <button type="button" className="ui-link" onClick={() => setView({ v: "boylar" })}>Boy sınıflarını düzenle ({sizes.join(", ")})</button>
    </main>
  );
}

function LotForm({ edit, places, onSave, onCancel, onDelete }: {
  edit?: Lot; places: Place[]; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (v: Omit<Lot, "id" | "business_id" | "created_at" | "created_by" | "status">) => Promise<void>;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const sources = useCList("sources");
  const [placeId, setPlaceId] = useState<string | null>(edit?.place_id ?? null);
  const [planted, setPlanted] = useState(edit?.planted_on ?? "");
  const [count, setCount] = useState(edit ? String(edit.initial_count) : "");
  const [source, setSource] = useState(edit?.source ?? "");
  const [initialCost, setInitialCost] = useState(edit?.data.initial_cost ? String(edit.data.initial_cost) : "");
  const [prior, setPrior] = useState(edit?.data.prior_cost ? String(edit.data.prior_cost) : "");
  const [note, setNote] = useState(edit?.note ?? "");
  const [passport, setPassport] = useState(String(edit?.data.passport ?? ""));
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Fidan" title={edit ? "Partiyi düzenle" : "Yeni parti"} />
      <TextField id="l_ad" label="Partinin adı" placeholder="Örnek: 2024 Mart dikimi" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      {places.length > 0 && <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Parsel / tarla</span>
        <div className="ui-chips wrap"><Chip selected={!placeId} onClick={() => setPlaceId(null)}>Yok</Chip>{places.map((p) => <Chip key={p.id} selected={placeId === p.id} onClick={() => setPlaceId(p.id)}>{p.name}</Chip>)}</div></div>}
      <TextField id="l_dikim" label="Dikim tarihi (geçmiş tarih olabilir)" type="date" max={todayStr()} value={planted} onChange={(e) => setPlanted(e.target.value)} />
      <TextField id="l_adet" label="Kaç adet dikildi?" inputMode="numeric" maxLength={9} value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} style={{ fontSize: "1.5rem", fontWeight: 800 }} />
      <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Kaynak</span>
        <div className="ui-chips wrap">{sources.map((s) => <Chip key={s} selected={source === s} onClick={() => setSource(source === s ? "" : s)}>{s}</Chip>)}</div></div>
      <TextField id="l_alis" label="Fidan / çelik alış maliyeti, toplam TL (isteğe bağlı)" inputMode="decimal" maxLength={12} value={initialCost} onChange={(e) => setInitialCost(e.target.value)} />
      <TextField id="l_onceki" label="Uygulamadan önce bu partiye yapılan masraf, toplam TL (isteğe bağlı)" inputMode="decimal" maxLength={12} value={prior} onChange={(e) => setPrior(e.target.value)} />
      <p className="ui-note">Geçmiş yılların masraflarını tek tek girmek yerine burada toplam olarak yazabilirsin; fidan başı maliyete eklenir.</p>
      <TextField id="l_pasaport" label="Bitki pasaportu no (isteğe bağlı, sevk listesinde çıkar)" maxLength={60} value={passport} onChange={(e) => setPassport(e.target.value)} />
      <TextField id="l_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Partiyi sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const n = Number(count);
        if (!name.trim()) { setError("Partinin adını yaz."); return; }
        if (!(n > 0)) { setError("Kaç adet dikildiğini yaz."); return; }
        await onSave({ name: name.trim(), place_id: placeId, planted_on: planted || null, initial_count: n, source: source || null, note: note.trim() || null,
          data: { ...(edit?.data ?? {}), initial_cost: initialCost ? num(initialCost) : 0, prior_cost: prior ? num(prior) : 0, passport: passport.trim() } });
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function SayimForm({ lot, st, sizes, onSave, onCancel }: { lot: Lot; st: LotStats; sizes: string[]; onCancel: () => void;
  onSave: (day: string, alive: number, bySize: Record<string, number>, note: string, loss: Record<string, number>) => Promise<void> }) {
  const reasons = useCList("fire");
  const [loss, setLoss] = useState<Record<string, string>>({});
  const [day, setDay] = useState(todayStr());
  const [vals, setVals] = useState<Record<string, string>>({});
  const [total, setTotal] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const sum = Object.values(vals).reduce((t, v) => t + (Number(v) || 0), 0);
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`${lot.name} · şu an ${fmt(st.alive)} canlı görünüyor`} title="Sayım" />
      <TextField id="sy_gun" label="Sayım günü" type="date" max={todayStr()} value={day} onChange={(e) => setDay(e.target.value)} />
      <span className="ui-label">Boylara göre kaç adet? (bilmiyorsan aşağıya toplamı yaz)</span>
      {sizes.map((s) => <TextField key={s} id={`sy_${s}`} label={s} inputMode="numeric" maxLength={9} value={vals[s] ?? ""} onChange={(e) => setVals({ ...vals, [s]: e.target.value.replace(/\D/g, "") })} />)}
      {sum > 0 ? <div className="ui-done"><p>Toplam canlı: <b>{fmt(sum)}</b> adet</p></div>
        : <TextField id="sy_toplam" label="Toplam canlı fidan" inputMode="numeric" maxLength={9} value={total} onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} style={{ fontSize: "1.5rem", fontWeight: 800 }} />}
      <div className="ui-card ui-stack" style={{ gap: 8 }}>
        <b>Ölen / kayıp fidan (isteğe bağlı)</b>
        <span className="ui-note" style={{ margin: 0 }}>Son sayımdan beri kaç tane, neden kayboldu? Fire sebeplerini “Listeleri düzenle”den değiştirebilirsin.</span>
        {reasons.map((x) => <TextField key={x} id={`fire_${x}`} label={x} inputMode="numeric" maxLength={7} value={loss[x] ?? ""} onChange={(e) => setLoss({ ...loss, [x]: e.target.value.replace(/\D/g, "") })} />)}
      </div>
      <TextField id="sy_not" label="Not (isteğe bağlı)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const alive = sum || Number(total);
        if (!(alive >= 0) || (!sum && !total)) { setError("Boylara göre ya da toplam adet yaz."); return; }
        const bySize = Object.fromEntries(Object.entries(vals).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)]));
        await onSave(day, alive, bySize, note.trim(), Object.fromEntries(Object.entries(loss).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)])));
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function BakimForm({ lot, onSave, onCancel }: { lot: Lot; onCancel: () => void; onSave: (day: string, type: string, data: Record<string, unknown>) => Promise<void> }) {
  const BAKIM = useCList("bakim");
  const [type, setType] = useState(BAKIM[0]);
  const [day, setDay] = useState(todayStr());
  const [product, setProduct] = useState("");
  const [dose, setDose] = useState("");
  const [note, setNote] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={lot.name} title="Bakım / işlem" />
      <div className="ui-chips wrap">{BAKIM.map((b) => <Chip key={b} selected={b === type} onClick={() => setType(b)}>{b}</Chip>)}</div>
      <TextField id="b_gun" label="Tarih" type="date" max={todayStr()} value={day} onChange={(e) => setDay(e.target.value)} />
      {(type === "İlaçlama" || type === "Gübreleme") && <>
        <TextField id="b_urun" label={type === "İlaçlama" ? "Hangi ilaç?" : "Hangi gübre?"} maxLength={60} value={product} onChange={(e) => setProduct(e.target.value)} />
        <TextField id="b_doz" label="Doz (isteğe bağlı)" maxLength={60} value={dose} onChange={(e) => setDose(e.target.value)} /></>}
      <TextField id="b_not" label={type === "Güve kontrolü" ? "Ne görüldü? (ör. güve yok / yuva var)" : "Not (isteğe bağlı)"} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="ui-sticky-bottom"><MainButton onClick={() => onSave(day, type, { ...(product ? { product } : {}), ...(dose ? { dose } : {}), ...(note ? { note } : {}) })}>Kaydet</MainButton></div>
    </main>
  );
}

function HatirlatForm({ lot, onSave, onCancel }: { lot: Lot; onCancel: () => void; onSave: (r: Record<string, number>) => Promise<void> }) {
  const BAKIM = useCList("bakim");
  const cur = (lot.data.reminders ?? {}) as Record<string, number>;
  const [vals, setVals] = useState<Record<string, string>>(Object.fromEntries(BAKIM.filter((b) => b !== "Diğer").map((b) => [b, cur[b] ? String(cur[b]) : ""])));
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={lot.name} title="Hatırlatıcılar" />
      <p className="ui-note">Her işi kaç günde bir yapıyorsan yaz. Son yapıldığı günden bu kadar gün geçince “zamanı geldi” uyarısı çıkar. Boş bırakılan hatırlatmaz.</p>
      {Object.keys(vals).map((k) => <TextField key={k} id={`h_${k}`} label={`${k}: kaç günde bir?`} inputMode="numeric" maxLength={3} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value.replace(/\D/g, "") })} />)}
      <div className="ui-sticky-bottom"><MainButton onClick={() => onSave(Object.fromEntries(Object.entries(vals).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)])))}>Kaydet</MainButton></div>
    </main>
  );
}

function SiparisForm({ edit, lots, sizes, onSave, onCancel, onDelete }: { edit?: EventRow; lots: Lot[]; sizes: string[]; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (data: Record<string, unknown>, day: string) => Promise<void> }) {
  const d = edit?.data ?? {};
  const [customer, setCustomer] = useState(String(d.customer ?? ""));
  const [lotId, setLotId] = useState<string | null>((d.lot_id as string) ?? null);
  const [size, setSize] = useState<string | null>((d.size as string) ?? null);
  const [qty, setQty] = useState(d.qty ? String(d.qty) : "");
  const [price, setPrice] = useState(d.price ? String(d.price) : "");
  const [due, setDue] = useState(String(d.due_on ?? ""));
  const [deposit, setDeposit] = useState(d.deposit ? String(d.deposit) : "");
  const [note, setNote] = useState(String(d.note ?? ""));
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Fidan" title={edit ? "Siparişi düzenle" : "Yeni sipariş"} />
      <TextField id="sp_musteri" label="Müşteri" placeholder="Örnek: Peyzaj firması, Belediye" maxLength={80} value={customer} onChange={(e) => setCustomer(e.target.value)} />
      <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Boy</span><div className="ui-chips wrap">{sizes.map((s) => <Chip key={s} selected={size === s} onClick={() => setSize(size === s ? null : s)}>{s}</Chip>)}</div></div>
      {lots.length > 0 && <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Hangi partiden? (isteğe bağlı)</span>
        <div className="ui-chips wrap"><Chip selected={!lotId} onClick={() => setLotId(null)}>Fark etmez</Chip>{lots.filter((l) => l.status === "aktif").map((l) => <Chip key={l.id} selected={lotId === l.id} onClick={() => setLotId(l.id)}>{l.name}</Chip>)}</div></div>}
      <div className="ui-quickadd">
        <TextField id="sp_adet" label="Adet" inputMode="numeric" maxLength={9} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
        <TextField id="sp_fiyat" label="Adet fiyatı TL (isteğe bağlı)" inputMode="decimal" maxLength={10} value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <TextField id="sp_kapora" label="Alınan kapora, TL (isteğe bağlı)" inputMode="decimal" maxLength={10} value={deposit} onChange={(e) => setDeposit(e.target.value)} />
      <TextField id="sp_teslim" label="Teslim günü (isteğe bağlı)" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <TextField id="sp_not" label="Not (isteğe bağlı)" placeholder="Örnek: saksılı, kapora alındı" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Siparişi sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        if (!customer.trim()) { setError("Müşteriyi yaz."); return; }
        if (!(Number(qty) > 0)) { setError("Adedi yaz."); return; }
        await onSave({ customer: customer.trim(), lot_id: lotId, size, qty: Number(qty), ...(price ? { price: num(price) } : {}), ...(due ? { due_on: due } : {}), ...(deposit ? { deposit: num(deposit) } : {}), ...(note.trim() ? { note: note.trim() } : {}) }, todayStr());
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function FotoForm({ onSave, onCancel }: { onCancel: () => void; onSave: (f: File, note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Gelişim günlüğü" title="Fotoğraf ekle" />
      <TextField id="f_not" label="Not (isteğe bağlı)" placeholder="Örnek: ilkbahar sonrası, 35 cm civarı" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <label className="ui-main-btn" style={{ cursor: "pointer" }}>{busy ? "Yükleniyor…" : "Fotoğraf çek / seç"}
        <input type="file" accept="image/*" capture="environment" hidden disabled={busy} onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          if (!navigator.onLine) { setError("Fotoğraf eklemek için internet lazım."); return; }
          setBusy(true); try { await onSave(f, note.trim()); } catch { setError("Yükleyemedim, tekrar dene."); setBusy(false); }
        }} />
      </label>
    </main>
  );
}

function Boylar({ sizes, onSave, onCancel }: { sizes: string[]; onCancel: () => void; onSave: (s: string[]) => Promise<void> }) {
  const [list, setList] = useState(sizes);
  const [nw, setNw] = useState("");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Fidan" title="Boy sınıfları" />
      <p className="ui-note">Fidanları nasıl sınıflandırıyorsan öyle yaz (ör. “20-30 cm”, “top 40”, “saksılı 3 lt”). Sayımda ve satışta bu sınıflar çıkar.</p>
      {list.map((s, i) => <div key={s} className="ui-moneyrow"><b>{s}</b><button type="button" className="ui-link inline" style={{ color: "var(--tehlike)" }} onClick={() => setList(list.filter((_, j) => j !== i))}>Çıkar</button></div>)}
      <div className="ui-quickadd"><TextField id="boy_yeni" label="Yeni sınıf" maxLength={30} value={nw} onChange={(e) => setNw(e.target.value)} />
        <button type="button" disabled={!nw.trim()} onClick={() => { if (!list.includes(nw.trim())) setList([...list, nw.trim()]); setNw(""); }}>Ekle</button></div>
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={async () => { if (!list.length) { setError("En az bir sınıf olmalı."); return; } try { await onSave(list); } catch { setError("Kaydedemedim, internet lazım."); } }}>Kaydet</MainButton>
    </main>
  );
}

function KarOrani({ value, onSave, onCancel }: { value: number | null; onCancel: () => void; onSave: (n: number) => Promise<void> }) {
  const [v, setV] = useState(value ? String(value) : "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Fidan" title="Kâr oranı" />
      <p className="ui-note">Fidan başı maliyetin üstüne yüzde kaç kâr koymak istiyorsun? Her partiye “önerilen satış fiyatı” bu orana göre çıkar. Boş bırakırsan öneri gösterilmez.</p>
      <TextField id="kar" label="Kâr oranı (%)" inputMode="numeric" maxLength={4} placeholder="Örnek: 40" value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} style={{ fontSize: "1.6rem", fontWeight: 800 }} />
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={async () => { try { await onSave(Number(v) || 0); } catch { setError("Kaydedemedim, internet lazım."); } }}>Kaydet</MainButton>
    </main>
  );
}

/** Müşteriden ödeme: tutar en eski borçlu satıştan başlayarak düşer. */
function OdemeForm({ name, open, onSave, onCancel }: { name: string; open: number; onCancel: () => void; onSave: (amt: number) => Promise<void> }) {
  const [v, setV] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`Borcu ${formatTL(open)}`} title={`Ödeme al: ${name}`} />
      <TextField id="odeme" label="Alınan para (TL)" inputMode="decimal" maxLength={12} value={v} onChange={(e) => setV(e.target.value)} style={{ fontSize: "1.6rem", fontWeight: 800 }} />
      <button type="button" className="ui-link" onClick={() => setV(String(open))}>Borcun hepsi: {formatTL(open)}</button>
      <p className="ui-note">Para en eski satıştan başlayarak düşülür.</p>
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton disabled={busy} onClick={async () => {
        const n = Math.round(num(v) * 100) / 100;
        if (!(n > 0)) { setError("Alınan parayı yaz."); return; }
        if (n > open + 0.001) { setError(`Borcu ${formatTL(open)}, fazlası yazılamaz.`); return; }
        setBusy(true); try { await onSave(n); } catch { setError("Kaydedemedim."); setBusy(false); }
      }}>Tamam</MainButton>
    </main>
  );
}

/** Boy başına satış fiyatı + WhatsApp'ta paylaşma. */
function FiyatListesi({ sizes, prices, suggested, free, hasStock, bizName, onSave, onCancel }: {
  sizes: string[]; prices: Record<string, number>; suggested: number | null; free: Record<string, number>; hasStock: boolean; bizName: string;
  onCancel: () => void; onSave: (p: Record<string, number>) => Promise<void>;
}) {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(sizes.map((k) => [k, prices[k] ? String(prices[k]) : ""])));
  const [withStock, setWithStock] = useState(hasStock);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const list = () => Object.fromEntries(sizes.filter((k) => num(v[k] ?? "") > 0).map((k) => [k, num(v[k])]));
  const text = () => {
    const p = list();
    return [`${bizName} · Şimşir fidanı fiyat listesi`, `Tarih: ${dayYear(todayStr())}`, "",
      ...sizes.filter((k) => p[k] && (!withStock || free[k] > 0)).map((k) => `${k}: ${formatTL(p[k])} / adet${withStock ? ` (${fmt(free[k])} adet var)` : ""}`)].join("\n");
  };
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Fidan" />
      <PageHeader sub="Boy başına adet fiyatı" title="Fiyat listesi" />
      {suggested && <p className="ui-note">Önerilen: {formatTL(suggested)} / adet (ortalama maliyet + kâr oranı). Boş bıraktığın boy listede çıkmaz.</p>}
      {sizes.map((k) => <TextField key={k} id={`fy_${k}`} label={`${k} (TL / adet)${hasStock ? ` · ${fmt(free[k] ?? 0)} adet var` : ""}`} inputMode="decimal" maxLength={10}
        placeholder={suggested ? String(suggested) : ""} value={v[k] ?? ""} onChange={(e) => { setSaved(false); setV({ ...v, [k]: e.target.value }); }} />)}
      {hasStock && <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Paylaşırken stok adedi yazılsın mı?</span>
        <div className="ui-chips"><Chip selected={withStock} onClick={() => setWithStock(true)}>Evet (stoğu olmayan boy çıkmaz)</Chip><Chip selected={!withStock} onClick={() => setWithStock(false)}>Hayır</Chip></div></div>}
      {error && <ErrorText>{error}</ErrorText>}
      {saved && <DoneCard message="Fiyat listesi kaydedildi." />}
      <MainButton secondary onClick={async () => { setError(""); try { await onSave(list()); setSaved(true); } catch { setError("Kaydedemedim, internet lazım."); } }}>Kaydet</MainButton>
      <div className="ui-sticky-bottom"><MainButton onClick={() => {
        if (!Object.keys(list()).length) { setError("En az bir boya fiyat yaz."); return; }
        window.open(`https://wa.me/?text=${encodeURIComponent(text())}`, "_blank");
      }}>WhatsApp’ta paylaş</MainButton></div>
    </main>
  );
}

/** Uyarılar tek kartta (aç / kapa). */
function Alerts({ items, open, setOpen }: { items: { key: string; red: boolean; text: React.ReactNode; onClick?: () => void }[]; open: boolean; setOpen: (v: boolean) => void }) {
  if (!items.length) return null;
  const red = items.some((i) => i.red);
  return (
    <div className={`ui-alerts${red ? " gecti" : ""}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}><span>Uyarılar ({items.length})</span><span>{open ? "Kapat ▲" : "Gör ▼"}</span></button>
      {open && <div className="list">{items.map((i) => (
        <button key={i.key} type="button" className={`ui-warn ${i.red ? "gecti" : "yakin"}`} style={{ textAlign: "left", font: "inherit", cursor: i.onClick ? "pointer" : "default" }} onClick={i.onClick}>
          <div className="ui-warn-row"><span>{i.text}</span></div>
        </button>))}</div>}
    </div>
  );
}

/** Yeni dikim: bir kerede dikilen fidan, istenirse birden çok tarlaya dağıtılır (her tarla ayrı parti olur). */
function DikimForm({ places, onSave, onCancel }: { places: Place[]; onCancel: () => void;
  onSave: (v: { name: string; planted: string | null; source: string; cost: number; prior: number; note: string }, parts: { place: string | null; qty: number }[]) => Promise<void> }) {
  const sources = useCList("sources");
  const [name, setName] = useState("");
  const [planted, setPlanted] = useState("");
  const [source, setSource] = useState("");
  const [cost, setCost] = useState("");
  const [prior, setPrior] = useState("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const keys = places.length ? places.map((p) => p.id) : ["yok"];
  const total = keys.reduce((t, k) => t + (Number(qty[k]) || 0), 0);
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Fidan" title="Yeni dikim" />
      <TextField id="dk_ad" label="Dikimin adı" placeholder="Örnek: 2025 yaz dikimi" maxLength={50} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="dk_tarih" label="Dikim tarihi (geçmiş tarih olabilir)" type="date" max={todayStr()} value={planted} onChange={(e) => setPlanted(e.target.value)} />
      <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Kaynak</span>
        <div className="ui-chips wrap">{sources.map((x) => <Chip key={x} selected={source === x} onClick={() => setSource(source === x ? "" : x)}>{x}</Chip>)}</div></div>
      <div className="ui-card ui-stack" style={{ gap: 8 }}>
        <b>Hangi tarlaya kaç fidan dikildi?</b>
        {places.length === 0 && <span className="ui-note" style={{ margin: 0 }}>Henüz tarla yok; tarlaları Tarlalar sekmesinden ekleyebilirsin. Şimdilik toplamı yaz.</span>}
        {keys.map((k) => <TextField key={k} id={`dk_${k}`} label={places.find((p) => p.id === k)?.name ?? "Toplam adet"} inputMode="numeric" maxLength={9}
          value={qty[k] ?? ""} onChange={(e) => setQty({ ...qty, [k]: e.target.value.replace(/\D/g, "") })} />)}
        {total > 0 && <span>Toplam: <b>{fmt(total)}</b> fidan</span>}
      </div>
      <TextField id="dk_alis" label="Fidan / çelik alış maliyeti, toplam TL (isteğe bağlı)" inputMode="decimal" maxLength={12} value={cost} onChange={(e) => setCost(e.target.value)} />
      <TextField id="dk_onceki" label="Uygulamadan önce bu dikime yapılan masraf, toplam TL (isteğe bağlı)" inputMode="decimal" maxLength={12} value={prior} onChange={(e) => setPrior(e.target.value)} />
      <p className="ui-note">Maliyetler tarlalara dikilen adede göre bölünür. Her tarla ayrı parti olarak takip edilir; “Dikime göre” görünümünde birlikte görünür.</p>
      <TextField id="dk_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        if (!name.trim()) { setError("Dikimin adını yaz."); return; }
        if (!(total > 0)) { setError("Kaç fidan dikildiğini yaz."); return; }
        await onSave({ name: name.trim(), planted: planted || null, source, cost: cost ? num(cost) : 0, prior: prior ? num(prior) : 0, note: note.trim() },
          keys.filter((k) => Number(qty[k]) > 0).map((k) => ({ place: k === "yok" ? null : k, qty: Number(qty[k]) })));
      }}>Kaydet</MainButton></div>
    </main>
  );
}

/** Taşı / saksıya al: fidanlar maliyetleriyle (fidan başı maliyet × adet) yeni yere geçer. */
function TasiForm({ lot, st, lots, places, sizes, onSave, onCancel }: { lot: Lot; st: LotStats; lots: Lot[]; places: Place[]; sizes: string[]; onCancel: () => void;
  onSave: (qty: number, size: string | null, target: string | null, newPlace: string | null) => Promise<void> }) {
  const [qty, setQty] = useState("");
  const [size, setSize] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [newPlace, setNewPlace] = useState<string | null>(null);
  const [error, setError] = useState("");
  const n = Number(qty);
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`${lot.name} · ${fmt(st.alive)} canlı`} title="Taşı / saksıya al" />
      <TextField id="ts_adet" label="Kaç fidan?" inputMode="numeric" maxLength={9} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} style={{ fontSize: "1.5rem", fontWeight: 800 }} />
      {sizes.length > 0 && <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Boy (isteğe bağlı)</span>
        <div className="ui-chips wrap">{sizes.map((x) => <Chip key={x} selected={size === x} onClick={() => setSize(size === x ? null : x)}>{x}</Chip>)}</div></div>}
      <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Nereye?</span>
        <div className="ui-chips wrap">
          <Chip selected={newPlace === "saksi" && !target} onClick={() => { setTarget(null); setNewPlace("saksi"); }}>Saksıya</Chip>
          {places.filter((p) => p.id !== lot.place_id).map((p) => <Chip key={p.id} selected={newPlace === p.id && !target} onClick={() => { setTarget(null); setNewPlace(p.id); }}>{p.name} (yeni parti)</Chip>)}
          {lots.map((l) => <Chip key={l.id} selected={target === l.id} onClick={() => { setTarget(l.id); setNewPlace(null); }}>{l.name}</Chip>)}
        </div></div>
      {n > 0 && st.alive > 0 && <div className="ui-done"><p>Taşınan maliyet: <b>{formatTL(Math.round(n * st.perPlant * 100) / 100)}</b> ({formatTL(Math.round(st.perPlant * 100) / 100)} × {fmt(n)})</p></div>}
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        if (!(n > 0)) { setError("Kaç fidan taşındığını yaz."); return; }
        if (n > st.alive) { setError(`Partide ${fmt(st.alive)} canlı fidan var.`); return; }
        if (!target && !newPlace) { setError("Nereye taşındığını seç."); return; }
        await onSave(n, size, target, newPlace);
      }}>Kaydet</MainButton></div>
    </main>
  );
}
