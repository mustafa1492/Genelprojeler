// Döviz kuru (TCMB, döviz satış): /api/kur?t=2026-03-01,2026-03-02
// Hafta sonu ve tatilde TCMB yayın yapmaz: o gün için önceki son iş gününün kuru verilir.
// Geçmiş günlerin kuru değişmez; sonuç uzun süre önbellekte tutulur.
import { NextResponse } from "next/server";

type Kur = { usd: number; eur: number; kaynak: string };
const mem = new Map<string, Kur | null>();

const back = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const todayTR = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

function pick(xml: string, code: string) {
  const m = xml.match(new RegExp(`CurrencyCode="${code}"[\\s\\S]*?<ForexSelling>([\\d.]+)</ForexSelling>`));
  return m ? Number(m[1]) : NaN;
}

async function file(iso: string): Promise<Kur | null> {
  if (mem.has(iso)) return mem.get(iso)!;
  const [y, m, d] = iso.split("-");
  const url = iso === todayTR() ? "https://www.tcmb.gov.tr/kurlar/today.xml" : `https://www.tcmb.gov.tr/kurlar/${y}${m}/${d}${m}${y}.xml`;
  try {
    const r = await fetch(url, { next: { revalidate: iso === todayTR() ? 3600 : 60 * 60 * 24 * 30 } });
    if (!r.ok) { if (r.status === 404) mem.set(iso, null); return null; }
    const xml = await r.text();
    const usd = pick(xml, "USD"), eur = pick(xml, "EUR");
    const date = xml.match(/Tarih="(\d\d)\.(\d\d)\.(\d{4})"/);
    const k = Number.isFinite(usd) && Number.isFinite(eur) ? { usd, eur, kaynak: date ? `${date[3]}-${date[2]}-${date[1]}` : iso } : null;
    if (iso !== todayTR()) mem.set(iso, k);
    return k;
  } catch { return null; }
}

async function rate(iso: string): Promise<Kur | null> {
  const t = todayTR();
  const start = iso > t ? t : iso;
  for (let i = 0; i < 10; i++) { const k = await file(back(start, i)); if (k) return k; }
  return null;
}

export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") ?? "";
  const dates = [...new Set(t.split(",").filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x) && x >= "2000-01-01"))].slice(0, 80);
  if (!dates.length) return NextResponse.json({ hata: "tarih yok" }, { status: 400 });
  const out: Record<string, Kur | null> = {};
  // TCMB'yi yormamak için 6'şar 6'şar
  for (let i = 0; i < dates.length; i += 6) await Promise.all(dates.slice(i, i + 6).map(async (d) => { out[d] = await rate(d); }));
  const allPast = dates.every((d) => d < todayTR());
  return NextResponse.json(out, { headers: { "Cache-Control": allPast ? "public, s-maxage=2592000, max-age=86400" : "public, s-maxage=1800, max-age=600" } });
}
