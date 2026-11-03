"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { listDues, remaining, type Due } from "@/core/dues/api";
import { listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, owed, type Expense } from "@/core/expenses/api";
import { downloadXlsx } from "@/core/export/xlsx";
import { listItems, type Item } from "@/core/inventory/api";
import { formatTL } from "@/core/ledger/api";
import { listPlaces, type Place } from "@/core/places/api";
import { useGo, useOnActivate } from "@/core/shell/TabShell";
import { BackButton, MainButton } from "@/core/ui";
import { useCList } from "../lists";
import { branchOf, breakEven, dayYear, GELIR, incomeOpen, ISLEM, VERIM } from "../kayit";
import { inSeason, SeasonPicker, useSeason } from "../sezon";

const tr = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;
const monthName = (m: string) => new Date(m + "-15T12:00:00").toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

/** Sezon raporu: ekranda okunur, "PDF olarak kaydet" ile yazdırılır; tüm sezon tek Excel dosyası. */
export default function Rapor() {
  const biz = useBusiness();
  const go = useGo();
  const { selected: S, seasons } = useSeason();
  const [exp, setExp] = useState<Expense[]>([]);
  const [ev, setEv] = useState<EventRow[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const load = useCallback(() => {
    listExpenses(biz.id).then(setExp).catch(() => {});
    Promise.all([listEvents(biz.id, GELIR), listEvents(biz.id, VERIM), listEvents(biz.id, ISLEM)]).then(([a, b, c]) => setEv([...a, ...b, ...c])).catch(() => {});
    listPlaces(biz.id).then(setPlaces).catch(() => {});
    listDues(biz.id).then(setDues).catch(() => {});
    listItems(biz.id).then(setItems).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  const E = exp.filter((e) => inSeason(e.occurred_on, S)).sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
  const G = ev.filter((e) => e.kind === GELIR && inSeason(e.occurred_on, S)).sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
  const V = ev.filter((e) => e.kind === VERIM && String(e.data.year) === S.name);
  const OPS = ev.filter((e) => e.kind === ISLEM && inSeason(e.occurred_on, S)).sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
  const masraf = E.reduce((t, e) => t + e.amount, 0);
  const gelir = G.reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  const alinacak = G.reduce((t, e) => t + incomeOpen(e), 0);
  const cats = [...new Set(E.map((e) => e.category))].map((c) => ({ c, t: E.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) })).sort((a, b) => b.t - a.t);
  const months = [...new Set(E.map((e) => e.occurred_on.slice(0, 7)))].sort().map((m) => ({ m, t: E.filter((e) => e.occurred_on.startsWith(m)).reduce((s, e) => s + e.amount, 0) }));
  const maxC = Math.max(1, ...cats.map((x) => x.t)), maxM = Math.max(1, ...months.map((x) => x.t));
  const pName = (id: string | null) => places.find((p) => p.id === id)?.name ?? "Genel";
  const fields = [...places.map((p) => p.id), null].map((id) => {
    const m = E.filter((e) => e.place_id === id).reduce((t, e) => t + e.amount, 0);
    const g = G.filter((e) => e.place_id === id).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
    const p = places.find((x) => x.id === id); const d = Number(p?.custom?.donum) || 0;
    const v = V.filter((e) => e.place_id === id).map((e) => `${Number(e.quantity).toLocaleString("tr-TR")} ${String(e.data.unit)}`).join(", ");
    const b = breakEven(m, V.filter((e) => e.place_id === id));
    return { id, name: pName(id), m, g, kar: g - m, d, v, be: b ? `${formatTL(Math.round(b.perUnit * 100) / 100)}/${b.unit}` : "" };
  }).filter((x) => x.m || x.g || x.v);
  // Geçen sezon: başlangıcı bundan önce olan en yakın sezon; yoksa aynı tarihlerin bir yıl öncesi
  const yr = (d: string, k: number) => `${Number(d.slice(0, 4)) + k}${d.slice(4)}`;
  const P = seasons.filter((x) => x.start < S.start).sort((a, b) => b.start.localeCompare(a.start))[0] ?? { id: "_", name: "Geçen yıl", start: yr(S.start, -1), end: yr(S.end, -1) };
  const EP = exp.filter((e) => inSeason(e.occurred_on, P)), GP = ev.filter((e) => e.kind === GELIR && inSeason(e.occurred_on, P));
  const masrafP = EP.reduce((t, e) => t + e.amount, 0), gelirP = GP.reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  const VP = ev.filter((e) => e.kind === VERIM && String(e.data.year) === P.name);
  const crops = [...new Set([...V, ...VP].map((e) => `${String(e.data.crop || "")}|${String(e.data.unit)}`))];
  const vSum = (L: EventRow[], c: string) => L.filter((e) => `${String(e.data.crop || "")}|${String(e.data.unit)}` === c).reduce((t, e) => t + Number(e.quantity), 0);
  const hasPrev = masrafP > 0 || gelirP > 0 || VP.length > 0;
  const pct = (a: number, b: number) => (b ? `${a >= b ? "▲" : "▼"} %${Math.abs(Math.round(((a - b) / b) * 100))}` : "");
  const cmpRows: [string, number, number, boolean][] = [["Gelir", gelir, gelirP, true], ["Masraf", masraf, masrafP, false], ["Kâr / zarar", gelir - masraf, gelirP - masrafP, true]];
  const isler = useCList("isler");
  const multi = isler.length > 1;
  const bOf = (e: { data?: Record<string, unknown> | null; place_id: string | null }) => { const b = branchOf(e, places); return b && isler.includes(b) ? b : "Genel"; };
  const branches = multi ? [...isler, "Genel"].map((b) => {
    const m = E.filter((e) => bOf(e) === b).reduce((t, e) => t + e.amount, 0);
    const g = G.filter((e) => bOf(e) === b).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
    return { b, m, g, kar: g - m };
  }).filter((x) => x.m || x.g) : [];
  const borc = dues.filter((d) => d.direction === "borc").reduce((t, d) => t + remaining(d), 0) + exp.reduce((t, e) => t + owed(e), 0);
  const alacak = dues.filter((d) => d.direction === "alacak").reduce((t, d) => t + remaining(d), 0) + ev.filter((e) => e.kind === GELIR).reduce((t, e) => t + incomeOpen(e), 0);

  const excel = () => downloadXlsx(`${biz.name}-${S.name}-sezon-raporu`.replace(/\s+/g, "-"), [
    { name: "Özet", title: `${biz.name} · ${S.name} sezonu (${tr(S.start)} – ${tr(S.end)})`, rows: [
      ["Kalem", "Tutar (TL)"], ["Gelir", gelir], ["Masraf", masraf], ["Kâr / zarar", gelir - masraf], ["Alınacak (vadeli satış)", alinacak], [],
      ["Masraf türü", "Toplam (TL)"], ...cats.map((x) => [x.c, x.t]), ["Toplam masraf", masraf], [],
      ["Ay", "Masraf (TL)"], ...months.map((x) => [monthName(x.m), x.t]),
      ...(hasPrev ? [[], ["Geçen sezonla", S.name, P.name], ...cmpRows.map(([k, a, b]) => [k, a, b]), ...crops.map((c) => { const [crop, unit] = c.split("|"); return [`Verim ${crop} (${unit})`, vSum(V, c), vSum(VP, c)]; })] : []),
      ...(multi ? [[], ["İş", "Masraf (TL)", "Gelir (TL)", "Kâr (TL)"], ...branches.map((x) => [x.b === "Genel" ? "Genel (ortak)" : x.b, x.m, x.g, x.b === "Genel" ? "" : x.kar])] : []),
    ] },
    { name: "Tarlalar", title: `Tarla tarla · ${S.name}`, rows: [["Tarla", "Dönüm", "Masraf (TL)", "Gelir (TL)", "Kâr (TL)", "Dönüm başı masraf (TL)", "Verim", "Başabaş fiyatı"],
      ...fields.map((f) => [f.name, f.d || "", f.m, f.g, f.kar, f.d ? Math.round(f.m / f.d) : "", f.v, f.be])] },
    { name: "Masraflar", title: `Masraflar · ${S.name}`, rows: [["Tarih", "Tür", "Tarla", "Tutar (TL)", "Not", "Veresiye (kime)", ...(multi ? ["İş"] : [])],
      ...E.map((e) => [tr(e.occurred_on), e.category, pName(e.place_id), e.amount, e.note ?? "", e.on_credit ? e.vendor ?? "" : "", ...(multi ? [bOf(e)] : [])]), ["Toplam", "", "", masraf]] },
    ...(multi ? isler.concat("Genel").filter((b) => E.some((e) => bOf(e) === b)).map((b) => ({ name: `${b} masrafı`.slice(0, 31), title: `${b === "Genel" ? "Genel (ortak)" : b} masrafları · ${S.name}`, rows: [["Tarih", "Tür", "Tarla", "Tutar (TL)", "Not"],
      ...E.filter((e) => bOf(e) === b).map((e) => [tr(e.occurred_on), e.category, pName(e.place_id), e.amount, e.note ?? ""]), ["Toplam", "", "", E.filter((e) => bOf(e) === b).reduce((t, e) => t + e.amount, 0)]] })) : []),
    { name: "Gelir", title: `Gelir · ${S.name}`, rows: [["Tarih", "Tür", "Tarla", "Ürün", "Miktar", "Birim", "Toplam (TL)", "Alıcı", "Alınacak (TL)"],
      ...G.map((e) => [tr(e.occurred_on), String(e.data.type), pName(e.place_id), String(e.data.crop ?? ""), Number(e.data.qty ?? 0) || "", String(e.data.unit ?? ""), Number(e.quantity), String(e.data.buyer ?? ""), incomeOpen(e)]),
      ["Toplam", "", "", "", "", "", gelir, "", alinacak]] },
    { name: "Tarla işleri", title: `Tarla günlüğü · ${S.name}`, rows: [["Tarih", "Tarla", "İşlem", "Ürün / ilaç", "Doz", "Bekleme (gün)", "Not"],
      ...OPS.map((e) => [tr(e.occurred_on), pName(e.place_id), String(e.data.type), String(e.data.product ?? ""), String(e.data.dose ?? ""), Number(e.data.wait_days ?? 0) || "", String(e.data.note ?? "")])] },
    { name: "Depo", title: `Depo · ${new Date().toLocaleDateString("tr-TR")}`, rows: [["Malzeme", "Tür", "Miktar", "Birim"], ...items.map((i) => [i.name, i.category, i.quantity, i.unit])] },
  ]);

  return (
    <main className="ui-stack rapor">
      <div className="no-print ui-stack">
        <BackButton onClick={() => go("ozet")} label="Özet" />
        <SeasonPicker onManage={() => go("sezonlar")} />
        <div className="ui-seg">
          <button type="button" onClick={() => window.print()}>PDF olarak kaydet</button>
          <button type="button" onClick={excel}>Excel (tüm sezon)</button>
        </div>
        <p className="ui-note">PDF: açılan pencerede “PDF olarak kaydet” ya da iPhone’da Paylaş → Yazdır → iki parmakla büyüt → Paylaş.</p>
      </div>

      <header className="rapor-head">
        <div><small>Sezon raporu</small><h1>{biz.name}</h1><span>{S.name} · {dayYear(S.start)} – {dayYear(S.end)}</span></div>
        <small>Hazırlandı: {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</small>
      </header>

      <div className="rapor-kpi">
        <div><span>Gelir</span><b>{formatTL(gelir)}</b></div>
        <div><span>Masraf</span><b>{formatTL(masraf)}</b></div>
        <div className={gelir - masraf >= 0 ? "pos" : "neg"}><span>Kâr / zarar</span><b>{formatTL(gelir - masraf)}</b></div>
      </div>
      {(alinacak > 0 || borc > 0 || alacak > 0) && <p className="ui-note">Alınacak (bu sezonun satışları): {formatTL(alinacak)} · Bugün toplam borç: {formatTL(borc)} · alacak: {formatTL(alacak)}</p>}

      {hasPrev && (
        <>
          <h2 className="ui-section">Geçen sezonla ({P.name})</h2>
          <div className="rapor-table">
            <table>
              <thead><tr><th></th><th>{S.name}</th><th>{P.name}</th><th>Fark</th></tr></thead>
              <tbody>
                {cmpRows.map(([k, a, b]) => <tr key={k}><td>{k}</td><td>{formatTL(a)}</td><td>{formatTL(b)}</td><td>{pct(a, b)}</td></tr>)}
                {crops.map((c) => { const [crop, unit] = c.split("|"); const a = vSum(V, c), b = vSum(VP, c); return <tr key={c}><td>Verim {crop}</td><td>{a.toLocaleString("tr-TR")} {unit}</td><td>{b.toLocaleString("tr-TR")} {unit}</td><td>{pct(a, b)}</td></tr>; })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {multi && (
        <>
          <h2 className="ui-section">İş iş</h2>
          <div className="rapor-table">
            <table>
              <thead><tr><th>İş</th><th>Masraf</th><th>Gelir</th><th>Kâr</th></tr></thead>
              <tbody>{branches.map((x) => <tr key={x.b}><td>{x.b === "Genel" ? "Genel (ortak)" : x.b}</td><td>{formatTL(x.m)}</td><td>{formatTL(x.g)}</td><td className={x.kar < 0 && x.b !== "Genel" ? "neg" : ""}>{x.b === "Genel" ? "—" : formatTL(x.kar)}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="ui-note">Genel (ortak): hiçbir işe ayrılmamış masraflar. Fidan maliyetine sadece “Fidan” seçilen masraflar girer.</p>
        </>
      )}

      <h2 className="ui-section">Masraf türleri</h2>
      <div className="ui-card ui-stack" style={{ gap: 8 }}>
        {cats.length === 0 && <span className="ui-note">Masraf yok.</span>}
        {cats.map((x) => (
          <div key={x.c} className="rapor-bar"><span>{x.c}</span><i style={{ width: `${(x.t / maxC) * 100}%` }} /><b>{formatTL(x.t)}</b></div>
        ))}
      </div>

      <h2 className="ui-section">Ay ay masraf</h2>
      <div className="ui-card ui-stack" style={{ gap: 8 }}>
        {months.map((x) => <div key={x.m} className="rapor-bar"><span>{monthName(x.m)}</span><i className="m" style={{ width: `${(x.t / maxM) * 100}%` }} /><b>{formatTL(x.t)}</b></div>)}
      </div>

      <h2 className="ui-section">Tarla tarla</h2>
      <div className="rapor-table">
        <table>
          <thead><tr><th>Tarla</th><th>Masraf</th><th>Gelir</th><th>Kâr</th><th>Dönüm başı</th><th>Verim</th><th>Başabaş</th></tr></thead>
          <tbody>{fields.map((f) => <tr key={f.name}><td>{f.name}</td><td>{formatTL(f.m)}</td><td>{formatTL(f.g)}</td><td className={f.kar < 0 ? "neg" : ""}>{formatTL(f.kar)}</td><td>{f.d ? formatTL(Math.round(f.m / f.d)) : "—"}</td><td>{f.v || "—"}</td><td>{f.be || "—"}</td></tr>)}</tbody>
        </table>
      </div>

      <h2 className="ui-section">Gelir</h2>
      <div className="rapor-table">
        <table>
          <thead><tr><th>Tarih</th><th>Tür</th><th>Tarla / ürün</th><th>Alıcı</th><th>Tutar</th></tr></thead>
          <tbody>{G.map((e) => <tr key={e.id}><td>{tr(e.occurred_on)}</td><td>{String(e.data.type)}</td><td>{[pName(e.place_id), String(e.data.crop ?? "")].filter(Boolean).join(" · ")}</td><td>{String(e.data.buyer ?? "")}</td><td>{formatTL(Number(e.quantity))}</td></tr>)}</tbody>
        </table>
      </div>

      <h2 className="ui-section">Masraflar</h2>
      <div className="rapor-table">
        <table>
          <thead><tr><th>Tarih</th><th>Tür</th><th>Tarla</th>{multi && <th>İş</th>}<th>Not</th><th>Tutar</th></tr></thead>
          <tbody>{E.map((e) => <tr key={e.id}><td>{tr(e.occurred_on)}</td><td>{e.category}</td><td>{pName(e.place_id)}</td>{multi && <td>{bOf(e)}</td>}<td>{e.note ?? ""}</td><td>{formatTL(e.amount)}</td></tr>)}</tbody>
          <tfoot><tr><td colSpan={multi ? 5 : 4}>Toplam</td><td>{formatTL(masraf)}</td></tr></tfoot>
        </table>
      </div>

      {OPS.length > 0 && (
        <>
          <h2 className="ui-section">Tarla işleri</h2>
          <div className="rapor-table">
            <table>
              <thead><tr><th>Tarih</th><th>Tarla</th><th>İşlem</th><th>Ürün / ilaç · doz</th></tr></thead>
              <tbody>{OPS.map((e) => <tr key={e.id}><td>{tr(e.occurred_on)}</td><td>{pName(e.place_id)}</td><td>{String(e.data.type)}</td><td>{[e.data.product, e.data.dose].filter(Boolean).map(String).join(" · ")}</td></tr>)}</tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
