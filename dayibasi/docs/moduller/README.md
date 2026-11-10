# Çalışma kuralları ve not düzeni

Her oturum **önce bu dosyayı, sonra kendi modül dosyasını** okur. Buradaki kurallar bütün modüller için geçerlidir; bir modül dosyası bu dosyayla çelişirse bu dosya geçerlidir.

Proje: Çiftçi Defteri (Next.js + Supabase, depo `mustafa1492/genelprojeler`, klasör `dayibasi/`). Canlı: https://genelprojeler.vercel.app, panel: /panel.
Diğer belgeler: ayrıntılı kurallar `dayibasi/CLAUDE.md` · istekler ve kararlar `docs/istekler.md` · plan `docs/plan/is-plani-ve-maliyet.md` (en alttaki "Güncelleme") · araştırmalar `docs/arastirma/reports/` · tasarım `docs/tasarim/` · saklanan fikirler `docs/fikirler/` · elle test listesi `docs/test-plani.md`.

## 1. Çalışma kuralları (Mustafa)
- Cevaplar kısa ve Türkçe. Kural, para, süre, eşik **uydurulmaz**: sorulur. Gerçek veri silinmeden/değiştirilmeden önce sorulur.
- **Kullanım hakkı korunur:** test gerektiğinde yapılır (yayın öncesi, para hesabı, yetki/veritabanı, giriş/internetsiz kayıt değişince). İstenmedikçe derin araştırma yok. İş tek seferde yapılır, gereksiz dosya okunmaz.
- **Aynı anda tek oturum kod yazar.** Ortak parçalara (`core/`, `app/layout`, `next.config`, veritabanı kuralları) sadece Core dokunur; diğer oturum küçük işi yapıp söyler, büyük işi `core.md` → "Diğer oturumlardan istekler"e yazar.
- Her oturum kendi dalında: `modul/<ad>` (Core: `gelistirme`). **Canlıya (main) sadece Core gönderir**, Mustafa "yükle" deyince.
- Commit sonuna oturumun verdiği `Co-Authored-By` satırı eklenir. Sadece belge/test değişen commit mesajına `[skip ci]`.
- Daha uygun bir bağlayıcı/skill varsa önce Mustafa'ya sorulur.
- Veritabanı: `execute_sql` ile create/alter/create or replace çalışır; `drop`/`revoke` onayı Mustafa'ya ulaşmıyor → kısıtlayıcı politika yazılır ya da komut SQL Editor için hazırlanır. Değişiklikler geriye uyumlu olur (önizleme ve canlı aynı veritabanını kullanır).
- Supabase proje ref: `ypblltxjbhgnnvtyteat`. Gizli anahtar ve şifre depoya yazılmaz.

## 2. Profesyonel çalışma ilkeleri
Amaç: uygulama büyürken **karışmasın**. Her ekleme ve çıkarma, kullanıcının kafasındaki resmi basitleştirmeli ya da en azından bozmamalı. Özellik eklerken/çıkarırken `kilavuz.md` §1 kontrol listesi uygulanır.

