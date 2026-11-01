// Dayıbaşı ürününe özel ayarlar.
// Ortak kod (core/) bu dosyadaki değerlerle çalışır; başka bir ürün (randevu, esnaf)
// kendi config.ts dosyasını yazar, core/ değişmez.

export const config = {
  product: "dayibasi",

  people: {
    kinds: {
      isci: { label: "İşçi", plural: "İşçiler" },
      ciftci: { label: "Çiftçi", plural: "Çiftçiler" },
      sofor: { label: "Şoför", plural: "Şoförler" },
    },
    tags: [] as string[],   // beceri etiketi kullanılmıyor (Mustafa, 1 Kasım 2026)
    // Ekip içi sınıflandırma: dayıbaşı kendi gruplarını açar (custom.grup)
    groupKey: "grup",
    customFields: [
      { key: "dogum", label: "Doğum tarihi", type: "date", required: true },
      { key: "koy", label: "Köyü", type: "text" },
    ],
  },

  places: {
    label: "Tarla",
    customFields: [{ key: "cks_no", label: "ÇKS no", type: "text" }],
  },

  assets: {
    label: "Araba",
    documentTitles: ["İzin kâğıdı", "Muayene", "Sigorta", "Koltuk sigortası"],
    remindDaysBefore: 5,
  },

  // Çiftçinin kartında sorulan alanlar (etiket yok)
  farmers: {
    kind: "ciftci",
    customFields: [{ key: "koy", label: "Köyü", type: "text" }],
  },

  ledger: {
    // Varsayılanlar (işletme ayarından değiştirilir). Çiftçiden kişi başı alınan = yevmiye + dayıbaşı payı.
    // Örnek: Manisa Ziraat Odaları 2026 tavsiyesi 1.450 + 150 = 1.600 TL (docs/urun.md)
    defaultWage: 1450,   // işçinin günlük yevmiyesi
    defaultFee: 150,     // dayıbaşı payı, kişi başı
    wageStep: 50,        // − / + adımı (yevmiye piyasaya göre ±100 TL oynar)
  },

  texts: {
    appName: "Dayıbaşı",
    businessPlaceholder: "Örnek: Mehmet Yılmaz ekibi",
  },

  screens: {
    bugun: "Bugün",
    ekip: "Ekibim",
    arac: "Arabalar",
    alacak: "Alacaklarım",
  },
} as const;
