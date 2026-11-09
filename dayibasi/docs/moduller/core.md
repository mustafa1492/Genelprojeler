# Core oturumu

**Kapsam:** `core/` (auth/AuthGate, members, offline store, expenses/ExpenseScreen, ui, shell/TabShell, appConfig, export), `products/panel/` (yönetim paneli), `app/` (layout, panel), `next.config.ts`, `supabase/` (migrations, functions/admin-users), yayın (main'e birleştirme).

## Durum (4 Kasım 2026)
- Canlıda: yeni tasarım (telefonda sade kartlar, bilgisayarda koyu yeşil gruplu yan menü + tablolar), yetkiler (memberships.perms: yonetici/aile/calisan/ozel; `perm_level`, `can`, `my_perms`), kısıtlayıcı RLS politikaları (0014–0017), yönetim paneli /panel (admin_* fonksiyonları 0016, edge function `admin-users`), app_config (duyuru, yeni_defter_kapali, liste:<key>), güvenlik başlıkları (CSP; open-meteo izinli), davet koduyla katılma, giriş takılma düzeltmesi (tabLock).
- Yönetici hesabı: admin@dayibasi.test (şifre Mustafa'da).
- Deneme hesabı (9 Kasım, SQL): kullanıcı adı `denememcbü` (e-posta denememcbu@kullanici.dayibasi.app), defter "MCBÜ deneme çiftliği", bütün modüller, 2025–2026 rastgele veri (60 masraf, 7 gelir, 4 tarla, kümes 21 gün, 12 hayvan, fidan, depo, belge, borç). Şifre Mustafa'da. Silinecek.
- Deneme hesabı (5 Kasım, SQL ile açıldı): kullanıcı adı `denemetum`, defter "Deneme çiftliği (tüm modüller)", modüller fidan/kanatlı/büyükbaş/küçükbaş açık, örnek veri var. Şifre depoda YOK (Mustafa'da). Gerçek kullanıma geçmeden silinecek.
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

- 4 Kasım (2): **Döviz karşılığı + yeni Excel** (gelistirme, canlıda DEĞİL). Kur: TCMB döviz satış, kaydın kendi günü (hafta sonu/tatil → önceki iş günü), `/api/kur` (sunucu, önbellekli) + `core/fx.tsx` (telefonda saklar, toplu ister). Ayarlar → Döviz karşılığı: Kapalı / Dolar (varsayılan) / Euro + bugünkü kur. Görünür: masraf/gelir satırları ve toplamları, kâr kartı, sezon raporu. Excel: `core/export/xlsx.ts` `downloadBook` (gerçek Excel tabloları, tarih gerçek tarih, Toplam satırı süzmeye göre, dolar = TL/kur formül), `core/expenses/excel.ts`, `products/ciftci/excel.ts` (Özet: gelir/masraf/kâr TL+$, ay ay SUMIFS, türe ve tarlaya göre). Bütün verimi indir'e makineler, barınak, sürü, günlük kayıt, hayvanlar, hayvan olayları eklendi. LibreOffice'te yeniden hesaplatılıp karşılaştırıldı: formül hatası yok, sonuçlar aynı. Depo ve Fidan ekranlarının kendi Excel'i eski biçimde (dövizsiz) kaldı.

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
