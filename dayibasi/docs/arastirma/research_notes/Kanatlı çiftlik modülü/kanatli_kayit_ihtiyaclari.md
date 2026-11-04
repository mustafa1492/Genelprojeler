# Kanatlı çiftlik kayıt ihtiyaçları (Türkiye, küçük/aile işletmesi)

> Yöntem notu (3 Kasım 2026): Bu oturumda WebFetch ile hiçbir sayfa açılamadı (dergipark.org.tr, aviagen.com, tarimorman.gov.tr, megep.meb.gov.tr, lexpera.com.tr, faolex.fao.org, vetdestek.com hepsi "ENOTFOUND", ağ izni yok). Aşağıdaki bulgular yalnızca arama motoru özetlerinden geliyor; tam metin doğrulanmadı. Ross/Cobb/Hy-Line/Big 6 tablolarının sayısal değerleri alınamadı (Gaps). Standart formüller "Inferences" altında, kaynak doğrulaması olmadan, sektörde bilinen haliyle verildi.

## 1. Üretim nasıl örgütlenir (sürü / dönem / kümes) ve günlük ne izlenir?

### Takeaway
Türkiye'de resmi düzen "işletme > kümes > sürü" şeklindedir: Bakanlık veri sisteminde her işletmeye numara verilir ve her kümes için ayrı sürü açılır. Uygulamanın temel kaydı "dönem/sürü" olmalı, ona günlük satırlar (ölüm, ayıklama, yem, su, ağırlık, sıcaklık, ışık) bağlanmalı. Etlik piliç dönemi Türkiye'de pratikte yaklaşık 40 gündür (Samsun çalışmasında ortalama 40,1 gün), yumurtacıda dönem 72-80+ haftadır.

