# Çiftçi Defteri: maliyet, kâr stratejisi ve uzun vadeli plan

*Hazırlanış: 4 Kasım 2026. Fiyatlar Claude'un bilgisine dayanır, internetten doğrulanmadı; dolar kuru 1 $ ≈ 42 TL varsayıldı. Başlamadan önce güncel fiyatlara bakılmalı.*

## 1. Kısa cevap

- **Şu an aylık gider: 0 TL** (her şey ücretsiz planlarda).
- **Satışa başlayınca sabit gider: aylık yaklaşık 5.000–7.000 TL** (sunucu + veritabanı + muhasebeci).
- **Başabaş: yaklaşık 70–90 ücretli kullanıcı.** Kâr için 150+ ücretli kullanıcı hedeflenmeli.
- **Gerçekçi beklenti:** İlk sezon (2027) hedefi 30–80 ücretli kullanıcı; kâra geçiş büyük ihtimalle 2. sezon (2028).
- **Claude kullanım hakkı:** Şimdiki paket, ajanlar sadece gerektiğinde ve küçük işlerde kullanılırsa yeter. Paket yükseltmeyi ancak gelir onu karşılayınca düşünmek mantıklı.

## 2. Giderler

### Bir kerelik
| Kalem | Tahmini | Not |
|---|---|---|
| Alan adı (.com veya .com.tr) | 400–800 TL/yıl | Ertelendi |
| Google Play hesabı | ~25 $ ≈ 1.050 TL | Bir kere |
| KVKK metni (avukat) | 5.000–20.000 TL | Tanıdık avukatla düşebilir |
| Şirket kuruluşu (şahıs şirketi) | 3.000–8.000 TL | Para almaya başlamadan gerekli |
| App Store (ileride) | ~99 $/yıl ≈ 4.150 TL/yıl | iPhone'u sonra |

### Aylık (satışa başlayınca)
| Kalem | Ücretsiz aşama | Satış aşaması | Not |
|---|---|---|---|
| Vercel (site) | 0 | ~20 $ ≈ 840 TL | Ücretsiz plan ticari kullanıma izin vermiyor; para almaya başlayınca Pro gerekir |
| Supabase (veritabanı) | 0 | ~25 $ ≈ 1.050 TL | Uyku yok, günlük yedek dahil |
| E-posta (şifre sıfırlama) | 0 | 0 | Resend vb. ücretsiz kotası yeter |
| Hata takibi | 0 | 0 | Ücretsiz plan yeter |
| Muhasebeci + e-fatura | 0 | 2.500–4.000 TL | Şirket olunca zorunlu |
| Ödeme altyapısı (iyzico/PayTR) | 0 | gelirin ~%3–4'ü | Tahsilat komisyonu |
| Claude aboneliği | şimdiki paket | şimdiki paket | Yükseltme yok |
| **Toplam sabit** | **0 TL** | **≈ 4.500–6.000 TL + Claude** | |

Kullanıcı sayısı 1.000'i geçene kadar sunucu ve veritabanı maliyeti pek artmaz. Fiş fotoğrafları çoğalırsa Supabase depolama ücreti biraz artar.

## 3. Fiyat ve paketler (taslak)

| Paket | İçerik | Aylık | Yıllık (önerilen) |
|---|---|---|---|
| **Basit** | Tarla, masraf, gelir, özet. Tek kişi | Ücretsiz | Ücretsiz |
| **Orta** | + takvim, hatırlatma, hava, depo, sezon raporu, Excel, aile | 99 TL | 790 TL |
| **Tam** | + çalışan modu, yetkiler, fiş kutusu, fidan / hayvancılık modülü, öncelikli destek | 199 TL | 1.590 TL |

- Çiftçi aylık ödemeyi sevmez: **yıllık ve hasat sonrası ödeme** seçeneği olmalı.
- Ücretsiz Basit paket kullanıcıyı içeri alır; değer görünce yükseltir.
- Komisyon ve vergi sonrası ortalama net gelir: ücretli kullanıcı başına **ayda yaklaşık 70–90 TL**.

## 4. Başabaş ve kâr

| Ücretli kullanıcı | Aylık net gelir | Sabit gider | Sonuç |
|---|---|---|---|
| 30 | ~2.400 TL | ~5.500 TL | −3.100 TL |
| 75 | ~6.000 TL | ~5.500 TL | **≈ başabaş** |
| 150 | ~12.000 TL | ~6.000 TL | +6.000 TL |
| 500 | ~40.000 TL | ~8.000 TL | +32.000 TL |

