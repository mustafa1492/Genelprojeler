# Dayıbaşı Takip-Kayıt Sistemi

*Durum: ⭐ En çok ilgimi çeken fikir — görüşme aşaması*

> ⚠️ **Hassas nokta — atlama:** İşçinin başka dayıbaşı seçebilmesi dayıbaşıların hoşuna gitmeyebilir ("benim işçimi elimden alıyor"). Bunu dayıbaşılarıyla yüz yüze ya da telefonda mutlaka konuş ve nasıl dengeleneceğini onlardan dinle.

## Fikir
Dayıbaşı işini dijitale çevirmek. Dayıbaşının yerine geçmek değil, **dayıbaşına araç olmak**. Müşteri ve para ödeyen dayıbaşı olur; işçiler ve çiftçiler sisteme ücretsiz girer.

## Neden bende avantaj var?
- Puantörlük yaptım, işin içini biliyorum
- WhatsApp'tan 70-80 dayıbaşına şimdiden ulaşabiliyorum
- Saha Operasyon Takip Sistemi projesi zaten bu işin yarısı

## Sahada gördüğüm sorunlar
- **İşçi:** bazı bölgelerde birden fazla dayıbaşı var, işçi seçebiliyor. İşçiye çalışabileceği dayıbaşı bulmak bile büyük artı.
- **Dayıbaşı:** lojistik, işçi bulma, müşteri bulma; bunların her birinin ayrı takip derdi. Üstüne muhasebe, vergi, evrak ve aklıma gelmeyen bir sürü iş.
- **Çiftçi:** bazen dayıbaşı bulmak zor. Üstelik her işçi her işi yapamıyor; mısır püskülü çekemeyen biri zeytini iyi topluyor olabilir.

## Sistemin üç tarafı
### 1. Dayıbaşı ↔ İşçiler
- Ertesi gün kim gelecek, hangi araç, hangi tarla: işçiye otomatik WhatsApp haberi
- İşçi kendi çalıştığı günleri ve alacağını görebilir (gün sayısı kavgası biter)
- Avans ve ödeme kaydı
- Her işçinin hangi işte deneyimli olduğu (zeytin, mısır püskülü, çapa…)

### 2. Dayıbaşının kendi işi
- Günlük puantaj, araç ve şoför takibi
- Kimden ne alacak, kime ne borç, sezon kârı
- Akşam tek mesajla günün özeti
- Mali müşavire hazır döküm (muhasebe/vergiyi sıfırdan yapma, kayıtları düzgün tut)

### 3. Dayıbaşı ↔ Müşteri (çiftçi/firma)
- Çiftçi "yarın 20 kişi lazım" diye talep açar, dayıbaşı onaylar
- Çiftçiye otomatik döküm: kaç kişi, kaç gün, ne tutar
- Ödeme hatırlatma, geçmiş işlerin kaydı
- Büyük firmalar için rapor/fatura modülü (ileride ayrı gelir olabilir)

## Kullanım şekli
- **WhatsApp = giriş kapısı:** dayıbaşı sesli mesaj ya da kısa yazıyla kayıt yapar ("Bugün Hasan Ağa'nın tarlasına 14 kişi, 2 araç"), yapay zekâ anlayıp kaydeder
- **Web paneli = beyin:** kayıtlar, raporlar, alacak-verecek burada; dayıbaşının çocuğu/yeğeni/puantörü de kullanabilir
- Dayıbaşıların çoğu teknolojiye uzak → yazılım kullandığını hissetmemeli

## Para verdirecek değerler
- Kaybolan alacak (tek bir kaçan alacak yıllık ücreti çıkarır)
- Yevmiye hatası ve işçiyle küslük
- Her akşam defter-hesap-telefon trafiğine giden zaman
- Çiftçiye düzgün döküm veren dayıbaşı daha çok iş alır

Hedef cümle: *"Bu sistem sana sezonda şu kadar kazandırır, sen bunun küçük bir kısmını ödüyorsun."*

## Gerçekçi sıralama
1. Önce dayıbaşının operasyon aracı (para ödeyen ve bağlanan o)
2. Sistemde işçi kayıtları ve yetenekleri birikir
3. Sonra çiftçi talepleri ve eşleştirme gelir

Tersinden başlarsan boş pazar yeri olur.

## Gelir modeli (düşünce)
- İlk sezon ücretsiz deneme
- Sonra **sezonluk ücret** (aylık abonelikten daha iyi tutabilir)
- İleride: firmalar için rapor/fatura modülü, mali müşavir anlaşmalı paket

