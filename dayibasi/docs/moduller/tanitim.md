# Tanıtım + Pazarlama oturumu
**Kapsam:** tanıtım sitesi (ana sayfa `/`, "Giriş yap" uygulamaya), logo, paylaşım görseli, pazarlama içerikleri, mağaza metni · **Dal:** `modul/tanitim` · **Kod:** `app/page.tsx`, `app/tanitim/` (Tanitim.tsx, rehber.ts, NasilKullanilir.tsx, Etkilesim.tsx, tanitim.css, cep.tsx), `public/tanitim/` · **Sınır:** core/, App, Menü, veritabanına dokunmaz (dokunulanlar core.md "Diğer oturumlardan istekler"de). Hiçbir şey Mustafa onayı olmadan yayınlanmaz/gönderilmez.

## Canlıda ne var
- (yok) Site henüz canlıda değil; son yayın main `69f32dd` (4 Kas) sitesizdir. Bütün iş `gelistirme`'ye birleştirildi (`daced8c`, 10 Kas), Vercel önizlemesinde görülür.

## Yapılacaklar (sırayla)
1. Mustafa doğru WhatsApp numarasını verince `app/tanitim/Tanitim.tsx` → `WA_NUMARA` (90 ile başlayan, boşluksuz) doldurulacak; boşken sitede "[YER TUTUCU] numara bekleniyor" görünür.
2. Canlıya çıkış: Mustafa Core'a "yükle" der (ya da bu oturuma main izni verir).
3. Uygulamada ekran/düğme adı değişince `app/tanitim/rehber.ts` (Nasıl kullanılır, 18 bölüm 68 konu) güncellenecek.

## Mustafa'dan beklenenler
- WhatsApp numarasının doğrusu nedir? (Verilen numarada bir hane eksikti; numara nota yazılmaz.)
- Canlıya çıkarma: Core'a "yükle" mi diyeceksin, yoksa bu oturuma main izni mi vereceksin?
- Metin onayı: ana cümle ("Tarlanın hesabı cebinde."), "Ücretsiz. Kredi kartı istemez.", sık sorulan soruların cevapları (özellikle "bilgilerin kimseyle paylaşılmaz, satılmaz").
- Alan adı (ertelendi).

## Kararlar ve kalıcı bilgiler
- 10 Kas: **Ücret alınmayacak.** Paket/fiyat bölümleri siteden kaldırıldı, `app/tanitim/cep.tsx`'te saklı (Mustafa: "cebe at, ileride yine ekleriz").
- 10 Kas: Proje TÜBİTAK başvurusuna çevrildi; sitede TÜBİTAK ile ilgili değişiklik yapılmayacak, sadece ücret kısmı kalktı (Mustafa).
- 10 Kas: **Ana sayfa `/` = tanıtım sitesi** (Mustafa: "ilk site bu çıksın"); modüller öne çıkarıldı ("göz önünde olsun"). Giriş yapmış kişi (oturum çerezi) `/`'dan `/ciftci`'ye geçer; `/tanitim` yönlendirmesiz kopya (noindex).
- 10 Kas: İletişim = WhatsApp düğmesi (Mustafa "WhatsApp'tan bana ulaşılabilsin").
- 10 Kas: Logo = Mustafa'nın verdiği resim (`docs/tasarim/logo-kaynak.jpg`); Canva logosu ve SVG denemesi beğenilmedi. Logo yazısı Nunito 900, "Defteri" buğday sarısı. Uygulama simgeleri, favicon ve paylaşım görseli de bu logoyla.
- 10 Kas: Etkileşimli parçalar (Mustafa seçti): Hesap açmadan dene, Kârını hesapla, Hangi modül bana göre? Hiçbiri kayıt göndermez.
- Eski paket kararları (ertelendi, cep.tsx'te): Basit ücretsiz ve sınırsız; fidan/hayvancılık Tam'a dahil; deneme süresi yok; "hasattan sonra öde" ödemeler konuşulurken açılacak.
- Alan adı ertelendi. Mağaza: önce Android. Destek: uygulama içi kısa videolar.
- Renkler: koyu yeşil #16351c, ana #2e6a2b, buğday #e9c46a, krem zemin #fbf7ee. Dış font/görsel/script yok (CSP); fontlar next/font ile gömülü.

## Saklanan fikirler
- Paketler ve fiyatlar (`app/tanitim/cep.tsx`).
- Uygulama içi kısa videolar (senaryo), Google Play mağaza metni.
- Sitedeki örnek ekranda "Tutarları gizle / büyük yazı" gösterimi (sunuldu, seçilmedi).

## Tuzaklar (ortam)
- Canva ücretsiz plan şeffaf PNG vermiyor; arka plan Python ile temizlendi. Google/Flow resim aracı bağlı değil; ElevenLabs bağlayıcısı kısıtlı (resim yok).
- Otomatik izin denetimi main'e push'u ve geniş `pkill`'i engelliyor; önizleme sunucusu (port 3125) arka plan görevi olarak açılıp TaskStop ile kapatılmalı.
- Dosya taşıyınca `tsc` eski `.next/types` yüzünden hata verir: önce `next build`.
- Vercel hesabına bu ortamdan erişim yok (önizleme adresi kontrol edilemiyor).

## Günlük
- 10 Kas: Yeni logo (site, uygulama simgeleri, favicon, paylaşım görseli), önbellek adı `dayibasi-v2`; `gelistirme`'ye birleştirildi (`daced8c`), main'e gönderim izinle engellendi.
- 10 Kas: Görsel tasarım (yardımcı ajan): buğday/krem palet, tarla SVG arka planı, dalga ayraçlar.
- 10 Kas: Etkileşimli parçalar (dene, kâr hesapla, modül seçici); 320/390/1366 px'te tıklanarak denendi.
- 10 Kas: Ana sayfa tanıtım sitesi oldu, dayıbaşı "Bugün" `/bugun`'a taşındı, modül kartları eklendi.
- 10 Kas: "Nasıl kullanılır" bütün bölümler (18 bölüm, 68 konu), adlar koddan doğrulandı; giriş ekranı yenilendi (`?kayit=1`).
- 10 Kas: Ücret kısımları kaldırıldı (cep.tsx), WhatsApp düğmesi yeri, paylaşım görseli.
- 4 Kas: Site taslağı `/tanitim` (yardımcı ajan), `modul/tanitim`.
- 4 Kas: Paket kararları alındı (sonradan ertelendi).
