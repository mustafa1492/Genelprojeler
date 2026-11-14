// Sesle masraf: "mazota üç bin beş yüz verdim" → { tür: Mazot, tutar: 3500 }. Telefonun kendi ses tanıması kullanılır (internet ister).
// Tutar ya rakamla ("3.500", "3 bin 500") ya da yazıyla ("üç bin beş yüz", "iki buçuk bin") gelebilir.

const BIRLER: Record<string, number> = { sıfır: 0, bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9 };
const ONLAR: Record<string, number> = { on: 10, yirmi: 20, otuz: 30, kırk: 40, elli: 50, altmış: 60, yetmiş: 70, seksen: 80, doksan: 90 };

/** Cümledeki tutarı bul (TL): en büyük sayı. Bulamazsa null. */
export function tutarBul(metin: string): number | null {
  const l = sayilar(metin);
  return l.length ? Math.max(...l) : null;
}

/** Cümledeki sayılar, söylendiği sırayla ("50 ton 4 bin 800'den" → [50, 4800]). */
export function sayilar(metin: string): number[] {
  const t = metin.toLocaleLowerCase("tr").replace(/(\d)\.(\d{3})/g, "$1$2").replace(/(\d),(\d+)/g, "$1.$2");
  const kelimeler = t.split(/[^0-9a-zçğıöşü.]+/).filter(Boolean);
  let toplam = 0, grup = 0, sayi = false;
  const out: number[] = [];
  const bitir = () => { if (sayi && toplam + grup > 0) out.push(Math.round((toplam + grup) * 100) / 100); toplam = 0; grup = 0; sayi = false; };
  for (const k of kelimeler) {
    const kok = k.replace(/(lira|lık|lik|tl)$/u, "");
    if (/^\d+(\.\d+)?$/.test(kok)) { if (sayi && grup > 0 && grup % 1000 !== 0 && !(grup >= 100 && Number(kok) < 100 && grup % 100 === 0) && !(grup >= 20 && Number(kok) < 10 && grup % 10 === 0)) bitir(); grup += Number(kok); sayi = true; }
    else if (kok in BIRLER) { grup += BIRLER[kok]; sayi = true; }
    else if (kok in ONLAR) { grup += ONLAR[kok]; sayi = true; }
    else if (kok === "yüz") { grup = (grup || 1) * 100; sayi = true; }
    else if (kok === "bin") { toplam += (grup || 1) * 1000; grup = 0; sayi = true; }
    else if (kok === "milyon") { toplam = (toplam + (grup || 1)) * 1_000_000; grup = 0; sayi = true; }
    else if (kok === "buçuk" && sayi) { grup += 0.5; }
    else if (sayi && (k === "lira" || k === "tl" || k === "ve")) { /* sayı devam edebilir */ }
    else bitir();
  }
  bitir();
  return out;
}

// Tür ipuçları: kelime kökü → listede aranacak türün başı
const IPUCU: [RegExp, string[]][] = [
  [/mazot|motorin|yakıt|benzin/, ["Mazot"]],
  [/gübre|üre|dap|amonyum|kompoze/, ["Gübre"]],
  [/ilaç|ilac|zirai/, ["İlaç"]],
  [/tohum|fide|fidan/, ["Tohum", "Fide"]],
  [/işçi|yevmiye|amele|dayıbaşı/, ["İşçilik"]],
  [/elektrik|sulama|su parası|kuyu|fatura/, ["Sulama", "Elektrik"]],
  [/kira/, ["Kira"]],
  [/traktör|tamir|yedek parça|makine|biçerdöver|lastik/, ["Traktör", "Makine", "Tamir"]],
  [/nakliye|taşıma|kamyon|nakliyat/, ["Nakliye"]],
];

/** Cümleden masraf türü: önce listedeki türün adı geçiyor mu, sonra ipuçları. */
export function turBul(metin: string, turler: string[]): string | null {
  const t = metin.toLocaleLowerCase("tr");
  const kucuk = (s: string) => s.toLocaleLowerCase("tr");
  const dogrudan = turler.find((c) => kucuk(c).split(/[\s/]+/).some((p) => p.length >= 3 && t.includes(p)));
  if (dogrudan) return dogrudan;
  for (const [re, adaylar] of IPUCU) {
    if (!re.test(t)) continue;
    const bulunan = turler.find((c) => adaylar.some((a) => kucuk(c).startsWith(kucuk(a)) || kucuk(c).includes(kucuk(a))));
    if (bulunan) return bulunan;
  }
  return null;
}

type Tanima = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null };

