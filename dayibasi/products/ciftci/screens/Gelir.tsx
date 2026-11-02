"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { addEvent, deleteEvent, listEvents, updateEvent, type EventRow } from "@/core/events/api";
import { downloadXlsx } from "@/core/export/xlsx";
import { formatTL } from "@/core/ledger/api";
import { mutate } from "@/core/offline/store";
import { listPlaces, type Place } from "@/core/places/api";
import { BackButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import { config } from "../config";
import { dayText, GELIR, incomeOpen, num, todayStr } from "../kayit";
import { HistoryLink } from "../nav";
import { useGo, useOnActivate, useTabParams } from "@/core/shell/TabShell";
import { inSeason, SeasonPicker, useSeason } from "../sezon";
import { listLots, type Lot } from "@/core/lots/api";
import { FIDAN_SATIS, hasFidan, sizesOf } from "../fidan";

type Done = { message: string; undo?: () => Promise<void> } | null;

export default function Gelir() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const fidan = hasFidan(biz);
  const [form, setForm] = useState<{ type?: string; edit?: EventRow; prefill?: Record<string, string | number | boolean> } | null>(null);
  const [done, setDone] = useState<Done>(null);
  const { selected: S } = useSeason();
  const go = useGo();
  const load = useCallback(() => {
    listEvents(biz.id, GELIR).then((r) => setRows(r.slice().reverse())).catch(() => setRows([]));
    listPlaces(biz.id).then(setPlaces).catch(() => {});
    if (fidan) listLots(biz.id).then(setLots).catch(() => {});
  }, [biz.id, fidan]);
  useEffect(load, [load]);
  useOnActivate(load);
  const tp = useTabParams();
  useEffect(() => { if (tp.p.yeni) { setDone(null); setForm(tp.p.parti || tp.p.adet ? { type: FIDAN_SATIS, prefill: tp.p } : {}); } }, [tp.n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (form) return <GelirForm places={places} type={form.type} edit={form.edit} lots={fidan ? lots.filter((l) => l.status === "aktif") : []} sizes={fidan ? sizesOf(biz) : []} prefill={form.prefill} onCancel={() => setForm(null)}
    onDelete={form.edit ? async () => { const e = form.edit!; await deleteEvent(e.id); setDone({ message: `Sildim: ${String(e.data.type)} ${formatTL(Number(e.quantity))}.`, undo: () => mutate({ kind: "insert", table: "events", values: e }) }); setForm(null); load(); } : undefined}
    onSave={async (v) => {
      if (form.edit) {
        const before = { ...form.edit };
        await updateEvent(form.edit.id, v);
        setDone({ message: `Değiştirdim: ${formatTL(Number(v.quantity))}.`, undo: () => updateEvent(before.id, before) });
      } else {
        const e = await addEvent(biz.id, { kind: GELIR, person_id: null, ...v });
        setDone({ message: `Kaydettim: ${String(v.data.type)} ${formatTL(Number(v.quantity))}${incomeOpen(e) ? `, alınacak ${formatTL(incomeOpen(e))}` : ""}.`, undo: () => deleteEvent(e.id) });
      }
      setForm(null); load();
    }} />;

  const all = rows ?? [];
  const inY = all.filter((e) => inSeason(e.occurred_on, S));
  const y = S.name;
  const total = inY.reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  const open = inY.reduce((t, e) => t + incomeOpen(e), 0);
  const placeName = (id: string | null) => places.find((p) => p.id === id)?.name ?? "";

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub="Satış, destek, diğer" title="Gelir" right={<HistoryLink />} />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      <MainButton onClick={() => { setDone(null); setForm({}); }}>+ Gelir ekle</MainButton>
      <SeasonPicker onManage={() => go("sezonlar")} />
      <div className="ui-total">
        <span>{y} sezonu gelir</span><b>{formatTL(total)}</b>
        <div className="ui-total-row">
          <div><span>Alınan</span><strong>{formatTL(total - open)}</strong></div>
          <div><span>Alınacak</span><strong>{formatTL(open)}</strong></div>
        </div>
      </div>
      {rows && inY.length === 0 && <div className="ui-empty">{y} sezonunda gelir yok.</div>}
      {inY.map((e) => (
        <button key={e.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left", cursor: "pointer" }} onClick={() => { setDone(null); setForm({ edit: e }); }}>
          <b style={{ minWidth: 0 }}>{String(e.data.type)}{e.data.crop ? ` · ${String(e.data.crop)}` : ""}
            <small>{[dayText(e.occurred_on), placeName(e.place_id), e.data.qty ? `${Number(e.data.qty).toLocaleString("tr-TR")} ${String(e.data.unit)} × ${formatTL(Number(e.data.price))}` : "",
              e.data.buyer ? String(e.data.buyer) : "", incomeOpen(e) ? `alınacak ${formatTL(incomeOpen(e))}${e.data.due_on ? ` (${dayText(String(e.data.due_on))})` : ""}` : "", nameOf(e.created_by)].filter(Boolean).join(" · ")}</small></b>
          <strong>{formatTL(Number(e.quantity))}</strong>
        </button>
      ))}
      {inY.length > 0 && <MainButton secondary onClick={() => downloadXlsx(`gelir-${y.replace(/\s+/g, "-")}`, [{ name: "Gelir", title: `${biz.name} · Gelir · ${y} sezonu`, rows: [
        ["Tarih", "Tür", "Tarla", "Ürün", "Miktar", "Birim", "Fiyat (TL)", "Toplam (TL)", "Alıcı", "Alınan (TL)", "Alınacak (TL)", "Vade", "Giren"],
        ...inY.slice().reverse().map((e) => [e.occurred_on, String(e.data.type), placeName(e.place_id), String(e.data.crop ?? ""), Number(e.data.qty ?? 0) || "", String(e.data.unit ?? ""),
          Number(e.data.price ?? 0) || "", Number(e.quantity), String(e.data.buyer ?? ""), Number(e.data.received ?? 0), incomeOpen(e), String(e.data.due_on ?? ""), nameOf(e.created_by)]),
      ] }])}>Excel’e indir ({y})</MainButton>}
    </main>
  );
}

type GelirValues = { occurred_on: string; place_id: string | null; quantity: number; data: Record<string, unknown> };
function GelirForm({ places, type: t0, edit, lots = [], sizes = [], prefill = {}, onSave, onCancel, onDelete }: {
  places: Place[]; type?: string; edit?: EventRow; lots?: Lot[]; sizes?: string[]; prefill?: Record<string, string | number | boolean>; onSave: (v: GelirValues) => Promise<void>; onCancel: () => void; onDelete?: () => Promise<void>;
}) {
  const d = edit?.data ?? {};
  const [type, setType] = useState<string | null>((d.type as string) ?? t0 ?? null);
  const [day, setDay] = useState(edit?.occurred_on ?? todayStr());
  const [placeId, setPlaceId] = useState<string | null>(edit?.place_id ?? null);
  const [crop, setCrop] = useState(String(d.crop ?? ""));
  const [lotId, setLotId] = useState<string | null>((d.lot_id as string) ?? (prefill.parti ? String(prefill.parti) : null));
  const [size, setSize] = useState<string | null>((d.size as string) ?? (prefill.boy ? String(prefill.boy) : null));
  const [qty, setQty] = useState(d.qty ? String(d.qty) : prefill.adet ? String(prefill.adet) : "");
  const [unit, setUnit] = useState(String(d.unit ?? "kg"));
  const [price, setPrice] = useState(d.price ? String(d.price) : prefill.fiyat ? String(prefill.fiyat) : "");
  const [total, setTotal] = useState(edit ? String(edit.quantity) : "");
  const [buyer, setBuyer] = useState(String(d.buyer ?? prefill.alici ?? ""));
  const [pay, setPay] = useState<"hepsi" | "kismen" | "vadeli">(edit ? (incomeOpen(edit) === 0 ? "hepsi" : Number(d.received ?? 0) > 0 ? "kismen" : "vadeli") : "hepsi");
  const [received, setReceived] = useState(d.received ? String(d.received) : "");
  const [due, setDue] = useState(String(d.due_on ?? ""));
  const [error, setError] = useState("");
  const isPlant = type === FIDAN_SATIS;
  const isSale = type === "Hasat satışı" || isPlant;
  const autoTotal = isSale && num(qty) > 0 && num(price) > 0 ? num(qty) * num(price) : 0;

  if (!type) return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Yeni gelir" title="Ne geliri?" />
      <div className="ui-tiles">{[...(lots.length ? [FIDAN_SATIS] : []), ...config.incomeKinds].map((k) => <button key={k} type="button" onClick={() => setType(k)}><b>{k}</b></button>)}</div>
    </main>
  );

  const save = async () => {
    const tot = autoTotal || num(total);
    if (!(tot > 0)) { setError(isSale ? "Miktar ve fiyatı ya da toplamı yaz." : "Tutarı yaz."); return; }
    if (isPlant && !lotId) { setError("Hangi partiden satıldığını seç."); return; }
    if (isPlant && !(num(qty) > 0)) { setError("Kaç adet satıldığını yaz."); return; }
    const rec = pay === "hepsi" ? tot : pay === "kismen" ? num(received) : 0;
    if (pay === "kismen" && !(rec > 0 && rec < tot)) { setError("Alınan tutarı yaz (toplamdan az)."); return; }
    await onSave({ occurred_on: day, place_id: placeId, quantity: tot, data: {
      type, ...(crop.trim() ? { crop: crop.trim() } : {}), ...(isSale && num(qty) > 0 ? { qty: num(qty), unit: isPlant ? "adet" : unit, ...(num(price) > 0 ? { price: num(price) } : {}) } : {}),
      ...(isPlant ? { lot_id: lotId, ...(size ? { size } : {}) } : {}),
      ...(buyer.trim() ? { buyer: buyer.trim() } : {}), received: rec, ...(pay !== "hepsi" && due ? { due_on: due } : {}),
    } });
  };

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={() => (edit || t0 ? onCancel() : setType(null))} label="Geri" />
      <PageHeader sub={edit ? "Geliri düzenle" : "Yeni gelir"} title={type} />
      <TextField id="g_gun" label="Tarih" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      {places.length > 0 && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">Hangi tarla? (isteğe bağlı)</span>
          <div className="ui-chips wrap">
            <Chip selected={!placeId} onClick={() => setPlaceId(null)}>Genel</Chip>
            {places.map((p) => <Chip key={p.id} selected={placeId === p.id} onClick={() => { setPlaceId(p.id); if (!crop && p.custom?.urun) setCrop(p.custom.urun); }}>{p.name}</Chip>)}
          </div>
        </div>
      )}
      {isPlant && (
        <>
          <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Hangi parti?</span>
            <div className="ui-chips wrap">{lots.map((l) => <Chip key={l.id} selected={lotId === l.id} onClick={() => { setLotId(l.id); if (l.place_id) setPlaceId(l.place_id); }}>{l.name}</Chip>)}</div></div>
          {sizes.length > 0 && <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Boy</span>
            <div className="ui-chips wrap">{sizes.map((x) => <Chip key={x} selected={size === x} onClick={() => setSize(size === x ? null : x)}>{x}</Chip>)}</div></div>}
          <div className="ui-quickadd">
            <TextField id="g_adet" label="Kaç adet?" inputMode="numeric" maxLength={9} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
            <TextField id="g_afiyat" label="Adet fiyatı (TL)" inputMode="decimal" maxLength={10} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </>
      )}
      {isSale && !isPlant && (
        <>
          <TextField id="g_urun" label="Ürün" placeholder="Örnek: Zeytin" maxLength={40} value={crop} onChange={(e) => setCrop(e.target.value)} />
          <div className="ui-quickadd">
            <TextField id="g_miktar" label="Miktar" inputMode="decimal" placeholder="4500" maxLength={12} value={qty} onChange={(e) => setQty(e.target.value)} />
            <TextField id="g_fiyat" label="Birim fiyat (TL)" inputMode="decimal" placeholder="38" maxLength={12} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="ui-chips">{config.units.map((u) => <Chip key={u} selected={u === unit} onClick={() => setUnit(u)}>{u}</Chip>)}</div>
        </>
      )}
      {autoTotal ? <div className="ui-done"><p>Toplam: <b>{formatTL(autoTotal)}</b></p></div>
        : <TextField id="g_toplam" label={isSale ? "ya da toplam tutar (TL)" : "Tutar (TL)"} inputMode="decimal" maxLength={12} value={total} onChange={(e) => setTotal(e.target.value)} style={{ fontSize: "1.6rem", fontWeight: 800 }} />}
      <TextField id="g_alici" label={isSale ? "Kime sattın? (isteğe bağlı)" : "Kimden? (isteğe bağlı)"} placeholder={isSale ? "Örnek: Tüccar Ahmet, Kooperatif" : "Örnek: Tarım Müdürlüğü"} maxLength={60} value={buyer} onChange={(e) => setBuyer(e.target.value)} />
      <div className="ui-stack" style={{ gap: 8 }}>
        <span className="ui-label">Para alındı mı?</span>
        <div className="ui-tabs" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {([["hepsi", "Hepsi alındı"], ["kismen", "Bir kısmı"], ["vadeli", "Sonra alınacak"]] as const).map(([k, l]) =>
            <button key={k} type="button" aria-selected={pay === k} onClick={() => setPay(k)}>{l}</button>)}
        </div>
        {pay === "kismen" && <TextField id="g_alinan" label="Şimdi alınan (TL)" inputMode="decimal" maxLength={12} value={received} onChange={(e) => setReceived(e.target.value)} />}
        {pay !== "hepsi" && <TextField id="g_vade" label="Kalanı ne zaman alınacak? (vade, isteğe bağlı)" type="date" value={due} onChange={(e) => setDue(e.target.value)} />}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Bu geliri sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={save}>Kaydet</MainButton></div>
    </main>
  );
}
