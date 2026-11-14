// Ortak girdi kataloğu (Core): depo, masraf ve tarla işinde aynı adlar. Marka adı yok; yaygın gübre adları ve ilaç türleri.
// Kayıtta yazı saklanır; liste yalnız öneridir (kişi istediğini yazabilir).
export const GUBRELER = ["Üre (%46)", "DAP (18-46-0)", "Amonyum sülfat (%21)", "Amonyum nitrat (%33)", "CAN (%26)", "20-20-0", "15-15-15", "20-20-20",
  "Potasyum sülfat", "Kompoze", "Yaprak gübresi", "Ahır gübresi"];
export const ILAC_TURLERI = ["Yabancı ot ilacı", "Mantar ilacı", "Böcek ilacı", "Örümcek ilacı", "Kükürt", "Göztaşı (bordo bulamacı)", "Yazlık yağ"];

export const TOHUMLAR = ["Buğday tohumu", "Arpa tohumu", "Mısır tohumu", "Ayçiçeği tohumu", "Pamuk tohumu", "Domates fidesi", "Biber fidesi", "Karpuz fidesi", "Yonca tohumu", "Ispanak tohumu"];

/** Türe göre öneriler (depo türü ya da masraf türü: "Gübre", "İlaç", "Tohum / fide"); diğer türlerde boş. */
export const girdiOnerileri = (tur: string): string[] => (/gübre/i.test(tur) ? GUBRELER : /ilaç/i.test(tur) ? ILAC_TURLERI : /tohum|fide/i.test(tur) ? TOHUMLAR : []);
