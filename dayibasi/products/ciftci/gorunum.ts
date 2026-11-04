import { usePrefs } from "@/core/prefs";

/** Özet kartları ve alt çubuk: kişiye özel görünüm (Ayarlar → Ekranımı düzenle). */
export const CARDS = [
  { id: "kar", label: "Kâr kartı" },
  { id: "hizli", label: "Hızlı düğmeler" },
  { id: "yeni", label: "Başkalarının yeni kayıtları" },
  { id: "yakin", label: "Yaklaşanlar" },
  { id: "hava", label: "Hava durumu" },
  { id: "son", label: "Son kayıtlar" },
] as const;
export type CardId = (typeof CARDS)[number]["id"];

export const PERIODS = [
  { id: "sezon", label: "Sezon", hint: "Seçili sezonun kârı, gelir ve masrafı." },
  { id: "ay", label: "Bu ay", hint: "Bu ayın gelir ve masrafı, geçen ayla karşılaştırma." },
  { id: "yil", label: "Bu yıl", hint: "Ocaktan bugüne, sezondan bağımsız." },
  { id: "30", label: "30 gün", hint: "Son 30 günde ne harcadım, ne kazandım." },
] as const;
export type Period = (typeof PERIODS)[number]["id"];

/** Alt çubuğa konabilecek sekmeler (Menü hep sağda, sabit). */
export const NAV_CHOICES = ["ozet", "tarlalar", "masraf", "gelir", "depo", "fidan", "kumes", "takvim", "rapor", "vadeler", "kayitlar"];
export const NAV_SLOTS = 4;

export type Gorunum = { cards: CardId[]; period: Period; nav: string[] };
export const VARSAYILAN: Gorunum = { cards: ["kar", "hizli", "yeni", "yakin", "hava"], period: "sezon", nav: ["ozet", "tarlalar", "masraf", "gelir"] };

/** Hazır görünümler: tek dokunuşla. */
export const HAZIR: { id: string; label: string; hint: string; g: Gorunum }[] = [
  { id: "tarla", label: "Tarlacı", hint: "Tarla işi, hava, yaklaşanlar önde", g: { cards: ["hizli", "yakin", "hava", "kar"], period: "sezon", nav: ["ozet", "tarlalar", "masraf", "depo"] } },
  { id: "kumes", label: "Kümesçi", hint: "Kümes alt çubukta, aylık kâr", g: { cards: ["hizli", "kar", "yakin", "son"], period: "ay", nav: ["ozet", "kumes", "masraf", "gelir"] } },
  { id: "para", label: "Sadece para", hint: "Kâr, borç, son kayıtlar", g: { cards: ["kar", "yakin", "son"], period: "ay", nav: ["ozet", "masraf", "gelir", "vadeler"] } },
  { id: "sade", label: "En sade", hint: "Sadece hızlı düğmeler ve yaklaşanlar", g: { cards: ["hizli", "yakin"], period: "sezon", nav: ["ozet", "tarlalar", "masraf", "gelir"] } },
];

export function useGorunum() {
  const { prefs, set } = usePrefs();
  const raw = (prefs.ozet ?? {}) as Partial<Gorunum>;
  const ok = new Set<string>(CARDS.map((c) => c.id));
  const g: Gorunum = {
    cards: Array.isArray(raw.cards) ? raw.cards.filter((c) => ok.has(c)) : VARSAYILAN.cards,
    period: PERIODS.some((p) => p.id === raw.period) ? raw.period! : VARSAYILAN.period,
    nav: Array.isArray(raw.nav) && raw.nav.length ? raw.nav.slice(0, NAV_SLOTS) : VARSAYILAN.nav,
  };
  return { g, setG: (patch: Partial<Gorunum>) => set({ ozet: { ...g, ...patch } }), large: prefs.buyukYazi === true, setLarge: (v: boolean) => set({ buyukYazi: v }) };
}

/** Kâr kartının tarih aralığı: [başlangıç, bitiş] (YYYY-AA-GG) ve karşılaştırma aralığı. */
export function periodRange(p: Exclude<Period, "sezon">, today: string): { from: string; to: string; prev: [string, string]; label: string; prevLabel: string } {
  const d = new Date(today + "T12:00:00");
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  if (p === "ay") {
    const from = iso(new Date(d.getFullYear(), d.getMonth(), 1, 12));
    const pf = iso(new Date(d.getFullYear(), d.getMonth() - 1, 1, 12)), pt = iso(new Date(d.getFullYear(), d.getMonth(), 0, 12));
    return { from, to: today, prev: [pf, pt], label: "Bu ay", prevLabel: "geçen aya göre" };
  }
  if (p === "yil") {
    const y = d.getFullYear();
    return { from: `${y}-01-01`, to: today, prev: [`${y - 1}-01-01`, `${y - 1}-${today.slice(5)}`], label: `${y} yılı`, prevLabel: "geçen yılın aynı dönemine göre" };
  }
  const from = iso(new Date(d.getTime() - 29 * 86400000));
  return { from, to: today, prev: [iso(new Date(d.getTime() - 59 * 86400000)), iso(new Date(d.getTime() - 30 * 86400000))], label: "Son 30 gün", prevLabel: "önceki 30 güne göre" };
}