## Riskler ve dikkat
- Ödemeler çoğu zaman nakit/kayıt dışı; "devlete kayıt" değil, "hesap karışmasın, alacağın kaybolmasın" diye sun
- İlk müşteriler çok önemli, memnun kalan da kalmayan da anlatır
- 70-80 kişinin hepsine birden gitme; önce yakın ve açık fikirli 3-5 kişiyle başla

---

## Araştırma Bulguları (1 Kasım 2026)

### Yasal çerçeve — ürünün en büyük fırsatı olabilir
Resmi adı **tarım aracısı**. Yasal olarak çalışmak için İŞKUR'dan "tarımda iş ve işçi bulma aracısı belgesi" gerekiyor. İŞKUR'a göre aracının yükümlülükleri:
- Belge 3 yıl geçerli, 3'er yıl yenileniyor
- İşveren ve işçilerle yapılan sözleşmeyi **10 iş günü içinde İŞKUR onayına** göndermek
- İşçiye işe başlamadan iş, ücret ve şartlar hakkında bilgi vermek
- İşverenle birlikte güvenli taşımayı gözetmek
- İşçinin günlük brüt ücretinin asgari ücretin altında olmamasını sağlamak
- **Her yıl İŞKUR'a faaliyet raporu** vermek
- İşçiden ücret alamaz; ücret yalnızca işverenden alınır

👉 **Fikir:** Sistem bu evrakı kendiliğinden üretebilir: sözleşme şablonu, işçi listesi, yıllık faaliyet raporu. "Evrak derdini bitiren sistem" dayıbaşının en çok değer vereceği şey olabilir.
⚠️ **Risk:** Belgesiz çalışan dayıbaşılar da var. Sistem kayıt dışılığı kolaylaştırıyor gibi görünmemeli; "belgeni al, evrakını biz hazırlayalım" çizgisi daha güvenli.

**Sahadan bilgi:** Dayıbaşıların İŞKUR belgesi olup olmadığını bilmiyorum, ama **taşıma için resmi yerlerden aldıkları evrakları var.** Yani resmi evrakla uğraşmaya zaten alışıklar; evrak modülü onlara yabancı gelmez.

Belgenin adı **"Tarım İşçisi Taşıma İzin Belgesi" / "Geçici Taşıma Belgesi"**. Dayıbaşıların Esnaf Kefalet'ten kredi çekebildiğini duydum; bu, esnaf sicil kayıtlı olabileceklerini gösteriyor (İzmir'de belge için oda/esnaf sicil kaydı isteniyor, aşağıda).

### Taşıma belgesi — araştırma (1 Kasım 2026)
**Manisa (Büyükşehir UKOME Dairesi veriyor):**
- İki tür: **hususi** (kendi işçisini taşıyan toprak sahibi) ve **ticari** (taşımacılık yapan şoför)
- Hususi belge süresi ÇKS'deki arazi büyüklüğüne göre: 10-30 dönüm 1 ay, 30-60 dönüm 2 ay, 60+ dönüm 3 ay
- Ticari taşımada ÇKS sahibi ile şoför arasında resmi **taşıma sözleşmesi** gerekiyor
- Şoförlere göre belge süresi 6 aydan **1 aya** düştü, her ay yenileme için şoför başına **~3.000 TL** ödeniyor (Ağustos 2026)
- **Belgede yazılı ÇKS'li tarla dışında taşıma yasak, cezası var**
- Gerilim: Manisa Şoförler ve Otomobilciler Esnaf Odası, J plakasız taşımaya ve dayıbaşılara karşı; "kiralık ÇKS" iddiaları var

**İzmir (Büyükşehir) için istenen belgeler:** çalışma/güzergâh izin belgesi ya da araç uygunluk belgesi, ruhsat, muayene/egzoz, şoför tanıtım kartı ve ehliyet, şoförün SGK kaydı, **oda kayıt ve esnaf sicil belgesi**, çiftçi kayıt formu.

👉 **Bu sistem için ne demek?**
- Her ay yenilenen belge = **sürekli hatırlatma ihtiyacı**. Kaçan bir yenileme ceza demek.
- Hangi aracın hangi tarlalara (ÇKS) gidebileceği belli. Sistem, dayıbaşı ekibi bir tarlaya yönlendirirken **"bu araç bu tarlaya gidebilir mi?"** kontrolü yapabilir. Bu, cezadan doğrudan koruyan, kimsenin yapmadığı bir özellik.
- Taşıma sözleşmesi ve belge başvuru evrakı şablondan otomatik hazırlanabilir.
- ⚠️ J plaka esnafıyla dayıbaşılar arasında gerilim var; sistem hiçbir tarafın kural dışı işini kolaylaştırıyormuş gibi görünmemeli. Sunuş: "kurallara uygun çalış, cezadan kurtul."

