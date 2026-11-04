# Hayvancılık oturumu

**Kapsam:** büyükbaş + küçükbaş (kümes ayrı modül olacak). Yeni modül, `products/ciftci/hayvan/` altında (fidan gibi panelden açılıp kapanan modül: settings.modules "hayvan"). Ortak masraf/gelir/depo/takvim/yetki kullanılır, yeniden yazılmaz.

## Kaynaklar
- Rapor: `docs/arastirma/reports/Hayvancılık modülü ihtiyaçları.md`
- Kümes raporu: `docs/arastirma/reports/Kanatlı çiftlik modülü.md`
- Notlar: `docs/arastirma/research_notes/…`

## Tasarım özeti
- Barınak (ahır/ağıl/kümes) → hayvan (küpe no ile kart; büyük/küçükbaş) ya da sürü (kanatlı, toplu sayı).
- Tek ekranda olay: doğurdu, kızgın, tohumlandı, gebe/boş, kuruya, ilaç, aşı, tartım, satış, ölüm. Sonraki tarihleri uygulama hesaplar, hatırlatır.
- Fark yaratacaklar: ilaç arınma etiketi ("sütü tanka katılmaz, şu tarihe kadar satılmaz"), mandıra kontrolü (litre, yağ/protein, kesinti, yem borcu), çobanla ortak defter (çalışan modu).
- Sıra: ortak iskelet + hayvan kartı + olay + hatırlatma + arınma → süt defteri → kümes → besi, yem stoğu, çoban hesabı, verimsiz hayvan listesi → sesli kayıt, küpe okuma.

## Kararlar (Mustafa, 2026-11-04)
- İlk sürüm: inek + koyun + keçi birlikte.
- Paket: Tam paketin içinde. Başka modül de isteyene eklenti olarak satılır.
- Kümes: hayvancılıktan ayrı modül.
- Süre/aşı/ilaç/mandıra/çoban soruları veteriner ve hayvancıya soruluyor: `hayvancilik-sorular.md`.

## Eski karar listesi
- İlk sürüm inek mi, koyun-keçi mi?
- Varsayılan süreler (gebelik inek ~280, koyun ~150, kuruya ~60 gün, aşı yaşları) onayı — kullanıcı değiştirebilir olacak.
- Mandıra süt parası hesabı, çobana ödeme şekli, ortaklı sürü.
- Deneyecek gerçek bir hayvancı.

## Nerede kaldık
- Kod başlanmadı. Soru listesi hazır, cevaplar bekleniyor.
