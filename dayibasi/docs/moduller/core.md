# Core oturumu
**Kapsam:** giriş ve yetkiler, ortak ekranlar (masraf, alt çubuk/Menü, Ayarlar, Ekranımı düzenle, Özet), internetsiz kayıt, tasarım, yönetim paneli, veritabanı, döviz, Excel, yayın · **Dal:** `gelistirme` · **Kod:** `core/`, `products/panel/`, `app/`, `next.config.ts`, `supabase/`, ayrıca `products/ciftci/` içinde App, Menu, gorunum, excel, screens/Ana-Ayarlar-Duzenle-Fotograflar · **Sınır:** modül ekranlarının içine modül oturumu bakar; Core birleştirir ve yayınlar.

## Canlıda ne var
- Giriş (kullanıcı adı / e-posta), davet koduyla katılma, yetkiler (yönetici, aile, çalışan, özel), veritabanı erişim kuralları, yönetim paneli (/panel).
- Telefon: alt çubuk (4 yer + Menü), Ayarlar, Ekranımı düzenle (hazır görünümler, kartlar, alt çubuk, kâr dönemi), Özet'te uzun basma. Bilgisayar: yan menü, iki sütun özet, tablolar.
- Kişiye özel ayarlar (`user_prefs`), internetsiz kayıt, tutarları gizle (`*** TL`), büyük yazı.
- Döviz karşılığı (TCMB, kaydın günü; `/api/kur`), yeni Excel (tablolar, formüller, Özet sayfası), bütün verimi indir.
- Modüller: fidan, kümes, büyükbaş, küçükbaş, makineler, tapudan parsel sorgusu.
- Son yayın: 14 Kasım 2026 (main `d009338`): TÜBİTAK deneme hesabı uygulama tarafı, veritabanı uyumasın (/api/uyanik).

