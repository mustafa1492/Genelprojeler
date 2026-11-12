# Hayvancılık oturumu
**Kapsam:** büyükbaş + küçükbaş (kümes ayrı oturum: `kanatli.md`), `products/ciftci/hayvan/` (kart.ts, Hayvanlar.tsx; ortak iskelet api.ts, hayvan.ts, Barinak.tsx). Panelden defter başına açılan modüller: settings.modules `buyukbas`, `kucukbas`. Yetki ekranı `hayvan`. Ortak masraf/gelir/depo/takvim kullanılır. · **Dal:** `modul/hayvancilik`

## Canlıda ne var
Küpe numaralı hayvan kartı (inek/koyun/keçi, dişi/erkek, ahır/ağıl), olaylar (doğum, kızgın, tohum, gebe/boş, kuruya, ilaç, aşı, tartım, satış, ölüm, not), "Bu hafta" hatırlatmaları, ilaç arınma uyarısı, doğumda yavru kaydı (annesine bağlı), satış fiyatı gelire yazılır, Süreler ekranı (settings.hayvan_sureler), ahır/ağıl ve toplu sürü (ortak Barinak). Tablolar: `animals`, `animal_events` (göç 0019).

## Yapılacaklar (sırayla)
1. Veteriner/hayvancı cevaplarıyla varsayılan süreleri düzelt; aşı takvimi önerisi.
2. Süt defteri (mandıra cevapları gelince), çoban hesabı.
3. Verimsiz hayvan listesi (eşikler Mustafa'dan).

## Mustafa'dan beklenenler
- Veteriner ve hayvancının cevapları: `hayvancilik-sorular.md` (38 soru).
- Varsayılan süreler onayı (inek 280/21/35/60/45, koyun 150/17/35, keçi 150/21/35 gün; `kart.ts` SURE_VARSAYILAN). Onaysız kondu, kullanıcı değiştirebiliyor.
- Verimsiz hayvan listesi: eşikleri ilk sürümde kullanıcı mı girsin, cevaplar mı beklensin? (9 Kasım soruldu)
- Soru listesindeki kümes soruları (36-37) çıkarılsın mı? (4 Kasım soruldu)

## Kararlar ve kalıcı bilgiler
- (Mustafa, 4 Kasım) İlk sürüm inek + koyun + keçi birlikte.
- (Mustafa, 4 Kasım) Hayvancılık Tam paketin içinde; başka modül de isteyene eklenti yapılır.
- (Mustafa, 4 Kasım) Kümes hayvancılıktan ayrı modül.
- (Mustafa, 4 Kasım) Deneyecek hayvancıya hesap açmaya gerek yok.
- (Mustafa, 4 Kasım) Cevapları beklemeden başlandı ("başla"); süreler varsayılan, sonra düzeltilecek.
- (Oturum, onaysız) İlaç arınma süresini kullanıcı ilacın kutusundan girer; hazır ilaç listesi yok (kaynak belirsiz). Satışta gelir türü "Hayvan satışı".

## Bilinen açıklar
- Gerçek veritabanıyla denenmedi; yalnız sahte sunucuyla (4 Kasım).
- Olay düzenlenemiyor, sadece silinip yeniden girilir.
- Süreler ayarını yalnız defter sahibi kaydedebilir (businesses güncelleme yetkisi).
- 0013 yedek canlıda yok; uygulanınca yedek.al()'a `animals`, `animal_events` eklenmeli (core.md'de yazılı).

## Tuzaklar
- Dalı açmadan önce `git fetch`: eski gelistirme'den açılırsa ortak iskelet görünmez.
- `next dev` CSP (eval) yüzünden boş açılır; ekran denemesi `next build` + `next start` ile. Oturum çerezde (`sb-<ref>-auth-token` = "base64-" + JSON), localStorage'da değil. Projede eslint ayarı yok.

## Günlük
- 4 Kasım: soru listesi (`hayvancilik-sorular.md`) ve kararlar, `modul/hayvancilik` gelistirme'den açıldı.
- 4 Kasım: 0019 (animals, animal_events) canlı veritabanına uygulandı; dosya ile aynı.
- 4 Kasım: hayvan kartı, olay, hatırlatma, arınma, Süreler; sekmeler, panel ve /yonetim modül kutuları, Geçmiş metinleri; ekran denemesi geçti.
- 4 Kasım: Core gelistirme ve main'e birleştirdi; büyükbaş/küçükbaş Menü'ye eklendi (canlıda).
