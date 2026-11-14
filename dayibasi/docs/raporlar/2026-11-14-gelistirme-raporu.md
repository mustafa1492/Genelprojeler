# Geliştirme raporu: 14 Kasım 2026 (Core oturumu)
*Mustafa'nın izniyle kararları Core verdi. Hepsi `gelistirme` dalında; **canlıya yüklenmedi**. TÜBİTAK hakemleri 18 Kasım'a kadar canlıdaki mevcut sürümü görür.*

## 1. Kısaca
- **Hayvancılık ve kümes arşivlendi.** Kod `arsiv/hayvancilik` dalında, veritabanı yerinde. Uygulama artık yalnız **tarla** (ana ürün) ve **fidan**.
- **Uygulama sadeleşti:**
  - alt çubuğun ortasında her ekrandan tek dokunuşla **"＋ Ekle"**;
  - Menü 9 öğeye indi;
  - yeni defterde **"Başlarken"** rehberi;
  - tek sezon varken sezon çipleri gizli;
  - tarlası olmayan defterde "Hangi iş için?" satırı çıkmıyor.
- **Ortak ürün kataloğu:** tarla ürünü, verim ve gelirde ürün artık listeden seçiliyor. İleride Köy pazarı ve bölge karşılaştırması için şart.
- **Sesle masraf:** "mazota üç bin verdim" deyince form Mazot ve 3.000 TL ile açılıyor.
- **Tanıtım sitesi:** tarla ve fidana göre düzenlendi. "Ücretsiz" iddiası kaldırıldı, "Yakında" listesine Köy pazarı eklendi.
- **Kalıcı ekran denemesi:** `scripts/deneme.cjs`, her yayından önce çalıştırılacak.
- **Belgeler:** uzun vadeli plan, vizyon notuna Köy pazarı (fide dahil), notlar.

