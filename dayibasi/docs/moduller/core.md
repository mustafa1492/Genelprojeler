# Core oturumu

**Kapsam:** `core/` (auth/AuthGate, members, offline store, expenses/ExpenseScreen, ui, shell/TabShell, appConfig, export), `products/panel/` (yönetim paneli), `app/` (layout, panel), `next.config.ts`, `supabase/` (migrations, functions/admin-users), yayın (main'e birleştirme).

## Durum (4 Kasım 2026)
- Canlıda: yeni tasarım (telefonda sade kartlar, bilgisayarda koyu yeşil gruplu yan menü + tablolar), yetkiler (memberships.perms: yonetici/aile/calisan/ozel; `perm_level`, `can`, `my_perms`), kısıtlayıcı RLS politikaları (0014–0017), yönetim paneli /panel (admin_* fonksiyonları 0016, edge function `admin-users`), app_config (duyuru, yeni_defter_kapali, liste:<key>), güvenlik başlıkları (CSP; open-meteo izinli), davet koduyla katılma, giriş takılma düzeltmesi (tabLock).
- Yönetici hesabı: admin@dayibasi.test (şifre Mustafa'da).
- Supabase ücretsiz plan (7 gün kullanılmazsa uyur, veri silinmez, panelden Restore).

## Bekleyen (Nisan öncesi, sırayla Mustafa'ya hatırlat)
- Paket sistemi (Basit/Orta/Tam) → panelde defter başına paket; modül/bölüm açma kapama zaten var (`hidden_screens`, `modules`).
- Basit mod + ilk açılış rehberi.
- Yedek (0013_yedek.sql hazır, uygulanmadı; dış yedek için açık izin gerekir).
- Deneme hesaplarını silme, SMTP (şifre sıfırlama), KVKK, Supabase uyku çözümü, son güvenlik kontrolü.
- Android (TWA) paketi.
- Taslakta tablonun sağında ayrıntı paneli vardı, yapılmadı (isteğe bağlı).

## Bekleyen istekler
- (Kanatlı, 4 Kasım 2026) Canlıda 0013_yedek uygulanmamış (`yedek.al` yok, gece yedeği çalışmıyor). Uygulanınca 0018_hayvan.sql sonundaki yedek bölümü de çalıştırılmalı (barns/herds/herd_days yedeğe girsin). (diğer oturumlardan)
- (yok)

## Nerede kaldık
- 4 Kasım: **Telefon arayüzü yenilendi** (gelistirme, canlıda DEĞİL): alt çubuk 4 yer + Menü (alttan açılan, gruplu), Ayarlar ekranı (aile, listeler, sezonlar, tutarları gizle, büyük yazı, verimi indir, panel, çıkış), Ekranımı düzenle (hazır görünümler: Tarlacı/Kümesçi/Sadece para/En sade; kâr dönemi sezon/ay/yıl/30 gün; özet kartları aç-kapa + ↑↓; alt çubuk seçimi). Özette uzun basma: gizle/yukarı/aşağı. Sürükleme yok (Mustafa: kastırır). Kişiye özel: `user_prefs` tablosu (0020, canlı veritabanına UYGULANDI), `core/prefs.tsx`, `products/ciftci/gorunum.ts`. Bilgisayarda özet iki sütun.
- Aynı gün birleştirildi: modul/kanatli, ciftci (makineler, tapudan tarla), fidan (stok, müşteri, fiyat listesi), hayvancilik (küpe kartı, 0019 canlıda), tanitim (not). Menü'ye büyükbaş/küçükbaş/makineler eklendi.
- Deneme (sahte sunucu, telefon 390 px + bilgisayar): özet, dönem değiştirme, Menü, Ayarlar, büyük yazı, hazır görünüm, sıralama, alt çubuk seçimi, uzun basma, yeniden açınca ayarın kalması ve 18 modül ekranı geçti; konsol hatası yok. Eksik adresler eklendi: /ciftci/takvim, /kayitlar, /fis.
- Paket sistemi ertelendi (modüller oturunca). Hazır plan: settings.paket + app_config tanımları + panelde seçim; hazır görünümler pakete bağlanabilir.

## Sıradaki
- **CANLIDA** (4 Kasım, main d820174). Mustafa: bir süre yeni özellik yok, sadece hata avı. Elle test listesi: `docs/test-plani.md` (A–J). Mustafa'nın bildirdiği hatalar numarasıyla gelecek; düzelt, otomatik testi tekrar çalıştır, sonra yayınla.
- Otomatik deneme betiği oturum geçici klasöründeydi (kalıcı değil); gerekirse yeniden yazılır: sahte Supabase (Playwright route), girişte /auth/v1/token sahte cevap, 9 yapılandırma × 22 ekran.
- Açık küçük not: user_prefs için anon yetkisi kaldırılmadı (RLS zaten engelliyor); istenirse SQL Editor'den `revoke all on user_prefs from anon;`.
