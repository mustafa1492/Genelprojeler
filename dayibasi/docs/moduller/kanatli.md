# Kanatlı (kümes) oturumu
**Kapsam:** kanatlı hayvancılık: kümes, sürü (toplu sayı), günlük ölüm/yem/yumurta, dönem kârı, yumurta ve gübre satışı, köy tavuğu sade modu, kuluçka, sözleşmeli yetiştirici karşılaştırması. Kod: `products/ciftci/hayvan/kanatli/`. Dal: `modul/kanatli`.

## Canlıda ne var
Kümes v1 (4 Kasım 2026'da canlıya çıktı): kümesler listesi, kümes kartı, sürü aç/kapat, Bugünün kaydı (ölü, ayıklanan, yem, tartım), sürü kartı (kayıp %, yem, tahmini canlı kg ve yem dönüşüm oranı). Panelde "Kümes modülü" açılan defterlerde görünür.

## Yapılacaklar (sırayla)
1. v2: dönem kapanışı + firma karnesiyle karşılaştırma (önerilen ilk adım).
2. Masraf/gelirde sürü seçimi (sürü artık `herds` tablosunda; `lots`/`data.lot_id` değil).
3. Yem stoğu Depo'dan düşsün.
4. Sonra: aşı/ilaç + bekleme süresi, boş bekleme sayacı, biyogüvenlik defteri.

## Mustafa'dan beklenenler
- Eşikler (aşı, yem dönüşüm hedefi, ölüm uyarısı, kesim yaşı): veterinerle konuşulunca "önerilen" değerler eklenecek.
- Deneyecek gerçek bir kümesçi.
- Hazır "çalışan" rolü hayvan ekranına yazabilsin mi? (Claude tarla işi gibi "yazar" seçti, 0018'de uygulandı; Mustafa açıkça onaylamadı.)
- v2'ye dönem kapanışı + karneyle mi başlansın? (9 Kas'ta soruldu, cevap yok.)

## Kararlar ve kalıcı bilgiler
### Sınırlar
- Hayvan ortak iskeleti (`barns`/`herds`/`herd_days`, `Barinak.tsx`) kanatlı oturumunda kuruldu, hayvancılık da kullanır; iskelete dokunan değişiklik `hayvancilik.md`'ye not edilir. Küpe kartı / üreme döngüsü hayvancılığın.
- Ortak masraf, gelir, depo, takvim, çalışan modu yeniden yazılmaz (`core/`). Büyük değişiklik gerekirse `core.md` "Diğer oturumlardan istekler"e not.
- Veritabanı tablosu/kuralı gerekirse: göç dosyası hazırlanır, uygulanması Mustafa'ya sorulur.

### Kaynaklar
- Rapor: `docs/arastirma/reports/Kanatlı çiftlik modülü.md` (yapı: işletme → kümes → sürü → günlük kayıt; ekranlar; on gösterge; mevzuat/takvim hatırlatmaları; iş sırası).
- `docs/istekler.md` (Hayvancılık bölümü), `hayvancilik.md`.

### Kararlar (Mustafa, 4 Kasım 2026)
- İlk sürüm: **sözleşmeli etlik**.
- Hayvancılık iskeleti beklenmedi; kanatlı kendi modül anahtarıyla (`settings.modules` "kanatli") başladı. Aynı gün Mustafa: iskelet genel kurulsun (aşağıda "Yapı").
- Eşikler (aşı, YDO hedefi, ölüm uyarısı, kesim yaşı): şimdilik yok/kullanıcı girer; veterinerle konuşulunca "önerilen" kısmı eklenecek.
- Deneyecek kümesçi şimdilik yok.

### Yapı: hayvan ortak iskeleti (Mustafa, 4 Kasım 2026: genel kurulsun, hayvancılık da kullanacak)
- Göç `supabase/migrations/0018_hayvan.sql` (**uygulandı 4 Kasım 2026**, yedek bölümü hariç: canlıda 0013/`yedek.al` yok): `barns` (barınak), `herds` (sürü/dönem), `herd_days` (günlük kayıt: ölü, ayıklanan, yem çuvalı + çuval kg, tartım, not; sürü başına günde bir). Hepsinde `species` = kanatli | kucukbas | buyukbas. Yetki ekranı `hayvan` (hazır çalışan rolü: yazar, onay bekliyor). Geri alma ve yönetim paneli listelerine eklendi; yedeğe eklenmedi (0013 bekliyor, core.md'de istek var). Giriş yapmamış kişinin (anon) yazma/TRUNCATE yetkisi kaldırıldı (dosyada da var).
- Neden ayrı tablo (`lots` değil): `lots` yazma yetkisi "fidan" iznine, `events` ise kind'e göre tarla iznine bağlı; kümes kaydı fidan izni olmayan kullanıcıda çalışmazdı.
- Kod: `products/ciftci/hayvan/` → `api.ts` (internetsiz okuma/yazma), `hayvan.ts` (tür adları, modül anahtarları, hesaplar), `Barinak.tsx` (genel ekran: türü parametre alır). Kanatlı: `hayvan/kanatli/Kumes.tsx` = `<Barinak species="kanatli" />`; kümese özel ekler burada büyür.
- Modül anahtarları tür başına: "kanatli" (panelde var), "kucukbas", "buyukbas" (sekmeleri hayvancılık oturumu ekler).
- Küpe kartı ve üreme döngüsü: hayvancılık oturumu, ayrı tablo, `herds`/`barns`'a bağlanır.

### Bilinen açıklar ve tuzaklar
- Kümes yalnız sahte sunucuyla denendi; gerçek telefonda ve gerçek veritabanıyla denenmedi. Canlıda bir defterde kümes verisi girilmiş (9 Kas kontrolü).
- Tahmini YDO ölenlerin yediği yemi de içerir (rapordaki genel tanım).
- Deneme: `next dev` sayfayı açmıyor (CSP `unsafe-eval` engeli); `npm run build` + `next start` kullan. Eski `next start` portta kalırsa yeni sunucu başlamaz, deneme eski derlemeye gider: önce `pkill -f next-server`.

## Saklanan fikirler
(yok)

## Günlük
- 12 Kas: not kontrolü (eksikler ve eskimiş satırlar düzeltildi).
- 4 Kas: v1 canlıya çıktı (Core birleştirdi).
- 4 Kas: 0018_hayvan Supabase'e uygulandı (yedek bölümü hariç), anon yazma yetkisi kaldırıldı.
- 4 Kas: v1 yazıldı ve genel iskelete taşındı (dal `modul/kanatli`): kümesler listesi (bugün girildi/girilmedi), kümes kartı, sürü aç/kapat, Bugünün kaydı (ölü, ayıklanan, yem çuvalı sayacı, çuval kg bir kez, dün seçimi, tartım + not "daha fazla"da), sürü kartı (kalan, kayıp %, yem kg, son tartım, tahmini canlı kg, tahmini YDO, gün ve tartım listesi). Sürü formunda "uygulamadan önce verilen yem / ölen" (ortadan başlayan için); girişten beri yem eksikse YDO gösterilmez.
- 4 Kas: ekran denemesi yapıldı ( sahte sunucu, derlenmiş sürüm): kümes ekle → sürü aç → bugünün kaydı (çuval kg sorusu, tartım) → aynı günü düzelt → geri al → YDO → sürü kapat; hepsi geçti, konsol hatası yok.