## 2. Verdiğim kararlar ve gerekçeleri
| Karar | Gerekçe | Geri dönüş |
|---|---|---|
| Kümes, büyükbaş, küçükbaş arşivde | Veritabanında yalnız deneme hesapları kullanıyordu; veteriner eşikleri hiç gelmedi | `arsiv/hayvancilik` dalından yarım günde döner |
| Fidan kalıyor | Gerçek hesabı var (Köprü fidancılık / Hüseyin); fide Köy pazarına bağlanacak | — |
| Alt çubuk: 3 kişisel yer + ortada ＋ Ekle + Menü | Kayıt eklemek en sık iş; her ekrandan tek dokunuş. Plandaki "Para" sekmesini yapmadım, çünkü sizin istediğiniz kişiye özel alt çubuğu bozacaktı | `NAV_SLOTS` 4 yapılır, `add` kaldırılır |
| Kişinin 4. alt çubuk yeri düşer (varsayılanda Gelir) | 6 düğme yaşlı kullanıcı için sıkışık. Gelir, Menü → Para'da ve ＋ Ekle'de | Ekranımı düzenle'den yeniden seçilir |
| Menü: Fiş (＋ Ekle'de) ve ayrı Geçmiş (Kayıtlar başlığında, her ekranın üstünde) kalktı; Para'ya Masraf ve Gelir eklendi | "Bir iş, bir yol" ilkesi | — |
| Tek sezon varken sezon çipleri gizli | Raporun 3. maddesi: az kullanılan seçim ekranın en üstünü kaplıyordu, "+ Sezon aç" yanlışlıkla basılıyordu. Kâr kartı başlığı zaten "2026 kârı" diyor; sezon yönetimi Ayarlar → Sezonlar'da | — |
| Ürün listeden seçilir, listede yoksa "Başka ürün (kendim yazayım)" | Vizyon §8.1: serbest yazı verinin toplanmasını engeller. Eski yazılar silinmez | — |
| Sesle masraf yalnız küçük, ikincil düğme | CLAUDE.md Kural 2: "Sesli kayıt minimal kalır" | Düğme kaldırılır |
| Sitede "Ücretsiz" yerine "Deneme sürümü: ücret alınmaz" | Fiyat kararı henüz yok; vizyon notu "ücretsiz değil deneme sezonu" diyor | Metin değişir |
| "Basit mod"u varsayılan yapmadım | Varsayılan görünüm zaten 5 kart, "En sade" hazır görünüm var. Gerçek kullanıcıyı izlemeden kartları azaltmak tahmin olurdu | — |
| Fidan ekranını bölmedim | 924 satırlık ekran fidan oturumunun işi; Hüseyin'in geri bildirimi olmadan bölmek riskli | — |
| Veritabanında hiçbir şey çalıştırmadım | "Yükleme yapma" talimatı; önizleme ve canlı aynı veritabanını kullanıyor | — |

## 3. Değişiklik ayrıntısı
### 3.1 Hayvancılık arşivi
- Silinen: `products/ciftci/hayvan/` (~900 satır), `/ciftci/kumes`, `/ciftci/buyukbas`, `/ciftci/kucukbas`.
- Temizlenen bağlar: menü, alt çubuk seçenekleri, "Kümesçi" hazır görünümü ("Fidancı" oldu), yetki satırı, panel ve yönetim modül kutuları, dışa aktarmadaki hayvan sayfaları, tanıtım sitesinde kümes ve hayvan anlatımları ile rehberleri.
- **Bilinen etki:** "Bütün verimi indir" artık hayvan tablolarını indirmiyor. Bu tablolarda yalnız deneme verisi var.
- `/ciftci/kumes` gibi eski adresler "bulunamadı" veriyor.

### 3.2 "＋ Ekle"
- `core/shell/TabShell.tsx`'e isteğe bağlı `add` eklendi. Ortak kod; Dayıbaşı da isterse kullanabilir.
- Telefonda alt çubuğun ortasında yeşil yuvarlak düğme var; bilgisayarda yan menünün başında "＋ Yeni kayıt".
- Açılan sayfada: Masraf, Gelir, Tarla işi, Fiş fotoğrafı, Hatırlatma; fidan açıksa Fidan. **Yalnız kişinin yazma yetkisi olanlar çıkar** (çalışan para göremez).
- Ekranımı düzenle'deki alt çubuk önizlemesi "3 yer + Ekle + Menü" oldu.

### 3.3 Başlarken (ilk açılış)
- Özet'in üstünde 3 adım: tarlanı ekle → ilk masrafını yaz → kâr kartına bak.
- Kayıt girildikçe adımlar kendiliğinden "✓ tamam" olur. Tarla ve masraf girilince kart kendiliğinden kaybolur; "Gizle" ile de kapanır (telefonda hatırlanır).
- Veri yüklenmeden görünmez, yani dolu defterde bir an bile yanıp sönmez. Yazma yetkisi olmayana çıkmaz.

### 3.4 Ürün kataloğu (`core/catalog/`)
- 7 grupta yaklaşık 55 ürün: tahıl, endüstri bitkisi, baklagil, yem bitkisi, sebze, meyve ve bağ, fidan/fide.
- Kullanıldığı yerler: tarla ekleme ve düzenleme, verim girme, gelir girme.
- Kayıtta ad saklanıyor, veritabanı değişmedi. Eski "Mısır (dane)" gibi yazılar listede varsa seçili görünür; yoksa "Başka ürün" olarak düzenlenebilir hâlde kalır.

### 3.5 Sesle masraf (`core/expenses/ses.ts`)
- Masraf türü ekranında "🎤 Söyleyerek yaz".
- Telefonun kendi ses tanıması kullanılıyor; ek maliyet yok. Android Chrome'da çalışır ve internet ister. Desteklemeyen tarayıcıda düğme hiç görünmez.
- Tutarı rakamla ("3.500", "4 bin 800") ve yazıyla ("üç bin beş yüz", "iki buçuk bin", "bir milyon iki yüz bin") anlıyor.
- Tür ipuçları: mazot/motorin, gübre/üre/DAP, ilaç, tohum/fide, işçi/yevmiye, elektrik/sulama/fatura, kira, traktör/tamir/biçerdöver, nakliye/kamyon. Kişinin kendi tür adları da aranıyor.
- Tür anlaşılmazsa "Duyduğum: … · 750 TL. Türünü aşağıdan seç" yazar; seçilen türün formunda tutar dolu gelir.
- Hata durumlarında düz cümle: izin verilmedi, internet yok, duyulmadı.
- Sitenin güvenlik ayarında mikrofon yalnız kendi sitemize açıldı (`next.config.ts`).

### 3.6 Diğer küçükler
- Tarla kartında "Verim" bölümü "Yıllara göre ürün ve verim" oldu; en yeni yıl üstte. Fikir havuzundaki münavebe tablosu bu.
- Masrafta "Hangi iş için?" yalnız defterde iş tanımlıysa çıkıyor (fidan açıksa çıkar).
- Bilgisayar yan menüsünden "Fiş yükle" ve "Listeler" kalktı. Rapordaki "yan menü taşıyor" sorununa da iyi geliyor.

### 3.7 Tanıtım sitesi
- Açıklama metninden "Ücretsiz" kalktı. Giriş düğmesinin altındaki yazı "Deneme sürümü: ücret alınmaz, kredi kartı istemez" oldu.
- SSS "Ücretli mi?" sorusunun cevabı değişti: deneme sürümünde ücret alınmadığı, ileride ücret konuşulursa önceden haber verileceği ve kayıtların her zaman kişinin olduğu yazıyor.
- Modül bölümü "Tarla da, fidan da aynı defterde" oldu. Tarla kartına "Yıllara göre ürün ve verim" eklendi.
- "Yakında" listesi: Köy pazarı (saman, fide/fidan, makine, işçilik), sesle masraf ve fişten masraf.
- "Nasıl kullanılır" adımları ＋ Ekle'ye göre güncellendi (masraf, gelir, fiş, hatırlatma, geçmiş). Sitedeki telefon çiziminin alt çubuğu yeni düzeni gösteriyor.

## 4. Ne denendi, ne denenmedi
**Denendi (sahte veritabanıyla, gerçek veriye dokunmadan):**
- Derleme ve tip kontrolü her iş grubundan sonra geçti.
- `scripts/deneme.cjs`: 20 ekran × 2 genişlik (telefon 390, bilgisayar 1366), örnek veriyle ve boş defterle. **Sorun: 0.**
- ＋ Ekle: açıldı, "Masraf"a basınca masraf türü ekranı geldi. Bilgisayarda ortada pencere olarak açılıyor.
- Başlarken: boş defterde göründü; "Tarla ekle" yeni tarla formunu açtı; ürün listesi açıldı.
- Sesle masraf: tarayıcıya sahte ses tanıma verilerek denendi. "mazota üç bin beş yüz verdim" → Mazot, 3500. "bugün yedi yüz elli lira verdim" → tür sorulur, Diğer seçilince 750.
- Sesten tutar ve tür çıkaran kısım 11 örnek cümleyle ayrıca sınandı: 11/11 doğru.
- Tanıtım sitesi: telefonda yatay taşma yok, görüntüye bakıldı.

**Denenmedi:**
- **Gerçek telefon**, özellikle gerçek mikrofonla sesli masraf ve Türkçe tanımanın doğruluğu.
- Gerçek veritabanıyla giriş. Deneme hesabı `denememcbü` bu değişikliklerle hiç açılmadı.
- PDF çıktısı, iPhone Safari (orada ses düğmesi muhtemelen görünmez), büyük yazı açıkken alt çubuktaki ＋ düğmesi.

**Dürüst not:** 14 Kasım öğleden sonraki yayından ("TÜBİTAK deneme hesabı + /api/uyanik") önce çalıştırdığım ekran denemesi geçersizdi. Derlemeyi gerçek veritabanı adresiyle yaptığım için sahte sunucu devreye girmemiş, betik giriş ekranını "temiz" saymıştı. O yayından sonra canlıda yalnız `/api/uyanik` ve ana sayfa başlığını doğrulamıştım. Değişiklikler küçüktü ve 11 Kasım'da bu hesapla denenmişti, risk düşük; ama sizin ya da benim canlıda bir kez deneme hesabıyla girip bakmamız gerekiyor. Betik artık giriş ekranında kalırsa durup uyarıyor.

## 5. 18 Kasım'a kadar ve sonrası: bu kararlara bağlı işler
1. **18 Kasım'a kadar canlıya dokunulmamalı.** Deneme hesabının modül ayarı boş olduğu için arşiv hakemleri etkilemez; ama hakem sürecinde arayüzün değişmemesi daha güvenli.
2. **Hakem değerlendirmesi 18 Kasım'dan sonra da sürebilir.** Yüklemeden sonra hakemler yeni arayüzü görür: ＋ Ekle, ürün listesi. Deneme hesabı bundan etkilenmez; Başlarken kartı çıkmaz, çünkü defter dolu.
3. **Deneme verisindeki ilaç bekleme örneği 30 Kasım'da doluyor.** Değerlendirme o tarihten sonraysa `supabase/seed/deneme_mcbu.sql` yeniden çalıştırılmalı. Veritabanı onayı gerekiyor.
4. **Yükleme günü sırası:**
   - `node scripts/deneme.cjs` ve `--bos` ile "sorun: 0" görülür;
   - sizin "yükle" onayınızla main'e gönderilir;
   - canlıda `denememcbü` ile girilip Özet, Tarlalar, Rapor ve ＋ Ekle'ye bakılır;
   - kendi telefonunuzda sesli masraf bir kez denenir.
5. **Yüklemeden sonra eski telefonlarda** önbellekten eski sürüm gelebilir; uygulamayı kapatıp açmak yeter. Kümes adresini yer imine kaydeden yok (gerçek kullanıcı yok).

## 6. Sıradaki işler (plan §5'e göre önerim)
1. Yükleme (18 Kasım'dan sonra, sizin onayınızla).
2. Fişten masraf: fiş fotoğrafından tutar ve tarihi okumak. Bir yapay zekâ servisi gerektirir; maliyeti çıkarıp size sorarım.
3. Girdi ve iş türü kataloğu (gübre, ilaç adları), masraf ve depoda.
4. KVKK: aydınlatma ve açık rıza iki ayrı metin olarak taslak; avukata gidecek.
5. Android mağaza sürümü (TWA) hazırlığı.
6. Gece yedeği (0013) ve deneme hesaplarının temizliği (TÜBİTAK değerlendirmesi bitince).
7. Fidan oturumu: Fidan ekranını bölmek ve fidan stoğunu Köy pazarına hazırlamak.

## 7. Sizden beklenen
1. 18 Kasım'dan sonra **"yükle"** onayı.
2. Supabase'de onay bekleyen iki iş: Geçmiş'teki iki deneme izinin silinmesi; `is_demo` ve iki fonksiyondaki güvenlik ayarı. Bir oturumda çıkan onay penceresine "izin ver" demeniz yeterli.
3. Depoyu gizli yapmak (GitHub ayarı; oturum yapamıyor).
4. Gerçek telefonda sesli masrafı bir kez denemek.
5. Pilot köy, muhtar ve kooperatifle görüşme zamanı (plan §5).

## 8. Dosyalar
- Plan: `docs/plan/uzun-vadeli-plan.md` (§7 güncel durum)
- Vizyon (Köy pazarı §6.7): `docs/fikirler/vizyon.md`
- Core notu: `docs/moduller/core.md`
- Deneme betiği: `scripts/deneme.cjs`
- Arşiv dalı: `arsiv/hayvancilik`
- `gelistirme`, `main`'den 7 commit ileride; 44 dosyada +947 / −1.090 satır.

---

## 9. Ek: görünüm turu (14 Kasım akşam)
Ekran görüntülerine tek tek bakılarak bulunan sorunlar ve yapılanlar. Hepsi `gelistirme`'de, yüklenmedi.

**Uygulama**
| Sorun | Ne yapıldı |
|---|---|
| Fidan bölümünde ana düğmeler yeşil-mavi karışık degrade, toplam kutuları ve seçili sekme sabit yeşil | Degradeler bölüm rengini kullanıyor; eski tarayıcı için düz renk yedeği var |
| Bilgisayar yan menüsünde seçili satır her bölümde yeşil | Bölüm rengi |
| Yan menünün başında "Fidan ▾" çipi iki satıra kırılıyordu | Yan menüde gizli; bölüm değiştirme Özet'in başında ve Menü'de |
| Masraf ekranı içinde bulunulan ay boşsa "0 TL" ile açılıyordu (ilk izlenim kötü) | Kaydı olan son aydan açılır; başlık "Haziran 2026 masrafı" gibi doğru ayı yazar |
| Özet az kayıtla boş görünüyordu (bilgisayarda yarısı boş) | Varsayılan kartlara "Son kayıtlar" eklendi (kişi Ekranımı düzenle'den kapatabilir) |
| Rapor'da telefonda üç rakam kutusu sıkışık, "125.800 TL" ikiye kırılıyordu | Gelir ve Masraf yan yana, Kâr/Zarar alt satırda tam genişlik ve büyük |

**Web sitesi**
| Sorun | Ne yapıldı |
|---|---|
| Ziyaretçiye **"[YER TUTUCU] WhatsApp numarası bekleniyor."** yazısı görünüyordu | Numara girilene kadar "Bize ulaş" bölümü hiç görünmez (`WA_NUMARA` doldurulunca kendiliğinden çıkar) |
| İki modül kartı bilgisayarda sayfanın yalnız sol yarısındaydı | İki geniş kart; kart içinde özellikler iki sütun |
| "Hangi modül bana göre?" testi "beş soru" diyordu ama üç soru vardı; iki modülle anlamı kalmamıştı | Kaldırıldı |
| Telefonda üst menü iki satıra kırılıp 165 piksel yer kaplıyordu | Telefonda yalnız logo ve "Giriş yap" (bölümler sayfada sırayla zaten) |
| Telefonda "Neler yapabilirsin?" 12 büyük kartla yaklaşık üç ekran boyuydu | Kartlar yatay ve sıkı (simge solda); bölüm 2.687 → 1.793 piksel |
| Sesle masraf "Yakında" listesindeydi | Özelliklere taşındı ("İstersen söyle: 'mazota üç bin verdim'") |

**Denendi:** her adımda derleme; 20 ekran × 2 genişlik × (örnek veri + boş defter) = 80 açılış, sorun 0; sitede telefonda yatay taşma yok; ekran görüntüleriyle bakıldı.
**Denenmedi:** gerçek telefon, eski Android tarayıcıda renk yedeği (kod incelemesiyle doğrulandı).

