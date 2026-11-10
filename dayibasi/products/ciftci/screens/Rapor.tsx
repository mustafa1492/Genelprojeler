"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { listDues, remaining, type Due } from "@/core/dues/api";
import { listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, owed, type Expense } from "@/core/expenses/api";
import { downloadBook, xDate } from "@/core/export/xlsx";
import { fmtFx, useRates } from "@/core/fx";
import { fxFor, gelirSheet, masrafSheet, ozetSheet } from "../excel";
import { listItems, type Item } from "@/core/inventory/api";
import { formatTL, formatTLRaw } from "@/core/ledger/api";
import { listPlaces, type Place } from "@/core/places/api";
import { useGo, useOnActivate, useBack } from "@/core/shell/TabShell";
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
  const back = useBack();
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
  const { doviz, conv } = useRates(useMemo(() => [...exp.map((e) => e.occurred_on), ...ev.filter((e) => e.kind === GELIR).map((e) => e.occurred_on)], [exp, ev]));

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
    return { id, name: pName(id), m, g, kar: g - m, d, v, be: b ? `${formatTL(Math.round(b.perUnit * 100) / 100)}/${b.unit}` : "", beRaw: b ? `${formatTLRaw(Math.round(b.perUnit * 100) / 100)}/${b.unit}` : "" };
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

  const fxSum = (L: { amt: number; d: string }[]) => (doviz === "kapali" ? null : L.reduce<number | null>((t, x) => { const v = conv(x.amt, x.d); return t == null || v == null ? null : t + v; }, 0));
  const fxM = fxSum(E.map((e) => ({ amt: e.amount, d: e.occurred_on }))), fxG = fxSum(G.map((e) => ({ amt: Number(e.quantity ?? 0), d: e.occurred_on })));
  const excel = async () => {
    const PL = places.map((p) => ({ id: p.id, name: p.name }));
    const fx = doviz === "kapali" || !navigator.onLine ? null : await fxFor([...E.map((e) => e.occurred_on), ...G.map((e) => e.occurred_on)], doviz === "eur");
    const M = masrafSheet(E, PL, fx, { title: `Masraflar · ${S.name}`, ...(multi ? { extra: [{ h: "İş", get: (e: Expense) => bOf(e) }] } : {}) });
    const GS = gelirSheet(G, PL, fx, { title: `Gelirler · ${S.name}` });
    const oz = ozetSheet({ title: `${biz.name} · ${S.name} sezonu`, sub: `${tr(S.start)} – ${tr(S.end)} · Hazırlandı: ${tr(new Date().toISOString().slice(0, 10))}`, M, G: GS, exp: E, gel: G, fx, places: PL, borc, alacak: alinacak });
    // Geçen sezonla ve iş iş: özetin altına
    if (hasPrev) {
      oz.rows.push({ cells: [] }, { cells: [`Geçen sezonla (${P.name})`], style: "section" }, { cells: ["", S.name, P.name, "Fark"], style: "head" });
      for (const [k, a, b] of cmpRows) { const r = oz.rows.length + 1; oz.rows.push({ cells: [k, a, b, { f: `=IF(C${r}<>0,(B${r}-C${r})/ABS(C${r}),"")`, v: b ? (a - b) / Math.abs(b) : "" }], fmt: [undefined, "tl", "tl", "pct"] }); }
      for (const c of crops) { const [crop, unit] = c.split("|"); const r = oz.rows.length + 1; const a = vSum(V, c), b = vSum(VP, c); oz.rows.push({ cells: [`Verim ${crop} (${unit})`, a, b, { f: `=IF(C${r}<>0,(B${r}-C${r})/ABS(C${r}),"")`, v: b ? (a - b) / b : "" }], fmt: [undefined, "num", "num", "pct"] }); }
    }
    if (multi) {
      oz.rows.push({ cells: [] }, { cells: ["İş iş"], style: "section" }, { cells: ["İş", "Gelir (TL)", "Masraf (TL)", "Kâr (TL)"], style: "head" });
      for (const x of branches) { const r = oz.rows.length + 1; oz.rows.push({ cells: [x.b === "Genel" ? "Genel (ortak)" : x.b, x.g, x.m, x.b === "Genel" ? "" : { f: `=B${r}-C${r}`, v: x.kar }], fmt: [undefined, "tl", "tl", "tl"] }); }
    }
    await downloadBook(`${biz.name}-${S.name}-sezon-raporu`.replace(/\s+/g, "-"), [
      oz,
      { name: "Tarla tarla", title: `Tarla tarla · ${S.name}`, info: ["Kâr ve dekar başı masraf formüldür."],
        cols: [{ h: "Tarla", t: "text", w: 20 }, { h: "Dekar", t: "num", sum: true }, { h: "Gelir (TL)", t: "tl" }, { h: "Masraf (TL)", t: "tl" }, { h: "Kâr (TL)", t: "tl" }, { h: "Dekar başı masraf (TL)", t: "tl", sum: false }, { h: "Verim", t: "text", w: 20 }, { h: "Başabaş fiyatı", t: "text", w: 16 }],
        rows: fields.map((f) => [f.name, f.d || null, f.g, f.m, { f: "={C:Gelir (TL)}{r}-{C:Masraf (TL)}{r}", v: f.kar }, { f: "=IF(N({C:Dekar}{r})>0,{C:Masraf (TL)}{r}/{C:Dekar}{r},\"\")", v: f.d ? f.m / f.d : "" }, f.v, f.beRaw]) },
      M, GS,
      { name: "Tarla işleri", title: `Tarla günlüğü · ${S.name}`, totals: false,
        cols: [{ h: "Tarih", t: "date" }, { h: "Tarla", t: "text" }, { h: "İşlem", t: "text" }, { h: "Ürün / ilaç", t: "text" }, { h: "Doz", t: "text" }, { h: "Bekleme (gün)", t: "num", sum: false }, { h: "Not", t: "text", w: 30 }],
        rows: OPS.map((e) => [xDate(e.occurred_on), pName(e.place_id), String(e.data.type), String(e.data.product ?? ""), String(e.data.dose ?? ""), Number(e.data.wait_days ?? 0) || null, String(e.data.note ?? "")]) },
      { name: "Depo", title: `Depo · ${new Date().toLocaleDateString("tr-TR")}`, totals: false,
        cols: [{ h: "Malzeme", t: "text", w: 22 }, { h: "Tür", t: "text" }, { h: "Miktar", t: "num", sum: false }, { h: "Birim", t: "text" }],
        rows: items.map((i) => [i.name, i.category, i.quantity, i.unit]) },
    ], { title: `${biz.name} ${S.name} sezon raporu` });
  };

  return (
    <main className="ui-stack rapor">
      <div className="no-print ui-stack">
        <BackButton onClick={() => back()} label="Geri" />
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
        <div><span>Gelir</span><b>{formatTL(gelir)}</b>{fxG != null && <small className="ui-fx">{fmtFx(fxG, doviz)}</small>}</div>
        <div><span>Masraf</span><b>{formatTL(masraf)}</b>{fxM != null && <small className="ui-fx">{fmtFx(fxM, doviz)}</small>}</div>
        <div className={gelir - masraf >= 0 ? "pos" : "neg"}><span>Kâr / zarar</span><b>{formatTL(gelir - masraf)}</b>{fxG != null && fxM != null && <small className="ui-fx">{fmtFx(fxG - fxM, doviz)} (her kayıt kendi günündeki kurla)</small>}</div>
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
          <thead><tr><th>Tarla</th><th>Masraf</th><th>Gelir</th><th>Kâr</th><th>Dekar başı</th><th>Verim</th><th>Başabaş</th></tr></thead>
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
