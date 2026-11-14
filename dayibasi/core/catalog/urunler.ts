// Ortak ürün kataloğu (Core). Tarla ürünü, verim ve ileride Köy pazarı / bölge karşılaştırması aynı adları kullanır:
// "Mısır", "mısır" ve "msr" ayrı yazılırsa o veri hiç toplanamaz. Kayıtta ad (yazı) saklanır; eski serbest yazılar geçerli kalır.
// Listeye ekleme Core'da yapılır; bir defterin kendi yazdığı ürün yalnız o defterde kalır.
export type Urun = { ad: string; grup: string };

const G = (grup: string, adlar: string[]): Urun[] => adlar.map((ad) => ({ ad, grup }));

export const URUNLER: Urun[] = [
  ...G("Tahıl", ["Buğday", "Arpa", "Mısır (dane)", "Mısır (silajlık)", "Yulaf", "Çavdar"]),
  ...G("Endüstri bitkisi", ["Pamuk", "Ayçiçeği", "Tütün", "Şeker pancarı", "Kanola"]),
  ...G("Baklagil", ["Nohut", "Mercimek", "Fasulye (kuru)"]),
  ...G("Yem bitkisi", ["Yonca", "Fiğ", "Silajlık sorgum"]),
  ...G("Sebze", ["Domates (sofralık)", "Domates (salçalık)", "Biber", "Patlıcan", "Hıyar", "Kabak", "Fasulye (taze)", "Patates", "Soğan", "Sarımsak",
    "Ispanak", "Marul", "Lahana", "Karpuz", "Kavun"]),
  ...G("Meyve ve bağ", ["Zeytin", "Üzüm (sofralık)", "Üzüm (kurutmalık)", "Üzüm (şaraplık)", "Çilek", "Şeftali", "Kiraz", "Elma", "Armut", "Nar", "İncir",
    "Mandalina", "Portakal", "Limon", "Badem", "Ceviz", "Kestane"]),
  ...G("Fidan ve fide", ["Fidan", "Fide"]),
];

const kucuk = (s: string) => s.trim().toLocaleLowerCase("tr").replace(/\s+/g, " ");

/** Katalogdaki adı bul (büyük/küçük harf ve boşluk farkını yok sayar). Yoksa null. */
export function katalogAdi(s: string): string | null {
  const k = kucuk(s);
  if (!k) return null;
  return URUNLER.find((u) => kucuk(u.ad) === k)?.ad ?? null;
}
