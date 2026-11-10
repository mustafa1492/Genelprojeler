# Tanıtım + Pazarlama oturumu

**Kapsam:** tanıtım sitesi (uygulamayla aynı adreste; ana sayfa tanıtım, "Giriş yap" uygulamaya), paket/fiyat metinleri, uygulama içi kısa videolar (senaryo), Google Play mağaza metni, pazarlama içerikleri (Canva, Gmail taslak, Drive). Hiçbir şey Mustafa onayı olmadan yayınlanmaz/gönderilmez.

## Kararlar
- Tasarım: Mustafa'nın verdiği Dribbble sayfaları (web-design / mobile popüler) ve bulunan örnekler; dribbble.com bu ortamdan açılmıyor (ağ izni gerekir). Seçilen uygulama tarzı: telefonda sade kartlar, bilgisayarda yan menü + tablo (`docs/tasarim/`).
- Paket taslağı: Basit (ücretsiz: tarla, masraf, gelir, özet) / Orta (~99 TL/ay, 790 TL/yıl) / Tam (~199 TL/ay, 1.590 TL/yıl). Yıllık + "hasattan sonra öde".
- Paket kararları (Kasım 2026): Basit pakette sınır yok. Fidan / hayvancılık Tam pakete dahil. Deneme süresi yok; ilk sezon ücret alınmayacak.
- Alan adı ertelendi. Mağaza: önce Android.
- Destek: uygulama içi kısa videolar.

## Ücret kararı (10 Kasım 2026)
- **Ücret alınmayacak.** Paketler/fiyatlar siteden kaldırıldı, `app/tanitim/cep.tsx`'te saklı (ileride yine eklenebilir). Aşağıdaki paket/fiyat notları ertelendi.
- Proje TÜBİTAK başvurusuna çevrildi; sitede TÜBİTAK ile ilgili değişiklik yapılmayacak (Mustafa).

## Nerede kaldık
- 4 Kasım 2026: **Site taslağı yapıldı** (`modul/tanitim` dalı, canlı ana sayfa değişmedi): `app/tanitim/page.tsx` + `tanitim.css` → adres `/tanitim`. Arama motoruna kapalı (noindex). Bölümler: giriş cümlesi + "Ücretsiz başla"/"Giriş yap" (ikisi de /ciftci), dert → çözüm, 12 özellik, telefon (Özet) ve bilgisayar (Masraflar) temsili çizimi (örnek rakamlar, HTML/CSS), bölümler/modüller + "Yakında", paketler [taslak], sık sorulan sorular, iletişim [YER TUTUCU], alt bilgi (/kvkk).
- Görüntüler: `docs/tasarim/tanitim-390.png`, `tanitim-320.png`, `tanitim-1366.png`. Yatay taşma yok, konsol hatası yok.
- "Yakında" diye işaretlenenler (uygulamada yok): dekar/kilo başı kâr ve girdi fiyat geçmişi, tarla × yıl ekim tablosu, ilaçlama saati, süt defteri, kümeste yumurta ve dönem kapanışı, Google Play uygulaması.
- 10 Kasım 2026: **Görsel düzen**: buğday/toprak/krem tamamlayıcı palet (koyu yeşil korunarak), girişte gradyan + tepe/tarla sırası SVG arka planı (`public/tanitim/tarla.svg`), dalga ayraçlar (giriş altı, alt bilgi üstü), tutarlı kart gölge/köşeleri, düğme hover/odak (buğday odak halkası), başlık altı buğday çizgisi. Metin değişmedi. Görüntüler yenilendi.

- 10 Kasım 2026: "Nasıl kullanılır" tıklanabilir rehber (6 adım + telefona ekleme, Android/iPhone; `app/tanitim/NasilKullanilir.tsx`), paylaşım görseli (`app/tanitim/opengraph-image.png`), WhatsApp düğmesi (numara bekleniyor: `page.tsx` `WA_NUMARA`). Giriş ekranı yenilendi (`core/auth/AuthGate.tsx` + `core/ui/ui.css`, Mustafa istedi); `?kayit=1` doğrudan "Yeni hesap aç" açar, "Hemen başla" buraya bağlı.

- 10 Kasım 2026 (2): "Nasıl kullanılır" bütün bölümleri kapsıyor: 18 bölüm, 68 konu + Telefona ekle (`app/tanitim/rehber.ts` içerik, `NasilKullanilir.tsx` görünüm). Düğme/alan adları koddan alındı; uygulamada ekran değişince `rehber.ts` güncellenmeli.

- 10 Kasım 2026 (3): **Ana sayfa (/) artık tanıtım sitesi** (Mustafa: "ilk site bu çıksın"). Arama motorlarına açık. Giriş yapmış kişi (çerezde oturum) / adresinden /ciftci'ye geçer; site /tanitim'de de açılır (yönlendirmesiz, noindex). Modüller öne çıkarıldı: girişte Tarla/Fidan/Kümes/Hayvan şeridi + "İşine göre modülünü seç" kartları (her kart rehberde o bölümü açar).

- 10 Kasım 2026 (4): Etkileşimli parçalar (`app/tanitim/Etkilesim.tsx`, hiçbir yere kayıt göndermez): "Hesap açmadan dene" (sahte telefonda masraf/gelir yaz, kâr kartı değişir, geri al, tutarları gizle), "Kârını hesapla" (dekar, masraf, verim, fiyat → kâr/zarar, başabaş), "Hangi modül bana göre?" (5 evet/hayır → modül + hazır görünüm önerisi).

## Onay bekleyen metinler (Mustafa)
- Ana cümle: "Tarlanın hesabı cebinde." / "Masrafını, gelirini, tarlanı ve deponu telefondan yaz; sezon sonunda ne kazandığını tek bakışta gör."
- "Basit paket hep ücretsiz. Kredi kartı istemez." ve "İlk sezon ücret alınmaz."
- Paketlerin içerik dağılımı (Orta: depo, makineler, takvim, sezon raporu/Excel, dolar karşılığı, aile ve çalışan; Tam: + fidan, kümes, büyükbaş/küçükbaş). Bu dağılım Claude önerisi, karar değil.
- Sık sorulan soruların cevapları (özellikle veri güvenliği: "kimseyle paylaşılmaz, satılmaz").

## Açık sorular
- İletişim: telefon / WhatsApp / e-posta ne yazılacak?
- Alan adı (ertelendi).
- WhatsApp numarası: verilen "0538313921" 10 hane, cep numarası 11 hane olmalı; doğrusu sorulacak.

## Sıradaki
- Mustafa taslağa bakacak (önizleme adresinde `/tanitim`), metin ve fiyat onayı.
- Ödemeler konuşulurken açılacak: "hasattan sonra öde" nasıl çalışacak (tahsil zamanı, gecikme).
