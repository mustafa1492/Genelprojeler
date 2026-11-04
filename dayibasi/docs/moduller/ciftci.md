# Çiftçi oturumu

**Kapsam:** `products/ciftci/` (App.tsx, screens/*, lists, kayit, sezon, rol, yetki, hava, disaAktar). Ortak masraf ekranı core'da (`core/expenses/ExpenseScreen.tsx`).

## Var olanlar
Tarlalar (köy/ilçe → hava), tarla günlüğü (ilaçlama bekleme, sulama saat/kWh/su ücreti), verim, masraf (tarlalara böl, iş seçimi Fidan/Buğday…, fiş kutusu), gelir, borç-vade, belgeler, depo, sezonlar + rapor (iş iş, geçen sezonla), takvim + hatırlatmalar, kayıtlar, aile + yetkiler, bütün verimi indir. Fidan ayrı oturumda (fidan.md).

## Gerçek kullanıcılar
- Baban: `abdullahsedat`, "Aile defteri" (2 tarla: Mehmet Ağa'nın yeri 25 dönüm, Çayın kenarı 12 dönüm; 2026 mısır verisi girildi). Tarlalara köy girilmedi (hava görünmez).

## Sıradaki (plan)
1. ~~Tapudan tarla getirme~~ (yazıldı, test bekliyor) (TKGM servisi: `cbsapi.tkgm.gov.tr/megsiswebapi.v3/api` → idariYapi/ilListe, ilceListe/{il}, mahalleListe/{ilçe}, parsel/{mahalle}/{ada}/{parsel}; CORS açık; alan m²→dönüm).
2. Dönüm/ürün başı kâr, başabaş, girdi fiyat geçmişi, münavebe görünümü.
3. Devlet destekleri takibi (araştırma: `docs/fikirler/09-devlet-destekleri.md`; tutarlar sabit yazılmaz).
4. Satışta vergi kesintisi (oran doğrulanmadan yapılmaz).
Ayrıntı: `docs/istekler.md`, `docs/arastirma/research_notes/Kanatlı çiftlik modülü/ciftci_defteri_ek_ozellikler.md`.

## Nerede kaldık
- 2026-11-04: Tapudan tarla yazıldı (`products/ciftci/tapu.ts` + Tarla formunda "Parsel sorgula"): il/ilçe/mahalle seç, ada/parsel yaz → dekar (m² ÷ 1000), köy + konum (hava), ad önerisi; `custom`'a il/ilce/mahalle/ada/parsel/tapu_m2/nitelik yazılır. Tarla sayfasında "Ada / Parsel" görünür.
- Ekranlarda "dönüm" yerine "dekar" yazıyor (veri anahtarı `donum` aynı). Core'da `ExpenseScreen.tsx`'te tek yazı değişti ("Dekara göre").
- **Test edilmedi:** tapu servisine gerçek istek atılmadı (alan biçimi "1.234,56" varsayıldı). Mustafa'ya sorulup canlı denenecek.
