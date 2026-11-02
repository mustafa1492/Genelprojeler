"use client";
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
import { ageText, FIDAN_SATIS, FOTO, lotStats, marginOf, SAYIM, SIPARIS, sizesOf, suggestedPrice, type LotStats } from "../fidan";
import { addDays, dayText, dayYear, GELIR, ISLEM, num, todayStr } from "../kayit";
import { HistoryLink } from "../nav";

type Done = { message: string; undo?: () => Promise<void> } | null;
type View = { v: "list" } | { v: "lot"; id: string } | { v: "lotForm"; edit?: Lot } | { v: "sayim"; id: string } | { v: "islem"; id: string }
  | { v: "siparis"; edit?: EventRow } | { v: "foto"; id: string } | { v: "fotoGor"; url: string; back: string } | { v: "hatirlat"; id: string } | { v: "boylar" } | { v: "kar" };
const BAKIM = ["Budama", "Güve kontrolü", "İlaçlama", "Gübreleme", "Sulama", "Yaprak hastalığı kontrolü", "Diğer"];
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
    Promise.all([listEvents(biz.id, SAYIM), listEvents(biz.id, SIPARIS), listEvents(biz.id, FOTO), listEvents(biz.id, GELIR), listEvents(biz.id, ISLEM)])
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
  const stats = (l: Lot) => lotStats(l, all, counts, sales, exp);
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
    onSave={async (day, alive, bySize, note) => {
      const e = await addEvent(biz.id, { kind: SAYIM, occurred_on: day, place_id: lotV.place_id, person_id: null, quantity: alive, data: { lot_id: lotV.id, alive, sizes: bySize, ...(note ? { note } : {}) } });
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
        {dueOf(lotV).filter((d) => d.next <= addDays(todayStr(), 3)).map((d) => (
          <div key={d.type} className={`ui-warn ${d.late ? "gecti" : "yakin"}`}><div className="ui-warn-row"><span>{d.type}: {d.late ? "zamanı geldi" : "yaklaşıyor"} ({d.next.slice(0, 4) === todayStr().slice(0, 4) ? dayText(d.next) : dayYear(d.next)})</span></div></div>
        ))}
        <div className="ui-total">
          <span>Canlı fidan</span><b>{fmt(st.alive)} adet</b>
          <div className="ui-total-row">
            <div><span>Fidan başı maliyet</span><strong>{st.alive ? formatTL(Math.round(st.perPlant * 100) / 100) : "—"}</strong></div>
            <div><span>Toplam maliyet</span><strong>{formatTL(Math.round(st.cost))}</strong></div>
          </div>
        </div>
        <Card><InfoRows rows={[
          ["Dikilen", `${fmt(lotV.initial_count)} adet${lotV.source ? ` · ${lotV.source}` : ""}`],
          ["Satılan", `${fmt(st.sold)} adet · ${formatTL(st.income)}`],
          ["Fire (ölen / kayıp)", `${fmt(st.dead)} adet · %${st.firePct.toFixed(1)}`],
          ["Son sayım", st.counted ? dayYear(st.counted) : "Sayım yok (dikilen adet esas)"],
          ["Maliyet dökümü", `partiye ${formatTL(Math.round(st.costDirect))}${st.costShare ? ` + parselden pay ${formatTL(Math.round(st.costShare))}` : ""}`],
          ["Kâr / zarar (şimdiye kadar)", formatTL(Math.round(st.income - st.cost))],
          ["Önerilen satış fiyatı", suggestedPrice(st.perPlant, margin) ? `${formatTL(suggestedPrice(st.perPlant, margin)!)} / adet (maliyet + %${margin})` : "Kâr oranı girilmedi"],
        ]} /></Card>
        {Object.keys(st.bySize).length > 0 && (
          <div className="ui-card ui-stack" style={{ gap: 8 }}>
            <b>Boy dağılımı (son sayım)</b>
            {sizes.filter((s) => st.bySize[s] != null).map((s) => <div key={s} className="rapor-bar"><span>{s}</span><i style={{ width: `${(st.bySize[s] / maxS) * 100}%` }} /><b>{fmt(st.bySize[s])}</b></div>)}
          </div>
        )}
        <div className="ui-tiles">
          <button type="button" onClick={() => { setDone(null); setView({ v: "sayim", id: lotV.id }); }}><b>+ Sayım</b><small>canlı adet, boylar</small></button>
          <button type="button" onClick={() => { setDone(null); setView({ v: "islem", id: lotV.id }); }}><b>+ Bakım / işlem</b><small>budama, güve, ilaç…</small></button>
          <button type="button" onClick={() => go("masraf", { yeni: 1, ...(lotV.place_id ? { tarla: lotV.place_id } : {}), parti: lotV.id })}><b>+ Masraf</b><small>bu partiye</small></button>
          <button type="button" onClick={() => go("gelir", { yeni: 1, parti: lotV.id })}><b>+ Satış</b><small>adet × boy × fiyat</small></button>
          <button type="button" onClick={() => { setDone(null); setView({ v: "foto", id: lotV.id }); }}><b>+ Fotoğraf</b><small>gelişim günlüğü</small></button>
          <button type="button" onClick={() => { setDone(null); setView({ v: "hatirlat", id: lotV.id }); }}><b>Hatırlatıcılar</b><small>her kaç günde bir</small></button>
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
  const S = active.map(stats);
  const totAlive = S.reduce((t, s) => t + s.alive, 0);
  const totCost = S.reduce((t, s) => t + s.cost, 0);
  const ready: Record<string, number> = {};
  for (const s of S) for (const [k, v] of Object.entries(s.bySize)) ready[k] = (ready[k] ?? 0) + v;
  const reserved: Record<string, number> = {};
  for (const o of orders.filter((o) => o.data.status === "bekliyor")) { const k = String(o.data.size ?? ""); if (k) reserved[k] = (reserved[k] ?? 0) + Number(o.data.qty ?? 0); }
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
    { name: "Siparişler", title: "Siparişler", rows: [["Tarih", "Müşteri", "Parti", "Boy", "Adet", "Fiyat (TL)", "Teslim", "Durum"],
      ...orders.map((o) => [dayYear(o.occurred_on), String(o.data.customer ?? ""), find(String(o.data.lot_id ?? ""))?.name ?? "", String(o.data.size ?? ""), Number(o.data.qty ?? 0), Number(o.data.price ?? 0) || "", o.data.due_on ? dayYear(String(o.data.due_on)) : "", String(o.data.status)])] },
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
        <button type="button" onClick={() => { setDone(null); setView({ v: "lotForm" }); }}>+ Parti ekle</button>
        <button type="button" onClick={() => { setDone(null); setView({ v: "siparis" }); }}>+ Sipariş</button>
      </div>

      {dues.map((d) => (
        <button key={d.lot.id + d.type} type="button" className={`ui-warn ${d.late ? "gecti" : "yakin"}`} style={{ textAlign: "left", font: "inherit" }} onClick={() => setView({ v: "lot", id: d.lot.id })}>
          <div className="ui-warn-row"><span><b>{d.lot.name}</b>: {d.type} {d.late ? "zamanı geldi" : `· ${dayText(d.next)}`}</span></div>
        </button>
      ))}

      {Object.keys(ready).length > 0 && (
        <div className="ui-card ui-stack" style={{ gap: 6 }}>
          <b>Satışa hazır (boylara göre)</b>
          <div className="ui-rows">{sizes.filter((k) => ready[k] != null).map((k) => <div key={k}><span>{k}</span><span>{fmt(ready[k])} adet{reserved[k] ? ` · ${fmt(reserved[k])} siparişte` : ""}</span></div>)}</div>
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
                  <span className="ui-note" style={{ margin: 0 }}>{[o.data.size, find(String(o.data.lot_id ?? ""))?.name, o.data.price ? `${formatTL(Number(o.data.price))}/adet` : "", o.data.due_on ? `teslim ${dayText(String(o.data.due_on))}` : ""].filter(Boolean).map(String).join(" · ")}</span>
                </button>
                <div className="ui-seg">
                  <button type="button" onClick={async () => {
                    await updateEvent(o.id, { data: { ...o.data, status: "teslim" } });
                    go("gelir", { yeni: 1, ...(o.data.lot_id ? { parti: String(o.data.lot_id) } : {}), ...(o.data.size ? { boy: String(o.data.size) } : {}), adet: Number(o.data.qty), ...(o.data.price ? { fiyat: Number(o.data.price) } : {}), alici: String(o.data.customer) });
                  }}>Teslim et → satış</button>
                  <button type="button" onClick={async () => { await updateEvent(o.id, { data: { ...o.data, status: "iptal" } }); setDone({ message: "Sipariş iptal.", undo: () => updateEvent(o.id, { data: o.data }) }); load(); }}>İptal</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      <h2 className="ui-section">Partiler</h2>
      {lots && all.length === 0 && <div className="ui-empty">Henüz parti yok. Önceki yıllarda diktiklerini de dikim tarihiyle ekleyebilirsin.</div>}
      {all.map((l) => { const s = stats(l); return (
        <button key={l.id} type="button" className="ui-card ui-stack" style={{ gap: 6, opacity: l.status === "bitti" ? 0.6 : 1 }} onClick={() => { setDone(null); setView({ v: "lot", id: l.id }); }}>
          <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b style={{ fontSize: "1.1rem" }}>{l.name}</b>
            {l.status === "bitti" ? <StatusPill status="bekliyor">Bitti</StatusPill> : <span className="ui-amount">{fmt(s.alive)} adet</span>}</span>
          <span className="ui-note" style={{ margin: 0 }}>{[place(l.place_id), l.planted_on ? dayYear(l.planted_on) : "", ageText(s.ageMonths), `fire %${s.firePct.toFixed(1)}`, s.alive ? `fidan başı ${formatTL(Math.round(s.perPlant * 100) / 100)}` : "", suggestedPrice(s.perPlant, margin) ? `öneri ${formatTL(suggestedPrice(s.perPlant, margin)!)}` : ""].filter(Boolean).join(" · ")}</span>
        </button>); })}
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
  const [placeId, setPlaceId] = useState<string | null>(edit?.place_id ?? null);
  const [planted, setPlanted] = useState(edit?.planted_on ?? "");
  const [count, setCount] = useState(edit ? String(edit.initial_count) : "");
  const [source, setSource] = useState(edit?.source ?? "");
  const [initialCost, setInitialCost] = useState(edit?.data.initial_cost ? String(edit.data.initial_cost) : "");
  const [prior, setPrior] = useState(edit?.data.prior_cost ? String(edit.data.prior_cost) : "");
  const [note, setNote] = useState(edit?.note ?? "");
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
        <div className="ui-chips wrap">{["Çelik", "Fide", "Tohum", "Hazır fidan"].map((s) => <Chip key={s} selected={source === s} onClick={() => setSource(source === s ? "" : s)}>{s}</Chip>)}</div></div>
      <TextField id="l_alis" label="Fidan / çelik alış maliyeti, toplam TL (isteğe bağlı)" inputMode="decimal" maxLength={12} value={initialCost} onChange={(e) => setInitialCost(e.target.value)} />
      <TextField id="l_onceki" label="Uygulamadan önce bu partiye yapılan masraf, toplam TL (isteğe bağlı)" inputMode="decimal" maxLength={12} value={prior} onChange={(e) => setPrior(e.target.value)} />
      <p className="ui-note">Geçmiş yılların masraflarını tek tek girmek yerine burada toplam olarak yazabilirsin; fidan başı maliyete eklenir.</p>
      <TextField id="l_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Partiyi sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const n = Number(count);
        if (!name.trim()) { setError("Partinin adını yaz."); return; }
        if (!(n > 0)) { setError("Kaç adet dikildiğini yaz."); return; }
        await onSave({ name: name.trim(), place_id: placeId, planted_on: planted || null, initial_count: n, source: source || null, note: note.trim() || null,
          data: { ...(edit?.data ?? {}), initial_cost: initialCost ? num(initialCost) : 0, prior_cost: prior ? num(prior) : 0 } });
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function SayimForm({ lot, st, sizes, onSave, onCancel }: { lot: Lot; st: LotStats; sizes: string[]; onCancel: () => void;
  onSave: (day: string, alive: number, bySize: Record<string, number>, note: string) => Promise<void> }) {
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
      <TextField id="sy_not" label="Not (ör. ölenlerin sebebi)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const alive = sum || Number(total);
        if (!(alive >= 0) || (!sum && !total)) { setError("Boylara göre ya da toplam adet yaz."); return; }
        const bySize = Object.fromEntries(Object.entries(vals).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)]));
        await onSave(day, alive, bySize, note.trim());
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function BakimForm({ lot, onSave, onCancel }: { lot: Lot; onCancel: () => void; onSave: (day: string, type: string, data: Record<string, unknown>) => Promise<void> }) {
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
      <TextField id="sp_teslim" label="Teslim günü (isteğe bağlı)" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <TextField id="sp_not" label="Not (isteğe bağlı)" placeholder="Örnek: saksılı, kapora alındı" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Siparişi sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        if (!customer.trim()) { setError("Müşteriyi yaz."); return; }
        if (!(Number(qty) > 0)) { setError("Adedi yaz."); return; }
        await onSave({ customer: customer.trim(), lot_id: lotId, size, qty: Number(qty), ...(price ? { price: num(price) } : {}), ...(due ? { due_on: due } : {}), ...(note.trim() ? { note: note.trim() } : {}) }, todayStr());
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
