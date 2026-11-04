// Çiftçi defteri Excel sayfaları: masraf, gelir, özet (ay ay, türe ve tarlaya göre), döviz karşılıkları.
export { masrafSheet } from "@/core/expenses/excel";
export type { Fx } from "@/core/expenses/excel";
// Her döviz sütunu formüldür (= TL / kur): Excel'de TL'yi düzeltirsen karşılığı da düzelir.
import type { Expense } from "@/core/expenses/api";
import { fxCols, KUR_NOTU, masrafSheet, type Fx, type Place } from "@/core/expenses/excel";
import type { EventRow } from "@/core/events/api";
import { getRates } from "@/core/fx";
import { rangeOf, xDate, type FreeSheet, type TableSheet } from "@/core/export/xlsx";
import { incomeOpen } from "./kayit";

/** Kayıtların günlerinin kurlarını getirir (internet ister). */
export async function fxFor(dates: string[], eur: boolean): Promise<Fx> {
  return { rates: await getRates([...new Set(dates.filter(Boolean))]), eur };
}

export function gelirSheet(ev: EventRow[], places: Place[], fx: Fx | null, opts: { title?: string; who?: (id?: string | null) => string } = {}): TableSheet {
  const pn = (id: string | null) => places.find((p) => p.id === id)?.name ?? "";
  const F = fx ? fxCols(fx, "Toplam (TL)") : null;
  const sorted = ev.slice().sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
  const d = (e: EventRow) => (e.data ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
  return {
    name: "Gelirler", title: opts.title,
    info: ["Her satır bir satış ya da gelir. Kalan = Toplam − Alınan (formül).", ...(F ? [KUR_NOTU] : [])],
    cols: [
      { h: "Tarih", t: "date" }, { h: "Tür", t: "text", w: 16 }, { h: "Ürün", t: "text", w: 16 }, ...(places.length ? [{ h: "Tarla", t: "text" as const, w: 18 }] : []),
      { h: "Miktar", t: "num", sum: false }, { h: "Birim", t: "text", w: 8 }, { h: "Birim fiyat (TL)", t: "tl", sum: false },
      { h: "Toplam (TL)", t: "tl" }, { h: "Alıcı", t: "text", w: 18 }, { h: "Alınan (TL)", t: "tl" }, { h: "Kalan (TL)", t: "tl" }, { h: "Vade", t: "date" },
      ...(F?.cols ?? []), ...(opts.who ? [{ h: "Giren", t: "text" as const, w: 16 }] : []),
    ],
    rows: sorted.map((e) => [
      xDate(e.occurred_on), String(d(e).type ?? ""), String(d(e).crop ?? ""), ...(places.length ? [pn(e.place_id)] : []),
      num(d(e).qty), String(d(e).unit ?? ""), num(d(e).price), Number(e.quantity ?? 0), String(d(e).buyer ?? ""),
      Number(d(e).received ?? 0), { f: "={C:Toplam (TL)}{r}-{C:Alınan (TL)}{r}", v: incomeOpen(e) }, xDate(String(d(e).due_on ?? "")),
      ...(F ? F.cells(e.occurred_on, Number(e.quantity ?? 0)) : []), ...(opts.who ? [opts.who(e.created_by)] : []),
    ]),
  };
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** Özet sayfası: büyük rakamlar, ay ay, masraf türüne ve tarlaya göre. Hepsi formül (Masraflar/Gelirler sayfalarından). */
export function ozetSheet(o: { title: string; sub: string; M: TableSheet; G: TableSheet; exp: Expense[]; gel: EventRow[]; fx: Fx | null; places: Place[]; borc?: number; alacak?: number }): FreeSheet {
  const { M, G, fx } = o;
  const mTL = rangeOf(M, "Tutar (TL)"), mD = rangeOf(M, "Tarih"), mT = rangeOf(M, "Tür"), mUSD = rangeOf(M, "Tutar ($)");
  const gTL = rangeOf(G, "Toplam (TL)"), gD = rangeOf(G, "Tarih"), gUSD = rangeOf(G, "Toplam ($)");
  const hasM = M.rows.length > 0, hasG = G.rows.length > 0;
  const sumIf = (has: boolean, rng: string, f: string) => (has ? f.replace("#", rng) : "0");
  const rows: FreeSheet["rows"] = [];
  const R = () => rows.length + 1;   // eklenecek satırın numarası
  const usdOf = (iso: string, tl: number) => { const k = fx?.rates[iso]; return k ? tl / k.usd : 0; };
  const mSum = o.exp.reduce((t, e) => t + e.amount, 0), gSum = o.gel.reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  const mU = o.exp.reduce((t, e) => t + usdOf(e.occurred_on, e.amount), 0), gU = o.gel.reduce((t, e) => t + usdOf(e.occurred_on, Number(e.quantity ?? 0)), 0);

  rows.push({ cells: [o.title], style: "title" });
  rows.push({ cells: [o.sub], style: "info" });
  rows.push({ cells: ["Rakamlar Masraflar ve Gelirler sayfalarından formülle gelir; oralarda bir satırı düzeltirsen burası da düzelir."], style: "info" });
  if (fx) rows.push({ cells: [KUR_NOTU], style: "info" });
  rows.push({ cells: [] });
  rows.push({ cells: ["", "TL", ...(fx ? ["Dolar ($)"] : [])], style: "head" });
  const rG = R(); rows.push({ cells: ["Gelir", { f: `=${sumIf(hasG, gTL, "SUM(#)")}`, v: gSum }, ...(fx ? [{ f: `=${sumIf(hasG, gUSD, "SUM(#)")}`, v: gU }] : [])], fmt: [undefined, "tl", "usd"] });
  const rM = R(); rows.push({ cells: ["Masraf", { f: `=${sumIf(hasM, mTL, "SUM(#)")}`, v: mSum }, ...(fx ? [{ f: `=${sumIf(hasM, mUSD, "SUM(#)")}`, v: mU }] : [])], fmt: [undefined, "tl", "usd"] });
  rows.push({ cells: ["Kâr / zarar", { f: `=B${rG}-B${rM}`, v: gSum - mSum }, ...(fx ? [{ f: `=C${rG}-C${rM}`, v: gU - mU }] : [])], style: "total", fmt: [undefined, "tl", "usd"] });
  if (o.alacak != null) rows.push({ cells: ["Alacak (henüz alınmadı)", o.alacak], fmt: [undefined, "tl"] });
  if (o.borc != null) rows.push({ cells: ["Borç (ödenecek)", o.borc], fmt: [undefined, "tl"] });
  if (fx && mU > 0) rows.push({ cells: ["Not: dolar kârı, her kaydın kendi günündeki kurla hesaplanır; TL kârını bugünkü kura bölmekten farklıdır."], style: "info" });

  // Ay ay
  const months = [...new Set([...o.exp.map((e) => e.occurred_on.slice(0, 7)), ...o.gel.map((e) => e.occurred_on.slice(0, 7))])].sort();
  if (months.length) {
    rows.push({ cells: [] });
    rows.push({ cells: ["Ay ay"], style: "section" });
    rows.push({ cells: ["Ay", "Ay başı", "Gelir (TL)", "Masraf (TL)", "Kâr (TL)", ...(fx ? ["Gelir ($)", "Masraf ($)", "Kâr ($)"] : [])], style: "head" });
    const first = R();
    for (const m of months) {
      const r = R(); const a = `B${r}`;
      const inM = (iso: string) => iso.startsWith(m);
      const g = o.gel.filter((e) => inM(e.occurred_on)).reduce((t, e) => t + Number(e.quantity ?? 0), 0), mm = o.exp.filter((e) => inM(e.occurred_on)).reduce((t, e) => t + e.amount, 0);
      const gu = o.gel.filter((e) => inM(e.occurred_on)).reduce((t, e) => t + usdOf(e.occurred_on, Number(e.quantity ?? 0)), 0), mu = o.exp.filter((e) => inM(e.occurred_on)).reduce((t, e) => t + usdOf(e.occurred_on, e.amount), 0);
      const cond = (dr: string) => `${dr},">="&${a},${dr},"<"&EDATE(${a},1)`;
      rows.push({ cells: [`${AYLAR[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`, xDate(`${m}-01`),
        { f: `=${sumIf(hasG, gTL, `SUMIFS(#,${cond(gD)})`)}`, v: g }, { f: `=${sumIf(hasM, mTL, `SUMIFS(#,${cond(mD)})`)}`, v: mm }, { f: `=C${r}-D${r}`, v: g - mm },
        ...(fx ? [{ f: `=${sumIf(hasG, gUSD, `SUMIFS(#,${cond(gD)})`)}`, v: gu }, { f: `=${sumIf(hasM, mUSD, `SUMIFS(#,${cond(mD)})`)}`, v: mu }, { f: `=F${r}-G${r}`, v: gu - mu }] : [])],
        fmt: [undefined, "date", "tl", "tl", "tl", "usd", "usd", "usd"] });
    }
    const last = R() - 1;
    const cached = (k: number) => rows.slice(first - 1, last).reduce((t, r) => { const c = r.cells[k]; return t + (c && typeof c === "object" && !(c instanceof Date) && typeof c.v === "number" ? c.v : 0); }, 0);
    const tot = (L: string) => ({ f: `=SUM(${L}${first}:${L}${last})`, v: cached(L.charCodeAt(0) - 65) });
    rows.push({ cells: ["Toplam", "", tot("C"), tot("D"), tot("E"), ...(fx ? [tot("F"), tot("G"), tot("H")] : [])], style: "total", fmt: [undefined, undefined, "tl", "tl", "tl", "usd", "usd", "usd"] });
  }

  // Masraf türüne göre
  const cats = [...new Set(o.exp.map((e) => e.category))].map((c) => ({ c, t: o.exp.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) })).sort((a, b) => b.t - a.t);
  if (cats.length) {
    rows.push({ cells: [] });
    rows.push({ cells: ["Masraf türüne göre"], style: "section" });
    rows.push({ cells: ["Tür", "Tutar (TL)", "Pay", ...(fx ? ["Tutar ($)"] : [])], style: "head" });
    const first = R();
    for (const x of cats) {
      const r = R();
      rows.push({ cells: [x.c, { f: `=SUMIFS(${mTL},${mT},A${r})`, v: x.t }, { f: `=IF(B$${first + cats.length}>0,B${r}/B$${first + cats.length},0)`, v: mSum ? x.t / mSum : 0 },
        ...(fx ? [{ f: `=SUMIFS(${mUSD},${mT},A${r})`, v: o.exp.filter((e) => e.category === x.c).reduce((t, e) => t + usdOf(e.occurred_on, e.amount), 0) }] : [])], fmt: [undefined, "tl", "pct", "usd"] });
    }
    rows.push({ cells: ["Toplam", { f: `=SUM(B${first}:B${R() - 1})`, v: mSum }, "", ...(fx ? [{ f: `=SUM(D${first}:D${R() - 1})`, v: mU }] : [])], style: "total", fmt: [undefined, "tl", undefined, "usd"] });
  }

  // Tarlaya göre
  if (o.places.length && M.cols.some((c) => c.h === "Tarla")) {
    const mP = rangeOf(M, "Tarla"), gP = G.cols.some((c) => c.h === "Tarla") ? rangeOf(G, "Tarla") : "";
    const pl = [...o.places.map((p) => p.name), ""].filter((n) => o.exp.some((e) => (o.places.find((p) => p.id === e.place_id)?.name ?? "") === n) || o.gel.some((e) => (o.places.find((p) => p.id === e.place_id)?.name ?? "") === n));
    if (pl.length) {
      rows.push({ cells: [] });
      rows.push({ cells: ["Tarlaya göre"], style: "section" });
      rows.push({ cells: ["Tarla", "Gelir (TL)", "Masraf (TL)", "Kâr (TL)"], style: "head" });
      for (const n of pl) {
        const r = R(); const key = n ? `A${r}` : `""`;
        const g = o.gel.filter((e) => (o.places.find((p) => p.id === e.place_id)?.name ?? "") === n).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
        const mm = o.exp.filter((e) => (o.places.find((p) => p.id === e.place_id)?.name ?? "") === n).reduce((t, e) => t + e.amount, 0);
        rows.push({ cells: [n || "Genel (tarlasız)", { f: gP && hasG ? `=SUMIFS(${gTL},${gP},${key})` : "=0", v: g }, { f: hasM ? `=SUMIFS(${mTL},${mP},${key})` : "=0", v: mm }, { f: `=B${r}-C${r}`, v: g - mm }],
          fmt: [undefined, "tl", "tl", "tl"] });
      }
    }
  }
  return { name: "Özet", free: true, widths: [30, 16, 16, 16, 16, 14, 14, 14], rows };
}
