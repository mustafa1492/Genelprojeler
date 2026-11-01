# Fikir: Çiftçinin sezon defteri (gelir-gider)

Mustafa, 1 Kasım 2026: "Sadece benim çiftçi masraflarımı sezon boyu girip hasat zamanı gelen parayı da girip veri çıktısı oluşturabildiğim bir sistem."
Kullanıcı: çiftçi (Mustafa'nın kendisi ilk kullanıcı olabilir). Tek kişilik, ekip yok.

## Akış
- **Sezon** aç (ör. "2026 Zeytin"), isteğe bağlı tarla(lar) ve dönüm.
- Sezon boyu **masraf** gir (tek ekran, 3 dokunuş): tür → tutar → kaydet. Not ve fiş fotoğrafı isteğe bağlı.
  Türler (config'ten, değiştirilebilir): Tohum/fide, Gübre, İlaç, Mazot, İşçilik (dayıbaşı), Su/elektrik, Kira, Makine/traktör, Nakliye, Diğer.
- Hasatta **gelir** gir: ne sattı, miktar (kg/kasa/ton) × fiyat ya da toplam, kime sattı, alınan / alınacak.
- **Çıktı:** sezon özeti (toplam masraf, gelir, kâr/zarar), tür tür masraf, ay ay grafik, dönüm başı ve kg başı maliyet, geçen sezonla karşılaştırma. **Excel (.xlsx)** ve WhatsApp'a özet.

## Çekirdekten gelenler
places (tarla), ledger/events (masraf ve gelir kayıtları), takvim, geçmiş + geri alma, internetsiz çalışma, Excel çıktısı, Alacaklarım (alıcıdan alınacak para).

## Dayıbaşı ile bağ (ileride)
Çiftçinin "İşçilik" masrafı dayıbaşı uygulamasındaki hesapla aynı rakam; ileride dayıbaşının gönderdiği hesap çiftçinin defterine tek dokunuşla eklenebilir (iki ürün aynı çekirdekte).

## Ne zaman?
Kural 1: önce dayıbaşı. Ama bu ürün küçük ve Mustafa kendisi kullanabilir → erken ve ucuz bir gerçek-kullanıcı denemesi olabilir. Masraf modülü dayıbaşı için yazılırken genel yazılırsa bu ürün birkaç ekranla çıkar.

## Sorulacaklar
- Hangi ürün(ler)? Birden çok ürün/tarla aynı sezonda mı?
- Satış nasıl: tüccara, kooperatife, hal? Peşin mi vadeli mi?
- Devlet desteği / mazot-gübre desteği gelir olarak girilsin mi?
