# Kanatlı (kümes) oturumu

**Kapsam:** kanatlı hayvancılık: kümes, sürü (toplu sayı), günlük ölüm/yem/yumurta, dönem kârı, yumurta ve gübre satışı, köy tavuğu sade modu, kuluçka, sözleşmeli yetiştirici karşılaştırması. Kod: `products/ciftci/hayvan/kanatli/`. Dal: `modul/kanatli`.

## Sınırlar
- Hayvancılık ortak iskeleti (barınak listesi, `settings.modules` "hayvan", olay/hatırlatma yapısı) **hayvancilik** oturumunun. Kanatlı onu kullanır; iskelet yoksa ve gerekiyorsa önce Mustafa'ya sorar, `hayvancilik.md`'ye not bırakır.
- Ortak masraf, gelir, depo, takvim, çalışan modu yeniden yazılmaz (`core/`). Büyük değişiklik gerekirse `core.md` "Bekleyen istekler"e not.
- Veritabanı tablosu/kuralı gerekirse: göç dosyası hazırlanır, uygulanması Mustafa'ya sorulur.

## Kaynaklar
- Rapor: `docs/arastirma/reports/Kanatlı çiftlik modülü.md` (yapı: işletme → kümes → sürü → günlük kayıt; ekranlar; on gösterge; mevzuat/takvim hatırlatmaları; iş sırası).
- `docs/istekler.md` (Hayvancılık bölümü), `hayvancilik.md`.

## Kararlar (Mustafa, 4 Kasım 2026)
- İlk sürüm: **sözleşmeli etlik**.
- Hayvancılık iskeleti beklenmedi; kanatlı kendi anahtarıyla (`settings.modules` "kanatli") başladı, iskelet gelince birleştirilecek.
- Eşikler (aşı, YDO hedefi, ölüm uyarısı, kesim yaşı): şimdilik yok/kullanıcı girer; veterinerle konuşulunca "önerilen" kısmı eklenecek.
- Deneyecek kümesçi şimdilik yok.

## Yapı (v1)
- Yeni tablo/göç yok. Kümes ve sürü `lots` tablosunda (`data.kanatli` = "kumes" | "suru"; sürüde `kumes_id, tur, firma, sozlesme_no, giris_g, bag_kg, closed_on`; `planted_on` = giriş günü, `initial_count` = giriş adedi, `source` = kuluçkahane). Fidan ekranları `isFidanLot` ile süzer.
- Günlük kayıt `events.kind = "kumes_gunluk"` (gün başına sürü başına bir kayıt: dead, culled, bags, bag_kg, note), tartım `"kumes_tartim"` (n, avg_g).
- Kod: `products/ciftci/hayvan/kanatli/` (kanatli.ts hesaplar, Kumes.tsx ekranlar). Sekme `/ciftci/kumes`, yetki anahtarı "kumes", panel ve /yonetim'de modül kutusu.

## Nerede kaldık
- v1 yazıldı (dal `modul/kanatli`): kümesler listesi (bugün girildi/girilmedi), kümes kartı, sürü aç/kapat, Bugünün kaydı (ölü, ayıklanan, yem çuvalı sayacı, çuval kg bir kez, dün seçimi, tartım + not "daha fazla"da), sürü kartı (kalan, kayıp %, yem kg, son tartım, tahmini canlı kg, tahmini YDO, gün ve tartım listesi). Tip denetimi temiz; tarayıcıda denenmedi.

## Sıradaki
- Mustafa onayıyla ekran denemesi (sahte sunucu) ve Core'a birleştirme isteği.
- v2: dönem kapanışı + firma karnesiyle karşılaştırma; masraf/gelirde sürü seçimi (`data.lot_id`); yem stoğu Depo'dan.
- Sonra: aşı/ilaç + bekleme süresi, boş bekleme sayacı, biyogüvenlik defteri.
