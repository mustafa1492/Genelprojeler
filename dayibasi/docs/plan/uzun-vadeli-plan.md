# Uzun vadeli plan: sade defter, sonra köyün ortak defteri
*14 Kasım 2026. Core oturumu hazırladı, Mustafa'nın "karar ver, planı çıkar" isteğiyle. Yön için `docs/fikirler/vizyon.md` esastır; bu belge onun takvime ve işe dökülmüş hâlidir.*

> "Mustafa'nın kararı" yazan maddeler kesindir. "Öneri" yazanlar Core'un önerisidir; Mustafa değiştirebilir. Rakam (fiyat, ücret, eşik) uydurulmaz.

---

## 1. Modül kararı (14 Kasım 2026)

Karar, gerçek kullanıma bakılarak verildi (14 Kasım veritabanı sayımı):

| Modül | Gerçek kullanıcı | Karar | Gerekçe |
|---|---|---|---|
| **Tarla** (masraf, gelir, tarla, depo, makineler, takvim, rapor, vade, belge) | Aile defteri, deneme hesapları | **Kalıyor, ana ürün** | Her çiftçinin defteri; vizyonun bütün bağlantıları buna bağlanır |
| **Fidan** | "Köprü fidancılık" (gerçek hesap) + deneme | **Kalıyor, sadeleşecek** | Gerçek kullanıcısı var; fide/fidan Köy pazarında da yer alacak (Mustafa'nın kararı) |
| **Dayıbaşı** (ayrı ürün) | Örnek hesap | **Kalıyor, beklemede** | Köy pazarının işçilik bölümünün karşı tarafı; 2. aşamada uyanır |
| **Tanıtım sitesi** | — | **Kalıyor** | Tarla + fidan odağına göre sadeleştirildi |
| **Kümes (kanatlı)** | Yalnız deneme hesabı | **Arşivlendi** | Gerçek kullanıcı yok; veteriner eşikleri bekliyordu |
| **Büyükbaş, küçükbaş** | Yalnız deneme hesabı | **Arşivlendi** | Aynı gerekçe |

**Arşiv nasıl yapıldı:**
- Kodun tamamı silinmeden önce `arsiv/hayvancilik` dalına alındı (GitHub'da duruyor). Eski `modul/hayvancilik` ve `modul/kanatli` dalları da yerinde.
- `gelistirme`'den çıkarılanlar: `products/ciftci/hayvan/`, `/ciftci/kumes`, `/ciftci/buyukbas`, `/ciftci/kucukbas` sayfaları; menü, alt çubuk, hazır görünüm ("Kümesçi" → "Fidancı"), yetki satırı, panel ve yönetim sayfasındaki modül kutuları, dışa aktarmadaki hayvan sayfaları; tanıtım sitesindeki kümes/hayvan anlatımları.
- **Veritabanına dokunulmadı.** `barns`, `herds`, `herd_days`, `animals`, `animal_events` tabloları ve içindeki deneme verisi duruyor; geçmiş (Geçmiş ekranı) eski kayıtları okumaya devam eder.
- **Geri getirmek gerekirse:** `arsiv/hayvancilik` dalındaki `products/ciftci/hayvan/` ve üç sayfa geri alınır, `git diff gelistirme arsiv/hayvancilik` ile bağlantı satırları görülür. Tahmini iş: yarım gün.

---

## 2. Sadeleştirme: uygulama nasıl incelecek?

İlke: **ekran sayısı azalır, çiftçinin yaptığı iş değişmez.** Her madde süzgeçten geçer (vizyon §2).

### 2.1 Ekran birleştirme (öneri)
| Bugün | Sonra |
|---|---|
| Fiş + Fotoğraflar + Masraf | **Masraf** (fiş fotoğrafı masrafın içinde; fotoğraflar masraf listesinde süzgeç) |
| Kayıtlar + Geçmiş | **Kayıtlar** (arama + "kim neyi değiştirdi" aynı yerde) |
| Sezonlar (ayrı ekran) | Rapor'un ve Ayarlar'ın içinde; tek sezon varken hiç görünmez |
| Listeler (ayrı ekran) | Ayarlar içinde, katalogla birlikte (bkz. 2.3) |
| Modül seçim ekranı | Yalnız fidan açıksa çıkar; tek modülde hiç görünmez (bugün de öyle) |

Sonuç: Menü'de ~15 öğe → ~9 öğe.

### 2.2 Alt çubuk ve ilk açılış (öneri)
- Sabit 5: **Özet · Tarlalar · ＋ Ekle · Para · Menü**. "＋ Ekle" tek düğmede masraf, gelir, tarla işi, fiş.
- **Basit mod varsayılan:** ilk açılışta Özet'te yalnız kâr kartı, hızlı düğmeler, yaklaşanlar. "Ekranımı düzenle" Ayarlar'da durur, öne çıkmaz.
- **İlk açılış rehberi:** 3 adım (tarlanı ekle → ilk masrafı yaz → kâr kartını gör). Atlanabilir.
- Hazır görünümler 4 → 3 (Tarlacı, Fidancı, Sadece para); "En sade" basit modun kendisi olur.

### 2.3 Ortak katalog (vizyon §8.1, en önemli hazırlık)
- **Ürün listesi** (mısır, buğday, domates, zeytin, üzüm…): tarlanın ürünü listeden seçilir; listede yoksa "Diğer + yazı".
- **Girdi listesi** (gübre, ilaç, tohum türleri) ve **iş türleri** (sürüm, ekim, ilaçlama, hasat…): masraf, tarla işi, depo ve ileride Köy pazarı aynı listeyi kullanır.
- Katalog Core'da tutulur; çiftçinin kendi eklediği kalemler kendi defterinde kalır.
- Mevcut serbest yazılar silinmez; bir kere eşleme önerilir ("'Mısır (dane)' → Mısır mı?").

### 2.4 Fidan sadeleştirme (öneri)
- `Fidan.tsx` tek dosyada 924 satır; uygulamanın en büyük ekranı. Parti/sayım, stok, sipariş, müşteri ayrı küçük ekranlara bölünür.
- Fidanın "müşteri ve alacak"ı ortak borç-vade ile birleşir (iki ayrı alacak listesi olmaz: "bir iş, bir yol").
- Ayrıntı fidan oturumunda; Hüseyin'in (Köprü fidancılık) geri bildirimiyle.

### 2.5 Kod tarafı
- Bugün ~8.300 satır ürün kodu; hayvancılıkla ~900 satır çıktı.
- Kullanılmayan ayarlar ve eski uyumluluk kodu bir kez temizlenir (sezonlar, eski yetki adları).
- Otomatik deneme betiği depoya kalıcı alınır (`scripts/`), her yayından önce aynı 20 ekran açılır.

---

## 3. Köy pazarı (vizyon §6.7'ye ek)
**Mustafa'nın kararı (14 Kasım): fide de olsun.** Bölümler:

| Bölüm | Veren | Arayan | Usul |
|---|---|---|---|
| Saman | Çiftçi | Hayvancı / çiftçi | İlan (satılık / aranıyor) |
| **Fide ve fidan** | Fidancı / çiftçi | Çiftçi | İlan; fidan modülündeki stoktan tek dokunuşla ("Satılabilir: 2.000 adet 30–40 cm") |
| Makine ve hizmet | Makine sahibi | Çiftçi | Talep → teklif |
| İşçilik | Dayıbaşı (ekip) | Çiftçi | Talep → teklif |

Fide bölümü, fidan modülünü Köy pazarına bağlayan köprü olur: fidancının stoğu ilanın kendisidir, satış olunca stoktan düşer, gelir yazılır.

---

## 4. Başka neler yapılabilir? (fikir havuzu, süzgeçten geçirilmiş)

Puan: ★★★ çiftçinin işini çok azaltır · ★★ orta · ★ hoş ama şart değil. "Ne zaman" sütunu bu planın aşamasıdır.

| Fikir | İş azaltır mı | Yeni ekran? | Ne zaman | Not |
|---|---|---|---|---|
| **Sesle masraf** ("mazota 3 bin verdim") | ★★★ | Hayır (＋ Ekle'ye mikrofon) | 1. aşama sonu | Yaşlı kullanıcı için yazmaktan kolay; telefonun kendi ses tanıması |
| **Fiş fotoğrafından masraf** (tutar, tarih, satıcı okunur) | ★★★ | Hayır | 1. aşama sonu | Çiftçi sadece onaylar |
| **WhatsApp hatırlatma** (vade, ilaç bekleme, belge bitişi) | ★★★ | Hayır | 2. aşama | Uygulamayı açmayan da haberdar olur; ücretli altyapı |
| **ÇKS ve destek takvimi** (başvuru tarihleri) | ★★ | Hayır (Takvim) | 1. aşama | Tarihler resmi kaynaktan, elle güncellenir |
| **Kredi/destek dosyası** (tek tuşla gelir-gider, tarla dökümü PDF) | ★★ | Hayır (Rapor) | 1. aşama | Rapor zaten var; banka biçimi eklenir |
| **İlaçlama saati** (hava durumuna göre) | ★★ | Hayır (Özet kartı) | 2. aşama | Eşikler Mustafa onayı olmadan yok |
| **Hangi yıl hangi tarlaya ne ekildi** (münavebe tablosu) | ★★ | Hayır (Tarla kartı) | 1. aşama | Veri zaten var |
| **Köy pazarı** | ★★★ | Evet, tek ekran | 2. aşama | Bkz. 3 |
| **Onay akışı** (karşı tarafın girdiği kayıt) | ★★★ | Hayır (Özet kartı) | 2. aşama | Köy pazarının kalbi |
| **Köy duyuru panosu** (muhtar, kooperatif yazar) | ★★ | Köy pazarı içinde | 2. aşama | Yalnız doğrulanmış hesaplar yazar |
| **Ortak alım** (kooperatifle toplu gübre siparişi) | ★★ | Köy pazarı içinde | 3. aşama | Kooperatif bağlantısıyla |
| **Bölgemle karşılaştır** | ★★ | Hayır (Rapor) | 3. aşama | Yeterli veri ve KVKK şartıyla |
| **Hal ve borsa fiyatları** | ★ | Hayır (Özet kartı) | 3. aşama | Resmi kaynak varsa |
| **Denetime hazır kayıt** (İyi Tarım) | ★★ | Hayır (Rapor çıktısı) | 3. aşama | Gereklilikler araştırılacak |
| Sosyal akış, beğeni, yorum | — | Evet | **Yapılmayacak** | Süzgeçten geçmiyor (vizyon §2) |

---

## 5. Takvim

### Şimdi → 18 Kasım 2026: TÜBİTAK
- Canlıya dokunulmaz (deneme hesabı hakemlerde). Hayvancılığın arşivlenmesi `gelistirme`'de bekler; 18 Kasım'dan sonra yüklenir.

### Kasım sonu → Ocak 2027: Sadeleştirme ve zemin (1. aşama, kod)
1. Hayvancılık arşivinin canlıya çıkması.
2. Ekran birleştirme (2.1) ve sabit alt çubuk (2.2): önce telefon taslağı (resim), Mustafa onaylayınca kod.
3. Ortak katalog (2.3).
4. Basit mod + ilk açılış rehberi.
5. KVKK: aydınlatma ve açık rıza iki ayrı metin; paylaşım onayı anahtarı (kapalı başlar).
6. Gece yedeği (0013), e-postayla şifre sıfırlama (SMTP), deneme hesaplarının temizliği (TÜBİTAK değerlendirmesi bitince).
7. Fidan sadeleştirme (fidan oturumu).

### Ocak → Şubat 2027: Sahaya hazırlık (konuşma ve dağıtım)
- **Android mağaza sürümü (TWA).** "Uygulamayı indir" denebilsin.
- **Konuşmalar:** muhtar ve kooperatif (pilot köy), 2–3 dayıbaşı, 2–3 makine sahibi, avukat (KVKK, aracılık, e-ticaret).
- Deneme sezonu kuralları: bitiş tarihi, "kurucu çiftçi" ödülü (Mustafa'nın kararı).
- Sesle masraf ve fişten masraf (zaman kalırsa).

### Mart → Haziran 2027: Deneme sezonu başlar
- 5–10 gerçek çiftçi (aile, Köprü fidancılık, muhtarın ve kooperatifin getirdikleri).
- Ayda bir yan yana oturup kullanımı izleme; takılınan yerlerin listesi.
- **Köy pazarı v1, tek köyde:** ilkbaharın dolu bölümleri **makine ve hizmet** (sürüm, ekim) ve **fide/fidan**. Onay akışı burada doğar.
- Başarı ölçütü: 3 ay sonra hâlâ kayıt giren kişi sayısı.

### Temmuz → Ekim 2027: Hasat ve bağlantı
- Köy pazarına **işçilik** (dayıbaşı uyanır) ve **saman** bölümleri.
- WhatsApp hatırlatma.
- Makine sahibi ve dayıbaşında "tek kayıt, iki taraf" alacak takibi.

### Kasım 2027: Sezon sonu değerlendirmesi
- Rakamlar: kaç kişi başladı, kaçı kaldı, en çok kullanılan ekran, "ne öderdin" cevapları.
- **Kararlar:** fiyat ve paketler; iş başı ücretin tutarı ve başlangıcı; ikinci köy/ilçe.

### 2028: Büyüme (3. aşama)
- İkinci ve üçüncü köy; kooperatif pilotu (stok, ortak alım).
- Bölgemle karşılaştır (yeterli veri + KVKK onayıyla).
- Kurumsal panel için tek pilot kurum (sözleşmeli üretim firması ya da kooperatif).
- Arşivdeki hayvancılık, ancak gerçek bir hayvancı kullanıcı isterse geri döner.

---

## 6. Mustafa'nın kararını bekleyenler (bu plana göre)
1. Modül kararı (bu belge §1): onay ya da değişiklik. Arşiv 18 Kasım'dan sonra mı yüklensin?
2. Ekran birleştirme ve alt çubuk taslağı (2.1–2.2): telefon resmi hazırlansın mı?
3. Katalog: ürün listesinin ilk hâlini kim çıkaracak (Core önerir, Mustafa düzeltir)?
4. Pilot köy, muhtar ve kooperatifle görüşme zamanı.
5. Deneme sezonu bitiş tarihi ve "kurucu çiftçi" ödülü.
6. Fikir havuzundan 1. aşamaya alınacaklar (öneri: sesle masraf, fişten masraf, münavebe tablosu, kredi dosyası).

---

## 7. Durum (14 Kasım gece, `gelistirme`'de, yüklenmedi)
| Plan maddesi | Durum |
|---|---|
| 1. Hayvancılık/kümes arşivi | Yapıldı |
| 2.1 Ekran birleştirme | Kısmen: Menü 9 öğeye indi (Fiş ＋ Ekle'de, Geçmiş Kayıtlar'da); Fiş/Fotoğraflar ekranları ayrı sayfa olarak duruyor, Sezonlar ve Listeler Ayarlar'dan açılıyor |
| 2.2 Alt çubuk | Yapıldı, değiştirilerek: "Para" sekmesi yerine 3 kişisel yer + ortada "＋ Ekle" + Menü (kişiye özel alt çubuk korunsun diye) |
| 2.2 İlk açılış rehberi | Yapıldı ("Başlarken" kartı, kendiliğinden işaretlenir, gizlenebilir) |
| 2.2 Basit mod varsayılan | Yapılmadı: varsayılan görünüm zaten 5 kart; "En sade" hazır görünüm duruyor. Gerçek kullanıcı denemesinden sonra karar |
| 2.3 Ortak katalog | Ürün kataloğu yapıldı (tarla, verim, gelir). Girdi ve iş türü kataloğu sonra (masraf türleri zaten listeden) |
| 2.4 Fidan sadeleştirme | Yapılmadı: fidan oturumunun işi, Hüseyin'in geri bildirimiyle |
| 2.5 Kalıcı deneme betiği | Yapıldı (`scripts/deneme.cjs`) |
| 4. Sesle masraf | Yapıldı (gerçek telefonda denenmeli) |
| 4. Yıllara göre ürün | Yapıldı (tarla kartında "Yıllara göre ürün ve verim") |
| 4. Fişten masraf, kredi dosyası, ÇKS takvimi | Yapılmadı |
| Tanıtım sitesi | Yapıldı: tarla+fidan, "Deneme sürümü", Yakında'ya Köy pazarı, rehber adımları ＋ Ekle'ye göre |

