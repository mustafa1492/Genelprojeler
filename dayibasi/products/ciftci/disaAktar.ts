// "Bütün verimi indir": defterin bütün kayıtları tek Excel'de (okumak için) + JSON (geri yüklemek için).
// İnternet ister; doğrudan veritabanından okur (telefondaki eksik kopyadan değil).
import { downloadXlsx } from "@/core/export/xlsx";
import { supabase } from "@/core/supabase/client";
import type { Business } from "@/core/auth/AuthGate";
import { GELIR, ISLEM, VERIM } from "./kayit";

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

export async function exportAll(biz: Business) {
  const [places, expenses, events, items, dues, docs, lots] = await Promise.all(
    ["places", "expenses", "events", "inventory_items", "dues", "documents", "lots"].map((t) => all(t, biz.id).catch((e) => (t === "lots" ? [] : Promise.reject(e)))),
  );
  const pName = (id: unknown) => s(places.find((p) => p.id === id)?.name) || "Genel";
  const d = (r: Row) => (r.data ?? {}) as Record<string, unknown>;
  const ev = (k: string) => events.filter((e) => e.kind === k).sort((a, b) => s(a.occurred_on).localeCompare(s(b.occurred_on)));
  const stamp = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const base = `${biz.name}-tum-veriler-${stamp}`.replace(/\s+/g, "-");

  await downloadXlsx(base, [
    { name: "Tarlalar", title: `${biz.name} · bütün veriler (${tr(stamp)})`, rows: [["Tarla", "Dönüm", "Ürün", "İş", "Köy / ilçe", "Not"],
      ...places.map((p) => { const c = (p.custom ?? {}) as Record<string, string>; return [s(p.name), n(c.donum), s(c.urun), s(c.is), s(c.koy), s(c.not)]; })] },
    { name: "Masraflar", rows: [["Tarih", "Tür", "Tarla", "Tutar (TL)", "Not", "Veresiye (kime)", "Ödenen (TL)", "İş"],
      ...expenses.sort((a, b) => s(a.occurred_on).localeCompare(s(b.occurred_on))).map((e) => [tr(s(e.occurred_on)), s(e.category), pName(e.place_id), n(e.amount), s(e.note), e.on_credit ? s(e.vendor) : "", e.on_credit ? n(e.paid_amount) : "", s(d(e).branch)])] },
    { name: "Gelirler", rows: [["Tarih", "Tür", "Tarla", "Ürün", "Miktar", "Birim", "Fiyat", "Toplam (TL)", "Alıcı", "Alınan (TL)", "Vade"],
      ...ev(GELIR).map((e) => [tr(s(e.occurred_on)), s(d(e).type), pName(e.place_id), s(d(e).crop), n(d(e).qty), s(d(e).unit), n(d(e).price), n(e.quantity), s(d(e).buyer), n(d(e).received), tr(s(d(e).due_on))])] },
    { name: "Tarla işleri", rows: [["Tarih", "Tarla", "İşlem", "Ürün / ilaç", "Doz", "Bekleme (gün)", "Sulama", "Not"],
      ...ev(ISLEM).map((e) => [tr(s(e.occurred_on)), pName(e.place_id), s(d(e).type), s(d(e).product), s(d(e).dose), n(d(e).wait_days), s(d(e).method ?? ""), s(d(e).note)])] },
    { name: "Verim", rows: [["Tarih", "Tarla", "Sezon", "Ürün", "Miktar", "Birim"],
      ...ev(VERIM).map((e) => [tr(s(e.occurred_on)), pName(e.place_id), s(d(e).year), s(d(e).crop), n(e.quantity), s(d(e).unit)])] },
    { name: "Depo", rows: [["Malzeme", "Tür", "Miktar", "Birim", "Not"], ...items.map((i) => [s(i.name), s(i.category), n(i.quantity), s(i.unit), s(i.note)])] },
    { name: "Borç ve alacak", rows: [["Yön", "Kim", "Tür", "Tutar (TL)", "Ödenen (TL)", "Vade", "Not"],
      ...dues.map((x) => [x.direction === "borc" ? "Borç" : "Alacak", s(x.party), s(x.kind), n(x.amount), n(x.paid_amount), tr(s(x.due_on)), s(x.note)])] },
    { name: "Belgeler", rows: [["Belge", "Bitiş", "Not"], ...docs.map((x) => [s(x.title), tr(s(x.expires_on)), s(x.notes)])] },
    ...(lots.length ? [{ name: "Fidan partileri", rows: [["Parti", "Tarla", "Dikim", "Başlangıç adedi", "Durum"], ...lots.map((l) => [s(l.name), pName(l.place_id), tr(s(l.planted_on)), n(l.initial_count), s(l.status)])] }] : []),
  ]);

  // Geri yükleme için ham kopya
  const json = JSON.stringify({ surum: 1, alindi: new Date().toISOString(), defter: { id: biz.id, name: biz.name, settings: biz.settings },
    places, expenses, events, inventory_items: items, dues, documents: docs, lots }, null, 1);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  a.download = `${base}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
