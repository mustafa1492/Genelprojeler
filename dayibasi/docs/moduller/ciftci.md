# Çiftçi oturumu

**Kapsam:** `products/ciftci/` (App.tsx, screens/*, lists, kayit, sezon, rol, yetki, hava, disaAktar). Ortak masraf ekranı core'da (`core/expenses/ExpenseScreen.tsx`).

## Var olanlar
Tarlalar (köy/ilçe → hava), tarla günlüğü (ilaçlama bekleme, sulama saat/kWh/su ücreti), verim, masraf (tarlalara böl, iş seçimi Fidan/Buğday…, fiş kutusu), gelir, borç-vade, belgeler, depo, sezonlar + rapor (iş iş, geçen sezonla), takvim + hatırlatmalar, kayıtlar, aile + yetkiler, bütün verimi indir. Fidan ayrı oturumda (fidan.md).

## Gerçek kullanıcılar
- Baban: `abdullahsedat`, "Aile defteri" (2 tarla: Mehmet Ağa'nın yeri 25 dönüm, Çayın kenarı 12 dönüm; 2026 mısır verisi girildi). Tarlalara köy girilmedi (hava görünmez).

## Sıradaki (plan)
- (Fidan oturumundan not, 10 Kasım 2026) Dikim hesaplayıcı ortak olacak: çiftçi şablonları eklenebilir: fide (domates, biber; sıra arası × sıra üzeri, viyol adedi), bahçe (zeytin, meyve; 6×6 m gibi, dönüme ağaç), tohum (dönüme kg). Sonuç masrafa / tarla bilgisine aktarılır. Hesaplayıcı önce fidanda yazılıp core'a taşınacak; şablonları bu oturum ekler.
1. ~~Tapudan tarla getirme~~ (yazıldı, servis denendi) (TKGM servisi: `cbsapi.tkgm.gov.tr/megsiswebapi.v3/api` → idariYapi/ilListe, ilceListe/{il}, mahalleListe/{ilçe}, parsel/{mahalle}/{ada}/{parsel}; CORS açık; alan m²→dönüm).
2. ~~Kâr analizi~~ → `docs/istekler.md`'ye yazıldı, şimdilik yapılmayacak (Mustafa).
3. (Bekliyor, yapılmayacak) Devlet destekleri takibi (araştırma: `docs/fikirler/09-devlet-destekleri.md`; tutarlar sabit yazılmaz).
4. (Bekliyor, yapılmayacak) Satışta vergi kesintisi (oran doğrulanmadan yapılmaz).
Ayrıntı: `docs/istekler.md`, `docs/arastirma/research_notes/Kanatlı çiftlik modülü/ciftci_defteri_ek_ozellikler.md`.

## Nerede kaldık
- 2026-11-04: **Makine bakımı** yazıldı (`screens/Makineler.tsx`, sekme `makineler`, yetki = tarlalar). Makineler ve bakım işleri düzenlenebilir listede (`makineler`, `makine_isleri`). Kayıt: `events.kind = 'makine'`, quantity = motor saati, data {makine, is, not, next_on, next_hours, expense_id}. Tutar girilirse "Traktör / makine" masrafı (data.makine). Özet "Yaklaşanlar": sonraki tarih 7 gün kala (`config.remindDays.makine`, Mustafa'ya sorulmadı, değiştirilebilir) (motor saatine göre uyarı yok, Mustafa: sadece makine sayfasında "tavsiye X saatte" bilgisi). Takvimde görünür. Muayene/sigorta → Belgeler bağlantısı. Ekrandan denenmedi.
- Tarla düzenlerken kayıtlı Ada/Parsel görünüyor.
- 2026-11-04: Tapudan tarla yazıldı (`products/ciftci/tapu.ts` + Tarla formunda "Parsel sorgula"): il/ilçe/mahalle seç, ada/parsel yaz → dekar (m² ÷ 1000), köy + konum (hava), ad önerisi; `custom`'a il/ilce/mahalle/ada/parsel/tapu_m2/nitelik yazılır. Tarla sayfasında "Ada / Parsel" görünür.
- Ekranlarda "dönüm" yerine "dekar" yazıyor (veri anahtarı `donum` aynı). Core'da `ExpenseScreen.tsx`'te tek yazı değişti ("Dekara göre").
- TKGM servisi denendi (2026-11-04): il/ilçe/mahalle listeleri, parsel (alan "9.766,00" biçiminde, koordinat [boylam, enlem]), olmayan parsel 404 — kod bunlarla uyumlu. Önizlemede ekrandan denenmedi.
