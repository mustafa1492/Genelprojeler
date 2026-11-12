# Core oturumu
**Kapsam:** giriş ve yetkiler, ortak ekranlar (masraf, alt çubuk/Menü, Ayarlar, Ekranımı düzenle, Özet), internetsiz kayıt, tasarım, yönetim paneli, veritabanı, döviz, Excel, yayın · **Dal:** `gelistirme` · **Kod:** `core/`, `products/panel/`, `app/`, `next.config.ts`, `supabase/`, ayrıca `products/ciftci/` içinde App, Menu, gorunum, excel, screens/Ana-Ayarlar-Duzenle-Fotograflar · **Sınır:** modül ekranlarının içine modül oturumu bakar; Core birleştirir ve yayınlar.

## Canlıda ne var
- Giriş (kullanıcı adı / e-posta), davet koduyla katılma, yetkiler (yönetici, aile, çalışan, özel), veritabanı erişim kuralları, yönetim paneli (/panel).
- Telefon: alt çubuk (4 yer + Menü), Ayarlar, Ekranımı düzenle (hazır görünümler, kartlar, alt çubuk, kâr dönemi), Özet'te uzun basma. Bilgisayar: yan menü, iki sütun özet, tablolar.
- Kişiye özel ayarlar (`user_prefs`), internetsiz kayıt, tutarları gizle (`*** TL`), büyük yazı.
- Döviz karşılığı (TCMB, kaydın günü; `/api/kur`), yeni Excel (tablolar, formüller, Özet sayfası), bütün verimi indir.
- Modüller: fidan, kümes, büyükbaş, küçükbaş, makineler, tapudan parsel sorgusu.
- Son yayın: 4 Kasım 2026 (main `69f32dd`).

