# Modüller ve ortak çekirdek

## Bütün projelerin tabanı: 3 kart
- **İşletme kartı:** ad, logo, renkler, adres, telefon, WhatsApp, çalışma saatleri, fotoğraflar
- **Kişi kartı:** tür (işçi, çiftçi, müşteri, üye…), ad, telefon, etiketler, özel alanlar, notlar, geçmiş, bakiye
- **Hizmet/ürün kataloğu:** ne satılıyor, fiyat, süre *(dayıbaşında gerekmiyor; esnaf/randevu işine başlanınca)*

Aynı veriden farklı ürünler çıkar: web sitesi = işletme kartı + katalog · QR menü = katalog · randevu = katalog + kişi + takvim · dayıbaşı = kişi + kayıt + evrak + cari.

## Kişi kartı ürüne göre nasıl değişir (sadece config)

| Ürün | Kişi türleri | Etiketler | Özel alanlar |
|---|---|---|---|
| Dayıbaşı | İşçi, çiftçi, şoför | Zeytin, budama, üzüm, mısır püskülü, çapa | Köy, ÇKS no |
| Randevu (berber) | Müşteri, çalışan | Saç, sakal, çocuk | Son hizmet, tercih edilen usta |
| Saha takip | Personel, müşteri firma | Ekip, vardiya | Ehliyet sınıfı |
| Spor salonu | Üye, eğitmen | Fitness, pilates | Üyelik bitişi |
| Veresiye defteri | Müşteri | — | Limit |

## Dalgalar
| Dalga | Modüller | Ne zaman |
|---|---|---|
| 1 · Çekirdek | Çok işletme, kullanıcı/yetki, kişi kartı + özel alanlar, kayıt defteri, cari hesap, hatırlatıcı, mesaj şablonları | İlk |
| 2 · Dayıbaşı | Araç kartı, evrak takibi, yoklama, puantaj, döküm, avans, tarla kartı, beceri etiketleri, rapor | İlk sürüm + pilot sezon |
| 3 · İkinci pazar | Takvim/randevu, katalog, abonelik/aidat, online ödeme, talep formu, hazır web sitesi, QR | Dayıbaşı oturunca |
| 4 · Tutana göre | Veresiye, stok, GPS, sadakat, yorum, hava uyarısı, vardiya, görev, masraf, resmi şablonlar, puanlama, toplu duyuru | Müşteri isteğine göre |

## Ekran bileşenleri (core/ui) — her üründe aynı
- Büyük ana düğme, ikincil düğme
- Seçim düğmesi listesi (tek seçim)
- − / + sayaç
- Durum etiketi (yeşil/turuncu/kırmızı + yazı)
- Uyarı kartı (kırmızı, tek eylem düğmeli)
- Onay cümlesi kartı ("Kaydettim: …")
- Kişi satırı (baş harf, ad, alt satır, sağda durum)
- Alt menü (4 sekme, ikon + yazı)