Ücretsizden ücretliye geçiş oranı bu tür uygulamalarda genelde %3–10. **75 ücretli için 750–2.500 kayıtlı kullanıcı** gerekir. Tek tek çiftçi bularak buna ulaşmak yavaştır; bu yüzden strateji toplu kanallara dayanmalı.

## 5. Kâra geçmek için strateji (gerçekçi)

1. **Önce kanıt (Nisan–Eylül 2027):** Baban, Hüseyin ve 10–20 tanıdık çiftçi bir sezon boyunca kullansın. Gerçek yorumlar, ekran görüntüleri, "şu kadar masrafımı gördüm" hikâyeleri. Satışın en büyük kozu bu.
2. **Toplu kanallar (2027 sonbahar):** Tek tek çiftçi yerine birden çok çiftçiye ulaşanlar:
   - Tarım kredi kooperatifleri ve sulama birlikleri: toplu lisans.
   - Gübre / ilaç bayileri: bayi müşterisine önerir; karşılığında kendi fiyatlarını uygulamada gösterir ya da komisyon alır.
   - Ziraat mühendisleri ve veterinerler: danışmanlık verdikleri çiftçiler için.
3. **Bölge odaklı:** Önce Ege (Bergama, Kınık, Manisa). Bir köyde 3–5 kişi kullanırsa diğerleri görür.
4. **Ek gelir (ileride):** Fidan ve hayvancılık modülleri ayrı ücretli eklenti; kooperatif veya bayi için "çok çiftçi görünümü" ayrı fiyat.
5. **Gider kontrolü:** Ücretli planlara (Vercel Pro, Supabase Pro) ancak para almaya başlarken geçilir.

**Riskler:** Çiftçinin uygulamaya güvenmemesi ve "kâğıt yeter" alışkanlığı; mevsimsellik (kışın kullanım düşer); büyük firmaların ücretsiz uygulamaları (Tarım Cebimde vb.); tek kişinin (senin) zamanının sınırlı olması.

## 6. Claude kullanım hakkı ve ajanlar

Bu oturumda gördüklerimiz:
- Normal geliştirme (bir ekran, bir düzeltme): az–orta hak.
- **Derin araştırma (4 ajan + rapor): çok yüksek.** Bir kere 5 saatlik sınıra takıldık.
- Uzun test turları: orta–yüksek.

Ajan paketi kurulunca tahmini kullanım:

| İş | Sıklık | Hak kullanımı |
|---|---|---|
| Küçük geliştirme / düzeltme | haftada birkaç | düşük–orta |
| Test ajanı (yükleme öncesi) | yayın başına 1 | orta |
| İçerik / pazarlama (gönderi, metin) | haftada 1 | düşük–orta |
| Tasarım (taslak görsel) | ayda birkaç | orta |
| Güvenlik kontrolü | Nisan öncesi 1, sonra 3 ayda 1 | orta |
| Derin araştırma | ayda en çok 1 | çok yüksek |

**Sonuç:** Şimdiki paketle ajanlar **sıralı ve seyrek** kullanılırsa yeter. Aynı gün hem derin araştırma hem büyük geliştirme hem test yapılırsa sınıra takılırız. Yetmemeye başlarsa bir üst plan (ör. Claude Max) aylık yaklaşık 100 $ (≈ 4.200 TL) civarı; bu da ~50 ücretli kullanıcıyla karşılanır. **Öneri:** Gelir bunu karşılamadan yükseltme. Hak bittiğinde bekle, işleri haftalara yay.

Hakkı korumanın yolları: işleri tek seferde ve net ver; derin araştırmayı ancak yeni bir alana girerken yap; testleri sadece yayından önce yap; ekran görüntüsü yerine kısa yazılı tarif ver (görsel okumak hak yer).

## 7. Uzun vadeli plan (haftalık hedefler)

Haftaları "hafta başı Pazartesi" diye düşün. Her hafta tek bir ana hedef; yetişmezse bir sonraki haftaya kayar, sorun değil.

### Dönem 1: Sağlamlaştırma (Kasım – Aralık 2026)
| Hafta | Hedef |
|---|---|
| 9 Kas | Fikir haftası: paketlerin içeriği netleşir, tanıtım sitesi taslağı konuşulur |
| 16 Kas | Kontrol listesi (30–40 madde) yazılır; sen telefonda bir tur denersin |
| 23 Kas | Bulunan hatalar düzeltilir (tek liste) |
| 30 Kas | Basit / Orta / Tam paket ayrımı uygulamaya (panelde paket seçimi) |
| 7 Ara | İlk açılış rehberi + "basit mod" görünümü |
| 14 Ara | Uygulama içi yardım: kısa video senaryoları yazılır |
| 21 Ara | Ara / tatil (tampon hafta) |
| 28 Ara | Ara / tatil (tampon hafta) |

