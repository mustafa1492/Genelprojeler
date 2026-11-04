# Kanatlı (kümes) oturumu

**Kapsam:** kanatlı hayvancılık: kümes, sürü (toplu sayı), günlük ölüm/yem/yumurta, dönem kârı, yumurta ve gübre satışı, köy tavuğu sade modu, kuluçka, sözleşmeli yetiştirici karşılaştırması. Kod: `products/ciftci/hayvan/kanatli/`. Dal: `modul/kanatli`.

## Sınırlar
- Hayvancılık ortak iskeleti (barınak listesi, `settings.modules` "hayvan", olay/hatırlatma yapısı) **hayvancilik** oturumunun. Kanatlı onu kullanır; iskelet yoksa ve gerekiyorsa önce Mustafa'ya sorar, `hayvancilik.md`'ye not bırakır.
- Ortak masraf, gelir, depo, takvim, çalışan modu yeniden yazılmaz (`core/`). Büyük değişiklik gerekirse `core.md` "Bekleyen istekler"e not.
- Veritabanı tablosu/kuralı gerekirse: göç dosyası hazırlanır, uygulanması Mustafa'ya sorulur.

## Kaynaklar
- Rapor: `docs/arastirma/reports/Kanatlı çiftlik modülü.md` (yapı: işletme → kümes → sürü → günlük kayıt; ekranlar; on gösterge; mevzuat/takvim hatırlatmaları; iş sırası).
- `docs/istekler.md` (Hayvancılık bölümü), `hayvancilik.md`.

## Başlamadan Mustafa'dan alınacak kararlar
- İlk sürüm hangi kullanıcı: köy tavuğu / yumurtacı / etlik (sözleşmeli)?
- Hayvancılık iskeleti beklenecek mi, yoksa kanatlı önce mi başlayıp iskeleti kuracak?
- Eşik ve takvimler (aşı programı, kesim yaşı, yem dönüşüm hedefi, ölüm uyarı oranı): Mustafa/veterinerden, uydurulmaz.
- Deneyecek gerçek bir kümesçi.

## Nerede kaldık
- Oturum açıldı, başlanmadı.

## Sıradaki
- Raporu oku, kararları Mustafa'ya sor, ilk sürüm planını sun; onaysız kod yazma.
