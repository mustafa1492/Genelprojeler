# Çiftçi Defteri: Vizyon ve Büyüme Notu
*14 Kasım 2026. Mustafa ile yapılan fikir alışverişinden derlendi (6.7 Köy pazarı aynı gün eklendi). Kod yazdırmak için değil; yön, kural ve karar noktalarını başka oturumlara taşımak için.*

> **Okuyan oturuma not:** Bu belgedeki her şey **vizyon ve öneri**dir. "Mustafa'nın kararı" diye işaretlenmemiş hiçbir madde kesinleşmiş değildir. Para, süre, eşik, fiyat gibi rakamlar uydurulmaz; Mustafa'ya sorulur. Canlıya yalnız Mustafa "yükle" deyince çıkılır. Mevcut çalışma kuralları (`dayibasi/docs/moduller/README.md`) aynen geçerlidir.

---

## 1. Vizyon

**Tek cümle:** *Çiftçinin işini kolaylaştıran her şey burada.*

**Yön:** *Çiftçinin cebindeki defterden, köyün ortak defterine.*

Bugün Çiftçi Defteri tek bir çiftçinin kendi kaydı. Büyüme, çiftçinin etrafındaki herkesin (dayıbaşı, kooperatif, bayi, makine sahibi, danışman, firma) **aynı kaydı beslemesiyle** gelir.

**Temel kural: Tek kayıt, iki taraf.**
Bir kişi girer, iki tarafta görünür. İşçilik masrafını dayıbaşı yazar, gübre masrafını kooperatif yazar; çiftçi sadece **onaylar**. Uygulama büyüdükçe çiftçinin işi **azalmalı**.

**Mustafa'nın tespiti:** "Çiftçinin işini kolaylaştırmak derken her şey işin içine giriyor." Dayıbaşı, kooperatif, bayi ve diğer bağlantılar bu vizyonun parçasıdır.

---

## 2. Süzgeç: Her yeni fikir bu 5 sorudan geçer

"Her şey dahil" olunca uygulama şişebilir; hedef kullanıcı yaşça büyük ve ekran arttıkça kaybolur. Bu yüzden:

1. **Çiftçinin işini gerçekten azaltıyor mu?** Daha az giriş, yol, telefon, unutma. Sadece "bilgi göstermek" yetmez.
2. **Yeni ekran açtırıyor mu?** Mümkünse var olan yere oturmalı (kooperatif stoğu → Depo, dayıbaşı → Masraf ve Takvim). Yeni ekran en son çare.
3. **Kaydı kim giriyor?** En iyisi, karşı tarafın girmesi ve çiftçinin onaylaması.
4. **İstemeyen görmüyor mu?** Bağlantılar da modüller gibi isteğe bağlı. Dayıbaşıyla çalışmayan çiftçi o düğmeyi hiç görmez.
5. **Ortak koda mı yazılıyor?** Katalog, depo, kişi kartı, onay akışı gibi parçalar bir kez yazılıp her yerde kullanılır.

**Kontrol cümlesi:** Uygulama büyürken çiftçinin işi de büyüyorsa, bir yerde süzgeç kaçmış demektir.

---

## 3. Neden bu yön? (para mantığı)

- Mustafa'nın tespiti: bölgedeki çiftçi bu işlere az para yatırır.
- Bu yüzden **çiftçi tarafı sade ve ucuz** kalabilir. Asıl gelir **bağlantı tarafından** gelir: bayi, kooperatif, makine sahibi, dayıbaşı, danışman, firma.
- Paket sistemi (Basit / Orta / Tam) ve fiyat **Mustafa'nın kararı**, hâlâ ertelenmiş durumda. Bu çerçeve yalnızca "kim öder" sorusunu değiştirir.
- **Farkımız:** büyük tarım yazılımları büyük işletmeye yapılır. Bizim alanımız küçük ve orta çiftçi: yaşlı kullanıcıya göre tasarım, internetsiz çalışma, aile/çalışanla ortak kullanım, Türkiye'ye özel parçalar (tapu parsel sorgusu, TCMB kuru, ÇKS). Rakiplerin çoğu ya sadece çiftçiye ya sadece kuruma yazılım yapıyor; **ikisini aynı veride birleştirmek** bizim farkımız olur.

---

## 4. Aşamalar