### Dönem 2: Hazırlık (Ocak – Mart 2027)
| Hafta | Hedef |
|---|---|
| 4 Oca | Tanıtım sitesi tasarımı (örnek sitelerden), metinler |
| 11 Oca | Tanıtım sitesi yapılır (uygulamayla aynı adreste) |
| 18 Oca | Alan adı alınır ve bağlanır |
| 25 Oca | Tapudan tarla getirme |
| 1 Şub | Dönüm başı kâr, başabaş fiyatı, girdi fiyat geçmişi |
| 8 Şub | Kısa yardım videoları çekilir (Canva/ekran kaydı) |
| 15 Şub | Agent paketi tanımları hazırlanır (test, içerik, pazarlama…) |
| 22 Şub | Şirket ve ödeme kararı: şahıs şirketi, iyzico/PayTR, muhasebeci |
| 1 Mar | Yedek kurulumu + deneme hesaplarının silinmesi + şifre sıfırlama e-postası |
| 8 Mar | KVKK metni (avukat) + gizlilik sayfası |
| 15 Mar | Google Play hesabı + Android paketi + 12 kişilik kapalı test başlar |
| 22 Mar | Güvenlik kontrolü + yayın öncesi tam test (izinle) |
| 29 Mar | Supabase/Vercel ücretli plana geçiş kararı (para alınacaksa) |

### Dönem 3: Gerçek kullanım (Nisan – Haziran 2027)
| Hafta | Hedef |
|---|---|
| 5 Nis | Babanla sezon kurulumu: tarlalar, sezon, listeler; ona öğretme |
| 12 Nis | **Hedef tarih:** 10–20 tanıdık çiftçiye açılış |
| 19 Nis | Her hafta: kullanıcıdan gelen hatalar ve istekler (tek liste) |
| 26 Nis | Google Play'de yayın (kapalı test bitince) |
| Mayıs (4 hafta) | Haftalık küçük iyileştirmeler; kullanım verisine bakma |
| Haziran (4 hafta) | İlk ücretli paketlerin denenmesi (tanıdıklara indirimli) |

### Dönem 4: Büyüme (Temmuz 2027 →)
| Dönem | Hedef |
|---|---|
| Temmuz | Pazarlama masası: içerik takvimi, ilk gönderiler |
| Ağustos | Bayi / kooperatif görüşmeleri için sunum ve broşür |
| Eylül–Ekim | Hasat sonu: yıllık paket kampanyası ("hasattan sonra öde") |
| Kasım–Aralık | Sezon değerlendirmesi; hayvancılık modülü kararı |
| 2028 | Hayvancılık modülü, iPhone uygulaması, başka bölgeler |

## 8. Karar bekleyenler

- Paket içerikleri ve fiyatlar (taslak yukarıda).
- Şirket türü ve ne zaman kurulacağı.
- Ücretsiz paketin kalıcı olup olmayacağı.
- Hayvancılık modülünün hangi yılda ele alınacağı.

## 9. Güncelleme (4 Kasım 2026): Nisan'a kadar bütün modüller

Mustafa'nın zaman sorunu yok, tek sınır Claude kullanım hakkı. Bu yüzden plan sıkıştırıldı; modüller ayrı oturumlarda yürür (`docs/moduller/`).

| Ay | İş |
|---|---|
| Kasım | Sağlamlaştırma, paketler, basit mod (Core) |
| Aralık | Hayvancılık ortak iskelet + büyükbaş/küçükbaş ilk sürüm |
| Ocak | Süt defteri + kümes; tanıtım sitesi |
| Şubat | Tapudan tarla, kâr hesapları; dayıbaşına az eforla uyan kısımlar |
| Mart | Yedek, KVKK, Android, toplu test (izinle), düzeltmeler |
| Nisan | Açılış (12 Nisan civarı) |

Hak tasarrufu: önce karar sonra kod, tek oturum tek iş, ortak iskelet, az ve toplu test, araştırma yok, sınıra takılınca bekle. Güvenlik işleri Nisan öncesine ertelendi. Mustafa "ikinci emir" verene kadar uygulamaya yeni bir şey eklenmiyor (fikir dönemi).
