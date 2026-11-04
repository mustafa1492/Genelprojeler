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
- Fikir dönemi; Mustafa "ikinci emre kadar uygulamaya bir şey getirme" dedi.
- Bu oturum ayrıca Mustafa'nın **genel planlarını konuşma** yeri.
- Paket sistemi **ertelendi**: modüller oturduktan sonra yapılacak. Hazır plan: settings.paket (basit/orta/tam, sadece yönetici değiştirir, keep_modules gibi tetikleyici) + paket tanımları (öneri: app_config) + panelde paket seçimi + görünen ekran = paket izinleri − hidden_screens. O zaman sorulacak: paket içerikleri, mevcut defterler hangi pakete (öneri: Tam), tanımların yeri.

## Sıradaki
- Mustafa'nın genel planlarını dinlemek; kod işi yok.
