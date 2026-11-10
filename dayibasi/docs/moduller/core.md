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
2. Tanıtım taslağını (`modul/tanitim`, `/tanitim`) birleştirmek: Mustafa "birleştir" deyince.
3. Mustafa'nın elle test listesinden (`docs/test-plani.md`) gelecek hatalar.
4. Arayüz raporundan seçilenler (`docs/fikirler/arayuz-onerileri.md`) ve giriş ekranı düzenlemesi: Mustafa seçince.
5. Nisan öncesi: paket sistemi (Basit/Orta/Tam), basit mod + ilk açılış rehberi, yedek (0013), deneme hesaplarını silme, SMTP (şifre sıfırlama), KVKK, Supabase uyku çözümü, son güvenlik kontrolü, Android (TWA).

## Mustafa'dan beklenenler
- Parsel sorgu canlıda çalışıyor mu (il listesi geliyor mu)? Gelmezse sunucu üzerinden çağırma denenecek.
- Sezon mu, yıl mı? (Öneri: sezon kalsın, varsayılan takvim yılı olsun.)
- Uygulamada "bizim yaptığımız belli olsun" için görünecek ad/imza ne?
- Giriş ekranında ne değişsin?
- Gelir ve hatırlatmada tarla seçilmeyince yazan "Genel" kalsın mı?

## Diğer oturumlardan istekler
- (Kanatlı, 4 Kasım) 0013 yedek uygulanınca `0018_hayvan.sql` sonundaki yedek bölümü de çalıştırılacak (barns/herds/herd_days); hayvancılık için `animals`, `animal_events` de eklenecek.
- (Tanıtım) "Ücretsiz başla" doğrudan "Yeni hesap aç" ekranını açsın mı?
- (Hayvancılık) Alt menü çok sekmeyle kalabalıktı → Menü ile çözüldü.

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

## Günlük
- 10 Kas: Az token kuralları (README §3), `kilavuz.md` (kontrol listesi, sözlük, şablon, rapor düzeni) ve `scripts/rapor.sh` (tek komutla durum) eklendi.
- 10 Kas: Not düzeni ve çalışma ilkeleri yazıldı (README: ilkeler, kontrol listesi, sözlük, şablon); modül notları şablona çevrildi (tanitim.md kendi dalında, oturumu çevirecek).
- 10 Kas: "Genel" masraf → "İşletme gideri"; raporda ayrı başlık + net kâr tablosu; Excel'de ayrı sayfa. gelistirme. Örnek veriyle denendi.
- 10 Kas: Telefon notundaki 14 düzeltme (geri tuşu, liste geri al/sıralama, alt çubuk simgeleri, masraf formu, fiş akışı, kâr kartı ayrıntısı, hızlı düğmeler, takvim, fotoğraflar, sakin eşitleme şeridi). gelistirme. Sahte sunucuyla denendi.
- 9 Kas: `denememcbü` deneme hesabı açıldı (canlı veritabanı, rastgele 2025–2026 verisi).
- 5 Kas: TÜBİTAK taslağı hazırlandı; telefon notu incelendi; arayüz inceleme ajanı raporu kaydedildi.
- 4 Kas: Canlıya çıktı: döviz + yeni Excel, `***` ile gizleme, parsel sorgu için güvenlik ayarı düzeltmesi.
- 4 Kas: Canlıya çıktı: yeni telefon arayüzü; kanatlı, çiftçi (makineler, tapu), fidan, hayvancılık dalları birleştirildi; 9 yapılandırma × 22 ekran denendi.
