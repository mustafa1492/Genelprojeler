# Ürün tarifi: Dayıbaşı sistemi, ilk sürüm

## Kim kullanır?
- **Dayıbaşı (sahip):** her şeyi görür ve girer. Çoğu teknolojiye uzak.
- **Yardımcı (çalışan):** dayıbaşının oğlu, yeğeni ya da puantörü; panele kayıt girebilir.
- **İşçi ve çiftçi:** uygulamaya girmez; WhatsApp mesajı alır.

## Ekranlar ve akışlar

### 1. Bugün (açılış ekranı)
- (1 Kasım 2026) Kayıt 3 adım: tarla → kimler gitti → **Ücretler**: işçi başı yevmiye ve senin payın ayrı ayrı − / + ile; altta "İşçilere" ve "Senin payın" ayrı hesap
- Gün değiştirme (önceki gün / bugüne dön): unutulan günün kaydı sonradan girilir
- "Dünkü gibi": son iş gününün kayıtları tek dokunuşla tekrar eklenir
- Kayda dokununca: kimler gitti, para dökümü, Sil (geri alınabilir)
- Yarının yoklama özeti, bu haftanın kişi-gün ve payın
- En üstte, varsa **kırmızı uyarı:** süresi geçmiş izin kâğıdı ("Bu arabayla işçi taşıma, ceza yazılır") → "Kâğıdı yeniledim" düğmesi yeni bitiş tarihini sorar
- "Bugün tarlada X kişi" büyük sayı
- Bugünün kayıtları: tarla adı, kişi sayısı, araba
- Ana düğme **"+ Bugünün kaydını ekle"** → 3 adım:
  1. Hangi tarla? (büyük seçim düğmeleri, en son kullanılanlar üstte)
  2. Kaç kişi? (− / + sayaç; son değer hazır gelir)
  3. Hangi araba? (seçim düğmeleri)
  → Kaydet → "Kaydettim: Hasan Ağa, 14 kişi, 45 ABC 101 arabası."
- Seçilen arabanın izin kâğıdı geçmişse kayıtta uyarı gösterilir
- Küçük ikincil seçenek: "ya da sesle söyle" (ilk sürümde yapılmayabilir)

### 2. Ekibim
- Üstte "Herkese sor: Yarın geliyor musun?" → her işçiye wa.me bağlantısıyla hazır mesaj
- Geliyor / Gelmiyor / Bekleniyor sayıları
- ~~Beceriye göre filtre~~ kaldırıldı (Mustafa, 1 Kasım 2026): beceri etiketi yok
- ~~Gruplar~~ ekrandan kaldırıldı (Mustafa, 1 Kasım 2026): liste yalnız **yarın durumuna** göre bölünür: Cevap bekleniyor / Geliyor / Gelmiyor
- Her satırda doğrudan Geliyor / Gelmiyor düğmesi; "Bekleyenlere sor" (yalnız cevap vermeyenlere WhatsApp), "Gelenleri paylaş" (gelenlerin listesi tek mesajla, ör. şoföre)
- Ekleme/çıkarma çok kolay: listenin üstünde tek kutu "Ekibe ekle" (seçili gruba eklenir); "Çıkar…" ile her satırda Çıkar düğmesi; her işlemde Geri al
- Ekibe eklerken **doğum tarihi zorunlu** (aynı adlı kişileri ayırmak için); aynı ad + aynı doğum tarihi ikinci kez eklenemez; aynı adlılar listede doğum yılıyla görünür. 18 yaşından küçükse uyarı (engel değil).
- Geliyor / Gelmiyor / Bekleniyor kutularına dokununca liste o duruma süzülür.
- İşçi kartı: ad, baş harfler, grubu, doğum tarihi ve yaşı, yarın durumu
- Kişi kartı detayı: telefon, köy, beceriler, çalıştığı günler, avans/ödeme geçmişi

### Kayıtlar (1 Kasım 2026, alt menüde Arabalar'ın yerine)
- Gün gün bütün kayıtlar (yeniden eskiye): tarla, kimler gitti, yevmiye, payın
- "Kişiye göre" seçince yalnız o işçinin çalıştığı günler + "X gün çalıştı"
- Kayda dokun → düzenle: gün, tarla, kimler (ekle/çıkar), isimsizse kişi sayısı, yevmiye, pay; Sil. Kaydet/Sil sonrası Geri al
- Aynı düzenleme ekranı Bugün'de kayda dokununca da açılır

