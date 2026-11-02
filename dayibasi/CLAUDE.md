# Proje: Dayıbaşı Takip-Kayıt Sistemi (ve ortak çekirdek)

Bu dosya Claude Code'un her oturumda okuduğu proje kurallarıdır. Önce bunu, sonra `docs/` klasörünü oku.

## Ne yapıyoruz?
Tarım işçisi ekipleri yöneten **dayıbaşılar** için web + WhatsApp tabanlı bir takip sistemi. Ege bölgesi (Bergama, Manisa) ile başlıyor. Ödeyen müşteri dayıbaşı; işçiler ve çiftçiler ücretsiz.

İlk sürümün ekranları (demo: `docs/tasarim/demo-ekranlar.dc.html`):
1. **Bugün:** uyarılar + bugün hangi tarlaya kaç kişi gitti + kayıt ekleme
2. **Ekibim:** işçi kartları, beceri etiketleri, akşam yoklaması ("Yarın geliyor musun?")
3. **Arabalar:** araç başına izin kâğıdı, muayene, sigorta ve bitiş tarihleri
4. **Alacaklarım:** çiftçi bazında borç, hesabı WhatsApp'tan gönderme

Ayrıntılar: `docs/urun.md`.

## Kural 1 — Ortak çekirdek, ama odak projeden geri kalmadan
Sahibinin bütün projeleri (dayıbaşı, randevu takibi, saha takibi, esnaf web siteleri, QR menü…) aynı base kaynak kodundan çıkacak. Bu yüzden:
- **Önce odak proje (şu an dayıbaşı).** Sıra ortak kod uğruna değişmez.
- **Ucuzsa genel yaz, pahalıysa yazma.** Genel yazmak birkaç satır/dakika fark ediyorsa genel yaz (ör. `workers` değil `people` + `kind = 'isci'`). Saatler sürecekse sadece dayıbaşı için yaz; genelleştirmeyi ikinci proje gerçekten ihtiyaç duyunca yap.
- **Ortak parçalar `core/` altında**, ürüne özel olanlar `products/dayibasi/` altında durur. `core/` hiçbir ürünü import etmez.
- **Ürüne özel farklar ayar dosyasında:** kişi türlerinin adı, etiketler, özel alanlar → `products/<ürün>/config.ts`.
- **Şimdi gerekmeyen özellik eklenmez.** "Randevuda da lazım olur" diye bugünden özellik yazılmaz.
- Bunu her seferinde sormadan kendin gözet; kullanıcıdan onay isteme.

## Kural 2 — Kullanıcılar teknolojiye alışık değil
Dayıbaşıların çoğu köyde yaşayan, uygulama kullanmaya alışık olmayan insanlar. Hedef: **destek için telefonla aramasınlar.**
- Ekran başına **tek ana iş**, tek büyük ana düğme
- Yazı en az 16 px (başlık 24-28 px), düğmeler en az 56 px yüksek
- **Klavye yerine dokunma:** seçim düğmeleri, − / + sayaç; serbest metin yalnızca zorunluysa
- **Teknik kelime yok:** puantaj → "Bugünün kaydı", cari → "Alacaklarım", evrak → "kâğıt", araç → "araba"
- Renk tek başına anlam taşımaz; yanında her zaman yazı ("Geliyor", "Süresi geçti")
- Her işlemden sonra düz cümleyle onay: "Kaydettim: Hasan Ağa, 14 kişi."
- Onay penceresi yerine geri alma
- Sesli kayıt **minimal** kalır: küçük ikincil seçenek, ilk sürümde yapılmasa da olur
- Ayrıntı: `docs/tasarim/kurallar.md`

## Kural 3 — Hassas nokta
**İşçinin başka dayıbaşına geçebilmesi / işçi devri** dayıbaşıların tepkisini çekebilir. Bu modül, sahibi dayıbaşılarla konuşup karar verene kadar **yapılmaz**. Konu açıldığında sahibine hatırlat.

## Teknik yığın
- **Next.js (App Router) + TypeScript**, telefona uygun web uygulaması (PWA); ayrı mobil uygulama yok
- **Supabase:** Postgres, giriş (telefon/e-posta), dosya deposu (evrak fotoğrafları), zamanlanmış fonksiyonlar (hatırlatmalar)
- **Çok işletme:** her tabloda `business_id`, Row Level Security ile her dayıbaşı yalnız kendi verisini görür. İlk migration: `supabase/migrations/0001_core.sql`
- **WhatsApp, ilk sürüm:** `https://wa.me/<numara>?text=<mesaj>` bağlantısı (ücretsiz, onay yok). Resmi WhatsApp Business API sonra; Ekim 2026'dan beri mesaj başı ücretli.
- Stil: sade CSS veya Tailwind; renk değişkenleri `docs/tasarim/kurallar.md` içinde

## Klasör düzeni (hedef)
```
core/                 # ortak, ürünlerden bağımsız
  people/             # kişi kartı (liste, kart, etiket, özel alanlar)
  ledger/             # cari hesap (alacak/borç)
  events/             # kayıt defteri (puantaj, randevu, ziyaret…)
  documents/          # evrak + bitiş tarihi + hatırlatma
  assets/             # araç/ekipman kartı
  messaging/          # WhatsApp mesaj şablonları ve bağlantıları
  auth/               # giriş, işletme, yetki
  ui/                 # büyük düğme, seçim düğmesi, sayaç, durum etiketi…
products/
  dayibasi/
    config.ts         # kişi türleri, etiketler, özel alanlar, metinler
    screens/          # Bugün, Ekibim, Arabalar, Alacaklarım
supabase/migrations/
docs/
```

