# Fidan oturumu
**Kapsam:** `products/ciftci/fidan.ts`, `products/ciftci/screens/Fidan.tsx` (ve Gelir'deki fidan satışı, Tarlalar'daki fidan bilgisi). Panelden defter başına açılan modül (settings.modules "fidan"). Ortak masraf/gelir/depo core ve çiftçi tarafında. · **Dal:** `modul/fidan`

## Canlıda ne var
Partiler (dikim, kaynak, pasaport), çok tarlalı dikim (tarlalara dağıtım), dikime/tarlaya göre görünüm, sayım (boy sınıfları, fire sebebi), bakım, hatırlatma, sipariş (kapora), sevk listesi (PDF), fotoğraf, taşıma/saksıya alma (maliyetiyle), fidan başı maliyet (genel masraf fidan sayısına, tarla masrafı canlı fidana göre), kâr oranıyla önerilen fiyat, Excel. Fidan/Buğday iş ayrımı (Fidan maliyetine sadece "Fidan" seçilen genel masraflar girer).

## Yapılacaklar (sırayla)
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

## Mustafa'dan beklenenler
- Hüseyin'e sorulacaklar (`huseyin-sorular.md`) ve kullanımından geri bildirim.
- Yapılacakların sırası (onaylandı, sıra kesin değil). Önerilen ilk iş: madde 1 (Hüseyin'in cevabını beklemiyor); planı yazılıp onay alınacak.
- Core'un bıraktığı arayüz raporu maddesi "parti → dikim" (32): ne yapılacağı konuşulmadı.

## Kararlar ve kalıcı bilgiler
- Hüseyin: `hüseyinköprü`, "Köprü fidancılık". Deneme: `ornekfidan`.
- Fiyat listesi boy başına tek fiyat (settings.fidan_prices); neden: şimdilik sadece şimşir üretiliyor. Birden çok tür olursa tür/çeşit bazlı fiyat (Mustafa, 4 Kas).
- Müşteriden ödeme en eski borçlu satıştan başlayarak düşer (Mustafa, 4 Kas); borçtan fazlası yazılamaz, avans tutulmaz (oturumun seçimi).
- Satışta fiyat listeden gelir ama kolay değiştirilebilir olmalı (Mustafa, 4 Kas): elle yazılan fiyat bir daha ezilmez.
- Müşteri = satıştaki alıcı / siparişteki müşteri adı (büyük/küçük harf ve boşluk farkı yok); borç ayrı defter değil, Gelir'deki "alınan"dan hesaplanır.
- Dikim hesaplayıcı: birim değerler (işçi/gün, gübre/dönüm, fiyatlar) kullanıcıdan, uydurulmaz; değerler Hüseyin'e sorulacak (Mustafa, 10 Kas).
- Dikim hesaplayıcı ortak olacak: önce fidanda ürünlerden bağımsız yazılır, sonra Core `core/`'a taşır; çiftçi/hayvancılık şablonlarını kendi oturumları ekler (Mustafa "tamam", 10 Kas).
- Teklif PDF'inde tanıtım olacak ve uygulamadan düzenlenebilir olacak; katalog sayfası aynı tanıtımı kullanır (Mustafa, 10 Kas).

## Saklanan fikirler
(Yapılacaklar madde 7 ve "Diğer" satırı)

## Bilinen açıklar
- 4 Kasım işleri tarayıcıda hiç denenmedi (sadece tip kontrolü); `denemetum` / `ornekfidan` ile bakılmalı.
- "Ödeme al" sadece satışın alınan tutarını artırır; ödemenin tarihi ayrı tutulmaz.
- Müşteri eşleşmesi yalnız ada göre (aynı adlı iki müşteri birleşir); telefon yok, WhatsApp kişi seçtiriyor.
- Fiyat listesinde stok adedi yazılsın mı Mustafa'ya soruldu, cevap gelmedi; ekranda Evet/Hayır seçimine bırakıldı.

## Tuzaklar (ortam)
- `npx tsc` için önce `npm ci` gerekiyor. `npx next lint` lint ayarı olmadığından soru sorup duruyor; lint çalışmıyor.
- `git reset --hard` / zorla push izin sisteminde reddediliyor; dalı güncellemek için `git merge --ff-only origin/gelistirme`.

## Günlük
- 4 Kas (modul/fidan, canlıda): Stok ekranı (boy boy elde / siparişte / satılabilir, parti dağılımı).
- 4 Kas (modul/fidan, canlıda): Müşteriler, borç ve hesabı WhatsApp'tan gönderme.
- 4 Kas (modul/fidan, canlıda): Fiyat listesi ve WhatsApp'ta paylaşma.
- 4 Kas (modul/fidan, canlıda): Müşteriden "Ödeme al" (satışın data.received'ı artar, Vadeler ile aynı yol, geri alınabilir).
- 4 Kas (modul/fidan, canlıda): Gelir'de fidan satışında boy seçince fiyat listeden dolar.
- 10 Kas (modul/fidan, not): Onaylanan işler (Yapılacaklar 1-7) ve `huseyin-sorular.md` yazıldı; hesaplayıcı notu core/çiftçi/hayvancılık dosyalarına bırakıldı.
