# Fidan oturumu

**Kapsam:** `products/ciftci/fidan.ts`, `products/ciftci/screens/Fidan.tsx` (ve Gelir'deki fidan satışı, Tarlalar'daki fidan bilgisi). Panelden defter başına açılan modül (settings.modules "fidan"). Ortak masraf/gelir/depo core ve çiftçi tarafında.

## Var olanlar
Partiler (dikim, kaynak, pasaport), çok tarlalı dikim (tarlalara dağıtım), dikime/tarlaya göre görünüm, sayım (boy sınıfları, fire sebebi), bakım, hatırlatma, sipariş (kapora), sevk listesi (PDF), fotoğraf, taşıma/saksıya alma (maliyetiyle), fidan başı maliyet (genel masraf fidan sayısına, tarla masrafı canlı fidana göre), kâr oranıyla önerilen fiyat, Excel. Fidan/Buğday iş ayrımı (Fidan maliyetine sadece "Fidan" seçilen genel masraflar girer).

## Gerçek kullanıcı
- Hüseyin: `hüseyinköprü`, "Köprü fidancılık". Deneme: `ornekfidan`.

## Sıradaki
- Hüseyin'in kullanımından gelen geri bildirim (henüz yok).
- Hüseyin'e yeni ekranları göstermek (Stok, Müşteriler, Fiyat listesi), geri bildirim almak.
- Olası: satış formunda boy seçince fiyat listesinden fiyatı doldurmak; müşteri telefonu (şimdilik WhatsApp kişi seçtiriyor).
- Tür/çeşit bazlı fiyat (Seçenek C) birden çok tür üretilirse.

## Nerede kaldık
- 4 Kasım 2026 (modul/fidan): Stok ekranı (boy boy elde / siparişte / satılabilir, parti dağılımı, boyu sayılmamışlar), Müşteriler (fidan satışı alıcısı + sipariş müşterisi, ad eşleşmesi büyük/küçük harf duyarsız; borç = Gelir'deki kalan), müşteri hesabını WhatsApp'tan gönderme, Fiyat listesi (settings.fidan_prices, boy başına tek fiyat: şimdilik sadece şimşir) + WhatsApp paylaşma (stok adediyle ya da adetsiz). Müşteriden "Ödeme al": tutar en eski borçlu satıştan başlayarak düşer (Mustafa kararı), satışın data.received'ı artar (Vadeler ile aynı yol), borçtan fazlası girilemez, geri alınabilir. Tarayıcıda denenmedi; main'e gitmedi.
