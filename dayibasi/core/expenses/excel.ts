// Masraf sayfası (Excel) ve döviz sütunları: bütün ürünlerde ortak.
import type { Expense } from "./api";
import { owed } from "./api";
import type { Kur } from "@/core/fx";
import { rangeOf, xDate, type Col, type FreeSheet, type TableSheet, type XCell } from "@/core/export/xlsx";

export type Place = { id: string; name: string };
export type Fx = { rates: Record<string, Kur | null>; eur: boolean };

export const KUR_NOTU = "Döviz karşılığı: kaydın kendi tarihindeki TCMB döviz satış kuru (hafta sonu/tatilde önceki iş günü). Kur ya da TL tutar değişirse karşılık kendiliğinden yeniden hesaplanır.";

/** Bir tutar sütunu için kur + karşılık sütunları (formül). */
export function fxCols(fx: Fx, tlHeader: string): { cols: Col[]; cells: (date: string, tl: number) => XCell[] } {
  const cols: Col[] = [{ h: "USD kuru", t: "kur", sum: false }, { h: `${tlHeader.replace(" (TL)", "")} ($)`, t: "usd" }];
  if (fx.eur) cols.push({ h: "EUR kuru", t: "kur", sum: false }, { h: `${tlHeader.replace(" (TL)", "")} (€)`, t: "eur" });
  return {
    cols,
    cells: (date, tl) => {
      const k = fx.rates[date];
      const out: XCell[] = [k?.usd ?? null, { f: `=IF(N({C:USD kuru}{r})>0,{C:${tlHeader}}{r}/{C:USD kuru}{r},"")`, v: k ? tl / k.usd : "" }];
      if (fx.eur) out.push(k?.eur ?? null, { f: `=IF(N({C:EUR kuru}{r})>0,{C:${tlHeader}}{r}/{C:EUR kuru}{r},"")`, v: k ? tl / k.eur : "" });
      return out;
    },
  };
}

export function masrafSheet(exp: Expense[], places: Place[], fx: Fx | null, opts: { title?: string; who?: (id?: string | null) => string; extra?: { h: string; get: (e: Expense) => string }[] } = {}): TableSheet {
  const pn = (id: string | null) => places.find((p) => p.id === id)?.name ?? "";
  const F = fx ? fxCols(fx, "Tutar (TL)") : null;
  const sorted = exp.slice().sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
  return {
    name: "Masraflar", title: opts.title,
    info: ["Her satır bir masraf. Süzmek ya da sıralamak için başlıktaki oka bas. En alttaki Toplam satırı süzdüğün satırlara göre değişir.", ...(F ? [KUR_NOTU] : [])],
    cols: [
      { h: "Tarih", t: "date" }, { h: "Tür", t: "text", w: 18 }, ...(places.length ? [{ h: "Tarla", t: "text" as const, w: 18 }] : []), { h: "Not", t: "text", w: 30 },
      { h: "Tutar (TL)", t: "tl" }, { h: "Ödeme", t: "text", w: 20 }, { h: "Kalan borç (TL)", t: "tl" },
      ...(F?.cols ?? []), ...(opts.extra ?? []).map((x) => ({ h: x.h, t: "text" as const })), { h: "Fiş", t: "text" as const, w: 6 }, ...(opts.who ? [{ h: "Giren", t: "text" as const, w: 16 }] : []),
    ],
    rows: sorted.map((e) => [
      xDate(e.occurred_on), e.category, ...(places.length ? [pn(e.place_id)] : []), [e.note, (e.data?.branch as string) || ""].filter(Boolean).join(" · "),
      e.amount, e.on_credit ? `Veresiye: ${e.vendor ?? ""}` : "Peşin", owed(e) || null,
      ...(F ? F.cells(e.occurred_on, e.amount) : []), ...(opts.extra ?? []).map((x) => x.get(e)), e.photo_path ? "var" : "", ...(opts.who ? [opts.who((e as Expense & { created_by?: string }).created_by)] : []),
    ]),
  };
}

/** Masraf özeti: türe göre, formüller Masraflar sayfasından. */
export function masrafOzet(M: TableSheet, exp: Expense[], fx: Fx | null, title: string, sub: string, extra: [string, number][] = []): FreeSheet {
  const mTL = rangeOf(M, "Tutar (TL)"), mT = rangeOf(M, "Tür"), mUSD = rangeOf(M, "Tutar ($)");
  const usd = (e: Expense) => { const k = fx?.rates[e.occurred_on]; return k ? e.amount / k.usd : 0; };
  const cats = [...new Set(exp.map((e) => e.category))].map((c) => ({ c, t: exp.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0), u: exp.filter((e) => e.category === c).reduce((s, e) => s + usd(e), 0) })).sort((a, b) => b.t - a.t);
  const rows: FreeSheet["rows"] = [{ cells: [title], style: "title" }, { cells: [sub], style: "info" }, { cells: ["Rakamlar Masraflar sayfasından formülle gelir."], style: "info" }, { cells: [] },
    { cells: ["Tür", "Tutar (TL)", "Pay", ...(fx ? ["Tutar ($)"] : [])], style: "head" }];
  const first = rows.length + 1, tot = first + cats.length, tSum = cats.reduce((t, x) => t + x.t, 0);
  cats.forEach((x, i) => { const r = first + i;
    rows.push({ cells: [x.c, { f: `=SUMIFS(${mTL},${mT},A${r})`, v: x.t }, { f: `=IF(B$${tot}>0,B${r}/B$${tot},0)`, v: tSum ? x.t / tSum : 0 }, ...(fx ? [{ f: `=SUMIFS(${mUSD},${mT},A${r})`, v: x.u }] : [])], fmt: [undefined, "tl", "pct", "usd"] }); });
  rows.push({ cells: ["Toplam masraf", { f: `=SUM(B${first}:B${Math.max(first, tot - 1)})`, v: cats.reduce((t, x) => t + x.t, 0) }, "", ...(fx ? [{ f: `=SUM(D${first}:D${Math.max(first, tot - 1)})`, v: cats.reduce((t, x) => t + x.u, 0) }] : [])], style: "total", fmt: [undefined, "tl", undefined, "usd"] });
  if (extra.length) { rows.push({ cells: [] }); extra.forEach(([k, v]) => rows.push({ cells: [k, v], fmt: [undefined, "tl"] })); }
  return { name: "Özet", free: true, widths: [30, 16, 10, 16], rows };
}
