# Kanatlı (kümes) oturumu
**Kapsam:** kanatlı hayvancılık: kümes, sürü (toplu sayı), günlük ölüm/yem/yumurta, dönem kârı, yumurta ve gübre satışı, köy tavuğu sade modu, kuluçka, sözleşmeli yetiştirici karşılaştırması. Kod: `products/ciftci/hayvan/kanatli/`. Dal: `modul/kanatli`.

## Canlıda ne var
Kümes v1 (4 Kasım 2026'da canlıya çıktı): kümesler listesi, kümes kartı, sürü aç/kapat, Bugünün kaydı (ölü, ayıklanan, yem, tartım), sürü kartı (kayıp %, yem, tahmini canlı kg ve yem dönüşüm oranı). Panelde "Kümes modülü" açılan defterlerde görünür.

## Yapılacaklar (sırayla)
- v2: dönem kapanışı + firma karnesiyle karşılaştırma; masraf/gelirde sürü seçimi (`data.lot_id`); yem stoğu Depo'dan.
- Sonra: aşı/ilaç + bekleme süresi, boş bekleme sayacı, biyogüvenlik defteri.

## Mustafa'dan beklenenler
- Eşikler (aşı, yem dönüşüm hedefi, ölüm uyarısı, kesim yaşı): veterinerle konuşulunca "önerilen" değerler eklenecek.
- Deneyecek gerçek bir kümesçi.

## Kararlar ve kalıcı bilgiler
### Sınırlar
- Hayvancılık ortak iskeleti (barınak listesi, `settings.modules` "hayvan", olay/hatırlatma yapısı) **hayvancilik** oturumunun. Kanatlı onu kullanır; iskelet yoksa ve gerekiyorsa önce Mustafa'ya sorar, `hayvancilik.md`'ye not bırakır.
- Ortak masraf, gelir, depo, takvim, çalışan modu yeniden yazılmaz (`core/`). Büyük değişiklik gerekirse `core.md` "Diğer oturumlardan istekler"e not.
- Veritabanı tablosu/kuralı gerekirse: göç dosyası hazırlanır, uygulanması Mustafa'ya sorulur.

### Kaynaklar
- Rapor: `docs/arastirma/reports/Kanatlı çiftlik modülü.md` (yapı: işletme → kümes → sürü → günlük kayıt; ekranlar; on gösterge; mevzuat/takvim hatırlatmaları; iş sırası).
- `docs/istekler.md` (Hayvancılık bölümü), `hayvancilik.md`.

### Kararlar (Mustafa, 4 Kasım 2026)
- İlk sürüm: **sözleşmeli etlik**.
- Hayvancılık iskeleti beklenmedi; kanatlı kendi anahtarıyla (`settings.modules` "kanatli") başladı, iskelet gelince birleştirilecek.
- Eşikler (aşı, YDO hedefi, ölüm uyarısı, kesim yaşı): şimdilik yok/kullanıcı girer; veterinerle konuşulunca "önerilen" kısmı eklenecek.
- Deneyecek kümesçi şimdilik yok.

### Yapı: hayvan ortak iskeleti (Mustafa, 4 Kasım 2026: genel kurulsun, hayvancılık da kullanacak)
- Göç `supabase/migrations/0018_hayvan.sql` (**uygulandı 4 Kasım 2026**, yedek bölümü hariç: canlıda 0013/`yedek.al` yok): `barns` (barınak), `herds` (sürü/dönem), `herd_days` (günlük kayıt: ölü, ayıklanan, yem çuvalı + çuval kg, tartım, not; sürü başına günde bir). Hepsinde `species` = kanatli | kucukbas | buyukbas. Yetki ekranı `hayvan` (hazır çalışan rolü: yazar). Geri alma, yedek, yönetim paneli listelerine eklendi.
- Kod: `products/ciftci/hayvan/` → `api.ts` (internetsiz okuma/yazma), `hayvan.ts` (tür adları, modül anahtarları, hesaplar), `Barinak.tsx` (genel ekran: türü parametre alır). Kanatlı: `hayvan/kanatli/Kumes.tsx` = `<Barinak species="kanatli" />`; kümese özel ekler burada büyür.
- Modül anahtarları tür başına: "kanatli" (panelde var), "kucukbas", "buyukbas" (sekmeleri hayvancılık oturumu ekler).
- Küpe kartı ve üreme döngüsü: hayvancılık oturumu, ayrı tablo, `herds`/`barns`'a bağlanır.

## Saklanan fikirler
(yok)

## Günlük
- v1 yazıldı ve genel iskelete taşındı (dal `modul/kanatli`): kümesler listesi (bugün girildi/girilmedi), kümes kartı, sürü aç/kapat, Bugünün kaydı (ölü, ayıklanan, yem çuvalı sayacı, çuval kg bir kez, dün seçimi, tartım + not "daha fazla"da), sürü kartı (kalan, kayıp %, yem kg, son tartım, tahmini canlı kg, tahmini YDO, gün ve tartım listesi). Sürü formunda "uygulamadan önce verilen yem / ölen" (ortadan başlayan için); girişten beri yem eksikse YDO gösterilmez.
- Ekran denemesi yapıldı (4 Kasım 2026, sahte sunucu, derlenmiş sürüm): kümes ekle → sürü aç → bugünün kaydı (çuval kg sorusu, tartım) → aynı günü düzelt → geri al → YDO → sürü kapat; hepsi geçti, konsol hatası yok.