Kaynaklar: [Manisa Manşet — mevsimlik işçi taşıması tartışması](https://www.manisamansetgazetesi.com/manisa-haberleri/manisada-her-gun-binlerce-isci-baglara-tasiniyor-mevsimlik-isci-tasimasi-tartisma-konusu-oldu/620063) · [Manisa Kulis — J plaka uyarısı](https://www.manisakulishaber.com/manisada-tarim-iscisi-tasimaciliginda-j-plaka-uyarisi) · [İzmir BB — Tarım İşçisi Taşıma İzin Belgesi](https://tuhim.izmir.bel.tr/tr/Tasitlar/19)

👉 **Yeni modül fikri — Araç ve evrak takibi:** her aracın taşıma izni, muayene, sigorta, şoför belgeleri ve bitiş tarihleri tek yerde; süresi dolmadan WhatsApp'tan hatırlatma. Cezayı ve aracın yolda kalmasını önler, değeri hemen anlaşılır.

Ayrıca 2024/5 sayılı Cumhurbaşkanlığı Genelgesi'yle mevsimlik işçiler için devletin **e-METİP** bilgi sistemi var ve işverenlerin çalıştırdıkları mevsimlik işçileri kolluğa bildirmesi isteniyor. Bildirim/kayıt işi de sistemin modülü olabilir.

### Dayıbaşının kazancı — fiyatlandırma için çıpa
- Manisa Ziraat Odaları İl Koordinasyon Kurulu'nun 2026 tavsiye ücretlerinde (10 Ağustos 2026) işçi başına günlük **150 TL dayıbaşı payı** var (örn. kesici: 1.450 TL + 150 TL = 1.600 TL)
- Sarıgöl üzüm bağlarında (Haziran 2026) günlük yevmiye 1.425 TL, bunun **125 TL'si dayıbaşı payı**
- Kaba hesap: 30 kişilik ekip × 150 TL = günde ~4.500 TL dayıbaşı geliri. Sezonluk birkaç bin TL'lik ücret, tek kaçan alacakla bile kendini çıkarır.
- Not: çiftçiler artan işçilik maliyeti yüzünden imeceye yöneliyor; maliyet hassasiyeti yüksek.

### Rakipler
- **EFENDİ (Efendi Çiftçinin Dijital Özgürlüğü):** MCBÜ Teknokent'teki Gidea Medya'nın çiftçi uygulaması. Drone ilaçlama talebi, işçi/iş ilanı, hava durumu, pazar yeri. **Dayıbaşı operasyonu (puantaj, alacak, evrak) yok.** Haber 2024'te "yolda" diyordu; yayında olup olmadığını kontrol et.
- **sezonlukisci.net:** iş/işçi ilan sitesi gibi görünüyor, erişilemedi; elle bak.
- Sonuç: İlan/eşleştirme tarafında rakip var, **dayıbaşının günlük işi ve evrakı** tarafı boş görünüyor.

### Teknik maliyet notu
WhatsApp Business API, 1 Ekim 2026'dan itibaren müşterinin başlattığı konuşmalardaki cevapları da mesaj başı ücretlendiriyor. Türkiye fiyatları Meta'nın sayfasından kontrol edilmeli. Mesaj maliyeti fiyatlandırmaya eklenmeli; günlük özet gibi sık mesajlar hesaplanmalı.

### Kaynaklar
- [İŞKUR — Tarım Aracıları](https://www.iskur.gov.tr/ozel-istihdam-burolari/tarim-aracilari/)
- [Muhasebe News — Tarımda İş Aracılığı](https://www.muhasebenews.com/tarimda-is-araciligi-nedir/)
- [Milli Gazete — Manisa 2026 tarım işçisi yevmiyeleri](https://www.milligazete.com.tr/manisada-alin-terinin-karsiligi-belli-oldu-2026-yili-tarim-iscisi-yevmiyeleri-aciklandi)
- [NTV — Sarıgöl dayıbaşı payı](https://www.ntv.com.tr/yerel-haberler/galeri-gunluk-net-1300-tl-kazaniyorlar-dayibasi-payi-ortaya-cikti-maliyetleri-dusurmek-icin-siraya-girdiler-1728969)
- [Cumhuriyet — Mevsimlik tarım işçileri genelgesi](https://www.cumhuriyet.com.tr/ekonomi/mevsimlik-tarim-iscilerinin-calisma-kosullarinin-iyilestirilmesine-2200493)
- [Manisa Tarım Haber — EFENDİ uygulaması](https://manisatarimhaber.com/gundem/tarim-sektorunde-cigir-acacak-efendi-uygulamasi-yolda)
- [Nordflux — WhatsApp API fiyatları Ekim 2026](https://nordflux.de/tr/bilgi/whatsapp-business-api-fiyatlari-ekim-2026)

---

## Görüşme Soruları
Amaç ürün satmak değil, gerçek dertleri dinlemek. Hepsini tek görüşmede sorma, sohbet gibi geçsin. Her görüşmede **Temel** ve **Kapanış** yeterli; diğerlerini konu gelince sor. Yüz yüze konuşmak telefondan daha iyi sonuç verir.

### Temel
- Bölgede dayıbaşıları birbiriyle rekabet mi ediyor, yoksa işçi devredip yardımlaşıyor mu?
- İşçinin başka dayıbaşına geçebilmesine ne dersin? *(hassas nokta)*
- Kayıtları nasıl tutuyorsun (defter, telefon notu, kafadan)? En çok nerede hata ya da tartışma çıkıyor?
- Sezonda en çok nerede para ya da zaman kaybediyorsun?
- Bu işleri kolaylaştıran bir sisteme sezonda ne öderdin?

### İşin kendisi
- Kaç işçiyle çalışıyorsun? Sezona göre bu sayı nasıl değişiyor?
- Hangi işleri yapıyorsunuz (zeytin, mısır püskülü, çapa, hasat…)? Hangi işçi hangi işte iyi, bunu nasıl biliyorsun?
- Kaç araç/servis var? Şoför, yakıt, güzergâh işini nasıl ayarlıyorsun?
- Bir günün nasıl geçiyor? Sabah işçi toplamadan akşam hesaba kadar en çok neyle uğraşıyorsun?

### İşçi tarafı
- İşçi bulmakta zorlanıyor musun? En çok hangi dönemde?
- İşçiler yevmiyeye, gün sayısına itiraz ediyor mu? Ne sıklıkla?
- Avans veriyor musun? Avansları nasıl takip ediyorsun?
- İşçiye ertesi günün planını nasıl haber veriyorsun?

### Çiftçi / müşteri tarafı
- Müşterilerini (çiftçi, firma) nasıl buluyorsun? Çoğu eski müşteri mi, yeni mi?
- Çiftçiden parayı zamanında alabiliyor musun? Alacak kaçırdığın oldu mu?
- Çiftçiye döküm/hesap veriyor musun? Nasıl?
- Büyük firmalarla çalışıyor musun? Senden evrak, rapor, fatura istiyorlar mı?

### Evrak, muhasebe, vergi
- Muhasebe ve vergi işini kim yapıyor? Mali müşavirle mi çalışıyorsun?
- En çok hangi evrak işi seni uğraştırıyor?
- SGK, İSG gibi zorunluluklar seni ne kadar etkiliyor?
- İŞKUR aracılık belgen var mı? Sözleşmeleri İŞKUR'a gönderiyor musun, yıllık raporu kim hazırlıyor?
- Bu evrakı sistem otomatik hazırlasa işine yarar mı?
- Taşıma için hangi evrakları alıyorsun, nereden (valilik, belediye, emniyet)? Ne sıklıkla yenileniyor?
- Evrakın süresi geçip ceza yediğin ya da aracın yolda kaldığı oldu mu?

### Teknoloji ve kullanım
- WhatsApp'ı ne kadar kullanıyorsun? Sesli mesaj mı, yazı mı?
- Telefon-bilgisayar işini senin yerine yapabilecek biri var mı (çocuk, yeğen, puantör)?
- Daha önce böyle bir uygulama denedin mi? Neden bıraktın?
- Her şeyin kayda geçmesi seni rahatsız eder mi?

### Kapanış
- Sihirli değnek olsa bu işte ilk neyi değiştirirdin?
- Sistem hazır olunca bir sezon ücretsiz denemek ister misin?
- Konuşmamı önereceğin başka dayıbaşı var mı?

---

## Görüşme Notları
| Dayıbaşı | Bölge | Tarih | Öne çıkan dert | İşçi değişimine bakışı | Ödemeye istekli mi? |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