## Yapılacaklar (sırayla)
1. **Yayın bekliyor (gelistirme'de, test edildi):** telefon notundaki düzeltmeler ve "İşletme gideri". Mustafa "yükle" deyince main'e.
2. Tanıtım sitesi `gelistirme`'ye birleştirildi (10 Kas, `daced8c`; ana sayfa, giriş ekranı, logo/simgeler dahil): Mustafa "yükle" deyince 1. maddeyle birlikte main'e.
3. Mustafa'nın elle test listesinden (`docs/test-plani.md`) gelecek hatalar.
4. Arayüz raporundan seçilenler (`docs/fikirler/arayuz-onerileri.md`) ve giriş ekranı düzenlemesi: Mustafa seçince.
5. Nisan öncesi: paket sistemi (Basit/Orta/Tam), basit mod + ilk açılış rehberi, yedek (0013), deneme hesaplarını silme, SMTP (şifre sıfırlama), KVKK, Supabase uyku çözümü, son güvenlik kontrolü, Android (TWA).

## Mustafa'dan beklenenler
- Parsel sorgu canlıda çalışıyor mu (il listesi geliyor mu)? Gelmezse sunucu üzerinden çağırma denenecek.
- Sezon mu, yıl mı? (Öneri: sezon kalsın, varsayılan takvim yılı olsun.)
- Uygulamada "bizim yaptığımız belli olsun" için görünecek ad/imza ne?
- Giriş ekranında ne değişsin? (Tanıtım oturumu 10 Kas'ta yeni görünüm yaptı, `gelistirme`'de; Mustafa bakacak.)
- Gelir ve hatırlatmada tarla seçilmeyince yazan "Genel" kalsın mı?

## Bekleyen istekler
- (Kanatlı, 4 Kasım 2026) Canlıda 0013_yedek uygulanmamış (`yedek.al` yok, gece yedeği çalışmıyor). Uygulanınca 0018_hayvan.sql sonundaki yedek bölümü de çalıştırılmalı (barns/herds/herd_days yedeğe girsin). (diğer oturumlardan)
- (yok)
## Diğer oturumlardan istekler
- (Kanatlı, 4 Kasım) 0013 yedek uygulanınca `0018_hayvan.sql` sonundaki yedek bölümü de çalıştırılacak (barns/herds/herd_days); hayvancılık için `animals`, `animal_events` de eklenecek.
- (Tanıtım, 10 Kas, yapıldı) `/ciftci?kayit=1` doğrudan "Yeni hesap aç" açar; sitedeki "Hemen başla" buna bağlı.
- (Hayvancılık) Alt menü çok sekmeyle kalabalıktı → Menü ile çözüldü.
- (Tanıtım oturumu, 10 Kasım 2026, Mustafa'nın isteğiyle yapıldı) Giriş ekranı yeni görünüm: `core/auth/AuthGate.tsx` Login + `core/ui/ui.css` `.ui-auth*`. Mantık değişmedi; `?kayit=1` ile kayıt modunda açılır. Dayıbaşı tarafını da etkiler (aynı ekran).
- (Tanıtım oturumu, 10 Kasım 2026, Mustafa'nın isteğiyle) **Ana sayfa değişti:** `app/page.tsx` = tanıtım sitesi. Dayıbaşı "Bugün" `/` → `/bugun` (`app/(dayibasi)/bugun/page.tsx`, `products/dayibasi/nav.tsx`, `Bugun.tsx`; çiftçi `otherHomes` dayibasi → `/bugun`). `manifest.ts` start_url `/ciftci`. `public/sw.js` PAGES'e `/ciftci` eklendi (önbellek adı sonra `dayibasi-v2` yapıldı). Çıkış yapınca `/`'a gidilir = tanıtım sayfası.
- (Tanıtım, 10 Kas, Mustafa'nın isteğiyle) Yeni logo: `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `app/favicon.ico` değişti; telefonlarda eski simge kalmasın diye önbellek adı `dayibasi-v2` (`public/sw.js` + `RegisterSW.tsx`).

## Kararlar ve kalıcı bilgiler
- **Yayın:** iş `gelistirme`'de yapılır, Mustafa "yükle" deyince main; Vercel main'i yayınlar. Veritabanı önizleme ve canlıda aynı.
- **Kişiye özel görünüm** kişi başına tutulur (deftere değil); sürükleme yok, seçerek ve ↑ ↓ ile (Mustafa: sürükleme uygulamayı kastırır).
- **Döviz:** her kayıt kendi günündeki TCMB döviz satış kuruyla; hafta sonu/tatilde önceki iş günü; varsayılan dolar; altın yok.
- **Tutarları gizle:** bulanık değil `*** TL`; `formatTL` ve `fmtFx` bayrağa bakar; Excel ham sayı kullanır (`formatTLRaw`).
- **İşletme gideri:** tarlası olmayan masraf; raporda ayrı başlık; dekar başı masrafa girmez; net kârdan düşülür. Kayıtta `place_id` boştur.
- **Geri tuşu:** bir önceki ekrana döner (`useBack`); sabit "Özet'e dön" yazılmaz.
- **Açılır seçim (`Pick`)**: çok seçenekli yan yana düğme yerine; tür seçimi liste.
- **Paket sistemi ertelendi** (modüller oturunca). Plan: `settings.paket` + `app_config` tanımları + panelde seçim; hazır görünümler pakete bağlanabilir.
- **Veri yapısı:** `user_prefs` (0020: kişi + defter → prefs: `ozet` {cards, period, nav, quick}, `buyukYazi`, `doviz`); `businesses.settings` (modules, hidden_screens, seasons, lists[key] {added, hidden, order}); göçler 0001–0020 canlıda (0013 yedek hariç).
- **Hesaplar** (şifreler depoda yok, Mustafa'da): yönetici `admin@dayibasi.test`; deneme `denememcbü` ("MCBÜ deneme çiftliği", bütün modüller), `denemetum`, `ornekciftci`, `ornekfidan`. Hepsi gerçek kullanıma geçmeden silinecek.
- **Test:** sahte Supabase + Playwright (giriş `/auth/v1/token` sahte cevap; `/rest/v1` tabloları sahte veri). Betikler oturumun geçici klasöründeydi, kalıcı değil; gerekirse yeniden yazılır. Bu ortamdan gerçek telefonda deneme yapılamaz.
- Supabase ücretsiz plan: 7 gün kullanılmazsa uyur, veri silinmez, panelden Restore. `user_prefs` için anon yetkisi kaldırılmadı (erişim kuralı zaten engelliyor); istenirse SQL Editor'den `revoke all on user_prefs from anon;`.

## Saklanan fikirler
- İlaçlama saati (hava durumuna göre saat saat uygun/değil): `docs/fikirler/ilaclama-saati.md`. Eşikler onaylanmadan kodlanmaz.
- Arayüz incelemesi, 48 bulgu: `docs/fikirler/arayuz-onerileri.md` (içinde: Vadeler'de aynı alacağın iki kez sayılma riski).
- TÜBİTAK 2209-A başvurusu: `docs/tubitak/README.md` (ayrı oturumda yürüyor).
- Bilgisayarda tablonun sağında ayrıntı paneli; Menü'de borç/vade uyarı etiketi; hazır görünümlerin ne değiştirdiğini kartta açıkça yazmak.

- 4 Kasım (3): Tutarları gizle artık bulanık değil "*** TL" (formatTL ve döviz karşılığı bayrağa bakar, kök usePrivacy ile yeniden çizer; Excel ham sayı kullanır). Göz tuşu kâr kartının sağ üstünde (kâr kartı gizliyse başlıkta). Parsel sorgu düzeltmesi: CSP tkgm adresini engelliyordu (il listesi gelmiyor, "Seç" kilitli) → connect-src'ye cbsapi.tkgm.gov.tr eklendi. Bu ortamdan tarayıcıyla TKGM 403 verdi (ortam kısıtı olabilir); canlıda telefonda denenmeli.

## Sıradaki
- **Mustafa'nın telefon notu (5 Kasım), incelendi, KODLANMADI.** Sıra önerisi: A → sezon/yıl kararı → B (+12) → C.
  - A. Hata: (1) Geri tuşu geldiği yere dönmüyor (Ayarlar içi → Özet'e, Ayarlar→İşler → Özet'e, Tarlalar'da masraf eklerken → Masraf'a); sekmeler arası geçmiş tutulmalı [Core]. (2) Silinen sezon geri eklenemiyor (muhtemelen aynı ad kontrolü) [Çiftçi; 13 ile birlikte]. (3) Listeye ekleyince "geri al" çıkmıyor [Çiftçi]. (4) İşleri düzenle sıralanamıyor, ↑↓ [Çiftçi]. (5) Alt çubuğa simgesi olmayan sekme konunca (ör. "Sezon raporu") sadece yazı çıkıyor, hizasız ve iki satır (Mustafa ekran görüntüsü, 5 Kasım). Çözüm: alt çubuğa konabilen her sekmeye simge (rapor, vadeler, kayıtlar, takvim, büyükbaş/küçükbaş, makineler, depo), alt çubukta kısa ad ("Rapor", "Vadeler"); her durumda diğerleriyle aynı hizada, tek satır. Ekranımı düzenle'deki seçicilerde ad kesiliyor ("Sezon r…"): kısa ad, taşmasın [Core]. Sezon/yıl kararı sonraya. (6) Fotoğrafla fiş ekledikten sonra masrafta "saçma" durum — EKRAN GÖRÜNTÜSÜ/ADIM İSTENECEK [Core].
  - B. Küçük: (7) "1 kayıt sırada bekliyor" uyarısı yumuşasın. (8) + Masraf ekle / + Gelir ekle düğmeleri çok büyük, daha zarif. (9) Yeni masrafta alttaki uzun yazı yerine "Detaylandır / düzenle". (10) Masraf türü seçimi kalabalık → açılır liste (öneri: sık 4–6 düğme + "Diğer ▾"; Kural 2 ile dengelenecek, Mustafa karar verecek).
  - C. Özellik: (11) Kâr kartına dokununca ayrıntı + dönem seçimi oradan. (12) Hızlı düğmeleri özelleştirme (Ekranımı düzenle). (13) Sezon yerine yıl — KARAR: öneri sezon kalsın, varsayılan takvim yılı, açma/silme derdi kalksın. (14) Takvim: seçili gün yokken ayın hepsi, güne dokununca o gün, boşluğa dokununca tekrar ay [Çiftçi]. (15) Bütün fotoğraflar (fiş, belge…) tek yerde (Menü → Fotoğraflar). (16) Masraf "genel / tarlalara böl" mantığı — Mustafa'nın beklediği davranış dinlenecek. (17) Uygulamanın bizim yaptığımız belli olsun (giriş ekranı/Ayarlar altı imza; hangi ad?) [Core + Tanıtım].
- **Arayüz inceleme raporu** (ajan, 4 Kasım): `docs/fikirler/arayuz-onerileri.md` — 48 bulgu, öncelik/iş/dosya yolu, ilk 10 hızlı kazanım, giriş ekranı 3 seçenek. Mustafa hangilerinin yapılacağını seçecek. (Ekran görüntüleri geçici klasördeydi, depoda yok.)
- **Önüne sunulacak fikir: İlaçlama saati** (hava durumuna göre saat saat uygun/değil) → `docs/fikirler/ilaclama-saati.md` (kural tablosu, yerleşim, diğer modüllere bağlama, açık sorular). Kodlanmadı; eşikler onaylanmadan yazılmayacak.
- **NOT (Mustafa): Giriş ekranı düzenlenecek** — ne istendiği konuşulacak (görünüm, metinler, kullanıcı adı/şifre akışı?).
- **CANLIDA** (4 Kasım, main d820174). Mustafa: bir süre yeni özellik yok, sadece hata avı. Elle test listesi: `docs/test-plani.md` (A–J). Mustafa'nın bildirdiği hatalar numarasıyla gelecek; düzelt, otomatik testi tekrar çalıştır, sonra yayınla.
- Otomatik deneme betiği oturum geçici klasöründeydi (kalıcı değil); gerekirse yeniden yazılır: sahte Supabase (Playwright route), girişte /auth/v1/token sahte cevap, 9 yapılandırma × 22 ekran.
- Açık küçük not: user_prefs için anon yetkisi kaldırılmadı (RLS zaten engelliyor); istenirse SQL Editor'den `revoke all on user_prefs from anon;`.
## Günlük
- 10 Kas: Az token kuralları (README §3), `kilavuz.md` (kontrol listesi, sözlük, şablon, rapor düzeni) ve `scripts/rapor.sh` (tek komutla durum) eklendi.
- 10 Kas: Not düzeni ve çalışma ilkeleri yazıldı (README: ilkeler, kontrol listesi, sözlük, şablon); modül notları şablona çevrildi (tanitim.md kendi dalında, oturumu çevirecek).
- 10 Kas: "Genel" masraf → "İşletme gideri"; raporda ayrı başlık + net kâr tablosu; Excel'de ayrı sayfa. gelistirme. Örnek veriyle denendi.
- 10 Kas: Telefon notundaki 14 düzeltme (geri tuşu, liste geri al/sıralama, alt çubuk simgeleri, masraf formu, fiş akışı, kâr kartı ayrıntısı, hızlı düğmeler, takvim, fotoğraflar, sakin eşitleme şeridi). gelistirme. Sahte sunucuyla denendi.
- 9 Kas: `denememcbü` deneme hesabı açıldı (canlı veritabanı, rastgele 2025–2026 verisi).
- 5 Kas: TÜBİTAK taslağı hazırlandı; telefon notu incelendi; arayüz inceleme ajanı raporu kaydedildi.
- 4 Kas: Canlıya çıktı: döviz + yeni Excel, `***` ile gizleme, parsel sorgu için güvenlik ayarı düzeltmesi.
- 4 Kas: Canlıya çıktı: yeni telefon arayüzü; kanatlı, çiftçi (makineler, tapu), fidan, hayvancılık dalları birleştirildi; 9 yapılandırma × 22 ekran denendi.