### Alacaklarım ekleri (1 Kasım 2026)
- Gecikme: çiftçinin en eski ödenmemiş işinden (ödemeler eski işlerden başlayarak düşülür) **15 gün** (ayardan değişir) geçince kart kırmızı kenarlı, "X gündür ödenmedi" etiketi, en üste çıkar; düğme "Hatırlat (hesabı gönder)"
- Toplu gönderim: "Borçlu herkese hesap gönder" / "Herkese hesabını gönder": sırayla Gönder (WhatsApp tek tek açılır), kaçının gönderildiği görünür, telefonu olmayanlar ayrıca yazılır
- Excel: çiftçi hesapları, işçi hesapları, aylık puantaj (CSV; Türkçe Excel için ; ayırıcı, UTF-8, gg.aa.yyyy)

### 3. Arabalar (şimdilik menüde yok; Mustafa: "önemi yok")
- Araba kartı: plaka, tür, kaç kişilik, şoför
- Tek satır durum: "Her şey tamam" (yeşil) ya da "İzin kâğıdının süresi geçmiş" (kırmızı)
- Kâğıtlar: izin kâğıdı, muayene, sigorta, koltuk sigortası → bitiş tarihi ve "X gün kaldı / Süresi geçti"
- Bitişten 5 gün önce dayıbaşına WhatsApp hatırlatması (ilk sürümde: panelde uyarı; otomatik mesaj sonra)

### 4. Alacaklarım
- "Sana borçlu olanların toplamı"
- Çiftçi kartı: kalan borç, son ödemeden bu yana geçen gün, toplam kişi-gün
- "Hesabını WhatsApp'tan gönder" → hazır döküm mesajı (gün, kişi, tutar, ödenen, kalan)
- Ödeme girişi: tutar + tarih (sayı klavyesi, tek alan)

## Hesap mantığı (Mustafa ile netleşti, 1 Kasım 2026)
- Dayıbaşı payı: kişi başı **sabit TL** (işletme ayarı, varsayılan 150).
- Yevmiye: piyasa ortalaması, ±100 TL oynar → **her kayıtta** girilir (son değer hazır gelir, − / + 50'şer).
- Çiftçiden kişi başı alınan = yevmiye + dayıbaşı payı.
- İşçilere parayı **dayıbaşı öder**.
- Kimin çalıştığı her kayıtta **elle seçilir**; istenirse isim seçmeden sadece sayı girilir (o zaman işçi hesabına yazılmaz).
- Rakamlar kayıt anında kaydın içine yazılır; ayar sonradan değişse de eski kayıtların hesabı değişmez.
- Alacaklarım: Çiftçiler (borç, ödeme aldım, WhatsApp hesap) · İşçiler (kalan, Öde, Herkese öde, WhatsApp hesap) · Puantaj (ay ay, kim kaç gün, gün gün kim nerede; WhatsApp'ta paylaş / kopyala) · Özet (yıl yıl: payın, toplam iş, tahsil oranı, işçilere ödenen; ay ay çubuk grafik ve ortalama yevmiye; en çok iş yapılan çiftçiler ve en çok çalışan işçiler).

## Hesap mantığı (ilk taslak)
- Çiftçinin borcu = Σ (kayıttaki kişi sayısı × kişi başı ücret) − Σ ödemeler
- Kişi başı ücret işletme ayarında; çiftçiye göre değiştirilebilir. Örnek: Manisa Ziraat Odaları 2026 tavsiyesi kesici için 1.450 TL + 150 TL dayıbaşı payı = 1.600 TL
- İşçi alacağı = çalıştığı gün × yevmiye − avanslar − ödemeler

## İlk sürümde YOK
- İşçi devri / dayıbaşılar arası işçi paylaşımı (hassas nokta, CLAUDE.md Kural 3)
- Çiftçinin kendi talep açması, eşleştirme
- Otomatik WhatsApp gönderimi (resmi API)
- GPS, hava durumu, İŞKUR rapor şablonları

## Sonraki sürümler (sırası pilot geri bildirimine göre)
Tarla kartı (ÇKS, konum) · avans ve işçi ödemeleri · sezon raporu · İŞKUR sözleşme ve yıllık rapor · taşıma sözleşmesi şablonu · "bu araba bu tarlaya gidebilir mi" kontrolü · otomatik hatırlatma mesajları · sesli kayıt