/** Telefon ses tanımayı destekliyor mu? (Android Chrome evet; bazı tarayıcılar hayır.) */
export function sesVarMi(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Bir cümle dinle. Sonuç ya da hata bir kere çağrılır. Dönen fonksiyon dinlemeyi durdurur. */
export function dinle(sonuc: (metin: string) => void, hata: (neden: "izin" | "duyulmadi" | "internet" | "diger") => void): () => void {
  const w = window as unknown as Record<string, new () => Tanima>;
  const T = w.SpeechRecognition || w.webkitSpeechRecognition;
  const r = new T();
  r.lang = "tr-TR"; r.interimResults = false; r.maxAlternatives = 1;
  let bitti = false;
  r.onresult = (e) => { bitti = true; sonuc(e.results[0]?.[0]?.transcript ?? ""); };
  r.onerror = (e) => { bitti = true; hata(e.error === "not-allowed" || e.error === "service-not-allowed" ? "izin" : e.error === "no-speech" ? "duyulmadi" : e.error === "network" ? "internet" : "diger"); };
  r.onend = () => { if (!bitti) hata("duyulmadi"); };
  r.start();
  return () => { bitti = true; r.abort(); };
}

// ---------- Gelir: "domatesi 50 tona 4 bin 800'den sattım", "devlet desteği 21 bin" ----------
export type GelirSes = { tur: string | null; urun: string | null; miktar: number | null; birim: string | null; fiyat: number | null; toplam: number | null };
const BIRIM: [RegExp, string][] = [[/\bton/, "ton"], [/\b(kg|kilo)/, "kg"], [/\bkasa/, "kasa"], [/\badet|\btane/, "adet"], [/\blitre/, "litre"]];

/** urunler: katalogdaki ürün adları; turler: gelir türleri (ilk satış türü "Hasat satışı"). */
export function gelirCoz(metin: string, urunler: string[], turler: string[]): GelirSes {
  const t = metin.toLocaleLowerCase("tr");
  const kok = (s: string) => s.toLocaleLowerCase("tr").replace(/\s*\(.*\)$/, "");
  const urun = urunler.find((u) => { const k = kok(u); return k.length >= 3 && t.includes(k.slice(0, Math.max(3, k.length - 1))); }) ?? null;
  const birim = BIRIM.find(([re]) => re.test(t))?.[1] ?? null;
  const n = sayilar(metin);
  const destek = /deste[kğ]|hibe/.test(t);   // "destek", "desteği" (k → ğ)
  const tur = destek ? turler.find((x) => /deste[kğ]/i.test(x)) ?? null : (urun || birim || /sat/.test(t)) ? turler.find((x) => /satış/i.test(x)) ?? null : null;
  if (birim && n.length >= 2) return { tur, urun, miktar: n[0], birim, fiyat: n[1], toplam: null };
  if (birim && n.length === 1) return { tur, urun, miktar: n[0], birim, fiyat: null, toplam: null };
  return { tur, urun, miktar: null, birim: null, fiyat: null, toplam: n.length ? Math.max(...n) : null };
}

// ---------- Tarla işi: "ova tarlasını ilaçladım" ----------
const ISLER: [RegExp, string][] = [[/ilaç/, "İlaçlama"], [/gübre/, "Gübreleme"], [/sula/, "Sulama"], [/buda/, "Budama"], [/sür/, "Sürüm"],
  [/ekt|ekim|dikt|dikim/, "Ekim / dikim"], [/çapa/, "Çapa"], [/hasat|topla|biçt/, "Hasat"]];

/** Cümleden tarla ve iş türü. tarlalar: [id, ad]; isler: defterin iş listesi. */
export function islemCoz(metin: string, tarlalar: { id: string; name: string }[], isler: string[]): { tarla: string | null; tur: string | null } {
  const t = metin.toLocaleLowerCase("tr");
  const kelimeler = (s: string) => s.toLocaleLowerCase("tr").split(/\s+/).filter((k) => k.length >= 3 && !["tarla", "tarlası", "tarlasını"].includes(k));
  let en: { id: string; puan: number } | null = null;
  for (const p of tarlalar) {
    const puan = kelimeler(p.name).filter((k) => t.includes(k.slice(0, Math.max(3, k.length - 1)))).length;
    if (puan > 0 && (!en || puan > en.puan)) en = { id: p.id, puan };
  }
  const aday = ISLER.find(([re]) => re.test(t))?.[1] ?? null;
  const tur = aday ? isler.find((x) => x.toLocaleLowerCase("tr") === aday.toLocaleLowerCase("tr")) ?? isler.find((x) => x.toLocaleLowerCase("tr").startsWith(aday.toLocaleLowerCase("tr").slice(0, 4))) ?? null : null;
  return { tarla: en?.id ?? null, tur };
}