### 1. Aşama: Sezon başına kadar
**Hedef:** Gerçek çiftçi bir sezon boyunca bıraktırmadan kullansın.
- Yeni özellik değil, **sadeleştirme ve deneme**: modül seçimi, sabit 5 düğmeli alt çubuk, basit mod, ilk açılış rehberi (açık sorulardaki 1. madde).
- Android mağaza sürümü (TWA). Köydeki çiftçi "siteye gir" değil, "uygulamayı indir" anlar.
- 5–10 gerçek kullanıcı (aile, fidancı Hüseyin, hayvancı, kümesçi).
- **Başarı ölçütü:** özellik sayısı değil, **kaç kişinin üç ay sonra hâlâ kayıt girdiği**.

### 2. Aşama: Bağlantı
**Hedef:** Bir kişi girsin, iki tarafta görünsün.
- **Köy pazarı** (saman, makine ve hizmet, işçilik; bkz. 6.7): bağlantıların çiftçiye görünen kapısı
- Dayıbaşı bağlantısı ve işçi bağlama (bkz. 6.1)
- Kooperatif ve bayi stoğu, veresiyesi (bkz. 6.2)
- Makine sahibi ve biçerdöverci hizmeti (bkz. 6.3)

### 3. Aşama: Veriyi değere çevirmek
- Bölgemle karşılaştır (bkz. 6.4)
- Kurumsal panel: kooperatif, sözleşmeli üretim firması (bkz. 6.5)
- Veriyi hizmete çevirme (bkz. 6.6)
- Denetime hazır kayıt: ilaçlama, doz, hasat bekleme süresi zaten tutuluyor. Sertifikalı üretim (İyi Tarım Uygulamaları gibi) ve ihracatçıya ürün verenler için çıktı. **Gereklilikler araştırılmalı.**
- Kredi ve destek dosyası: banka/kooperatif için tek tuşla gelir-gider ve tarla dökümü; ÇKS ve destek tarihleri için hatırlatma.
- İlaçlama saati fikri (`docs/fikirler/ilaclama-saati.md`) buraya oturur. Eşikler onaylanmadan yapılmaz.

**Sıralama kuralı:** 2. ve 3. aşama, sahada bir sezon kullanılmış bir Çiftçi Defteri'nin üstüne kurulursa anlam kazanır. Bugün bunlar için yapılacak iş yalnızca **hazırlık** (bkz. 8).

---

## 5. İlk sezon: "Kanıt toplama sezonu"

Mustafa'nın tespiti: bir sezonu ücretsiz geçirmek gerekiyor. Öneri, bunu bedava dağıtım değil **karşılığı olan bir deneme sezonu** olarak kurgulamak:

- **"Ücretsiz" değil, "Deneme sezonu" denir.** ("Ücretsiz" yazısı zaten kaldırıldı.) Sezonun bitiş tarihi en baştan söylenir; ücrete geçiş sürpriz olmaz.
- **Karşılığında istenenler:**
  - **Geri bildirim:** ayda bir kısa görüşme ya da sahada yan yana oturup kullanımı izlemek.
  - **İzin:** sezon sonunda anonim kullanım rakamlarını ("şu kadar çiftçi, tarla, kayıt") kullanma izni.
  - **Referans:** memnun kalan çiftçinin kooperatife/başka çiftçiye "ben kullanıyorum" demesi; kısa video ya da sözlü onay.
- **İlk kullanıcıya ödül:** "Kurucu çiftçi" gibi bir ad; ileride kalıcı indirim ya da ek ücretsiz süre sözü. **Ne kadar olacağı Mustafa'nın kararı.**
- **Sezon sonunda elde olması gerekenler:** kaç kişi başladı, kaçı 3 ay sonra hâlâ kullanıyor, en çok hangi ekran kullanıldı, nerede takıldılar, "bu olmasa ne yapardın" cevapları, "bunun için ne öderdin" cevapları.
- Bu rakamlar fiyat kararını, kooperatif sunumunu ve TÜBİTAK/KOSGEB başvurularını besler.
- **Masraf tarafı:** Vercel ve Supabase ücretsiz katmanları küçük kullanıcı sayısında yeter. Veritabanı uyumasın diye hazırlanan günlük çağrı bunun içindi.
- **Yan gelir:** cepte tutulan esnaf web sitesi işi bu sezonda yan gelir olabilir (bkz. 10).

---

## 6. Bağlantılar (ağ)

