# Büyükbaş (süt sığırcılığı + besi) — küçük/orta aile işletmeleri için uygulama ihtiyaçları

Araştırma tarihi: 4 Kasım 2026. Yöntem notu: Sayfaların çoğu açılamadı (ekonomigazetesi.com ağ izninde değil; diğer sayfalar fetch edilmedi). Bulgular büyük ölçüde **arama sonucu özetlerinden** alındı; rakamlar haber özetlerinden gelir, birincil metinden doğrulanmadı. "Genel zootekni bilgisi" diye işaretlenenler bu oturumda kaynakla doğrulanmadı, uygulamada kullanılmadan önce bir veteriner/zooteknist teyidi gerekir.

## 1. Süt sığırcılığı: üreme takvimi (kızgınlık, tohumlama, gebelik, kuruya ayırma, doğum)

### Takeaway
Uygulamanın kalbi "inek takvimi" olmalı: doğum → (45-60 gün) ilk kızgınlık/tohumlama → 21 gün sonra tekrar kızgınlık kontrolü → gebelik muayenesi → kuruya ayırma → doğum. Bu zincirdeki her tarih bir önceki kayıttan hesaplanabilir; çiftçinin girmesi gereken tek şey olay tarihi (doğum, tohumlama, muayene sonucu).

### Cited Findings
- Kızgınlık belirtileri: vulva şişer, iç kısım nemli ve kırmızı-pembe olur, yumurta akı kıvamında "çara" akıntısı gelir; komşu ineğe/duvara yalama, binme girişimi, yem ve süt azalması görülür — [vetrehberi: Ineklerde kızgınlık nasıl tespit edilir](https://vetrehberi.com/ineklerde-kizginlik-nedir-nasil-tespit-edilir)
- Kızgınlık gözlemi için günde en az 5-6 kez, her biri ~15 dakika gözlem önerilir — [vetrehberi](https://vetrehberi.com/ineklerde-kizginlik-nedir-nasil-tespit-edilir)
- "Sabah-akşam kuralı": sabah kızgınlık gösteren akşam, öğleden sonra/akşam gösteren ertesi sabah tohumlanır; Türkiye'de yaygın kullanılan sistem — [Ankara Üni. açık ders notu](https://acikders.ankara.edu.tr/mod/resource/view.php?id=161729); [vetrehberi: tohumlama hataları](https://vetrehberi.com/ineklerde-infertiliteye-neden-olan-tohumlama-hatalari)
- İki kızgınlık arası ortalama 21 gün; gebe kalmayan inek ~21 gün sonra tekrar kızgınlık gösterir — [Ankara Üni. açık ders](https://acikders.ankara.edu.tr/mod/resource/view.php?id=177871)
- Düveler ergin ağırlığının 2/3'üne ulaşınca tohumlanabilir (yaş değil ağırlık ölçütü) — [Ankara Üni. açık ders](https://acikders.ankara.edu.tr/mod/resource/view.php?id=177866)
- Sürü üreme hedefleri: "7,5 kuralı" (her ay sürünün %7,5'i gebe kalmalı), "80/80" (doğum sonrası 80. günü dolduran ineklerin %80'i en az bir kez tohumlanmış olmalı), "80/150" (doğum sonrası 150 günde %80'i gebe olmalı); doğumdan 55-60 gün sonra hâlâ kızgınlık yoksa sorun araştırılmalı — [Ankara Üni. açık ders](https://acikders.ankara.edu.tr/mod/resource/view.php?id=177872)
- Doğumdan sonra en erken ~45 gün sonra tohumlama (düşük güvenilirlikli soru-cevap kaynağı) — [Yandex soru-cevap](https://yandex.com.tr/yacevap/t/inek)
- TÜRKVET mobil uygulaması küpe numarasıyla dişinin son doğum tarihini, yaklaşan ve sonraki tahmini doğum tarihini gösterebiliyor (yani devlet sistemi de bu hesabı tutuyor; çiftçi uygulaması bununla tutarlı olmalı) — [tamindir: TÜRKVET](https://www.tamindir.com/android/turkvet/)

### Inferences
- Genel zootekni bilgisi (bu oturumda kaynakla doğrulanmadı): gebelik süresi ~280-283 gün (Holstein ~279-280, etçi/kültür melezlerinde biraz daha uzun); kuruya ayırma doğumdan ~60 gün önce; hedef buzağılama aralığı ~365-400 gün; ilk gebelik muayenesi (elle/rektal) tohumlamadan ~35-45 gün sonra, ultrasonla ~28-30 gün. Uygulama bu değerleri **ayarlanabilir varsayılan** olarak koymalı.
- Hesaplanacak alanlar: tahmini doğum tarihi (tohumlama + 280/283), kuruya ayırma tarihi (tahmini doğum − 60), 21. gün kızgınlık kontrol hatırlatması, gebelik muayenesi hatırlatması, "doğumdan bu yana gün" (DIM / laktasyon günü), "boş gün" (doğum → gebe kalan tohumlama), tohumlama sayısı/gebelik, buzağılama aralığı.
- Tohumlama kaydı alanları: tarih/saat, inek küpe no, boğa adı/kodu veya sperma pipet kodu (suni tohumlama) ya da tabii aşım boğası, tohumlayan (veteriner/teknisyen), ücret, kaçıncı tohumlama. Mevzuatta "tabii tohumlama boğalarına dair tebliğ" var (2025) — [Bakanlık PDF](https://www.tarimorman.gov.tr/HAYGEM/Belgeler/Talimatlar/2025%20YILI/Tabii%20Tohumlama%20Bogalarina%20Dair%20Teblig.pdf) — içeriği okunmadı.
- Kızgınlık takibi için tek dokunuşla "kızgın gördüm" butonu + otomatik "tohumlama zamanı: bu akşam / yarın sabah" uyarısı, sabah-akşam kuralının doğrudan karşılığıdır.

### Gaps
- Türkiye'deki ırklar (Holstein, Simental, Montofon/Brown Swiss, yerli melez) için resmi gebelik süresi ve hedef değerler kaynakla teyit edilmedi.
- Düve ilk tohumlama yaşı (genellikle 14-16 ay diye bilinir) kaynakla doğrulanamadı.

## 2. Süt verimi, süt satışı, süt parası ve fiyat (USK 2025-2026)

### Takeaway
Süt fiyatı 2026'da iki kez açıklandı (22,22 → 24,30 TL/lt, 1 Mayıs'tan beri sabit), üretim maliyeti ise Eylül 2026'da 29,34 TL/lt; yani üretici litrede ~5 TL zararda. Çiftçinin en çok ihtiyaç duyacağı şey "mandıra bana doğru mu ödedi?" kontrolü: litre × baz fiyat ± yağ/protein farkı ± kalite primi/kesintisi − yem mahsubu.

### Cited Findings
- USK tavsiye fiyatı: 22 Ocak 2026'dan itibaren 19,60 → 22,22 TL/lt; 1 Mayıs 2026'dan itibaren 24,30 TL/lt (üreticinin eline net geçecek, %3,6 yağ ve %3,2 protein baz; destek ödemeleri hariç) — [Habertürk](https://www.haberturk.com/usk-cig-sut-satis-fiyatini-acikladi-3881511-ekonomi); [Bloomberg HT](https://www.bloomberght.com/usk-cig-sut-tavsiye-satis-fiyatini-2-08-tl-artirdi-3776367); [Politikam](https://www.politikam.com/sut-ureticisine-yeni-yil-mujdesi-cig-sut-fiyati-2222-tlye-yukseldi)
- Yağ ve protein oranındaki her 0,1 puanlık (dizyem) değişim için ±33 kuruş fark uygulanır — [CNBC-e](https://www.cnbce.com/haberler/usk-cig-sut-satis-fiyatini-acikladi-h22639) (arama özeti; hangi döneme ait olduğu kesin değil)
- Temmuz-Kasım 2026 arasında USK'nın yeni bir fiyat açıkladığına dair kayıt bulunamadı; 1 Mayıs fiyatı 5 ay sabit kaldı, üreticiler Kasım'da güncelleme bekliyor — [Foreks / TÜSEDAD](https://www.foreks.com/haber/detay/6ac5ecf295016b5817e66891/FRKS/tr/tusedad-eylul-ayinda-1-litre-sicak-cig-sut-uretim-maliyeti-29-34-tl-olarak-hesaplandi-07-10-26/); [Ekonomi Gazetesi (açılamadı, başlık: "Litrede 5 lira zarar eden süt üreticisi acil referans fiyat bekliyor")](https://www.ekonomigazetesi.com/sektor-haberleri/litrede-5-lira-zarar-eden-sut-ureticisi-acil-referans-fiyat-bekliyor-90878)
- TÜSEDAD maliyet hesabı (1 lt sıcak çiğ süt): Ocak 2026 25,37 TL; Mart 28,13; Nisan 28,35; Eylül 29,34 TL (100 baş sağmal, günlük 30 lt ortalama verim varsayımı) — [Foreks](https://www.foreks.com/haber/detay/6ac5ecf295016b5817e66891/FRKS/tr/tusedad-eylul-ayinda-1-litre-sicak-cig-sut-uretim-maliyeti-29-34-tl-olarak-hesaplandi-07-10-26/); [YatırımX](https://www.yatirimx.com.tr/ekonomi/tusedad-ocak-2026-cig-sut-maliyetini-acikladi-1-litre-sut-kac-tl/17562); [Bloomberg HT](https://www.bloomberght.com/tusedad-nisan-ayi-cig-sut-maliyetini-acikladi-3776268)
- TÜSEDAD Ocak 2026'dan geçerli 27 TL/lt istemişti — [Dünya](https://www.dunya.com/sektorler/tarim/tusedaddan-uskye-cagri-cig-sut-tavsiye-fiyati-27-tllt-olarak-aciklansin-haberi-810176)
- TÜSEDAD-USK maliyet farkı Eylül 2026'da litrede 6,16 TL (arama özetinde geçti, birincil metinden doğrulanamadı) — [Ekonomi Gazetesi](https://www.ekonomigazetesi.com/sektor-haberleri/litrede-5-lira-zarar-eden-sut-ureticisi-acil-referans-fiyat-bekliyor-90878)
- Kalite: tank sütünde somatik hücre sayısı (SHS) >400.000 hücre/ml sürüde sorun göstergesi; SHS veya toplam bakteri eşiği aşınca süt işleyenler parasal yaptırım uygulayabiliyor; aynı kaynak Türkiye'de alıcıların bu kriterleri henüz tam dikkate almadığını iddia ediyor (görüş) — [vetrehberi: tank sütünde SHS](https://vetrehberi.com/tank-sutunde-somatik-hucre-sayimi-neden-yapilmalidir)
- Yüksek SHS süt verimini ve peynire işlenebilirliği düşürür — [DergiPark](https://dergipark.org.tr/tr/download/article-file/1706112)
- Bakanlığın çiğ süt sözleşmesinde yem-süt paritesi 1,3'e uygun olmalı; Rekabet Kurumu bazı sanayicilerin üreticiyi kendisinden yem almaya zorladığını ve pariteye uyulmadığını tespit edip "süt karşılığı yem" tedbiri aldı — [CNN Türk](https://www.cnnturk.com/ekonomi/cig-sut-ureticilerini-korumak-icin-rekabet-kurumundan-sut-karsiligi-yem-tedbiri-2342524); [Yeni Ankara](https://www.yeniankara.com.tr/yazarlar/hami-fiskeci/sutyem-paritesi-ureticiyi-zorluyor-170562)
- Kula Süt Üreticileri Birliği çiğ süt fiyatının aylık belirlenmesini istiyor — [Cumhuriyet](https://www.cumhuriyet.com.tr/ekonomi/kula-sut-ureticileri-birligi-cig-sut-fiyatlari-aylik-olarak-belirlenmeli-1946794)
- Kayıt tutma: Erzurum Narman'da 208 işletmenin yalnız %13,5'i bireysel hayvan kaydı tutuyor; Hınıs'ta %26, başka bir çalışmada %48; Aşkale'de %46,6 verim kaydı tutuyor (çalışmalar ~2014-2016, bölgesel) — [DergiPark](https://dergipark.org.tr/en/download/article-file/2558268); [DergiPark](https://dergipark.org.tr/tr/download/article-file/1337948)

### Inferences
- Süt satış modülü: günlük/sağım bazında litre (sabah-akşam), alıcı (mandıra, kooperatif, toplama merkezi, sütçü), alıcı fişindeki litre ile kendi sayımı karşılaştırma, aylık analiz sonuçları (yağ %, protein %, SHS, bakteri) girişi, beklenen ödeme = litre × (baz + (yağ−3,6)×10×0,33 + (protein−3,2)×10×0,33) + prim − kesinti − yem mahsubu. Bu formül USK dizyem kuralına dayanır; alıcı sözleşmesi farklıysa ayarlanabilir olmalı.
- "Süt/yem paritesi" göstergesi: 1 lt süt fiyatı / 1 kg süt yemi fiyatı (hedef ≥1,3-1,5). Ocak 2026'da sahada 22,20 TL süt / 13-15 TL yem ≈ 1,5'in altı — [Ekonomi Gazetesi (Neptün Soyer)](https://www.ekonomigazetesi.com/sehirler/koy-koop-izmir-birligi-baskani-neptun-soyer-2220-tl-cig-sut-fiyati-surdurulebilir-degil-69738).
- İnek başına verim kaydı (haftalık/aylık tek ölçüm bile yeter) laktasyon eğrisi, kuruya ayırma ve ayıklama (kasaplığa ayırma) kararları için gereklidir; e-Islah/soy kütüğü verim kayıtları bunun resmi karşılığıdır.

### Gaps
- Toplama merkezlerinin/mandıraların gerçek prim-kesinti cetvelleri (SHS, bakteri, antibiyotik pozitif sütte tank reddi cezası) ve ödeme vadesi (15/30/45 gün) için kaynak bulunamadı. Saha görüşmesi gerekir.
- 2026 çiğ süt desteği: Bakanlık yetkililerine göre litre başına 20 kuruş (2025 ile aynı) temel destek; TÜSEDAD 10 Ağustos 2026'da tutarın ve takvimin netleşmediğini söylüyor — çelişkili ([Bloomberg HT](https://www.bloomberght.com/tusedad-2026-yili-cig-sut-destekleme-tutari-ile-odeme-takvimi-hala-aciklanmadi-3785084)).

## 3. Besi (fattening): alım, tartım, yem, satış, karkas, destekler

### Takeaway
Besicinin kâr/zararı üç sayıya bağlı: alış fiyatı, günlük canlı ağırlık artışı (GCAA) ve kg artış başına yem maliyeti. Satış fiyatı 2026'da karkas tosunda ESK tavanı 600 TL/kg, canlıda ~510 TL/kg civarı. 2026'da devlet 500 bin baş besilik ithalatı planlıyor; bu, besi materyali fiyatını etkiler.

### Cited Findings
- ESK 2026 Kurban dönemi (1-7 Haziran 2026) elde kalan kurbanlık alımı karkas fiyatları: tosun 600 TL/kg, düve 530 TL/kg, inek 470 TL/kg; tavan fiyat, yaş/cinsiyet/randıman/karkas ağırlığına göre değişir — [NTV](https://www.ntv.com.tr/turkiye/satilmayan-kurbanliklari-et-ve-sut-kurumu-alacak-1726233); [Yeni Asır](https://www.yeniasir.com.tr/ekonomi/2026/05/29/satilamayan-kurbanliklari-et-ve-sut-kurumu-alacak)
- 2026 kurbanlık ortalama canlı kilo fiyatı: tosun 510 TL/kg, düve/inek 475 TL/kg — [Cumhuriyet](https://www.cumhuriyet.com.tr/ekonomi/2026-yili-kurbanlik-fiyatlari-ne-kadar-iste-il-il-guncel-buyukbas-ve-kucukbas-listesi-2498794)
- 2026'da 500 bin baş besilik sığır ithalatı planlandı; ithalatı yalnız devlet yapıyor (özel sektöre izin yok) — [Ekonomi Gazetesi](https://www.ekonomigazetesi.com/kose-yazisi/besilik-sigir-ithalatina-devam-planlanan-sayi-500-bin-70826)
- Besilik erkek (karkas) desteği 2024-2026 kararı: yurt içinde doğmuş, kayıtlı, ≥200 kg karkasa ulaşan erkek sığırı mevzuata uygun kesimhanede kestirene, en fazla 200 başa kadar baş başına 500 TL temel destek (2026 güncellemesi doğrulanamadı) — [Cumhuriyet](https://www.cumhuriyet.com.tr/ekonomi/hayvancilikta-2024-2026-donemi-destekleme-tutarlari-belli-oldu-2231394); [Artvin İl Müd.](https://artvin.tarimorman.gov.tr/Duyuru/692/Besilik-Erkek-Sigir-_karkas_-Desteklemesi-Basvurusu)
- Sözleşmeli besicilik (ESK) desteği karkasa göre: 201-250 kg için 2,5 TL/kg, 251-300 kg 3,5 TL/kg, ≥301 kg 5 TL/kg; ödemeler ESK icmallerine göre, en fazla 200 baş (karar tarihi görülemedi, eski olabilir) — [Finansopia](https://www.finansopia.com/genel/tarim/sozlesmeli-besicilikte-destekleme-odemeleri-belli-oldu/)
- Büyükbaşın iller arası sevkinde şap aşısı şartı aranır — [Cumhuriyet: il tarım müdürlüğü şap uyarısı](https://www.cumhuriyet.com.tr/turkiye/il-tarim-mudurlugunden-sap-uyarisi-2169051)

### Inferences
- Besi modülü: alım kaydı (tarih, yer: hayvan pazarı/borsa/tüccar/ithal ESK dağıtımı, küpe no, ırk, yaş, alış canlı ağırlığı, fiyat, nakliye, komisyon), periyodik tartım (kantar yoksa göğüs çevresi şeridiyle tahmini ağırlık), GCAA = (son ağırlık − ilk ağırlık)/gün, kg artış başına yem maliyeti, başa toplam maliyet ve başa-baş satış fiyatı, beklenen karkas = canlı × randıman (genel bilgi: besi tosununda ~%55-60; doğrulanmadı).
- "Kesime hazır" uyarısı: hedef canlı ağırlık veya hedef gün sayısına gelince; ayrıca ilaç arınma süresi dolmamışsa satış/kesim engeli uyarısı.
- Karkas desteği eşiği (≥200 kg karkas, yurt içi doğumlu, kayıtlı) uygulamada "destek uygunluğu" işareti olarak gösterilebilir.

### Gaps
- 2026 besilik buzağı/dana alış fiyatları, besi maliyeti TL/kg canlı ağırlık artışı ve ESK olağan dönem (kurban dışı) alım fiyat tablosu bulunamadı.
- Hayvan borsası komisyon oranları ve kesimhane ödeme vadesi bulunamadı.

## 4. Sağlık: hastalıklar, aşılar, veteriner, ilaç arınma süreleri

### Takeaway
Zorunlu/kampanya aşıları (şap yılda 2-3 kez, dişi buzağıya brusella, salgında LSD ve şarbon) il/ilçe müdürlüğü takvimine bağlı; uygulama bunları "ilçe kampanyası" olarak hatırlatmalı. En kritik kayıt ilaç arınma süresi: tedavi edilen ineğin sütü tanka karışırsa bütün tank reddedilir ve ceza riski doğar.

### Cited Findings
- Şap rutin aşılaması ilkbahar ve sonbaharda yılda 2 kez; Aydın'da bir yıl 3'e çıkarıldı — [Cumhuriyet: Aydın İl Müd. şap uyarısı](https://www.cumhuriyet.com.tr/turkiye/il-tarim-mudurlugunden-sap-uyarisi-2169051)
- Balıkesir'de 2026 sonbaharında büyükbaşta şap ve bruselloz aşılaması yürütülüyor — [Politikam](https://www.politikam.com/balikesir-buyukbas-hayvan-sap-bruselloz-sonbahar-asilamasi-2026)
- Brusella aşısı dişi buzağılara uygulanıyor (Aydın planı: 70 bin dişi buzağı, 2024) — [Cumhuriyet](https://www.cumhuriyet.com.tr/turkiye/il-tarim-mudurlugunden-sap-uyarisi-2169051); bruselloz "yavru atma hastalığı" — [Kilis İl Müd. broşürü](https://kilis.tarim.gov.tr/Belgeler/Broşür%20ve%20Afişler/Brucellozis%20(Yavru%20Atma%20Hastalığı).pdf)
- Nodüler ekzantem (LSD) için karantinadaki ilçelerde aşılama (salgın müdahalesi) — [T24](https://t24.com.tr/haber/artvinde-karantinadaki-5-ilcede-asilama-calismasi,646828)
- Şarbon salgın bölgelerinde toplu aşılama (ör. 33.963 büyükbaş) — [Sol Haber](https://haber.sol.org.tr/turkiye/ankarada-sarbon-panigi-10-binden-fazla-hayvana-asi-yapildi-246346)
- 2026 "atık desteği": gebe sığır/mandada yavru atma olursa hayvan başına 20.000 TL (8 Eylül 2026 Resmî Gazete değişikliği) — [Alomaliye](https://www.alomaliye.com/2026/09/08/bitkisel-ve-hayvansal-uretim-destekleri-artirildi/amp/); [Diken](https://www.diken.com.tr/?p=1632843)
- Arınma süresi: örnek sefapirin (laktasyondaki inek) son uygulamadan sonra ette 4 gün, sütte 96 saat; penisilinle tedavi edilen bazı ineklerde sütte 14-15 güne kadar kalıntı saptandı (1995 çalışması, eski); meme içi uygulamalar sütü ciddi kirletir — [DergiPark](https://dergipark.org.tr/tr/download/article-file/1691058); [DergiPark](https://dergipark.org.tr/en/download/article-file/181584)
- Tedaviden önce etken tespiti gereksiz antibiyotiği ve tank sütü kalıntı riskini azaltır; klinik mastitiste dökülen süt önemli ekonomik kayıp — [vetrehberi: mastitis 7 nokta programı](https://vetrehberi.com/ineklerde-mastitislerin-kontrolu-icin-7-nokta-programi)

### Inferences
- Sağlık kaydı alanları: tarih, hayvan, teşhis (mastitis/meme iltihabı, ayak hastalığı/topallık, doğum felci/süt humması, ketozis, metritis/döl yatağı iltihabı, plasenta retensiyonu/son atmama, ishal/buzağı ishali, pnömoni, şap, LSD vb.), ilaç adı, doz, uygulama yolu, veteriner, reçete no, **süt arınma bitiş tarihi ve et arınma bitiş tarihi** (ilaç etiketinden girilir). Bu süre bitene kadar ineğe "SÜTÜ TANKA KATMA" ve "KESİME/SATIŞA VERME" etiketi.
- Aşı takvimi: hayvan bazlı aşı kaydı + ilçe kampanya duyurusu hatırlatması; brusella için dişi buzağı yaş penceresi (genel bilgi: 3-8 ay, doğrulanmadı).
- Mastitis için meme çeyreği bazında (sol ön, sağ ön, sol arka, sağ arka) kayıt ve CMT (California mastitis testi) sonucu girişi faydalı olur; kronik vakalar ayıklama kararına girer.
- Yavru atma kaydı hem brusella şüphesi bildirimi hem de 20.000 TL atık desteği başvurusu için gerekli bir belge izi oluşturur.

### Gaps
- IBR, BVD, şarbon için rutin (kampanya dışı) önerilen aşı takvimi bu oturumda kaynaklanamadı.
- Türkiye'de veteriner ilaç reçete sistemi (e-reçete / VETBİS) ve elektronik reçete zorunluluğu için kaynak bulunamadı.

## 5. Yem: kaba/kesif yem, silaj, rasyon, stok, kendi üretimi

### Takeaway
Yem toplam giderin en büyük kalemi ve süt fiyatı yemin gerisinde kalıyor (1 lt süt ≈ 1,5 kg yemin altı). Uygulama yem stok/tüketim ve "litre süt başına yem maliyeti" göstermeli; rasyon hesaplaması çiftçi için ikinci öncelik.

### Cited Findings
- Ocak 2026 sahada 1 kg yem 13-15 TL, 1 lt süt 22,20 TL; 1 lt sütle 1,5 kg yem alınamıyor (dünya referansı 1:1,5) — [Ekonomi Gazetesi (Köy-Koop İzmir)](https://www.ekonomigazetesi.com/sehirler/koy-koop-izmir-birligi-baskani-neptun-soyer-2220-tl-cig-sut-fiyati-surdurulebilir-degil-69738)
- Yem ve mazot zamları süt maliyetini artırdı (TÜSEDAD) — [Bloomberg HT](https://www.bloomberght.com/tusedad-mazot-ve-yeme-gelen-zamlar-maliyeti-1-77-artirdi-3773412); "Yeme yüzde 10 zam" — [BirGün](https://www.birgun.net/makale/yeme-yuzde-10-zam-sut-krizi-kapida-254003)
- İthal yem hammaddesine bağımlılık maliyet baskısını artırıyor (TÜSEDAD, Eylül 2026) — [Foreks](https://www.foreks.com/haber/detay/6ac5ecf295016b5817e66891/FRKS/tr/tusedad-eylul-ayinda-1-litre-sicak-cig-sut-uretim-maliyeti-29-34-tl-olarak-hesaplandi-07-10-26/)

### Inferences
- Yem modülü: yem kalemleri (süt yemi, besi yemi, arpa, mısır kırması, kepek, küspe; kaba yem: yonca, fiğ, saman, mısır silajı, çayır otu), alım (tarih, kg/balya/ton, fiyat, satıcı, vade), günlük tüketim (grup bazında: sağmal, kuru, düve, buzağı, besi), stok kaç gün yeter tahmini.
- Kendi tarlası olan çiftçi için mevcut tarla modülüyle bağlantı: silaj/yonca hasat → yem stoğuna girer, tarla maliyeti → yem maliyetine aktarılır (fırsat maliyeti olarak piyasa fiyatı da gösterilebilir).
- Basit rasyon yardımı: kuru madde tüketimi ≈ canlı ağırlığın %3-3,5'i, kesif:kaba oranı (genel zootekni bilgisi, doğrulanmadı) — tam rasyon programı yerine "tablodan seç" yaklaşımı yaşlı kullanıcıya daha uygun.

### Gaps
- 2026 güncel saman, yonca, silaj fiyatları ve yem bitkisi destekleri bulunamadı.

## 6. Ekonomi özeti 2025-2026 ve destekler

### Takeaway
2026: süt 24,30 TL/lt (Mayıs'tan beri), maliyet 29,34 TL/lt (Eylül), buzağı desteği 2.000 TL, atık desteği 20.000 TL, çiğ süt desteği belirsiz (~0,20 TL/lt). Desteklere hak kazanmak kayıt disiplini istiyor (TÜRKVET'te ≥4 ay yaşamış buzağı, ana küpe no, doğum tarihi).

### Cited Findings
- 2026 buzağı temel desteği 1.400 → 2.000 TL; malak 2.800 → 4.000 TL (8 Eylül 2026 Resmî Gazete değişikliği) — [Alomaliye](https://www.alomaliye.com/2026/09/08/bitkisel-ve-hayvansal-uretim-destekleri-artirildi/amp/); [Para Dergi](https://paradergi.com.tr/sektorler/2026/09/21/tarimsal-uretime-destek-artti)
- Buzağı desteği şartı: TÜRKVET kayıtlarına göre en az 4 ay (120 gün) yaşamış olmak; doğduğu işletme no, cinsiyet, ana kulak no, doğum tarihi kayıtlı olmalı; buzağıların zamanında küpeletilmesi, TÜRKVET ve e-Islah'a kaydı ve programlı aşılardan yetiştirici sorumlu — [Alomaliye: Hayvancılık Desteklemeleri Uygulama Tebliği 2025/30](https://www.alomaliye.com/2025/11/04/hayvancilik-desteklemeleri-uygulama-tebligi-no-2025-30/); [Bakanlık buzağı/malak desteği sayfası](https://www.tarimorman.gov.tr/Konular/Tarimsal-Destekler/Hayvancilik-Desteklemeleri/b%C3%BCy%C3%BCkba%C5%9F-hayvanc%C4%B1l%C4%B1k-desteklemeleri?Ziyaretci=Ciftci)
- Çiğ süt üretim maliyeti ve fiyat açığı (bkz. bölüm 2) — [Foreks](https://www.foreks.com/haber/detay/6ac5ecf295016b5817e66891/FRKS/tr/tusedad-eylul-ayinda-1-litre-sicak-cig-sut-uretim-maliyeti-29-34-tl-olarak-hesaplandi-07-10-26/)

### Inferences
- Uygulama "destek takvimi" göstermeli: buzağı desteği başvuru dönemleri (1. ve 2. dönem), karkas desteği, çiğ süt desteği, atık desteği — her biri için hangi kaydın eksik olduğunu işaretlemek (ör. "Bu buzağı TÜRKVET'te kayıtlı mı?").
- İşçilik: aile işgücü genelde ücretsiz sayılıyor; TÜSEDAD maliyetinde personel gideri ayrı kalem ([Politikam](https://www.politikam.com/tusedad-ocak-2026-cig-sut-uretim-maliyeti-yem-zammi-personel-gideri)). Uygulama aile işgücünü isteğe bağlı "saat × asgari ücret" ile gösterebilir.

### Gaps
- 2026 buzağı (dana) piyasa fiyatı, işçilik (çoban/sağımcı) ücretleri bulunamadı.
- Besilik erkek karkas desteğinin 2026 güncel tutarı doğrulanamadı.

## 7. Resmi kayıt yükümlülükleri (TÜRKVET, küpe, bildirim süreleri)

### Takeaway
Doğan buzağının belirli sürede küpelenip TÜRKVET'e kaydı, ölüm/satış/nakil bildirimi destek ve yasal uyum için zorunlu; ancak yürürlükteki gün sayıları bu oturumda kesin doğrulanamadı (kaynaklar 20 gün, 30 gün, 3 ay, 6 ay arasında çelişiyor; yönetmelik Eylül 2025'te değişti ve karekodlu küpeye geçildi).

### Cited Findings
- 2011 sığır tanımlama yönetmeliği (RG 28130) 14. maddesinde 20 günlük tanımlama süresi geçiyor (2015 değişiklik metninden) — [FAOLEX](https://faolex.fao.org/docs/pdf/tur150605.pdf)
- Bir eğitim sunumuna göre 14. madde doğumdan itibaren en geç 3 ay içinde tanımlama ve işletme bilgilerinin 30 gün içinde bildirilmesini öngörüyor; 2002 metninde 6 ay — çelişkili — [EKMUD sunumu](https://ekmud.org.tr/sunum/indir/148-kuresel-tehdit-zoonozlar); [FAOLEX 2002](https://faolex.fao.org/docs/pdf/tur35446.pdf)
- Bakanlık 11.09.2025'te sığır tanımlama yönetmeliğinde değişiklik duyurdu — [HAYGEM](https://www.tarimorman.gov.tr/HAYGEM/Haber/381/Yonetmelik-Degisiklikleri); sığır küpelerinde karekod dönemi başladı — [CNBC-e](https://www.cnbce.com/haberler/sigir-kupelerinde-karekod-donemi-basladi-h32333); "kimliksiz hayvan dönemi sona eriyor" — [Sözcü](https://www.sozcu.com.tr/hayvancilikta-kimliksiz-hayvan-donemi-sona-eriyor-wp7865639)

### Inferences
- Uygulama TÜRKVET'in yerine geçmemeli, "hatırlatıcı + hazırlık" olmalı: doğum girilince "küpe taktır / bildir" görevi oluşturur, son tarih ayarlanabilir (resmi gün sayısı doğrulanınca sabitlenir). Küpe no (TR + 12 hane), ana küpe no, doğum tarihi, cinsiyet, ırk alanları TÜRKVET ile birebir aynı olmalı ki çiftçi müdürlüğe/veterinere ekranı gösterebilsin.
- Hayvan pasaportu, nakil (veteriner sağlık raporu), şap aşısı şartı satış/alış kaydına bağlanmalı.

### Gaps
- Yürürlükteki doğum-küpeleme ve ölüm/satış bildirim gün sayıları (Eylül 2025 değişikliği sonrası) doğrulanmalı — Resmî Gazete metni okunamadı.

## 8. Acı noktalar (pain points) ve tasarım çıkarımları

### Takeaway
Asıl sorun bilgi değil disiplin: işletmelerin çoğu bireysel hayvan kaydı tutmuyor (bölgesel %13-48). Tohumlama/doğum tarihleri unutuluyor, süt parası kontrol edilemiyor, mandıra yem mahsubuyla parayı eritiyor, destek şartları kayıt eksikliğinden kaçırılıyor.

### Cited Findings
- Bireysel kayıt tutma oranları düşük ve eğitim düzeyi/deneyim bazı çalışmalarda etkili değil, bazılarında işletme büyüklüğü ve eğitim etkili — [DergiPark Narman](https://dergipark.org.tr/en/download/article-file/2558268)
- Kayıt tutmama süt sığırcılığının temel sorunları arasında (Bingöl çalışması) — [DergiPark](https://dergipark.org.tr/tr/download/article-file/1337948)
- Sanayicinin üreticiyi kendinden yem almaya zorlaması (yem mahsubu) Rekabet Kurumu tespiti — [CNN Türk](https://www.cnnturk.com/ekonomi/cig-sut-ureticilerini-korumak-icin-rekabet-kurumundan-sut-karsiligi-yem-tedbiri-2342524)
- Üretici fiyatın gecikmeli açıklanmasından ve maliyetin altında kalmasından şikâyetçi; 14 maddelik talep listesi — [NTV](https://www.ntv.com.tr/ekonomi/sut-ureticilerinden-14-maddelik-talep,Ia9yiGTnTUmAFP7uet4PCA); [Evrensel](https://www.evrensel.net/haber/5979781/belirlenen-sut-fiyatlarina-tepki-uretici-zararda)
- Kızgınlığı yakalamak günde 5-6 kez gözlem ister; kaçırılan her kızgınlık ~21 gün kayıp demektir — [vetrehberi](https://vetrehberi.com/ineklerde-kizginlik-nedir-nasil-tespit-edilir); [Ankara Üni.](https://acikders.ankara.edu.tr/mod/resource/view.php?id=177871)

### Inferences
- Öncelik sırası (MVP): (1) hayvan listesi (küpe no + isim/lakap + foto), (2) olay kaydı tek ekran: doğum / kızgın / tohumlandı / gebe-boş / kuruya / hastalık-ilaç / satış-ölüm, (3) otomatik takvim ve bildirim (21. gün, gebelik muayenesi, kuruya ayırma, doğum yaklaşıyor, arınma bitti, aşı kampanyası, TÜRKVET bildirimi), (4) süt defteri (günlük litre, aylık mandıra hesabı, analiz sonuçları, yem mahsubu), (5) besi defteri (alış, tartım, GCAA, maliyet), (6) yem stok/gider.
- Yaşlı çiftçi için: büyük düğmeler, sesle kayıt (ör. "Sarıkız bugün kızgın"), küpe no yerine hayvan adı/fotoğrafı ile seçim, aile üyesi (oğul/kız) ile paylaşılan hesap (mevcut "çalışan modu" ile uyumlu), çevrimdışı çalışma (ahırda çekim yok), sade Türkçe terimler (kızgınlık, tohum, kuru, doğum, buzağı, dana, düve, tosun, inek, sağmal).
- Veteriner/tohumlama teknisyeni ile paylaşım (bir hayvanın kartını WhatsApp ile gönderme) saha gerçekliğine uygun.
- Borç-vade: yem bayisine veresiye, mandıranın ödeme gecikmesi — mevcut çiftçi defteri borç/alacak altyapısına bağlanmalı.

### Gaps
- Mandıra ödeme vadesi, veresiye yem borcu oranları ve yaşlı çiftçilerin akıllı telefon kullanım oranı için 2025-2026 kaynağı bulunamadı; çiftçi forumları (ör. Facebook grupları) bu oturumda taranamadı.
- Damızlık Sığır Yetiştiricileri Birliği (DSYB) ve e-Islah'ın üyelere sunduğu kayıt araçları incelenemedi.
