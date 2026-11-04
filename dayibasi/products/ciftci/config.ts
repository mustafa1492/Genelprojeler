// Çiftçi defteri ayarları. Ortak kod (core/) bu değerlerle çalışır.
export const config = {
  product: "ciftci",
  texts: { appName: "Çiftçi Defteri", businessPlaceholder: "Örnek: Aile defteri" },
  expenses: { categories: ["Tohum / fide", "Gübre", "İlaç", "Mazot", "İşçilik", "Sulama / elektrik", "Kira", "Traktör / makine", "Nakliye", "Diğer"] },
  operations: ["İlaçlama", "Gübreleme", "Sulama", "Budama", "Sürüm", "Ekim / dikim", "Çapa", "Hasat", "Diğer"],
  incomeKinds: ["Hasat satışı", "Devlet desteği", "Diğer gelir"],
  units: ["kg", "ton", "kasa", "adet", "litre"],
  inventory: { categories: ["Gübre", "İlaç", "Tohum", "Malzeme", "Diğer"], units: ["kg", "litre", "adet", "çuval", "kutu", "paket"] },
  dueKinds: ["Kredi", "Kooperatif", "Bayi", "Çek", "Senet", "Diğer"],
  documents: ["ÇKS", "TARSİM sigortası", "Kira sözleşmesi", "Traktör muayenesi", "Traktör sigortası", "Destek başvurusu", "Ruhsat"],
  remindDays: { dues: 15, documents: 30, makine: 7 },
} as const;

export const BASE = "/ciftci";