```
                    Firma / Kooperatif paneli
                    (toplu bilgi hizmeti)
                              │
   Dayıbaşı ───────┐          │          ┌─────── Kooperatif / Bayi
   (işçi, yevmiye) │          │          │        (girdi, stok, veresiye)
                   ▼          ▼          ▼
                 ┌──────────────────────────┐
                 │     ÇİFTÇİNİN DEFTERİ    │
                 └──────────────────────────┘
                   ▲                     ▲
   Makine sahibi ──┘                     └── Bölgemle karşılaştır
   (dekar başı hizmet)                       (kendi maliyeti ↔ bölgesi)
```

### 6.1 Dayıbaşı ve işçi bağlama
Çiftçi Defteri ile Dayıbaşı'yı birbirine bağlayan en doğal parça.

**Akış (öneri):**
1. **Çiftçi ilan verir (2 dokunuş):** iş türü (zeytin, mısır püskülü, çapa…), tarih, kaç kişi, kaç gün. Tarla ve köy defterden kendiliğinden gelir.
2. **Önce bildiği dayıbaşına gider.** Çiftçi daha önce biriyle çalıştıysa ilan ilk ona düşer. Yanıt gelmezse bölgedeki diğer dayıbaşılara açılır.
3. **Dayıbaşı yanıt verir:** "Alırım, 12 kişi, Salı başlarız." WhatsApp'tan gelen bağlantıyla, tek düğmeyle.
4. **İş kesinleşince:** dayıbaşının uygulamasında ekip ve puantaj açılır. İş bitince yevmiye toplamı çiftçinin defterine **onay bekleyen masraf** olarak, dayıbaşının tarafına **alacak** olarak düşer. Vade iki tarafta da takip edilir.

**Hassas noktalar:**
- ~~"İşçimi alıyor" meselesi~~ **Geçersiz (Mustafa, 14 Kasım):** dayıbaşı tek kişi değil 20–30 kişilik ekip getirir; iletişim yalnız dayıbaşı ile çiftçi arasındadır, çiftçi işçilerle muhatap olmaz. Çiftçi ekranında yalnız "dayıbaşı · kişi sayısı" görünür.
- **Fiyat kırma:** Mustafa'nın kararı (14 Kasım): teklifte fiyat açıkça görünür, cevap sayısına sınır yok. Bkz. 6.7.
- **Puan/yorum yok.** Köyde açık puanlama kavga çıkarır. Yerine tarafsız bilgi: "Uygulamada 23 iş tamamladı", "Belgesi var".
- **Dayıbaşının asıl derdi tahsilat.** Ona en büyük fayda, iş bulmaktan çok alacak takibi olabilir.
- **WhatsApp:** dayıbaşılar teknolojiye uzak; yanıt WhatsApp üzerinden gelmeli. WhatsApp'ın resmi mesaj altyapısı ücretli, hesaba katılmalı. (Saha takip projesindeki WhatsApp fikri burada kullanılabilir.)

**Hukuki taraf (avukatla bakılmalı):**
- Tarımda iş ve işçi bulma aracılığı yalnızca İŞKUR'dan **aracılık belgesi** almış kişilerce yapılabilir; devredilemez, vekâletle yürütülemez (Tarımda İş Aracılığı Yönetmeliği).
- Bir araştırmaya göre aracıların yaklaşık yarısında (%46) belge var, yarısında yok.
- **Sonuç 1: Platformun kendisi "aracı" olmamalı.** Biz işçi bulmuyoruz; çiftçi ile dayıbaşının iletişim ve kayıt aracını sağlıyoruz. Tasarımda ve metinlerde net durmalı; yoksa izinsiz aracılık sayılma riski olabilir.
- **Sonuç 2: Belgesiz dayıbaşının ilana çıkması riskli.** Seçenekler: sadece belgelilere ilan açmak ya da belge almayı kolaylaştırıp "Belgeli" rozetiyle teşvik etmek. **Mustafa'nın kararı.**
- **Fırsat:** aracı, işverenle işçiler adına sözleşme yapmak ve imzalı örneği 10 gün içinde İŞKUR'a vermek zorunda. Uygulama bu sözleşmeyi hazırlayıp süreyi hatırlatırsa dayıbaşına doğrudan fayda olur ve belgeye geçişi teşvik eder.

**İlk sürüm önerisi:** bölgeye açık ilan bile olmasın; sadece **çiftçinin zaten çalıştığı dayıbaşıyla** bağlantı. Hukuki ve sosyal risk en az, "tek kayıt iki taraf" faydası yine görünür. Bölgeye açılma, dayıbaşılarıyla konuştuktan sonra.