## Yapılacaklar (sırayla)
1. **Yayın bekliyor (18 Kasım TÜBİTAK'tan sonra):** hayvancılık ve kümesin koddan çıkarılması (arşiv `arsiv/hayvancilik`). Sonraki işler `docs/plan/uzun-vadeli-plan.md` §5 sırasıyla.
2. Tanıtım taslağını (`modul/tanitim`, `/tanitim`) birleştirmek: Mustafa "birleştir" deyince.
3. Mustafa'nın elle test listesinden (`docs/test-plani.md`) gelecek hatalar.
4. Arayüz raporundan seçilenler (`docs/fikirler/arayuz-onerileri.md`) ve giriş ekranı düzenlemesi: Mustafa seçince.
5. Nisan öncesi: paket sistemi (Basit/Orta/Tam), basit mod + ilk açılış rehberi, yedek (0013), deneme hesaplarını silme, SMTP (şifre sıfırlama), KVKK, son güvenlik kontrolü, Android (TWA).

## Mustafa'dan beklenenler
- **Depoyu gizli yap** (11 Kasım isteği; oturum depo ayarını değiştiremiyor): GitHub → Settings → Danger Zone → Change visibility → private.
- **Supabase onayı gereken iki komut** (onay penceresi cevapsız kaldı): deneme defterinin Geçmiş'indeki iki "koruma denemesi" izini silmek; `is_demo` fonksiyonunu `security invoker` yapmak.
- Supabase panelinde "sızdırılmış şifre koruması"nı açmak (Authentication → şifre ayarları).
- Telefon/WhatsApp numarasının doğrusu (11 hane) ve nerede görüneceği (bkz. `tanitim.md`).
- Parsel sorgu canlıda çalışıyor mu (il listesi geliyor mu)? Gelmezse sunucu üzerinden çağırma denenecek.
- Sezon mu, yıl mı? (Öneri: sezon kalsın, varsayılan takvim yılı olsun.)
- Uygulamada "bizim yaptığımız belli olsun" için görünecek ad/imza ne?
- Giriş ekranında ne değişsin?
- Gelir ve hatırlatmada tarla seçilmeyince yazan "Genel" kalsın mı?

## Bekleyen istekler
- (Tanıtım, 4 Kasım 2026) Tanıtım sitesindeki "Ücretsiz başla" /ciftci'ye gidiyor ve giriş ekranı açılıyor. AuthGate `?kayit=1` gibi bir adresle doğrudan "Yeni hesap aç" kipinde açılabilirse oraya bağlanacak.
- (Kanatlı, 4 Kasım 2026) Canlıda 0013_yedek uygulanmamış (`yedek.al` yok, gece yedeği çalışmıyor). Uygulanınca 0018_hayvan.sql sonundaki yedek bölümü de çalıştırılmalı (barns/herds/herd_days yedeğe girsin). (diğer oturumlardan)
- (yok)
## Diğer oturumlardan istekler
- (Çiftçi) **Modül seçimi ve renkler (Mustafa, 10 Kasım 2026, çiftçi oturumundan):** Girişte büyük kartlarla seçim: 🌾 Tarla / 🌱 Fidan / 🐄 Hayvancılık (hayvancılık tek kart; içinde kümes, büyükbaş, küçükbaş). Sadece defterde açık modüller çıkar; tek modül varsa sorulmaz. Son seçilen hatırlanır, üstte "🌱 Fidan ▾" ile değiştirilir. Her modülün kendi rengi (üst şerit, düğmeler, alt çubuk). Para: modülde sadece o modülün masraf/geliri görünür, bir düğmeyle "Hepsi" (bütün masraflar/gelirler, toplam kâr). Ortak kalanlar: borç-vade, belgeler, aile, ayarlar. Ayrıca konuşulan sadeleştirme: Fiş+Fotoğraflar → Masraf, Kayıtlar+Geçmiş birleşir, tarihler Takvim'de toplanır, Sezonlar → Rapor, alt çubuk sabit 5 (Özet · Üretim · ＋ Ekle · Para · Menü), belge/fotoğrafa "neye ait" (tarla/makine/sürü) alanı. Önce telefon taslağı (resim) gösterilecek, Mustafa onaylayınca kod.
  - Ek (Mustafa, 10 Kasım): Seçim ekranında sadece hesaba açılmış modüller çıkar (ör. tarla + fidan açıksa yalnız o ikisi). Ortak kullanılabilen bölümler (masraf, gelir, depo, makineler, takvim, borç-vade, belgeler, rapor) **her modülün içinde** yer alır, kullanıcı modülden çıkmadan ulaşır; ayrı bir "ortak" alana gitmez. İlke: ulaşım kolaylığı en üstte, her şey en fazla 2 dokunuşta.
  - Ek (Mustafa, 10 Kasım): **Tarlalar, Depo ve Makineler ortak**: her modülde aynı tam liste (fidan da tarlada yetişir, traktör her işte kullanılır). Modüle göre ayrılan: modülün kendi işleri (fidan dikim/sayım, hayvan kayıtları, tarla işleri) ve masraf/gelir/rapor görünümü ("Hepsi" düğmesiyle tamamı).
- (Kanatlı, 4 Kasım) 0013 yedek uygulanınca `0018_hayvan.sql` sonundaki yedek bölümü de çalıştırılacak (barns/herds/herd_days); hayvancılık için `animals`, `animal_events` de eklenecek.
- (Tanıtım) "Ücretsiz başla" doğrudan "Yeni hesap aç" ekranını açsın mı?
- (Hayvancılık) Alt menü çok sekmeyle kalabalıktı → Menü ile çözüldü.
- (Fidan, 10 Kasım 2026) **Dikim / alan hesaplayıcı:** önce fidan modülünde ürünlerden bağımsız yazılacak (alan ÷ bitki başı yer = adet; adet/alan × birim ihtiyaç = malzeme, maliyet; şablonlar modül ayarında). Çalışınca `core/` altına taşınması istenecek. Ayrıntı: `fidan.md` madde 6.

## Kararlar ve kalıcı bilgiler
- **Modül kararı (14 Kasım 2026, Mustafa "karar ver" dedi):** tarla (ana ürün) ve fidan (gerçek kullanıcı: Köprü fidancılık) kalır; dayıbaşı beklemede kalır (Köy pazarı işçilik bölümü); kümes, büyükbaş, küçükbaş arşivlendi (`arsiv/hayvancilik`, veritabanına dokunulmadı). Hazır görünüm "Kümesçi" → "Fidancı". Plan: `docs/plan/uzun-vadeli-plan.md`.
- **Veritabanı uyumasın (14 Kasım 2026):** Supabase ücretsiz plan 7 gün istek almazsa projeyi duraklatır. Önlem: `app/api/uyanik` veritabanından tek satır okur; `vercel.json` → crons her gün 03:17 UTC (06:17 TR) çağırır. Zamanlayıcı yalnız canlıda (main) çalışır. **Kontrol:** tarayıcıda `/api/uyanik` → `{"ok":true}`; Vercel → proje → Settings → Cron Jobs'ta görünür, Logs'ta günlük çağrı. **Uyursa:** Supabase paneli → proje → "Restore project" (veri silinmez, birkaç dakika sürer), sonra `/api/uyanik` ile doğrula. Ücretli plana geçilirse bu adım gereksiz olur.
- **Güvenlik kontrolü (11 Kasım 2026):** bütün dallardaki 194 commit tarandı: gizli anahtar, şifre, belirteç yok; `.env` yalnız herkese açık anahtar. Depo o gün herkese açıktı, fork 0. Supabase denetimi: kritik yok; uyarılar: sızdırılmış şifre koruması kapalı, `admin_table_ok` ve `event_screen` arama yolu sabit değil, `is_demo` girişsiz çağrılabiliyor (veri sızdırmaz).
- **Vercel önizleme adresi** (`genelprojeler-git-gelistirme-mustii1.vercel.app`) Vercel girişi ister; oturum giremez. Önizleme yerine aynı sürüm yerelde gerçek veritabanına bağlı çalıştırılıp denenir.
- **Sığ klonda `rapor.sh` yanıltır:** main geçmişi eksikse "canlıya gitmemiş commit" sayısı şişer; önce `git fetch origin main gelistirme` (derinlikli).
- **Deneme hesabı `denememcbü` (TÜBİTAK 2209-A hakemleri, son gün 18 Kasım 2026):** defter `settings.demo = true`, modül yok, tek sezon (2026), 3 tarla (Bergama: mısır, ayçiçeği, domates), uydurma veri. Üyelik `ozel`: kayıt ekler/değiştirir; ayarlar ve geçmiş yalnız görülür; üye/davet yok. Göç `0021_deneme.sql`: demo defterde örnek kayıt (created_by boş) silinemez; kullanıcının eklediği silinir. **Sıfırlama:** `supabase/seed/deneme_mcbu.sql` tekrar çalıştırılır (ilaç bekleme örneği çalıştırıldığı güne göre tarihlenir; değerlendirme öncesi yeniden çalıştırmak iyi olur). Bilinen açık: örnek kayıtlar değiştirilebilir (silinemez); şifre değişimi yalnız uygulamada kapalı (/sifre), Supabase tarafında değil.
- **Arayüz raporu kalanları (11 Kasım, Mustafa kararı Core'a bıraktı):** gelir türü adı "Hasat satışı" kalır (kayıtlı veride bu ad var, değiştirmek veri değişikliği olur); "Tahsil ettim" kalır (Fidan ve Geçmiş'te aynı söz); Vadeler çift sayım (41) kod hatası değil, alacak elle iki yere yazılırsa olur (gelirden otomatik vade açılmıyor); Makineler "saat" (30) doğru. "parti → dikim" (32) fidan oturumuna bırakıldı. Bilgisayar görünümü (iki sütun Özet, geniş ekran), sezon çipleri (3) ve başlık düzeni (2) modül seçimi/sadeleştirme taslağıyla birlikte ele alınacak.
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
- **Vizyon notu (14 Kasım 2026):** `docs/fikirler/vizyon.md`. Core'u ilgilendiren hazırlıklar (§8–9): ortak ürün kataloğu (listeden seçim), masraf→tarla→dekar bağı, ayrı ve geri alınabilir paylaşım onayı, KVKK iki ayrı metin, onay akışı ("tek kayıt, iki taraf"). Hiçbiri kodlanmadı; Mustafa sıra verince.
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

- (Tanıtım oturumu, 10 Kasım 2026, Mustafa'nın isteğiyle yapıldı) Giriş ekranı yeni görünüm: `core/auth/AuthGate.tsx` Login + `core/ui/ui.css` `.ui-auth*`. Mantık değişmedi; `?kayit=1` ile kayıt modunda açılır. Dayıbaşı tarafını da etkiler (aynı ekran).
- (Tanıtım oturumu, 10 Kasım 2026, Mustafa'nın isteğiyle) **Ana sayfa değişti:** `app/page.tsx` = tanıtım sitesi. Dayıbaşı "Bugün" `/` → `/bugun` (`app/(dayibasi)/bugun/page.tsx`, `products/dayibasi/nav.tsx`, `Bugun.tsx`; çiftçi `otherHomes` dayibasi → `/bugun`). `manifest.ts` start_url `/ciftci`. `public/sw.js` PAGES'e `/ciftci` eklendi (önbellek adı aynı). Çıkış yapınca `/`'a gidilir = tanıtım sayfası.
## Günlük
- 14 Kas: Hayvancılık/kümes koddan çıkarıldı (arşiv dalı), tanıtım sitesi tarla+fidana göre; derleme ve 16 ekran denemesi temiz. Uzun vadeli plan yazıldı.
- 14 Kas: Canlıya çıktı: deneme hesabı uygulama tarafı + /api/uyanik; canlıda /api/uyanik ok, ana sayfa başlığı görünüyor.
- 14 Kas: Veritabanı uyumasın: `/api/uyanik` + günlük Vercel zamanlayıcısı (gelistirme; canlıya çıkınca çalışır).
- 11 Kas: TÜBİTAK deneme hesabı hazırlandı: 0021 koruması ve örnek veri canlı veritabanında; uygulama tarafı gelistirme'de.
- 11 Kas: Canlıya çıktı: arayüz raporu düzeltmeleri (3 commit). Yayın öncesi 23 ekran × telefon/bilgisayar sahte sunucuyla açıldı, hata ve yatay taşma yok.
- 11 Kas: Arayüz raporu küçükler: tarla kartında masraf/gelir ayrı satır (20), döviz seçenekleri yan yana (15), "uzun bas" ipucu ilk 5 açılışta (8), Menü bölüm başlıkları normal harf (10), "Ara" (44), küçük açıklamalar (22, 45, 46). Madde 30 hata değil (kayıt gerçekten motor saati).
- 11 Kas: Arayüz raporu A+B: kalan küçük etiketler büyütüldü; Rapor'da geniş tablolar telefonda kart listesi (bilgisayar/yazıcıda tablo), paylaş düğmeleri en altta. Örnek veriyle Rapor ve Tarlalar (zarar yazısı dahil) telefonda görüldü.
- 11 Kas: Arayüz raporu hızlı kazanımları: küçük yazılar 1rem, zarara "zarar" yazısı (Tarlalar, Rapor), dar ekran/büyük yazıda hızlı düğmeler 2×2, büyük onay kutusu ve Ayarlar'da anahtar, "Büyük yazı" Görünüm'ün başında. Derlendi; Özet, Ayarlar, Düzenle boş veriyle görüldü, zarar yazısı veriyle denenmedi.
- 10 Kas: Dallar birleştirildi (çiftçi: bölüm seçimi ve renkler; tanıtım: ana sayfa site, yeni giriş ekranı, logo; fidan ve hayvancılık notları). Düzeltmeler: başka bölümün hızlı düğmesi gizli, adresle açılan ekran kendi bölümüne geçer, kişinin alt çubuk düzeni korunur, koyu renkler (kâr kartı, yan menü) bölüme göre, Menü'de bölüm düğmesi ayrı görünüm, girişte "Ücretsiz" kaldırıldı (fiyat kararı bekliyor). Not: ortak dosyalara (core/, App, Menü) modül oturumları dokunmuştu; kural README'de duruyor.
- 10 Kas: Az token kuralları (README §3), `kilavuz.md` (kontrol listesi, sözlük, şablon, rapor düzeni) ve `scripts/rapor.sh` (tek komutla durum) eklendi.
- 10 Kas: Not düzeni ve çalışma ilkeleri yazıldı (README: ilkeler, kontrol listesi, sözlük, şablon); modül notları şablona çevrildi (tanitim.md kendi dalında, oturumu çevirecek).
- 10 Kas: "Genel" masraf → "İşletme gideri"; raporda ayrı başlık + net kâr tablosu; Excel'de ayrı sayfa. gelistirme. Örnek veriyle denendi.
- 10 Kas: Telefon notundaki 14 düzeltme (geri tuşu, liste geri al/sıralama, alt çubuk simgeleri, masraf formu, fiş akışı, kâr kartı ayrıntısı, hızlı düğmeler, takvim, fotoğraflar, sakin eşitleme şeridi). gelistirme. Sahte sunucuyla denendi.
- 9 Kas: `denememcbü` deneme hesabı açıldı (canlı veritabanı, rastgele 2025–2026 verisi).
- 5 Kas: TÜBİTAK taslağı hazırlandı; telefon notu incelendi; arayüz inceleme ajanı raporu kaydedildi.
- 4 Kas: Canlıya çıktı: döviz + yeni Excel, `***` ile gizleme, parsel sorgu için güvenlik ayarı düzeltmesi.
- 4 Kas: Canlıya çıktı: yeni telefon arayüzü; kanatlı, çiftçi (makineler, tapu), fidan, hayvancılık dalları birleştirildi; 9 yapılandırma × 22 ekran denendi.
