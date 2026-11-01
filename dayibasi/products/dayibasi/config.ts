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
    tags: ["Zeytin", "Budama", "Üzüm", "Mısır püskülü", "Çapa"],
    customFields: [
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
    defaultDailyRate: 1600, // TL, kişi başı günlük (örnek: Manisa 2026 tavsiyesi, dayıbaşı payı dahil)
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