### 6.2 Kooperatif ve bayi stoğu
**Depo modülü zaten var.** Kooperatif/bayi tarafı büyük ölçüde aynı depo ekranının başka bir görünümü olur.

**Akış (öneri):**
1. **Kooperatif tarafı:** kendi deposunu tutar (gübre, ilaç, tohum, yem, mazot). Hangi ürünlerin çiftçiye görüneceğini kendisi seçer. Excel ya da başka programdan liste yükleyebilir.
2. **Çiftçi tarafı, "Nerede var?":** ürünü listeden seçer, hangi kooperatifte/bayide olduğunu görür. Kesin adet yerine **"Var / Az kaldı / Yok"** (daha sade, kooperatifin ticari bilgisini de korur). Fiyat gösterimi kooperatifin kararı.
3. **Ayırtma:** "Bana 20 çuval ayır" → kooperatif onaylar. Boşuna yol gidilmez.
4. **Teslimde tek kayıt, iki taraf:** çiftçinin deposuna girer, defterine masraf olarak düşer (veresiyeyse vadesiyle). Kooperatifin deposundan düşer, ortağın cari hesabına yazılır.
5. **Haber verme:** "Beklediğin gübre geldi" (WhatsApp'tan da gelebilir).

**Asıl değer, talebi önceden görmek:** çiftçilerin takvimdeki planlı işleri (ilaçlama, gübreleme) ve geçen sezonki kullanımları toplanınca kooperatife "Önümüzdeki ay bölgende tahminen şu kadar ton gübre ihtiyacı var" bilgisi verilir. Kooperatif stoğunu buna göre yapar, çiftçi "yok" cevabıyla karşılaşmaz. Veriyi hizmete çevirmenin en somut hâli. Kurallar 7. bölümdeki gibi.

**Dikkat:**
- Büyük kooperatiflerin kendi sistemleri olabilir; entegrasyon zor ve yavaş. Başlangıç hedefi: kâğıt/Excel'le çalışan **küçük yerel kooperatifler ve bayiler**.
- **Stok güncel değilse güven biter.** Çiftçi "var" görüp gittiğinde mal yoksa bir daha bakmaz. Satış ve teslim mutlaka sistemden geçmeli; "son güncelleme: 2 gün önce" bilgisi gösterilmeli.

### 6.3 Makine sahibi / biçerdöverci
- Dekar başı iş yapıyor, çok sayıda çiftçiden alacağı birikiyor. Dayıbaşı'ya çok benziyor (iş yap, alacağı takip et); ortak kod büyür.
- İş ve ücret aynı şekilde iki tarafa yazılır: makine sahibinde alacak, çiftçide masraf.

### 6.4 Bölgemle karşılaştır
Mustafa'nın tespiti: genel bölge seçildikten sonra çiftçinin kendi maliyetlerini bölgesiyle karşılaştırması büyük fayda. **Ama kimse kimsenin verisini görmez; kişi sadece kendisini bölgesiyle karşılaştırır.**

**Çiftçi ne görür (öneri):**
- Tarlasını ya da ürününü seçer; bölgesi tarlanın köyünden kendiliğinden gelir.
- Tek karşılaştırma: **"Sen"** ve **"Bölgende"**. Dekar başı maliyet, kalem kalem (gübre, ilaç, tohum, işçilik, mazot, sulama), dekar başı verim, başabaş fiyatı.
- Rakamın yanında düz cümle: "Gübre masrafın bölgedeki çiftçilerin çoğundan fazla." Yaşlı kullanıcı yüzdeyi değil cümleyi anlar.
- Bölge rakamı olarak ortalama değil **orta değer** (medyan). Uçuk bir kayıt ortalamayı bozar, orta değeri bozmaz. Ekranda "bölgede ortadaki çiftçi" gibi sade dille.

**Gizlilik kuralları:**
1. Liste yok, isim yok, tek kayıt yok; sadece toplu rakam.
2. **Alt sınır:** bölgede o üründe yeterli çiftçi yoksa rakam gösterilmez; "Köyünde henüz yeterli kayıt yok, ilçe geneli gösteriliyor" denip bir üst bölgeye geçilir (köy → ilçe → il). **Alt sınır sayısı Mustafa'nın kararı.**
3. **Sabit bölge basamakları.** Kullanıcı kendi filtresini kuramaz (yoksa "köy" ile "köy eksi bir mahalle" farkından tek kişinin rakamı çıkarılabilir).
4. **Yuvarlama:** bölge rakamları yuvarlak gösterilir.
5. **Sadece paylaşmayı açanlar hesaba girer.** Paylaşım ayrı, her an kapatılabilir bir anahtar.

**"Paylaşan görür" kuralı?** Karşılaştırmayı yalnızca paylaşımı açanlara göstermek adil ve teşvik edici. Ancak KVKK'daki "açık rıza hizmet şartı yapılamaz" ilkesiyle nasıl örtüştüğü **avukata sorulmalı**. **Mustafa'nın kararı.**

**Ön şartlar:**
- Ürün ve masraf türleri listeden seçilmeli.
- Masrafın tarlası ve tarlanın dekarı dolu olmalı (dekar başı hesap için). "İşletme gideri" karşılaştırmaya girmez ya da ayrı gösterilir.
- Hesap sezon kapanınca ya da yeterli kayıt birikince yapılır; yarım kayıtla karşılaştırma yanıltır.

### 6.5 Kurumsal panel: kooperatif, sözleşmeli üretim firması, büyük işletme
Kurumsal ürün "aynı uygulamanın büyüğü" değil; **çiftçi uygulamasının üstüne oturan ikinci bir katman**. Altyapıda zaten kurumsal yazılımın temel taşları var: ekip daveti, ekran ekran yetki, kim neyi girdi, geçmiş, "Geri al".

**Kim neye ihtiyaç duyar?**
- **Kooperatif ve üretici birlikleri:** ortak listesi, ortağın teslim ettiği ürün (kantar, kalite, fiyat), ortağa verilen girdi ve avans, ortak cari hesap (alacak-borç mahsubu), ortaklara ödeme, toplu duyuru.
- **Sözleşmeli üretim firmaları (Yaklaşım Tarım tipi):** yüzlerce çiftçinin tarlası, verilen tohum/ilaç, saha ziyaretleri, hasat tahmini, teslimat, hasattan mahsup. Mustafa bu alanı içeriden tanıyor; saha takip projesi de buraya bağlanıyor. **En güçlü kapı olabilir.**
- **Büyük işletmeler:** çok sayıda tarla ve çalışan, puantaj, makine filosu, maliyet merkezleri.

**Asıl fikir: tek kayıt, iki görünüm.** Her ortak/sözleşmeli çiftçi kendi Çiftçi Defteri'ni kullanır; kurum, çiftçinin izin verdiği kadarını kendi panelinde toplu görür. Aynı veri tekrar girilmez.

**"Profesyonel" olmak için eklenecekler:**
- Bilgisayar ağırlıklı panel: tablolar, filtreler, toplu işlem.
- Toplu veri alma/verme: Excel'den yükleme, muhasebe programlarına (Logo, Mikro, Luca gibi) aktarım.
- Resmi belge tarafı: çiftçiden alımda e-müstahsil makbuzu, e-fatura gibi konular. **Hangilerinin gerektiği araştırılmalı.**
- Rol hiyerarşisi: yönetici, muhasebe, saha personeli, kantar görevlisi; şube/bölge bazlı yetki.
- Güvence: düzenli yedek, kesintisiz çalışma, KVKK sözleşmesi, veri dışa aktarma hakkı.
- Destek ve eğitim: kurum, yazılımla birlikte bir muhatap satın alır.

**Gerçekçi taraf:**
- Satış süreci uzun (yönetim kurulu kararı, deneme, referans). Genelde şirket kurmak, kurumsal fatura kesebilmek ve bir pilot müşteri gerekir.
- Tek kişiyle kurumsal destek zor; "telefonu kim açacak" sorusu ilk müşteride çıkar.
- Sıralama: önce çiftçi uygulaması sahada bir sezon oturur (kurumu ikna edecek kanıt), sonra **tek bir pilot kurumla** onların gerçek iş akışına göre panel kurulur.
- TÜBİTAK ve KOSGEB destekleri işe yarayabilir; 2209-A başvurusu ilk adım sayılır.

### 6.6 Veriyi hizmete çevirmek
Mustafa'nın tespiti: veriyi hizmete çevirme fikri iyi.

**Satılan şey ham veri değil, toplu bilgi ve hizmet.** Ham veriyi satmak (kimin, hangi tarlası, ne kazandığı) hem hukuken çok riskli hem çiftçinin güvenini bitirir. "Verimi satıyorlar" haberi köyde çok hızlı yayılır.

**Kim neyi alır?**
- **Tohum, ilaç, gübre firmaları:** hangi bölgede hangi ürün ne kadar alanda, hangi girdi hangi ay kullanılıyor (pazar ve talep raporu).
- **Bayiler:** sezonda ne kadar stoklamaları gerektiğine dair bölgesel talep tahmini.
- **Alıcı, sanayi, ihracatçı:** hasat zamanı ve rekolte tahmini.
- **Banka ve sigorta:** bölgesel ortalama maliyet ve verim (risk hesabı). **Tek çiftçinin bilgisi satılmaz**; çiftçi isterse kendi raporunu kendisi bankaya götürür.
- **Üniversite, kamu, kooperatif:** araştırma ve planlama verisi.

**Model:** bir kerelik dosya satışı yerine **abonelikle güncel bölge paneli ve rapor**. Çiftçiye de karşılığında bir şey döner (bölge karşılaştırması). Çiftçi verisini verdiğinde kazandığını görürse izin verir.

**Gerçekçi beklenti:** bir sezonda birkaç düzine çiftçinin verisi satılabilir değer taşımaz; değer birkaç bin çiftçiye ulaşınca oluşur. İlk sezonun verisi satış için değil, **kanıt** için.

### 6.7 Köy pazarı (14 Kasım fikir alışverişi)
**Mustafa'nın kararı:** çiftçilerin birbirine (ve çevresindeki iş yapanlara) satış yapabildiği bir yer. Genel sosyal medya değil (akış, beğeni, yorum yok); yerel, düzenli ve defterle bağlı bir ilan ve talep-teklif yeri. Armut'a benzer: talep açılır, iş yapanlar teklif verir.

**Dört bölüm (Mustafa'nın seçimi; fide sonradan eklendi):**
| Bölüm | Veren | Arayan | Usul | Defterde |
|---|---|---|---|---|
| **Saman** | Çiftçi | Hayvancı / çiftçi | Basit ilan: satılık / aranıyor | Satıcıda gelir ve depodan düşüm, alıcıda masraf ve depo girişi |
| **Fide ve fidan** | Fidancı / çiftçi | Çiftçi | İlan; fidan modülündeki stoktan tek dokunuşla | Satıcıda gelir ve stoktan düşüm, alıcıda masraf |
| **Makine ve hizmet** | Makine sahibi (sürüm, balya, biçerdöver…) | Çiftçi | Talep → teklif | Makine sahibinde alacak, çiftçide masraf (tarlasıyla) |
| **İşçilik** | Dayıbaşı (20–30 kişilik ekip) | Çiftçi | Talep → teklif | Dayıbaşında alacak, çiftçide masraf |

**Talep → teklif akışı:**
1. Çiftçi talep açar: kısa sorularla (iş türü, tarih, dekar ya da kişi sayısı, gün). Tarla ve köy defterden gelir; 2–3 dokunuş.
2. Talep, o işi yapan ve o bölgede olan makine sahiplerine / dayıbaşılarına bildirim olarak gider. Tersi de var: "boşum / ekibim var" ilanı, arayan çiftçilere gider.
3. **Teklifte fiyat açıkça görünür; cevap sayısına sınır yok** (Mustafa'nın kararı).
4. Çiftçi birini seçer; iletişim taraflar arasında (WhatsApp / telefon). Para uygulamadan geçmez.
5. İş bitince karşı taraf "bitti, toplam şu kadar" yazar → çiftçide **onay bekleyen masraf**; onaylanınca iki defterde kesinleşir, vade takip edilir.

**Para:** çiftçi ödemez. Başlangıçta herkes için ücretsiz. İleride makine sahibi ve dayıbaşı **iş başına** öder (Mustafa'nın kararı); "tamamlanan iş" = çiftçinin onayladığı kayıt. Ücret, aracılık komisyonu gibi değil, alacak takibi ve kaydın karşılığı olarak sunulmalı (hukuken de bu ayrım önemli). Tutar ve başlangıç tarihi Mustafa'nın kararı.
- Risk: ilk tanışmadan sonra işin uygulama dışına kaçması. Çözüm yasak değil fayda: alacak ve vade takibi yalnız uygulamaya girilen işte tutulur.

**Güven:** puan ve yorum yok. Tarafsız bilgi: "Uygulamada 23 iş", "Muhtar onaylı", "Aracılık belgesi var". Her ilanda "Bildir" düğmesi. Telefon numarası ancak taraf "görüşelim" deyince açılır.

**İlk kalabalık (Mustafa):** bir muhtar ve bir kooperatif. Öneri: muhtar köy doğrulaması ("muhtar onaylı") ve köy duyuruları; kooperatif ilk ilanlar ve "Bildir"e ilk bakan. Pilot: tek köy/ilçe.

**Zamanlama:** saman yaz sonu–sonbahar; makine sürümde (sonbahar, ilkbahar) ve hasatta (yaz); işçilik hasat ve çapada. Pilotun başlama ayı, önce hangi bölümün dolacağını belirler.

**Dikkat / araştırılacak:** platform aracı değil, ilan ve kayıt aracı (tarım aracılığı + e-ticaret "aracı hizmet sağlayıcı" yükümlülükleri avukata sorulacak). Satışı kurala bağlı ürünler (zirai ilaç, tohumluk, hayvan) Köy pazarında yok ya da uyarılı.

**Açık sorular:** muhtar ve kooperatif hangi köy/ilçeden, onlarla konuşuldu mu; pilot ne zaman; köyden tek tük gündelikçi de ilan verebilsin mi yoksa işçilik yalnız dayıbaşı üzerinden mi; iş başı ücretin tutarı.

---

## 7. Gizlilik ve hukuk: ortak kurallar
*(Avukat görüşü değildir. KVKK ve aracılık konuları bir avukata danışılmalı.)*

- **KVKK Madde 8:** kişisel veriler, ilgili kişinin açık rızası olmadan aktarılamaz.
- **Açık rıza:** bilgilendirmeye dayalı, belirli bir konuya ilişkin, özgür iradeyle verilmiş olmalı. **Hizmetin ön şartı yapılamaz.** Yani "uygulamayı kullanmak için verini paylaşmayı kabul et" denemez; paylaşım ayrı ve isteğe bağlı bir onay olmalı.
- **2026 İlke Kararı (2026/347):** açık rızaya dayanan işlemde **aydınlatma metni ile açık rıza metni ayrı ayrı** düzenlenip sunulmalı. Nisan öncesi listedeki KVKK metinleri baştan iki ayrı metin olarak kurulmalı.
- **Anonimleştirilmiş veri:** daha önce bir kişiyle ilişkili ama artık bağlantısı kesilmiş veri. Satılabilecek alan esas olarak burası.
- **Köyde anonimleştirme zor:** bir köyde üç domates üreticisi varsa "köyün domates maliyeti" bile kişiyi ele verir. Bütün toplu gösterimlerde **alt sınır, sabit bölge basamakları ve yuvarlama** kuralları geçerli (bkz. 6.4).
- **Tarım aracılığı:** bkz. 6.1. Platform aracı değil, araçtır.

---

## 8. Bugünden yapılacak hazırlıklar
*Odaklanılan işten (1. aşama) geri kalmadan, ileride bağlantıları kaldıracak zemini hazırlamak için. Hepsi küçük düzenlemeler.*

1. **Ortak ürün kataloğu (en önemlisi).** Çiftçinin masrafı, bölge karşılaştırması, kooperatif stoğu ve talep tahmini aynı ürün listesine bağlı. Ürün adları, girdiler (ilaç, gübre, tohum) ve iş türleri mümkün olduğunca **listeden seçilmeli, serbest yazılmamalı**. (Biri "mısır", öteki "Mısır (silajlık)", üçüncüsü "msr" yazarsa o veri hiç toplanamaz.) Katalog Core'a ait olmalı; her modül aynısını kullanmalı.
2. **Masraf → tarla → dekar bağı** dolu tutulmalı (dekar başı hesap için).
3. **Paylaşım onayı** şimdiden ayrı ve geri alınabilir bir anahtar olarak tasarlanmalı. Sonradan herkesten tekrar izin istemekten çok daha kolay.
4. **KVKK metinleri** iki ayrı metin olarak (aydınlatma + açık rıza) hazırlanmalı.
5. **Depo modülü** kooperatif/bayi görünümünü kaldıracak şekilde düzenli tutulmalı.

---

## 9. Ortak kod (Core) için aday parçalar
Bir kere yazılıp Çiftçi Defteri, Dayıbaşı, kurumsal panel ve ileride esnaf işi gibi diğer projelerde kullanılabilecek parçalar:

- Kişi kartı (zaten hedeflenen)
- Ürün kataloğu
- Depo (stok, az kalan uyarısı)
- **Onay akışı:** karşı tarafın girdiği kaydı "onay bekliyor → onaylandı/reddedildi" olarak gösteren yapı. "Tek kayıt, iki taraf"ın kalbi.
- Alacak-borç ve vade takibi
- Toplu karşılaştırma motoru (alt sınır, yuvarlama, sabit basamaklar dahil)
- Bildirim katmanı (uygulama içi + WhatsApp)
- Yetki ve rol yapısı (zaten var; kurumsal rollere genişler)

---

## 10. Cepte tutulanlar
- **Esnaf web sitesi işi (Mustafa'nın kararı: şimdilik beklemede).** Özet: tek kod, çok site (her esnaf bir ayar dosyası); 4–5 sektör kalıbı; esnafın kendi düzenleyebileceği küçük panel; Google İşletme Profili kurulumu pakete dahil; tek seferlik kurulum + küçük aylık ücret modeli (rakamlar Mustafa'da); önce tanıdık 2–3 esnafa vitrin için yapılır, sonra esnafa kendi dükkanının sitesi telefonda hazır gösterilerek satılır. Deneme sezonunda yan gelir olabilir.
- **Çekirdeği başka sektöre taşıma fikirleri** (ilk konuşmadan): arıcı (kovan = tarla), sanayi esnafı/tamirci (varlık = müşterinin aracı), nakliyeci. Şimdilik sadece fikir.

---

## 11. Mustafa'nın kararını bekleyenler
1. Paket sistemi ve fiyat (zaten ertelenmiş).
2. Deneme sezonunun bitiş tarihi ve "kurucu çiftçi" ödülünün ne olacağı.
3. Bölge karşılaştırmasında **alt sınır** (en az kaç çiftçi).
4. "Paylaşan görür" kuralı uygulanacak mı (avukat görüşüyle).
5. İşçi bağlamada: ilk sürüm sadece bilinen dayıbaşıyla mı; belgesiz dayıbaşı politikası. (Fiyat açık, cevap sınırsız, ücret iş başı: kararlandı, bkz. 6.7.)
6. Hedef ölçek: Bergama ve çevresinde iyi oturmuş yerel bir ürün mü, Türkiye geneline açılan bir platform mu?
7. Kurumsal tarafta pilot kurum: Yaklaşım Tarım ya da tanıdık bir kooperatif pilot olabilir mi?

## 12. Konuşulacak / araştırılacaklar
- **Dayıbaşılarıyla:** "işçimi alıyor" meselesi; işçi bilgisinin çiftçiye gösterilmemesi; fiyat rekabeti; belge durumu; uygulamadan en çok ne bekledikleri (tahsilat?).
- **Avukatla:** KVKK (paylaşım onayı, "paylaşan görür", anonimleştirme), tarım aracılığı (platformun aracı sayılmaması).
- **Araştırma:** sertifikalı üretim (İyi Tarım Uygulamaları) kayıt gereklilikleri; kooperatif ve firmalar için e-müstahsil makbuzu / e-fatura gereklilikleri; WhatsApp resmi mesaj altyapısı maliyeti; bölgedeki kooperatiflerin ve bayilerin kullandığı sistemler.
- **Çiftçilerle (deneme sezonunda):** "bunun için ne öderdin", en çok kullanılan/takılınan yerler.

---

## Kaynaklar
- KVKK metni (Madde 8): https://egitimbilimleri-egitim.omu.edu.tr/tr/ogrenci/belgeler1522696503/Kişisel%20Verilerin%20Korunması.pdf
- KVKK İlke Kararı hakkında merak edilenler (açık rızanın şartları): https://www.mobildev.com/corp/KVKK-Ilke-Karari-Hakkinda-Merak-Edilenler.pdf
- Açık rıza ve aydınlatma metni ayrı düzenlenmeli (2026/347 İlke Kararı): https://www.alomaliye.com/2026/03/24/kvkkdan-yeni-ilke-karari-acik-riza-metni-ile-aydinlatma-metni-artik-ayri-duzenlenmeli/
- KVKK kavram tanımları (anonimleştirilmiş veri): https://kvkk.gov.tr/SharedFolderServer/CMSFiles/d1e5b8a6-d244-4ab7-a2e6-f36af317b4c2.pdf
- Tarım aracısı tanımı (DergiPark): https://dergipark.org.tr/en/download/article-file/3093437
- Tarım Aracıları, aracılığın devredilemezliği (kaynak İŞKUR): https://www.muhasebenews.com/?p=77552
- Tarım aracıları ve sorumlulukları, belge oranı ve sözleşme yükümlülüğü (bianet): https://bianet.org/yazi/tarim-aracilari-ve-sorumluluklari-238689
