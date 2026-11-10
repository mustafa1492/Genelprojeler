# Fidan oturumu

**Kapsam:** `products/ciftci/fidan.ts`, `products/ciftci/screens/Fidan.tsx` (ve Gelir'deki fidan satışı, Tarlalar'daki fidan bilgisi). Panelden defter başına açılan modül (settings.modules "fidan"). Ortak masraf/gelir/depo core ve çiftçi tarafında.

## Var olanlar
Partiler (dikim, kaynak, pasaport), çok tarlalı dikim (tarlalara dağıtım), dikime/tarlaya göre görünüm, sayım (boy sınıfları, fire sebebi), bakım, hatırlatma, sipariş (kapora), sevk listesi (PDF), fotoğraf, taşıma/saksıya alma (maliyetiyle), fidan başı maliyet (genel masraf fidan sayısına, tarla masrafı canlı fidana göre), kâr oranıyla önerilen fiyat, Excel. Fidan/Buğday iş ayrımı (Fidan maliyetine sadece "Fidan" seçilen genel masraflar girer).

## Gerçek kullanıcı
- Hüseyin: `hüseyinköprü`, "Köprü fidancılık". Deneme: `ornekfidan`.

## Sıradaki
Mustafa'nın onayladığı işler (10 Kasım 2026), sıra henüz kesin değil:
1. **Tek satışta birden çok boy ve parti:** satış ve siparişte birden çok satır (boy × parti × adet × fiyat); sevk listesi ve borç tek parça. Eski tek satırlı kayıtlar bozulmadan okunmalı.
2. **Büyüme takibi ve tahmin:** ara ara yapılan ölçümler/sayımlar arasındaki büyüme hızı (boy dağılımının kayması, gün başına), ölçümden ölçüme karşılaştırma; buradan "bu parti X boyuna yaklaşık ne zaman gelir" tahmini.
3. **Sezon özeti (fidan içinde):** sezonda satılan adet, boy başına ortalama fiyat, fidan başı kâr, müşteri sayısı, fire.
4. **Müşteri telefonu ve tekrar satış:** telefon bir kez girilir; hesap / fiyat listesi doğrudan kişiye; geçmiş müşterilere fiyat listesi gönderme.
5. **Teklif PDF'i (estetik):** sadece fiyat teklifi değil, içinde **tanıtım** da olacak (işletme hakkında yazı, fotoğraflar, iletişim, belki pasaport/sertifika bilgisi). Tanıtım içeriği **uygulamadan düzenlenebilir** olmalı. Tasarımı özenli olmalı (kapak, logo, düzenli tablo).
6. **Dikim hesaplayıcı (konuşuluyor):** tarla dönümü + kullanılacak alan + sıra arası / sıra üzeri → fidan adedi (yol ve yedek payıyla), sıra uzunluğu, damla boru, işçilik, gübre/torf, maliyet; ters hesap; "bu planla dikim ekle". Birim değerler kullanıcıdan, uydurulmaz.
7. **Ek fikirler (10 Kasım 2026, listeye alındı).** Önce: 7a, 7b, 7c.
   - 7a. **Şimşir güvesi / yanıklık takibi:** feromon tuzağı sayımı, artınca ilaçlama uyarısı; atılan ilaç ve etki süresi.
   - 7b. **Herkese açık katalog sayfası:** teklif PDF'iyle aynı tanıtım içeriği (tek yerde düzenlenir); stokla güncel boylar, isteğe bağlı fiyat, fotoğraf, "WhatsApp'tan sipariş ver".
   - 7c. **Söküm ve sevk planı:** bekleyen siparişlerin teslim tarihine göre hangi partiden / boydan kaç sökülecek, işçi tahmini.
   - QR etiket (parti/sıraya; okutunca parti açılır, sayım/bakım girilir).
   - Tarla haritası (hangi sırada hangi parti).
   - Don / sıcak uyarısı (tarla konumundan ücretsiz hava tahmini).
   - Sulama günlüğü (su/elektrik maliyeti fidan başına).
   - Adete göre fiyat kademesi (indirim teklif ve satışta kendiliğinden).
   - Gelecek sezona ön sipariş (büyüme tahminiyle, kaporalı).
   - İzlenebilirlik belgesi (dikim, kaynak, ilaçlar, pasaport; sevk listesiyle).
   - Elde kalan fidanın değeri (fiyat listesine göre).
   - Hibe / kredi raporu (TKDK, Ziraat; maliyet, gelir, üretim özeti PDF).
- **Hüseyin'e sorulacaklar:** `huseyin-sorular.md` (üretim, dikim ihtiyaç listesi ve birim değerler, büyüme, satış, teklif PDF'i). Hepsi bir seferde sorulacak; dikim hesaplayıcının birim değerleri oradan gelecek.
- Diğer: Hüseyin'in geri bildirimi; tür/çeşit bazlı fiyat (birden çok tür üretilirse); hızlı (tahmini) sayım, çelikle üretim, parti karşılaştırma raporu (öneri, onaylanmadı).

## Nerede kaldık
- 4 Kasım 2026 (modul/fidan): Stok ekranı (boy boy elde / siparişte / satılabilir, parti dağılımı, boyu sayılmamışlar), Müşteriler (fidan satışı alıcısı + sipariş müşterisi, ad eşleşmesi büyük/küçük harf duyarsız; borç = Gelir'deki kalan), müşteri hesabını WhatsApp'tan gönderme, Fiyat listesi (settings.fidan_prices, boy başına tek fiyat: şimdilik sadece şimşir) + WhatsApp paylaşma (stok adediyle ya da adetsiz). Müşteriden "Ödeme al": tutar en eski borçlu satıştan başlayarak düşer (Mustafa kararı), satışın data.received'ı artar (Vadeler ile aynı yol), borçtan fazlası girilemez, geri alınabilir. Gelir'de fidan satışı: boy seçince fiyat listesinden fiyat dolar (elle yazılınca bir daha değişmez; siparişten gelen fiyat ve düzenlenen satış ezilmez). Canlıda (Core birleştirdi).