## Dil ve adlandırma
- Arayüz metinleri Türkçe, kod (tablo, değişken, fonksiyon adları) İngilizce
- Para TL, `numeric(12,2)`; tarihler Europe/Istanbul

## Sözlük
- **Dayıbaşı:** tarım işçisi ekibini toplayıp çiftçiye götüren kişi; resmi adı "tarım aracısı" (İŞKUR belgesi gerekir)
- **Puantaj:** kim, hangi gün, hangi tarlada çalıştı kaydı
- **ÇKS:** Çiftçi Kayıt Sistemi; taşıma izin belgesi ÇKS'li tarlaya bağlıdır
- **Taşıma izin belgesi:** işçi taşıyan araç için büyükşehir belediyesinden (Manisa'da UKOME) alınan, şu an 1 ay geçerli belge
- **Yevmiye:** işçinin günlük ücreti; dayıbaşı payı ayrıca eklenir

## Çalışma şekli
- **Sahibi genel izin verdi (1 Kasım 2026):** işleri sormadan yap, yapınca kısaca söyle. Yine de önce sor: gerçek kullanıcı verisini silme/değiştirme, para harcatan ya da geri alınamayan işler, para hesabı/oyun kuralı gibi iş kuralları (bunlar uydurulmaz).
- Sahibi haftada 10-12 saat ayırabiliyor; işleri küçük, bitirilebilir parçalara böl
- Yol haritası: `docs/yol-haritasi.md`
- Bir şey yapmadan önce "bu kullanıcıyı telefona sarılmaya iter mi?" diye sor

## Supabase
- Proje: `dayibasi` (ref `ypblltxjbhgnnvtyteat`, Frankfurt). 0001-0004 uygulandı (1 Kasım 2026; 0003-0004 kullanıcı SQL Editor'den). Geri alma, KVKK silme, sınırlar gerçek veritabanında denendi.
- Giriş: şimdilik e-posta + şifre (`core/auth/AuthGate.tsx`). Telefonla (SMS) giriş ücretli bir SMS sağlayıcısı ister, sonraya.
- Herkese açık adres ve anahtar `.env` dosyasında. Gizli anahtar (service_role, DB şifresi) depoya asla yazılmaz.
- İstemci: `core/supabase/client.ts`.

## Kaldığımız yer (1 Kasım 2026)
- **İLK HEDEF: çiftçi defteri — `docs/ciftci-plan.md`** (Mustafa 2 Kasım 2026: önce bu bitecek). Sonra `docs/istekler.md`.
- **Sıradaki işler: `docs/istekler.md`** (Mustafa'nın not ettirdiği istekler; önce onu oku).
- Yapıldı: Next.js kurulumu, Supabase, core/ui, giriş + işletme oluştur, Ekibim (ara/WhatsApp, kişi kartı, avans/ödeme, akşam yoklaması), Geçmiş ekranı (uygulama tarafı).
- **Bekleyen (Supabase panelinde, kullanıcı yapar):** Authentication > Providers > Email: şifre en az 8, "leaked password protection" açık. Authentication > URL Configuration: yayın adresi Site URL + Redirect URLs'e `<adres>/sifre` eklenecek (şifremi unuttum için).
- Bugün (tarla → kişi, araba adımı yok; kullanıcı "arabaların önemi yok" dedi) ve Alacaklarım gerçek veriyle çalışıyor. Hesap kuralları `docs/urun.md` ve `products/dayibasi/hesap.ts`; kayıtta `events.data` = {wage, fee, workers[]} (eski kayıtlarda yalnız rate). Arabalar "yakında".
- Yayında: https://genelprojeler.vercel.app (Vercel, Root Directory `dayibasi`, main'e her push'ta güncellenir; veri Supabase'te, deploy veri silmez).
- Test hesapları (şifreler depoda YOK, kullanıcıda): `admin@dayibasi.test` (platform_admins, /yonetim), `ornek@dayibasi.test` ("Mehmet Yılmaz ekibi (örnek)", 8 işçi, 3 çiftçi, 10 günlük kayıt). Gerçek kullanıma geçmeden silinecek.
- Kullanıcı adıyla giriş: "@" yoksa `<ad>@kullanici.dayibasi.app` (AuthGate `USERNAME_DOMAIN`). Mustafa'nın babası: kullanıcı adı `abdullahsedat` (şifre depoda YOK). Henüz işletmesi yok; **çiftçi defteri** (ayrı ürün, `docs/fikirler/07`) yapılınca ona bağlanacak, dayıbaşı ekranlarını görmemeli.
- Güvenlik planı ve açık listesi: `docs/guvenlik.md`. KVKK aydınlatma metni `/kvkk` TASLAK, avukata gösterilmeli.
- İnternetsiz çalışma (`core/offline/`): yazmalar `mutate()` ile yerel aynaya + giden kutusuna, internet gelince sırayla gönderilir; okumalar `query()` ile. Yeni tablo yazan her kod buradan geçmeli (doğrudan supabase insert/update yazma). Kimlikler istemcide `crypto.randomUUID()`. `public/sw.js` sayfaları ve dosyaları saklar; önbellek adını değiştirince `RegisterSW.tsx`'teki de değişmeli. Geri alma, Geçmiş ve "tamamen sil" internet ister.
- Sıradaki iş: yayına alma (Vercel). Kullanıcı "işe yarar hale gelmeden yayına gerek yok" dedi; Bugün + Alacaklarım bitti, artık yayına alınabilir.
- Bu ortamdan Supabase'e tarayıcıyla ulaşılamıyor; ekranlar sahte sunucuyla (Playwright route) denendi.
