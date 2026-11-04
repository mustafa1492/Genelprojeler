// "Bütün verimi indir": defterin bütün kayıtları tek Excel'de (okumak için) + JSON (geri yüklemek için).
// İnternet ister; doğrudan veritabanından okur (telefondaki eksik kopyadan değil).
import { downloadBook, xDate, type TableSheet } from "@/core/export/xlsx";
import { owed, type Expense } from "@/core/expenses/api";
import type { EventRow } from "@/core/events/api";
import { fxFor, gelirSheet, masrafSheet, ozetSheet } from "./excel";
import { supabase } from "@/core/supabase/client";
import type { Business } from "@/core/auth/AuthGate";
import { GELIR, incomeOpen, ISLEM, MAKINE, VERIM } from "./kayit";

const tr = (d?: string | null) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : "");
type Row = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v == null ? "" : String(v));
const n = (v: unknown) => (v == null || v === "" ? "" : Number(v));

async function all(table: string, biz: string): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase().from(table).select("*").eq("business_id", biz).range(from, from + 999);
    if (error) throw error;
    out.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) return out;
  }
}

export async function exportAll(biz: Business, opts: { eur?: boolean } = {}) {
  const [places, expenses, events, items, dues, docs, lots, barns, herds, herdDays, animals, animalEvents] = await Promise.all(
    ["places", "expenses", "events", "inventory_items", "dues", "documents", "lots", "barns", "herds", "herd_days", "animals", "animal_events"]
      .map((t) => all(t, biz.id).catch((e) => (["places", "expenses", "events"].includes(t) ? Promise.reject(e) : []))),
  );
  const pName = (id: unknown) => s(places.find((p) => p.id === id)?.name) || "Genel";
  const d = (r: Row) => (r.data ?? {}) as Record<string, unknown>;
  const ev = (k: string) => events.filter((e) => e.kind === k).sort((a, b) => s(a.occurred_on).localeCompare(s(b.occurred_on)));
  const stamp = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const base = `${biz.name}-tum-veriler-${stamp}`.replace(/\s+/g, "-");
  const P = places.map((p) => ({ id: p.id, name: s(p.name) }));
  const exp = expenses as unknown as Expense[];
  const gel = ev(GELIR) as unknown as EventRow[];
  const fx = await fxFor([...exp.map((e) => e.occurred_on), ...gel.map((e) => e.occurred_on)], !!opts.eur).catch(() => null);
  const M = masrafSheet(exp, P, fx, { title: `${biz.name} · Masraflar · bütün tarihler` }), G = gelirSheet(gel, P, fx, { title: `${biz.name} · Gelirler · bütün tarihler` });
  const borc = dues.filter((x) => x.direction === "borc").reduce((t, x) => t + Math.max(0, Number(x.amount) - Number(x.paid_amount ?? 0)), 0) + exp.reduce((t, e) => t + owed(e), 0);
  const alacak = dues.filter((x) => x.direction === "alacak").reduce((t, x) => t + Math.max(0, Number(x.amount) - Number(x.paid_amount ?? 0)), 0) + gel.reduce((t, e) => t + incomeOpen(e), 0);
  const herdName = (id: unknown) => s(herds.find((h) => h.id === id)?.name);
  const barnName = (id: unknown) => s(barns.find((h) => h.id === id)?.name);
  const animalName = (id: unknown) => { const a = animals.find((x) => x.id === id); return a ? [s(a.tag), s(a.name)].filter(Boolean).join(" · ") : ""; };
  const TUR: Record<string, string> = { kanatli: "Kanatlı", kucukbas: "Küçükbaş", buyukbas: "Büyükbaş" };
  const opt = (cond: boolean, sh: TableSheet) => (cond ? [sh] : []);
  const mak = ev(MAKINE);

  await downloadBook(base, [
    ozetSheet({ title: `${biz.name} · bütün kayıtlar`, sub: `Alındığı gün: ${tr(stamp)} · Bütün tarihler`, M, G, exp, gel, fx, places: P, borc, alacak }),
    M, G,
    { name: "Borç ve alacak", info: ["Kalan = Tutar − Ödenen (formül)."], cols: [{ h: "Yön", t: "text" }, { h: "Kim", t: "text", w: 20 }, { h: "Tür", t: "text" }, { h: "Tutar (TL)", t: "tl" }, { h: "Ödenen (TL)", t: "tl" }, { h: "Kalan (TL)", t: "tl" }, { h: "Vade", t: "date" }, { h: "Not", t: "text", w: 30 }],
      rows: dues.map((x) => [x.direction === "borc" ? "Borç" : "Alacak", s(x.party), s(x.kind), Number(x.amount), Number(x.paid_amount ?? 0), { f: "={C:Tutar (TL)}{r}-{C:Ödenen (TL)}{r}", v: Number(x.amount) - Number(x.paid_amount ?? 0) }, xDate(s(x.due_on)), s(x.note)]) },
    { name: "Tarlalar", cols: [{ h: "Tarla", t: "text", w: 20 }, { h: "Dekar", t: "num" }, { h: "Ürün", t: "text" }, { h: "İş", t: "text" }, { h: "Köy / ilçe", t: "text", w: 22 }, { h: "Not", t: "text", w: 30 }], totals: true,
      rows: places.map((p) => { const c = (p.custom ?? {}) as Record<string, string>; return [s(p.name), c.donum ? Number(c.donum) : null, s(c.urun), s(c.is), s(c.koy), s(c.not)]; }) },
    { name: "Tarla işleri", cols: [{ h: "Tarih", t: "date" }, { h: "Tarla", t: "text" }, { h: "İşlem", t: "text" }, { h: "Ürün / ilaç", t: "text" }, { h: "Doz", t: "text" }, { h: "Bekleme (gün)", t: "num", sum: false }, { h: "Sulama", t: "text" }, { h: "Not", t: "text", w: 30 }], totals: false,
      rows: ev(ISLEM).map((e) => [xDate(s(e.occurred_on)), pName(e.place_id), s(d(e).type), s(d(e).product), s(d(e).dose), n(d(e).wait_days) === "" ? null : Number(d(e).wait_days), s(d(e).method ?? ""), s(d(e).note)]) },
    { name: "Verim", cols: [{ h: "Tarih", t: "date" }, { h: "Tarla", t: "text" }, { h: "Sezon", t: "text" }, { h: "Ürün", t: "text" }, { h: "Miktar", t: "num", sum: true }, { h: "Birim", t: "text" }],
      rows: ev(VERIM).map((e) => [xDate(s(e.occurred_on)), pName(e.place_id), s(d(e).year), s(d(e).crop), Number(e.quantity ?? 0), s(d(e).unit)]) },
    ...opt(mak.length > 0, { name: "Makineler", cols: [{ h: "Tarih", t: "date" }, { h: "Makine", t: "text", w: 18 }, { h: "Yapılan iş", t: "text", w: 24 }, { h: "Motor saati", t: "num", sum: false }, { h: "Sonraki bakım", t: "date" }, { h: "Sonraki saat", t: "num", sum: false }, { h: "Not", t: "text", w: 30 }], totals: false,
      rows: mak.map((e) => [xDate(s(e.occurred_on)), s(d(e).makine), s(d(e).is), e.quantity == null ? null : Number(e.quantity), xDate(s(d(e).next_on)), d(e).next_hours == null ? null : Number(d(e).next_hours), s(d(e).not)]) }),
    { name: "Depo", cols: [{ h: "Malzeme", t: "text", w: 22 }, { h: "Tür", t: "text" }, { h: "Miktar", t: "num", sum: false }, { h: "Birim", t: "text" }, { h: "Not", t: "text", w: 30 }], totals: false,
      rows: items.map((i) => [s(i.name), s(i.category), Number(i.quantity ?? 0), s(i.unit), s(i.note)]) },
    { name: "Belgeler", cols: [{ h: "Belge", t: "text", w: 26 }, { h: "Bitiş", t: "date" }, { h: "Not", t: "text", w: 30 }], totals: false,
      rows: docs.map((x) => [s(x.title), xDate(s(x.expires_on)), s(x.notes)]) },
    ...opt(lots.length > 0, { name: "Fidan partileri", cols: [{ h: "Parti", t: "text" }, { h: "Tarla", t: "text" }, { h: "Dikim", t: "date" }, { h: "Başlangıç adedi", t: "num", sum: true }, { h: "Durum", t: "text" }],
      rows: lots.map((l) => [s(l.name), pName(l.place_id), xDate(s(l.planted_on)), Number(l.initial_count ?? 0), s(l.status)]) }),
    ...opt(barns.length > 0, { name: "Barınaklar", cols: [{ h: "Barınak", t: "text", w: 20 }, { h: "Tür", t: "text" }, { h: "Alan (m²)", t: "num", sum: true }, { h: "Kapasite", t: "num", sum: true }, { h: "Not", t: "text", w: 30 }],
      rows: barns.map((b) => [s(b.name), TUR[s(b.species)] ?? s(b.species), b.area_m2 == null ? null : Number(b.area_m2), b.capacity == null ? null : Number(b.capacity), s(b.note)]) }),
    ...opt(herds.length > 0, { name: "Sürüler", cols: [{ h: "Sürü / dönem", t: "text", w: 22 }, { h: "Tür", t: "text" }, { h: "Çeşit", t: "text" }, { h: "Barınak", t: "text" }, { h: "Giriş", t: "date" }, { h: "Giriş adedi", t: "num", sum: true }, { h: "Nereden", t: "text" }, { h: "Durum", t: "text" }, { h: "Kapanış", t: "date" }, { h: "Not", t: "text", w: 30 }],
      rows: herds.map((h) => [s(h.name), TUR[s(h.species)] ?? s(h.species), s(h.kind), barnName(h.barn_id), xDate(s(h.started_on)), Number(h.initial_count ?? 0), s(h.source), h.status === "kapandi" ? "Kapandı" : "Açık", xDate(s(h.closed_on)), s(h.note)]) }),
    ...opt(herdDays.length > 0, { name: "Sürü günlük kayıt", info: ["Yem (kg) = çuval × çuval kg (formül)."], cols: [{ h: "Gün", t: "date" }, { h: "Sürü", t: "text", w: 20 }, { h: "Ölen", t: "num", sum: true }, { h: "Ayıklanan", t: "num", sum: true }, { h: "Yem çuvalı", t: "num", sum: true }, { h: "Çuval kg", t: "num", sum: false }, { h: "Yem (kg)", t: "num", sum: true }, { h: "Ortalama ağırlık (g)", t: "num", sum: false }, { h: "Tartılan", t: "num", sum: false }, { h: "Not", t: "text", w: 26 }],
      rows: herdDays.slice().sort((a, b) => s(a.day).localeCompare(s(b.day))).map((x) => [xDate(s(x.day)), herdName(x.herd_id), Number(x.dead ?? 0), Number(x.culled ?? 0), Number(x.feed_bags ?? 0), x.bag_kg == null ? null : Number(x.bag_kg),
        { f: "=IF(N({C:Çuval kg}{r})>0,{C:Yem çuvalı}{r}*{C:Çuval kg}{r},\"\")", v: x.bag_kg ? Number(x.feed_bags) * Number(x.bag_kg) : "" }, x.avg_weight_g == null ? null : Number(x.avg_weight_g), x.weighed_n == null ? null : Number(x.weighed_n), s(x.note)]) }),
    ...opt(animals.length > 0, { name: "Hayvanlar", cols: [{ h: "Küpe no", t: "text" }, { h: "Adı", t: "text" }, { h: "Cins", t: "text" }, { h: "Cinsiyet", t: "text" }, { h: "Irk", t: "text" }, { h: "Doğum", t: "date" }, { h: "Anası", t: "text" }, { h: "Barınak", t: "text" }, { h: "Durum", t: "text" }, { h: "Çıkış", t: "date" }, { h: "Not", t: "text", w: 30 }], totals: false,
      rows: animals.map((a) => [s(a.tag), s(a.name), ({ inek: "İnek", koyun: "Koyun", keci: "Keçi" } as Record<string, string>)[s(a.kind)] ?? s(a.kind), a.sex === "disi" ? "Dişi" : "Erkek", s(a.breed), xDate(s(a.born_on)), animalName(a.mother_id), barnName(a.barn_id),
        ({ var: "Var", satildi: "Satıldı", oldu: "Öldü" } as Record<string, string>)[s(a.status)] ?? s(a.status), xDate(s(a.left_on)), s(a.note)]) }),
    ...opt(animalEvents.length > 0, { name: "Hayvan olayları", cols: [{ h: "Gün", t: "date" }, { h: "Hayvan", t: "text", w: 20 }, { h: "Olay", t: "text" }, { h: "Ayrıntı", t: "text", w: 30 }, { h: "Not", t: "text", w: 30 }], totals: false,
      rows: animalEvents.slice().sort((a, b) => s(a.day).localeCompare(s(b.day))).map((x) => [xDate(s(x.day)), animalName(x.animal_id), s(x.type), Object.entries(d(x)).map(([k, v]) => `${k}: ${s(v)}`).join(", "), s(x.note)]) }),
  ], { title: `${biz.name} bütün kayıtlar` });

  // Geri yükleme için ham kopya
  const json = JSON.stringify({ surum: 1, alindi: new Date().toISOString(), defter: { id: biz.id, name: biz.name, settings: biz.settings },
    places, expenses, events, inventory_items: items, dues, documents: docs, lots, barns, herds, herd_days: herdDays, animals, animal_events: animalEvents }, null, 1);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  a.download = `${base}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
