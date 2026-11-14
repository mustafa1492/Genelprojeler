# Çiftçi Defteri: proje özeti (fikir alışverişi için)
*14 Kasım 2026 durumu. Başka bir oturuma fikir almak için hazırlandı; kod yazdırmak için değil.*

## Ne bu?
Çiftçinin masrafını, gelirini, tarlasını ve deposunu telefondan kaydettiği, sezon sonunda tarla tarla ne kazandığını gösteren bir uygulama.
- **Adres:** https://genelprojeler.vercel.app (ana sayfa tanıtım sitesi, uygulama `/ciftci`, yönetim paneli `/panel`)
- **Teknik:** Next.js (Vercel'de) + Supabase (veritabanı, giriş). Telefona eklenebilen web uygulaması; internetsiz de kayıt alır, internet gelince eşitler.
- **Kim yapıyor:** Mustafa (ürün sahibi, kararlar) + Claude oturumları (kod). Her modülün kendi oturumu ve dalı var; ortak parçaları ve yayını "Core" oturumu yapar.
- **Hedef kullanıcı:** yaşça büyük, teknolojiyle arası az çiftçi. Bu yüzden büyük yazı, büyük düğme, az ekran, her şey en fazla 2 dokunuş.
- **Aynı altyapıda ikinci ürün:** "Dayıbaşı" (tarım işçisi ekibi yöneten aracı için yevmiye/alacak takibi). Şu an ara verildi.

## Uygulamada şu an ne var (canlıda)
- **Temel:** tarlalar (dekar, ürün, köy; tapudan ada/parsel sorgusu), masraf (türüyle, veresiye), gelir (satış, destek; alınacak tutar ve vadesi), tarla işleri (ilaçlama, gübre, sulama, hasat), verim, başabaş fiyatı.
- **Hesap:** sezon ya da ay/yıl bazında kâr kartı; tarla tarla kâr/zarar; "İşletme gideri" (tarlası olmayan masraf, net kârdan düşer); sezon raporu (PDF ve Excel); her kaydın kendi günündeki TCMB kuruyla dolar/euro karşılığı.
- **Takip:** takvim (işler, hasat bekleme süresi bitişi, vadeler, belge bitişleri, hatırlatmalar), borç-vade, depo (az kalan uyarısı), makineler (bakım, motor saati), belgeler (ÇKS, sigorta…), fotoğraflar/fiş.
- **Modüller (isteğe açılır):** fidan, kümes (kanatlı), büyükbaş, küçükbaş.
- **Ortak kullanım:** aile ve çalışan daveti, ekran ekran yetki (görür/değiştirir/yok), kim neyi girdi, "Geri al", geçmiş.
- **Kişiye özel:** Ekranımı düzenle (özet kartları, alt çubuk, hazır görünümler), büyük yazı, tutarları gizle (`*** TL`), hava durumu.

## Son günlerde yapılanlar (10–14 Kasım)
- Telefon notundaki 14 düzeltme ve modül seçimi/renkleri canlıya çıktı (10 Kasım).
- Arayüz inceleme raporundaki (48 bulgu) okunabilirlik maddeleri yapıldı: küçük yazılar büyüdü, zarar artık yazıyla "zarar" diye gösteriliyor, telefonda rapor tabloları kart listesi oldu, onay kutuları büyüdü/anahtar oldu (11 Kasım, canlıda).
- TÜBİTAK 2209-A başvurusu için hakemlere verilen ortak deneme hesabı hazırlandı: uydurma ama gerçekçi Bergama verisi (mısır, ayçiçeği, domates), örnek kayıtlar silinemiyor, ayar/üye değiştirilemiyor (veritabanı tarafı hazır, uygulama tarafı yayın bekliyor). Başvuru son günü 18 Kasım.
- Veritabanı uyumasın diye günlük otomatik çağrı hazırlandı (yayın bekliyor).
- Güvenlik taraması: depoda gizli anahtar/şifre yok; depo herkese açıktı, gizliye alınması Mustafa'da.

## Çalışma kuralları (kısaca)
- Önce sorun, sonra çözüm; yeni ekran en son çare; varsayılan sade; bir iş bir yol; bir kavram bir ad.
- Para, süre, eşik gibi kurallar uydurulmaz, Mustafa'ya sorulur. Gerçek veri sorulmadan değişmez. Silme yerine gizleme, her işlemde "Geri al".
- Canlıya yalnız Mustafa "yükle" deyince çıkılır.

## Açık sorular ve kararı bekleyenler (fikir istenen yerler)
1. **Modül seçimi ve sadeleştirme (en büyük konu):** girişte büyük kartlarla Tarla / Fidan / Hayvancılık seçimi; her modülün kendi rengi; alt çubuk sabit 5 (Özet · Üretim · ＋ Ekle · Para · Menü); fiş+fotoğraflar → masraf, kayıtlar+geçmiş birleşsin; tarlalar, depo ve makineler her modülde ortak. Önce telefon taslağı (resim) hazırlanacak.
2. **Sezon mu, yıl mı?** Öneri: sezon kalsın, varsayılan takvim yılı olsun, açma/silme derdi kalksın.
3. **"Bizim yaptığımız belli olsun":** uygulamada görünecek ad/imza ne olmalı?
4. **Paket sistemi (Basit / Orta / Tam) ve fiyat:** ertelendi; "Ücretsiz" yazısı fiyat kararı gelene kadar kaldırıldı.
5. **Bilgisayar görünümü:** özet iki sütun, geniş ekranda tarlalar tablo/ızgara.
6. **İlaçlama saati fikri:** hava durumuna göre saat saat "ilaçlamaya uygun mu"; eşikler onaylanmadan yapılmayacak (`docs/fikirler/ilaclama-saati.md`).
7. **Gerçek kullanıcı denemesi:** fidancı (Hüseyin), hayvancı ve kümesçi bulunup sahada denenmesi; veteriner/hayvancıdan süre ve eşik bilgileri.

## Nisan öncesi yapılacaklar
Paket sistemi, basit mod + ilk açılış rehberi, gece yedeği, deneme hesaplarının silinmesi, e-posta ile şifre sıfırlama (SMTP), KVKK metinleri, son güvenlik kontrolü, Android mağaza sürümü (TWA).

## Daha fazla ayrıntı (depoda)
- Çalışma kuralları: `dayibasi/docs/moduller/README.md`, sözlük ve kontrol listesi: `kilavuz.md`
- Modül notları: `dayibasi/docs/moduller/*.md` (core, ciftci, fidan, hayvancilik, kanatli, tanitim)
- İstekler: `dayibasi/docs/istekler.md`, fikirler: `dayibasi/docs/fikirler/`, plan ve maliyet: `dayibasi/docs/plan/is-plani-ve-maliyet.md`
