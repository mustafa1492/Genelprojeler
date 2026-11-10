# Çiftçi oturumu
**Kapsam:** `products/ciftci/` (App.tsx, screens/*, lists, kayit, sezon, rol, yetki, hava, disaAktar). Ortak masraf ekranı core'da (`core/expenses/ExpenseScreen.tsx`). · **Dal:** `modul/ciftci` · **Sınır:** ortak masraf ekranı, Özet, Menü, Ayarlar Core'da.

## Canlıda ne var
Tarlalar (köy/ilçe → hava), tarla günlüğü (ilaçlama bekleme, sulama saat/kWh/su ücreti), verim, masraf (tarlalara böl, iş seçimi Fidan/Buğday…, fiş kutusu), gelir, borç-vade, belgeler, depo, sezonlar + rapor (iş iş, geçen sezonla), takvim + hatırlatmalar, kayıtlar, aile + yetkiler, bütün verimi indir. Fidan ayrı oturumda (fidan.md).

## Yapılacaklar (sırayla)
1. ~~Tapudan tarla getirme~~ (yazıldı, servis denendi) (TKGM servisi: `cbsapi.tkgm.gov.tr/megsiswebapi.v3/api` → idariYapi/ilListe, ilceListe/{il}, mahalleListe/{ilçe}, parsel/{mahalle}/{ada}/{parsel}; CORS açık; alan m²→dönüm).
2. ~~Kâr analizi~~ → `docs/istekler.md`'ye yazıldı, şimdilik yapılmayacak (Mustafa).
3. (Bekliyor, yapılmayacak) Devlet destekleri takibi (araştırma: `docs/fikirler/09-devlet-destekleri.md`; tutarlar sabit yazılmaz).
4. (Bekliyor, yapılmayacak) Satışta vergi kesintisi (oran doğrulanmadan yapılmaz).
Ayrıntı: `docs/istekler.md`, `docs/arastirma/research_notes/Kanatlı çiftlik modülü/ciftci_defteri_ek_ozellikler.md`.

## Mustafa'dan beklenenler
(yok)

## Kararlar ve kalıcı bilgiler
- **Modül seçimi ve renkler (Mustafa, 10 Kasım 2026, çiftçi oturumundan):** Girişte büyük kartlarla seçim: 🌾 Tarla / 🌱 Fidan / 🐄 Hayvancılık (hayvancılık tek kart; içinde kümes, büyükbaş, küçükbaş). Sadece defterde açık modüller çıkar; tek modül varsa sorulmaz. Son seçilen hatırlanır, üstte "🌱 Fidan ▾" ile değiştirilir. Her modülün kendi rengi (üst şerit, düğmeler, alt çubuk). Para: modülde sadece o modülün masraf/geliri görünür, bir düğmeyle "Hepsi" (bütün masraflar/gelirler, toplam kâr). Ortak kalanlar: borç-vade, belgeler, aile, ayarlar. Ayrıca konuşulan sadeleştirme: Fiş+Fotoğraflar → Masraf, Kayıtlar+Geçmiş birleşir, tarihler Takvim'de toplanır, Sezonlar → Rapor, alt çubuk sabit 5 (Özet · Üretim · ＋ Ekle · Para · Menü), belge/fotoğrafa "neye ait" (tarla/makine/sürü) alanı. Önce telefon taslağı (resim) gösterilecek, Mustafa onaylayınca kod.
  - Ek (Mustafa, 10 Kasım): Seçim ekranında sadece hesaba açılmış modüller çıkar (ör. tarla + fidan açıksa yalnız o ikisi). Ortak kullanılabilen bölümler (masraf, gelir, depo, makineler, takvim, borç-vade, belgeler, rapor) **her modülün içinde** yer alır, kullanıcı modülden çıkmadan ulaşır; ayrı bir "ortak" alana gitmez. İlke: ulaşım kolaylığı en üstte, her şey en fazla 2 dokunuşta.
  - Ek (Mustafa, 10 Kasım): **Tarlalar, Depo ve Makineler ortak**: her modülde aynı tam liste (fidan da tarlada yetişir, traktör her işte kullanılır). Modüle göre ayrılan: modülün kendi işleri (fidan dikim/sayım, hayvan kayıtları, tarla işleri) ve masraf/gelir/rapor görünümü ("Hepsi" düğmesiyle tamamı).
- Baban: `abdullahsedat`, "Aile defteri" (2 tarla: Mehmet Ağa'nın yeri 25 dönüm, Çayın kenarı 12 dönüm; 2026 mısır verisi girildi). Tarlalara köy girilmedi (hava görünmez).

## Saklanan fikirler
- Kâr analizi, devlet destekleri takibi, satışta vergi kesintisi: `docs/istekler.md` (şimdilik yapılmayacak; oranlar doğrulanmadan yazılmaz).
- (Fidan oturumundan not, 10 Kasım 2026) Dikim hesaplayıcı ortak olacak: çiftçi şablonları eklenebilir: fide (domates, biber; sıra arası × sıra üzeri, viyol adedi), bahçe (zeytin, meyve; 6×6 m gibi, dönüme ağaç), tohum (dönüme kg). Sonuç masrafa / tarla bilgisine aktarılır. Hesaplayıcı önce fidanda yazılıp core'a taşınacak; şablonları bu oturum ekler.

## Günlük
- 2026-11-10: Makineler listesinde sadece listedeki makineler görünüyor (çıkarılan makine artık görünmüyor; kayıtları masrafta kalır). Makineler → Belgeler → Geri artık Makineler'e döner (`geri` parametresi). Hayvan "Bugünün kaydı"nda Kayıp (ölü, ayıklanan) ve Yem ayrı kartlarda (hayvancılık dosyası, küçük değişiklik).
- 2026-11-04: **Makine bakımı** yazıldı (`screens/Makineler.tsx`, sekme `makineler`, yetki = tarlalar). Makineler ve bakım işleri düzenlenebilir listede (`makineler`, `makine_isleri`). Kayıt: `events.kind = 'makine'`, quantity = motor saati, data {makine, is, not, next_on, next_hours, expense_id}. Tutar girilirse "Traktör / makine" masrafı (data.makine). Özet "Yaklaşanlar": sonraki tarih 7 gün kala (`config.remindDays.makine`, Mustafa'ya sorulmadı, değiştirilebilir) (motor saatine göre uyarı yok, Mustafa: sadece makine sayfasında "tavsiye X saatte" bilgisi). Takvimde görünür. Muayene/sigorta → Belgeler bağlantısı. Ekrandan denenmedi.
- Tarla düzenlerken kayıtlı Ada/Parsel görünüyor.
- 2026-11-04: Tapudan tarla yazıldı (`products/ciftci/tapu.ts` + Tarla formunda "Parsel sorgula"): il/ilçe/mahalle seç, ada/parsel yaz → dekar (m² ÷ 1000), köy + konum (hava), ad önerisi; `custom`'a il/ilce/mahalle/ada/parsel/tapu_m2/nitelik yazılır. Tarla sayfasında "Ada / Parsel" görünür.
- Ekranlarda "dönüm" yerine "dekar" yazıyor (veri anahtarı `donum` aynı). Core'da `ExpenseScreen.tsx`'te tek yazı değişti ("Dekara göre").
- TKGM servisi denendi (2026-11-04): il/ilçe/mahalle listeleri, parsel (alan "9.766,00" biçiminde, koordinat [boylam, enlem]), olmayan parsel 404 — kod bunlarla uyumlu. Önizlemede ekrandan denenmedi.
- 2026-11-10: **Bölüm (modül) seçimi, 1. adım** yazıldı (`products/ciftci/modul.tsx`): birden çok bölüm açıksa girişte büyük kartlar (Tarla yeşil, Fidan turkuaz, Hayvancılık kahverengi); seçim cihazda hatırlanır (`ko:modul:<defter>`); renk `--ana*` değişkenleriyle bütün uygulamaya; başka bölüme özel sekmeler (fidan / kümes, büyükbaş, küçükbaş) gizlenir, gerisi ortak; alt çubukta bölümün ekranı 2. sırada; bölüm değiştirme: Özet'te ad düğmesi, Menü'de "Bölüm" satırı, bilgisayarda yan menüde. Tarla her defterde açık sayılıyor (Mustafa'ya sorulacak: sadece fidancı/hayvancıda Tarla kartı çıksın mı). Sıradaki adımlar: para (masraf/gelir/rapor) bölüme göre + "Hepsi" düğmesi; ＋ Ekle ortada sabit 5'li alt çubuk (Core: TabShell). `core/ui/ui.css` sonuna küçük stil eklendi. Ekrandan denenmedi.
