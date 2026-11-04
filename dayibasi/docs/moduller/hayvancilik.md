# Hayvancılık oturumu

**Not:** Kanatlı (kümes) ayrı oturumda: `kanatli.md`. Ortak iskelet (barınak, modül anahtarı, olay/hatırlatma) bu oturumda.

**Kapsam:** yeni modül, `products/ciftci/hayvan/` altında (fidan gibi panelden açılıp kapanan modül: settings.modules "hayvan"). Ortak masraf/gelir/depo/takvim/yetki kullanılır, yeniden yazılmaz.

## Kaynaklar
- Rapor: `docs/arastirma/reports/Hayvancılık modülü ihtiyaçları.md`
- Kümes raporu: `docs/arastirma/reports/Kanatlı çiftlik modülü.md`
- Notlar: `docs/arastirma/research_notes/…`

## Tasarım özeti
- Barınak (ahır/ağıl/kümes) → hayvan (küpe no ile kart; büyük/küçükbaş) ya da sürü (kanatlı, toplu sayı).
- Tek ekranda olay: doğurdu, kızgın, tohumlandı, gebe/boş, kuruya, ilaç, aşı, tartım, satış, ölüm. Sonraki tarihleri uygulama hesaplar, hatırlatır.
- Fark yaratacaklar: ilaç arınma etiketi ("sütü tanka katılmaz, şu tarihe kadar satılmaz"), mandıra kontrolü (litre, yağ/protein, kesinti, yem borcu), çobanla ortak defter (çalışan modu).
- Sıra: ortak iskelet + hayvan kartı + olay + hatırlatma + arınma → süt defteri → kümes → besi, yem stoğu, çoban hesabı, verimsiz hayvan listesi → sesli kayıt, küpe okuma.

## Başlamadan Mustafa'dan alınacak kararlar
- İlk sürüm inek mi, koyun-keçi mi?
- Varsayılan süreler (gebelik inek ~280, koyun ~150, kuruya ~60 gün, aşı yaşları) onayı — kullanıcı değiştirebilir olacak.
- Mandıra süt parası hesabı, çobana ödeme şekli, ortaklı sürü.
- Deneyecek gerçek bir hayvancı.

## Kanatlıdan not (4 Kasım 2026)
- Kanatlı iskeleti beklemeden başladı: modül anahtarı "kanatli", kümes/sürü `lots` tablosunda `data.kanatli` ile. Ortak barınak gelince birleştirilecek (bkz. `kanatli.md` Yapı).

## Nerede kaldık
- Başlanmadı (plan: Aralık).