### Cited Findings
- 2025/33 sayılı Biyogüvenlik Tebliği'ne göre il/ilçe müdürlükleri Bakanlık veri sistemi üzerinden işletmeye işletme numarası verir; **kümes sayısı kadar sürü açılır**, işletme koordinatları sisteme girilir. — [Lexpera: Biyogüvenlik Tebliği 2025/33](https://www.lexpera.com.tr/mevzuat/tebligler/ticari-etlik-ve-yumurtaci-kanatli-isletmelerinin-biyoguvenlik-kurallarina-dair-teblig-2025-33); [Hukuki Haber metni](https://www.hukukihaber.net/ticari-etlik-ve-yumurtaci-kanatli-isletmelerinin-biyoguvenlik-kurallarina-dair-teblig)
- Tebliğ 31.01.2026'da yürürlüğe girdi; kapsam: **350+ yumurtacı tavuk, 500+ etlik tavuk, 200+ hindi/ördek/kaz/bıldırcın, 20+ devekuşu** bulunan işletmeler. Biyogüvenlik planı ve haritası zorunlu; aynı işletmede hem etlik hem yumurtacı ticari sürü bulunamaz; çevre en az 150 cm tel örgü/çit; uyulmazsa sistemden "biyogüvenlik kısıtı" konup yeni hayvan girişi engellenir; mevcut işletmelere 12 ay uyum süresi. — [Lexpera](https://www.lexpera.com.tr/mevzuat/tebligler/ticari-etlik-ve-yumurtaci-kanatli-isletmelerinin-biyoguvenlik-kurallarina-dair-teblig-2025-33); [Ekonomi Gazetesi](https://www.ekonomigazetesi.com/sektor-haberleri/ticari-etlik-ve-yumurtaci-kanatli-uretimi-yapan-isletmelerin-sartlari-belirlendi-71406); [Sabah](https://sabah.com.tr/yasam/tavuk-eti-ve-yumurtada-salgina-karsi-onlem-bakanlik-kumeslere-siki-biyoguvenlik-sartlari-getirdi-7514726)
- Yumurtacı tavukların korunması yönetmeliğine göre işletmeci/bakıcı **her kümes için öngörülen formu** tutmak zorundadır; insan tüketimine satılan yumurtanın izlenebilirliği için her işletmeye ayırt edici numara verilir. — [Lexpera: Yumurtacı tavukların korunması yönetmeliği](https://www.lexpera.com.tr/mevzuat/yonetmelikler/yumurtaci-tavuklarin-korunmasi-ile-ilgili-asgari-standartlara-iliskin-yonetmelik)
- Samsun'daki etlik piliç işletmelerinde: kesim yaşı ort. **40,11 gün**, canlı ağırlık **2,35 kg**, YDO **1,76**, ölüm **%8,6**; yem + civciv toplam masrafın **%90**'ı (yıl özetten okunamadı). — [OMÜ Açık Erişim](https://acikerisim.omu.edu.tr/entities/publication/3afdb220-e788-4fc3-8869-87a7d91f266c)
- Balıkesir ve çevresinde: hayvan başı kesim canlı ağırlığı **2,73 kg**, YDO **1,62**, ölüm **%3,94**; işletmelerin YDO'su çoğunlukla 1,50-1,80 aralığında. — [Zenodo: Balıkesir etlik piliç durumu](https://zenodo.org/records/8395643)
- Etlik piliç kesim öncesi dönemi ders notunda yaklaşık 5-6,5 hafta. — [Ankara Üni. açık ders](https://acikders.ankara.edu.tr/mod/resource/view.php?id=7510)
- Yumurtacı denemelerde yem, dönem başında tartılıp verilir, dönem sonunda (çoğu kez 15 günde bir) artan yem tartılıp düşülerek tüketim bulunur; günlük tüketim haftalık artandan gün sayısına bölünerek çıkarılır; yumurtalar her gün toplanıp sayılır. — [DergiPark 419937](https://dergipark.org.tr/en/download/article-file/419937); [DergiPark 419833](https://dergipark.org.tr/en/download/article-file/419833); [DergiPark 416887](https://dergipark.org.tr/en/download/article-file/416887)
- Big-6 bir ağır beyaz hindi hattıdır; otlatmalı yetiştirmede büyümeye olumsuz etki görülmemiş. — [YYÜ GCRIS: Big-6 hindi büyüme](https://gcris.yyu.edu.tr/items/14134af1-f50d-45b2-a94a-9b375c56d504/full)

### Inferences
- Önerilen veri modeli: **İşletme** (Bakanlık işletme no) > **Kümes** (m², kapasite) > **Dönem/Sürü** (tür: etlik/yumurtacı/hindi/köy tavuğu/bıldırcın; ırk/hat: Ross 308, Cobb 500, Lohmann Brown, Hy-Line, Atak-S, Big 6...; giriş tarihi; giriş adedi; civciv kaynağı/kuluçkahane; civciv giriş ağırlığı; entegre firma varsa adı) > **Günlük kayıt**.
- Günlük kayıt alanları: tarih, yaş (gün/hafta, otomatik), ölü adedi (öldü), ayıklanan/itlaf (ıskarta), kalan hayvan (otomatik), verilen yem (kg ve yem tipi: civciv başlangıç / büyütme / bitirme; yumurtacıda faz yemi), su tüketimi (litre; sayaç okuması), tartım örneği (ör. 50-100 hayvan ort. ağırlık, haftada 1), kümes sıcaklığı en düşük/en yüksek, nem %, ışık saati, not/fotoğraf (hastalık belirtisi), ilaç/aşı uygulaması. Yumurtacıda ayrıca: toplanan yumurta (sağlam/kırık/kirli/sınıf bazında), yumurta ağırlığı örneği.
- Su/yem oranının (genelde ~1,8-2) ani düşüşü hastalık uyarısı olarak kullanılabilir — sektör bilgisi, bu oturumda kaynakla doğrulanmadı.
- Dönem kapanışı: kesim/sevk tarihi, sevk edilen adet, toplam canlı kg, kesimhane kondemnasyonu (fire/ret), dönem sonu stok yem iadesi, gübre çıkışı; ardından temizlik-dezenfeksiyon ve boş bekleme süresi (tarih aralığı kaydı).

### Gaps
- Biyogüvenlik Tebliği'nin kayıt maddeleri (ölüm defteri, ziyaretçi/araç giriş defteri, dezenfeksiyon kaydı, boş bekleme süresi) tam metin açılamadığı için doğrulanamadı.
- Hayvan hareketi (sevk/nakil) belgesi, veteriner sağlık raporu prosedürü bulunamadı.
- Ross 308 / Cobb 500 haftalık hedef tablosu, sıcaklık-ışık programı, yerleşim sıklığı (adet/m² veya kg/m²) değerleri alınamadı (aviagen.com ve tarimorman.gov.tr PDF'leri erişilemedi).
- Hindi (Big 6) erkek/dişi kesim yaşı ve ağırlıkları, köy tavuğu ve bıldırcın (dönem ~6 hafta, yumurtlama ~6. haftadan) için kaynaklı veri bulunamadı.

## 2. Performans ölçütleri, formüller ve hedef değerler

### Takeaway
Uygulamanın otomatik hesaplaması gereken çekirdek göstergeler: YDO (FCR), yaşama gücü, ortalama günlük canlı ağırlık artışı, EPEF (Avrupa Üretim Etkinlik Faktörü), tavuk-gün yumurta verimi %, yumurta kütlesi, yumurta başına yem, kg canlı ağırlık maliyeti ve yumurta başına maliyet. Türkiye saha değerleri YDO 1,62-1,76, ölüm %4-9, EPEF ~312 civarında.

### Cited Findings
- YYO/YDO = Tüketilen yem (kg) / Canlı ağırlık (kg); dönem sonunda sürü kayıtlarından hesaplanır. — [Kelkit TSO broiler kitapçığı](https://www.kelkittso.org.tr/dosyalar/broiler-etlik-pilic-yetistiriciligi.pdf) (arama özeti); [Bursa Uludağ tez](https://acikerisim.uludag.edu.tr/server/api/core/bitstreams/b2ae3f4a-5d50-4e9c-864c-c9b10fa5ff86/content)
- Balıkesir-Bolu-Sakarya'da 125 işletmenin 2012-2013 verisinde Avrupa Verimlilik Faktörü **312,27** (eski veri). — [YÖK Açık Bilim tez](https://acikbilim.yok.gov.tr/handle/20.500.12812/25320)
- Yumurtacıda yemden yararlanma = tüketilen yem / yumurta kütlesi; yumurta kütlesi = verim % × yumurta ağırlığı. Tavuk-gün yumurta verimi % olarak hesaplanır. — [DergiPark 416887](https://dergipark.org.tr/en/download/article-file/416887); [DergiPark 419937](https://dergipark.org.tr/en/download/article-file/419937)
- Lohmann Brown-Classic (kafes): giriş başına **324 yumurta / 72 hf, 367 / 80 hf**; yumurta kütlesi 20,63 kg (72 hf), 23,52 kg (80 hf); yem dönüşümü **2,0-2,2 kg yem / kg yumurta**; yaşama gücü büyütme %98-99, 72 hf'ya kadar yumurtlama %95-96; pik %94-96, 140-145. günde. — [Lohmann LB-Classic Cage infografik](https://lohmann-breeders.com/files/downloads/LEAFLETS/Cage/LB-CLASSIC/2021_Lohmann-infographic_LB-Classic-CAGE_ENG.pdf)
- Lohmann Brown-Classic (alternatif/serbest sistem): 321 yumurta / 72 hf, 363 / 80 hf, 412 / 90 hf; yem dönüşümü 2,15-2,25; yaşama gücü %94-95 (72 hf). — [Lohmann LB-Classic Alternative infografik](https://lohmann-breeders.com/files/downloads/LEAFLETS/Alternative/LB-Classic/2021_Lohmann-infographic_LB-Classic-ALTERNATIVE_ENG.pdf)
- Ross 308 için güncel resmi hedef: "Broiler Performance Objectives 2022"; ağırlık çiftlik ağırlığı (bağırsaktaki yem dahil), yem tüketimi canlı hayvan başına. Sayılar bu oturumda okunamadı. — [Aviagen Ross 308 PO 2022](https://aa-na.aviagen.com/assets/Tech_Center/Ross_Broiler/RossxRoss308-BroilerPerformanceObjectives2022-EN.pdf)
- Bursa'da Cobb 500, Hybro ve A.Farm genotipleri 42. günde sırasıyla 2191, 2073, 2082 g (eski saha çalışması). — arama özeti, [DergiPark 419896](https://dergipark.org.tr/en/download/article-file/419896)
- Bir maliyet çalışmasında birim canlı ağırlık maliyeti **2,20 TL/kg** (2020'ler başı, güncel değil) ve yem masraf payı **%82,76**. — [DergiPark: Broyler üretiminde maliyet](https://dergipark.org.tr/tr/download/article-file/2584957)

### Inferences (standart formüller — bu oturumda kaynakla doğrulanmadı, sektörde yaygın)
- **Yaşama gücü (%)** = (Dönem sonu canlı adet / Giriş adedi) × 100. Ölüm % = 100 − yaşama gücü (ayıklama ayrı gösterilebilir).
- **YDO** = Toplam tüketilen yem kg / Toplam satılan canlı kg (bazı entegreler başlangıç civciv ağırlığını düşer veya ölülerin ağırlığını ekler; uygulamada iki seçenek sunulmalı).
- **EPEF** = (Ortalama canlı ağırlık kg × Yaşama gücü %) / (Kesim yaşı gün × YDO) × 100. Örnek: 2,5 kg, %96, 40 gün, 1,65 → 364. Türkiye'de 300+ iyi kabul edilir (tek sayısal referans: 312).
- **Ort. günlük canlı ağırlık artışı (g/gün)** = (Kesim ağırlığı − civciv ağırlığı ~40 g) / yaş günü.
- **Tavuk-gün verimi (%)** = Günlük toplanan yumurta / O gün mevcut tavuk × 100. **Giriş-tavuk (hen-housed) verimi** = Toplam yumurta / Başlangıç tavuk sayısı.
- **Yumurta kütlesi (g/tavuk/gün)** = Tavuk-gün % × ort. yumurta ağırlığı g / 100.
- **Yumurta başına yem (g)** = Günlük yem g / tavuk ÷ (tavuk-gün %/100); **düzine başına yem** de gösterilebilir.
- **Kırık/kirli oranı (%)** = Kırık (veya kirli) / Toplam toplanan × 100.
- **kg canlı maliyeti** = Dönem toplam masrafı / Satılan canlı kg; **yumurta başı maliyet** = Dönem masrafı / Toplam satılabilir yumurta; **hayvan başı kâr** = (Gelir − Masraf) / Satılan adet.

### Gaps
- Ross 308 2022, Cobb 500, Hy-Line Brown/W-36 ve Aviagen Turkeys Big 6/B.U.T. hedef tablo değerleri (gün 7/14/21/28/35/42 ağırlık, kümülatif yem, YDO) alınamadı — aviagen.com, hy-line.com erişimi gerekiyor.
- EPEF formülü Türkçe birincil kaynaktan doğrulanamadı.

## 3. Aşı ve sağlık programı, ilaç arınma süresi

### Takeaway
Etlik piliçte yaygın Türk takvimi: Marek kuluçkahanede, 1. gün IB+ND sprey/damla, 7-14. gün Newcastle (LaSota), 10-24. gün Gumboro (içme suyu, takviyeli). Kaynaklar gün olarak birbirini tutmuyor; uygulama sabit takvim dayatmamalı, veteriner/kuluçkahane takvimini şablon olarak girmeye izin vermeli. Arınma süresi kaydı kesim/yumurta satış günü kontrolü için kritik ama Türk kaynakları bu oturumda bulunamadı.

### Cited Findings
- Bir etlik piliç tablosu: Marek kuluçkahanede deri altı; 1. gün IB + ND (Clone 30) damla/sprey; 10. gün Gumboro içme suyu; 14. gün Newcastle LaSota içme suyu; 18. gün Gumboro takviye. — [tavukciftligi.net broiler](https://tavukciftligi.net/urunler/broiler-tavuk.html)
- Başka bir takvim: Newcastle 7. gün, Gumboro 10. gün; aşı türü ve yerel koşula göre değişir. — [asi.gen.tr civciv aşıları](https://www.asi.gen.tr/civciv-asilari.html)
- İstanbul Üniversitesi ders notu: Newcastle 1. gün sprey, 7-10. gün sprey/içme suyu; Gumboro 8-14. ve 21-24. günlerde içme suyu. — [İÜ: Kanatlılarda aşılar ve aşılama yöntemleri](https://cdn.istanbul.edu.tr/FileHandler2.ashx?f=kanatlilarda-asilar-ve-asilama-yontemleri1.pdf)
- Gumboro aşısı genellikle içme suyu veya damla ile verilir. — [vetdestek: tavuklarda kullanılan aşılar](https://www.vetdestek.com/tavuklarda-kullanilan-asilar-ve-ozellikleri/)
- Hindi aşıları için ayrı rehber mevcut (içerik okunamadı). — [Altın Kuluçka: hindi aşıları](https://altin-kulucka.com/blog/hindi-asilari-ve-uygulamasi/)
- Kayıplarda hastalık çıkarsa entegre firma prim kesintisi yapabilir (sağlık kaydının ekonomik önemi). — [Bursa Uludağ tez](https://acikerisim.uludag.edu.tr/server/api/core/bitstreams/b2ae3f4a-5d50-4e9c-864c-c9b10fa5ff86/content)

### Inferences
- Aşı/ilaç kaydı alanları: tarih, yaş, ürün adı, seri/parti no, son kullanma, doz, uygulama yolu (içme suyu/sprey/göz-burun damla/enjeksiyon), uygulanan adet/kümes, uygulayan (veteriner adı), **arınma süresi (gün)** → uygulama "en erken kesim/yumurta satış tarihi"ni otomatik hesaplayıp kesim/satış girişinde uyarı vermeli.
- Yumurtacıda ilaç kullanımında yumurtanın da arınma süresi olduğundan, o günlerde toplanan yumurta "satılamaz" olarak işaretlenebilmeli.
- Hatırlatma: aşı takvimi şablonu (etlik / yumurtacı büyütme / hindi) + dönem başlangıç tarihine göre otomatik hatırlatıcı.

### Gaps
- Türkiye'de kanatlı ilaçlarında arınma süresi ve kayıt yükümlülüğü (Veteriner Tıbbi Ürünler Yönetmeliği, reçete/ilaç kayıt defteri, TİTCK değil Bakanlık VTÜ sistemi) kaynakla bulunamadı.
- Yumurtacı büyütme dönemi (0-18 hafta) için Türk aşı takvimi (Marek, IB, ND, Gumboro, AE, çiçek, EDS, Mycoplasma, Salmonella) bulunamadı.
- Kuş gribi (HPAI) dönemlerinde bölgesel kısıtlar ve bildirim yükümlülüğü (Bolu örneği var, ayrıntı yok: [Ekonomim](https://www.ekonomim.com/ekonomi/boluda-kus-gribi-tedbiri-kanatli-isletmelerine-biyoguvenlik-kisiti-haberi-897401)).

## 4. Sözleşmeli (entegre) yetiştiricilik: ödeme, belgeler, bağımsız doğrulama

### Takeaway
Türkiye'de sözleşmeli etlik piliç üretimi "Kanatlı Hayvan Eti Üretiminde Sözleşmeli Üretime İlişkin Usul ve Esaslar Hakkında Yönetmelik" ile düzenlenir: entegre firma civciv, yem, veteriner hizmeti, kesim ve pazarlamayı sağlar; üretici kümesi, bakımı, işçiliği ve genelde ısıtma/elektrik/altlığı karşılar. Ödeme teslim edilen canlı kg üzerinden "taban fiyat" + performansa (YDO, ölüm, ağırlık) bağlı prim/ceza şeklindedir. Kesin prim tabloları yayımlanmıyor; bu yüzden üreticinin bağımsız kendi kaydını tutması değerlidir.

### Cited Findings
- Yönetmeliğe göre entegre firma civciv ve yem temini, veteriner hizmetleri, kesimhane ve son ürün pazarlamasını yürütür; sözleşme **en az 3 nüsha** düzenlenir (üretici, firma, il/ilçe müdürlüğü). — [Lexpera: Sözleşmeli üretim yönetmeliği](https://www.lexpera.com.tr/mevzuat/yonetmelikler/kanatli-hayvan-eti-uretiminde-sozlesmeli-uretime-iliskin-usul-ve-esaslar-hakkinda-yonetmelik); [Alomaliye özet](https://www.alomaliye.com/2017/10/27/kanatli-hayvan-eti-uretiminde-sozlesmeli-uretim/)
- Firma, teslim edilen canlı ağırlık üzerinden kg başına ödeme yapar ("taban fiyat"); birçok firmada performansa göre prim ve ceza sistemi vardır; kümeste hastalık/toplu kayıpta prim kesintisi yapılabilir; yem masrafı firmanın verdiği kg fiyatla hesaplanır. — [Bursa Uludağ Üni. tez](https://acikerisim.uludag.edu.tr/server/api/core/bitstreams/b2ae3f4a-5d50-4e9c-864c-c9b10fa5ff86/content); [DergiPark: Broyler maliyet](https://dergipark.org.tr/tr/download/article-file/2584957)
- 2025 tarihli bir blog: kg başı ödeme bölgeye/firmaya göre **8-12 TL** (tek, resmi olmayan kaynak). Daha eski bir kaynakta yetiştirme ücreti 0,50-0,70 TL/kg (çok eski, enflasyon nedeniyle geçersiz). — [vetdestek 2025](https://www.vetdestek.com/2025-etlik-pilic-yetistiriciligi-ne-kadar-kazandirir/); [vetbilgi](https://www.vetbilgi.com/etlik-pilic-yetistiriciligi-maliyetleri-ve-kar-oranlari/)
- İzmir'de 42 entegre işletmeyi kapsayan tezde besi performansı ölçütü olarak besi sonu canlı ağırlık ve yemden yararlanma oranı kullanılmış. — [Ege Üni. açık erişim](https://acikerisim.ege.edu.tr/items/8c4bba2a-a8fe-4ad6-a3ab-27861628a242)
- Rekabet Kurumu soruşturması 27 Eylül 2025'te sonuçlandı, 13 firmaya toplam 3,7 milyar TL ceza (piliç sektörü). — [Ekonomim köşe yazısı](https://www.ekonomim.com/kose-yazisi/operasyonla-tavuk-etinin-fiyati-duser-mi/900046)
- TAGEM Kanatlı Hayvancılık Sektör Politika Belgesi 2023-2027 mevcut (içerik okunamadı). — [TAGEM](https://www.tarimorman.gov.tr/TAGEM/Belgeler/yayin/Kanatl%C4%B1%20Hayvanc%C4%B1l%C4%B1k%20Sekt%C3%B6r%20Politika%20Belgesi%202023-2027.pdf)

### Inferences
- Üreticinin firmadan aldığı/saklaması gereken belgeler (uygulamada fotoğraf eki): sözleşme, civciv giriş irsaliyesi (adet, kuluçkahane, ebeveyn sürü yaşı, + fire/ilave civciv), her yem irsaliyesi (tarih, yem tipi, kg), ilaç/aşı teslim belgeleri, sevk/kesim irsaliyesi (araç, kafes/adet, tartı), kesimhane raporu (canlı kg, karkas, ret/kondemnasyon), dönem sonu "üretici karnesi"/hesap kesimi (YDO, ölüm, EPEF, prim/kesinti, net ödeme), ödeme dekontu.
- Bağımsız doğrulama için uygulama: (a) yem irsaliyelerinin toplamı vs. firmanın karnede yazdığı yem; (b) kendi günlük ölüm sayımı vs. karnedeki adet; (c) giriş adedi + ilave − ölü − ayıklama = sevk adedi mutabakatı; (d) kendi hesapladığı YDO/EPEF vs. karne; (e) iade edilen yem; (f) ödeme günü vs. sözleşmedeki süre. Fark çıkarsa uyarı.
- Entegre üreticinin kendi masrafları (ısıtma, elektrik, talaş, işçilik, su, kümes amortismanı) karnede yer almaz; gerçek kârı görmek için ayrı girilmeli.

### Gaps
- Banvit, Beypiliç, Erpiliç, Keskinoğlu, Şenpiliç vb. firmaların 2025-2026 kg başı yetiştirme ücreti ve prim/ceza katsayıları kamuya açık kaynakta bulunamadı.
- Yönetmeliğin ödeme süresi, uyuşmazlık ve belge maddeleri tam metinden doğrulanamadı.

## 5. Maliyet ve gelir kalemleri (küçük işletme)

### Takeaway
Yem ve civciv maliyetin büyük kısmıdır (TEPGE 2025: yem %68, civciv %14; saha çalışmalarında yem+civciv ~%90). Masraf kategorileri: civciv/piliç, yem, altlık (talaş/saman/kabuk), ısıtma (doğalgaz/kömür/LPG/odun), elektrik, su, aşı-ilaç-veteriner, dezenfektan, işçilik, nakliye, kümes bakım/amortisman, sigorta. Gelir: canlı satış (kg), yumurta satışı (adet/koli/viyol), gübre satışı, ıskarta (yaşlı tavuk) satışı, entegre ödemesi ve destekler.

### Cited Findings
- TEPGE "Kümes Hayvancılığı Durum-Tahmin 2025": yem kanatlı üretim maliyetinin **%68**'i, civciv **%14**; yurt içi soyanın **%95,9**'u ithal. — arama özeti, [Ekonomim](https://www.ekonomim.com/kose-yazisi/operasyonla-tavuk-etinin-fiyati-duser-mi/900046) / TEPGE raporu (doğrudan açılamadı)
- Samsun: yem + civciv toplam masrafın **%90**'ı. — [OMÜ](https://acikerisim.omu.edu.tr/entities/publication/3afdb220-e788-4fc3-8869-87a7d91f266c)
- Etlik civciv birim fiyatı 2025'te ort. **35-50 TL** (yatırım rehberi tahmini). — [maliyeti.com.tr 2025](https://www.maliyeti.com.tr/etlik-tavuk-ciftligi-kurma-maliyeti-2025/)
- 25.000'lik broiler kümes fizibilite örneği mevcut (rakamlar okunamadı). — [tarimsalhibe.com](https://www.tarimsalhibe.com/25-000-broiler-kumes-projesi-etlik-pilic-tesisi-fizibilite/)
- Ayçiçek çekirdeği kabuğu altlık olarak denenmiş (talaşa alternatif altlıklar). — [DergiPark 3466113](https://dergipark.org.tr/tr/download/article-file/3466113)

### Inferences
- Masraf girişinde "dönem"e bağlama zorunlu; ortak masraflar (elektrik faturası, işçi maaşı) birden çok kümes/dönem arasında hayvan sayısı veya gün oranıyla bölünebilmeli (mevcut uygulamadaki "masrafı tarlalara dönüme göre böl" mantığının kanatlı karşılığı).
- Yem stoku: giren yem (irsaliye) − tüketilen = silo/çuval stoku; yemin fiyatı girişte alınırsa dönem yem maliyeti otomatik çıkar.
- Gübre (tavuk gübresi) satışı adet değil ton/römork veya çuval birimiyle; yumurtacıda dönem sonu ıskarta tavuk satışı ayrı gelir kalemi.

### Gaps
- Güncel (2025-2026) yem kg fiyatı, talaş, doğalgaz/kömür dönem başı tüketimi, tavuk gübresi fiyatı, işçilik ücretleri için kaynaklı veri bulunamadı.
- Kanatlı için devlet destekleri (ör. köy tavuğu/hindi dağıtım projeleri, IPARD) bu araştırmanın kapsamında aranmadı.

## 6. Yumurta işletmesi: günlük toplama, sınıflandırma, satış ve stok

### Takeaway
Türk Gıda Kodeksi Yumurta Tebliği (2014/55): A sınıfı yumurta ağırlığa göre S (<53 g), M (53-63 g), L (63-73 g), XL (≥73 g) sınıflanır; B sınıfı sadece gıda sanayine. A sınıfı yumurta yumurtlamadan itibaren 21 gün içinde tüketiciye ulaşmalı; bu, stok kaydında "toplama tarihi" ve yaşlanma uyarısını gerektirir.

### Cited Findings
- Ağırlık sınıfları: S küçük <53 g, M 53-63 g, L 63-73 g, XL ≥73 g (AB ile aynı eşikler). — [Resmî Gazete 20.12.2014](https://www.resmigazete.gov.tr/eskiler/2014/12/20141220-5.htm); [Lexpera Yumurta Tebliği 2014/55](https://www.lexpera.com.tr/resmi-gazete/metin/turk-gida-kodeksi-yumurta-tebligi-29211-2014-55); [AB 589/2008 md.4](https://www.legislation.gov.uk/eur/2008/589/article/4/data.html)
- A sınıfı: doğrudan tüketim veya gıda sanayi; B sınıfı: yalnız gıda sanayi. Ağırlık sınıfları renk/sembolle alt sınıflara bölünemez. A sınıfı yumurta yumurtlama tarihinden itibaren **21 gün** içinde tüketiciye ulaştırılmalı. — [Resmî Gazete](https://www.resmigazete.gov.tr/eskiler/2014/12/20141220-5.htm); [Lexpera](https://www.lexpera.com.tr/resmi-gazete/metin/turk-gida-kodeksi-yumurta-tebligi-29211-2014-55)
- Basında "yumurtada 28 gün kriteri" haberi (son tüketim tarihi ile ilgili; ayrıntı okunamadı). — [Sözcü](https://www.sozcu.com.tr/yumurtada-28-gun-kriteri-wp685044)
- İnsan tüketimine satılan yumurtanın izlenebilirliği için her işletmeye ayırt edici numara verilir. — [Lexpera: Yumurtacı tavuk yönetmeliği](https://www.lexpera.com.tr/mevzuat/yonetmelikler/yumurtaci-tavuklarin-korunmasi-ile-ilgili-asgari-standartlara-iliskin-yonetmelik)
- Organik/serbest yumurta üretiminde Bursa'da performans çalışması mevcut. — [Uludağ açık erişim](https://acikerisim.uludag.edu.tr/entities/publication/d200345b-1c4d-4d17-9ab0-ab417312a52c)

### Inferences
- Günlük yumurta kaydı: kümes, tarih, toplam toplanan, sağlam / kırık / kirli / çatlak / kabuksuz-anormal, (tartı varsa) S/M/L/XL dağılımı veya tek "ort. ağırlık"; köy tavuğu/küçük üretici için sadece "toplam + kırık" yeterli basit mod.
- Stok: giriş = günlük sağlam toplama; çıkış = satış (müşteri: bakkal, market, pazar, kapıdan, kooperatif), ev tüketimi, kırılma/fire; birim adet, 30'luk viyol (koli 12 viyol = 360 adet yaygın; sektör bilgisi, doğrulanmadı). Stokta en eski toplama tarihi > ~21 gün olunca uyarı.
- Satış kaydı: tarih, müşteri, adet/viyol, sınıf, birim fiyat, tahsil edildi mi (veresiye takibi bakkal satışları için önemli).
- Bıldırcın yumurtası için ayrı birim (adet/paket) gerekir; sınıflandırma yok.

### Gaps
- Yumurta üzerine basılan üretici kodu formatı (üretim şekli rakamı 0-3 + ülke + işletme no) Türk mevzuatından doğrulanamadı.
- 2025-2026 üretici yumurta fiyatları (Yum-Bir) bulunamadı.
- Küçük üreticinin (<350 tavuk, tebliğ kapsamı dışı) bakkala yumurta satışında hangi kayıt/etiket şartına tabi olduğu bulunamadı.
