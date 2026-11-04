# Hayvancılık oturumu

**Not:** Kanatlı (kümes) ayrı oturumda: `kanatli.md`. Ortak iskelet (barınak, modül anahtarı, olay/hatırlatma) bu oturumda.

**Kapsam:** büyükbaş + küçükbaş. Yeni modül, `products/ciftci/hayvan/` altında (fidan gibi panelden açılıp kapanan modül: settings.modules "hayvan"). Ortak masraf/gelir/depo/takvim/yetki kullanılır, yeniden yazılmaz.

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

## Ortak iskelet hazır (kanatlı oturumu kurdu, 4 Kasım 2026)
- Tablolar `barns`, `herds`, `herd_days` (göç 0018, `species` alanıyla), yetki ekranı `hayvan`, kod `products/ciftci/hayvan/` (api.ts, hayvan.ts, Barinak.tsx). Ayrıntı: `kanatli.md` "Yapı".
- Küçükbaş/büyükbaş için: `TURLER` içindeki adları kontrol et, App.tsx'e `<Barinak species="kucukbas" />` sekmesi ve panele modül kutusu ekle. Küpe kartı ve üreme döngüsü bu oturumda, ayrı tablo olarak.

## Nerede kaldık (4 Kasım 2026)
- Yapıldı (`modul/hayvancilik`, gelistirme'ye birleştirilmedi): göç `0019_hayvan_kart.sql` (animals, animal_events) CANLIYA UYGULANDI. Kod: `hayvan/kart.ts` (hesaplar, varsayılan süreler), `hayvan/Hayvanlar.tsx` (liste, "Bu hafta", kart, olay, doğumda yavru kaydı, satışta gelire yazma, ilaç arınma uyarısı, Süreler ekranı → settings.hayvan_sureler). Sekmeler Büyükbaş/Küçükbaş (modül anahtarı buyukbas/kucukbas, panel + /yonetim'de kutu). Ahır/ağıl ve toplu sürü: ortak Barinak ekranı.
- Ekran denemesi yapılmadı (Mustafa'ya sorulacak).
- Varsayılan süreler veteriner onayı bekliyor (`hayvancilik-sorular.md`).
- 0013 yedek uygulanınca yedek.al()'a animals, animal_events eklenmeli.

## Sıradaki
- Veteriner/hayvancı cevaplarıyla süreleri düzelt; aşı takvimi önerisi.
- Süt defteri (mandıra cevapları gelince), çoban hesabı, verimsiz hayvan listesi.