1. **Önce sorun, sonra çözüm.** Ne çözülüyor, kim istedi, yapılmazsa ne olur? Cevap yoksa yapılmaz.
2. **Yeni ekran en son çare.** Önce: mevcut bir ekrana satır/alan olarak sığar mı? Mevcut bir ayarla çözülür mü?
3. **Varsayılan sade.** Yeni şey varsayılan olarak kapalı, gizli ya da tek satırdır; isteyen açar (Ekranımı düzenle, modül kutusu, "Detaylandır / düzenle").
4. **Bir iş, bir yol.** Aynı işi yapan iki düğme, aynı bilgiyi gösteren iki kart olmaz. Yenisi gelince eskisi kaldırılır.
5. **Bir kavram, bir ad.** Sözlükteki (`kilavuz.md` §2) adlar her ekranda, Excel'de ve notlarda aynıdır. Yeni kavram önce sözlüğe yazılır.
6. **Ortak olan ortak yerde.** İki modülün kullandığı şey `core/`'a (ya da ortak iskelete) konur; kopyalanmaz. Modüle özel olan modül klasöründe kalır.
7. **Kural koddan önce yazılır.** Para hesabı, yetki, süre, eşik: önce Mustafa'nın onayladığı cümle, sonra kod. Onaysız varsayılan değer koyulmaz.
8. **Geri dönülebilir.** Silme yerine gizleme; her işlemde "Geri al"; veritabanı değişikliği eski kayıtları bozmaz.
9. **Dürüst rapor.** Ne denendi, ne denenmedi, ne tahmin edildi açıkça yazılır. "Çalışıyor" denmeden önce çalıştırılır.
10. **Küçük ve bitmiş.** İş, tek seferde bitirilip test edilebilecek parçalara bölünür; yarım iş dala gönderilmez.

## 3. Az token harcama (her oturum uyar)
- **Okuma:** oturum başında sadece bu dosya ve kendi modül notu okunur. `kilavuz.md`, diğer modül notları, `docs/istekler.md`, araştırmalar ancak iş gerektirince ve ilgili bölümüyle (arama ya da satır aralığı) okunur. Okunmuş dosya tekrar okunmaz.
- **Kod:** dosyanın tamamı yerine arayıp ilgili satırlar okunur. Birbirinden bağımsız komutlar tek seferde çalıştırılır. Uzun çıktılar kısaltılır (son satırlar, sadece hatalar).
- **Test:** değişen yere yönelik test yeter; bütün ekranların testi sadece yayından önce. Aynı test üst üste çalıştırılmaz. Ekran görüntüsü ancak görünüm değiştiyse, az sayıda alınır.
- **Derleme:** her küçük değişiklikte değil, iş grubu bitince bir kez.
- **Yardımcı ajan / derin araştırma:** sadece Mustafa isteyince.
- **Cevap:** kısa. Yapılanı, denenen/denenmeyeni ve beklenen kararı söyler; kodu, uzun listeleri ve daha önce söyleneni tekrar etmez. Ayrıntı ancak sorulursa.
- **Not:** modül notu kısa tutulur (Günlük en fazla 10 satır, satır başına tek cümle). Biten işin ayrıntısı koda ve commit mesajına bırakılır.
- **Rapor / durum:** `bash dayibasi/scripts/rapor.sh` (kısa için `kisa`) tek komutla bütün notları ve dalları verir; dosyalar tek tek okunmaz. Düzeni `kilavuz.md` §4'te.
- **Soru:** karar gerektiren şeyler tek mesajda, seçenekli sorulur; küçük şeyler için varsayılan seçilip söylenir.

## 4. Hangi dosya ne zaman
| Dosya | Ne zaman okunur |
|---|---|
| `README.md` (bu) + kendi modül notun | her oturum başında |
| `kilavuz.md` | özellik ekleme/çıkarma, ad verme, not yazma, rapor |
| başka modülün notu | o modülü etkileyen iş |
| `docs/istekler.md`, `docs/fikirler/…` | ilgili istek/fikir konuşulurken |
| `CLAUDE.md` | zaten kendiliğinden yüklenir |

## 5. Oturumlar
| Dosya | Kapsam |
|---|---|
| core.md | giriş, yetkiler, ortak ekranlar, internetsiz kayıt, tasarım, panel, veritabanı, yayın |
| ciftci.md | tarla, masraf, gelir, rapor, takvim, makineler |
| fidan.md | fidancılık modülü |
| hayvancilik.md | büyükbaş, küçükbaş, süt, hayvan ortak iskeleti |
| kanatli.md | kanatlı (kümes, sürü) |
| tanitim.md | tanıtım sitesi, paket/fiyat metinleri, pazarlama, mağaza |
| dayibasi.md | dayıbaşı ürünü (ara verildi) |
