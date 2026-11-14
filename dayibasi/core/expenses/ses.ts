// Sesle masraf: "mazota üç bin beş yüz verdim" → { tür: Mazot, tutar: 3500 }. Telefonun kendi ses tanıması kullanılır (internet ister).
// Tutar ya rakamla ("3.500", "3 bin 500") ya da yazıyla ("üç bin beş yüz", "iki buçuk bin") gelebilir.

const BIRLER: Record<string, number> = { sıfır: 0, bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9 };
const ONLAR: Record<string, number> = { on: 10, yirmi: 20, otuz: 30, kırk: 40, elli: 50, altmış: 60, yetmiş: 70, seksen: 80, doksan: 90 };

/** Cümledeki tutarı bul (TL). Bulamazsa null. */
export function tutarBul(metin: string): number | null {
  const t = metin.toLocaleLowerCase("tr").replace(/(\d)\.(\d{3})/g, "$1$2").replace(/(\d),(\d+)/g, "$1.$2");
  const kelimeler = t.split(/[^0-9a-zçğıöşü.]+/).filter(Boolean);
  let toplam = 0, grup = 0, sayi = false, en = 0;
  const bitir = () => { if (sayi) en = Math.max(en, toplam + grup); toplam = 0; grup = 0; sayi = false; };
  for (const k of kelimeler) {
    const kok = k.replace(/(lira|lık|lik|tl)$/u, "");
    if (/^\d+(\.\d+)?$/.test(kok)) { grup += Number(kok); sayi = true; }
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
  // "iki buçuk bin" → (2.5)×1000 olarak çözülür; küsuratlı TL yuvarlanır
  return en > 0 ? Math.round(en) : null;
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
