// Tapu (TKGM parsel sorgu) servisi. CORS açık, anahtar gerekmez.
const API = "https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api";

export type Yer = { id: number; ad: string };
export type Parsel = { il: string; ilce: string; mahalle: string; ada: string; parsel: string; m2: number; dekar: number; nitelik: string; mevki: string; lat: number; lon: number };

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}/${path}`);
  if (!r.ok) throw new Error(r.status === 404 ? "yok" : "tapu");
  return r.json() as Promise<T>;
}

type FC = { features?: { properties: { id: number; text: string } }[] };
const yerler = async (path: string): Promise<Yer[]> => {
  const key = `ko:tapu:${path}`;
  try { const c = JSON.parse(localStorage.getItem(key) ?? "null"); if (Array.isArray(c) && c.length) return c; } catch { /* yok */ }
  const j = await get<FC>(path);
  const l = (j.features ?? []).map((f) => ({ id: f.properties.id, ad: f.properties.text })).sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
  try { localStorage.setItem(key, JSON.stringify(l)); } catch { /* dolu */ }
  return l;
};
export const ilListe = () => yerler("idariYapi/ilListe");
export const ilceListe = (il: number) => yerler(`idariYapi/ilceListe/${il}`);
export const mahalleListe = (ilce: number) => yerler(`idariYapi/mahalleListe/${ilce}`);

/** "1.234,56" veya 1234.56 → 1234.56 */
export function m2Sayi(v: unknown): number {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim();
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? n : 0;
}

type Feat = { geometry?: { type: string; coordinates: number[][][] | number[][][][] }; properties?: Record<string, unknown> };
function orta(g: Feat["geometry"]): [number, number] {
  if (!g) return [0, 0];
  const ring = (g.type === "MultiPolygon" ? (g.coordinates as number[][][][])[0][0] : (g.coordinates as number[][][])[0]) ?? [];
  if (!ring.length) return [0, 0];
  const s = ring.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]);
  return [s[1] / ring.length, s[0] / ring.length]; // [lat, lon]
}

export async function parselBul(mahalle: number, ada: string, parsel: string): Promise<Parsel | null> {
  let f: Feat;
  try { f = await get<Feat>(`parsel/${mahalle}/${encodeURIComponent(ada.trim())}/${encodeURIComponent(parsel.trim())}`); }
  catch (e) { if ((e as Error).message === "yok") return null; throw e; }
  const p = f?.properties;
  if (!p) return null;
  const m2 = m2Sayi(p.alan);
  const [lat, lon] = orta(f.geometry);
  return {
    il: String(p.ilAd ?? ""), ilce: String(p.ilceAd ?? ""), mahalle: String(p.mahalleAd ?? ""),
    ada: String(p.adaNo ?? ada), parsel: String(p.parselNo ?? parsel),
    m2, dekar: Math.round(m2 / 10) / 100, nitelik: String(p.nitelik ?? ""), mevki: String(p.mevkii ?? ""), lat, lon,
  };
}
