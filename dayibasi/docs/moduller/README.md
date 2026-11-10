# Çalışma kuralları ve not düzeni

Her oturum **önce bu dosyayı, sonra kendi modül dosyasını** okur. Buradaki kurallar bütün modüller için geçerlidir; bir modül dosyası bu dosyayla çelişirse bu dosya geçerlidir.

Proje: Çiftçi Defteri (Next.js + Supabase, depo `mustafa1492/genelprojeler`, klasör `dayibasi/`). Canlı: https://genelprojeler.vercel.app, panel: /panel.
Diğer belgeler: ayrıntılı kurallar `dayibasi/CLAUDE.md` · istekler ve kararlar `docs/istekler.md` · plan `docs/plan/is-plani-ve-maliyet.md` (en alttaki "Güncelleme") · araştırmalar `docs/arastirma/reports/` · tasarım `docs/tasarim/` · saklanan fikirler `docs/fikirler/` · elle test listesi `docs/test-plani.md`.

## 1. Çalışma kuralları (Mustafa)
- Cevaplar kısa ve Türkçe. Kural, para, süre, eşik **uydurulmaz**: sorulur. Gerçek veri silinmeden/değiştirilmeden önce sorulur.
- **Kullanım hakkı korunur:** test gerektiğinde yapılır (yayın öncesi, para hesabı, yetki/veritabanı, giriş/internetsiz kayıt değişince). İstenmedikçe derin araştırma yok. İş tek seferde yapılır, gereksiz dosya okunmaz.
- **Aynı anda tek oturum kod yazar.** Ortak parçalara (`core/`, `app/layout`, `next.config`, veritabanı kuralları) sadece Core dokunur; diğer oturum küçük işi yapıp söyler, büyük işi `core.md` → "Diğer oturumlardan istekler"e yazar.
- Her oturum kendi dalında: `modul/<ad>` (Core: `gelistirme`). **Canlıya (main) sadece Core gönderir**, Mustafa "yükle" deyince.
- Commit sonuna oturumun verdiği `Co-Authored-By` satırı eklenir. Sadece belge/test değişen commit mesajına `[skip ci]`.
- Daha uygun bir bağlayıcı/skill varsa önce Mustafa'ya sorulur.
- Veritabanı: `execute_sql` ile create/alter/create or replace çalışır; `drop`/`revoke` onayı Mustafa'ya ulaşmıyor → kısıtlayıcı politika yazılır ya da komut SQL Editor için hazırlanır. Değişiklikler geriye uyumlu olur (önizleme ve canlı aynı veritabanını kullanır).
- Supabase proje ref: `ypblltxjbhgnnvtyteat`. Gizli anahtar ve şifre depoya yazılmaz.

## 2. Profesyonel çalışma ilkeleri
Amaç: uygulama büyürken **karışmasın**. Her ekleme ve çıkarma, kullanıcının kafasındaki resmi basitleştirmeli ya da en azından bozmamalı.

1. **Önce sorun, sonra çözüm.** Ne çözülüyor, kim istedi, yapılmazsa ne olur? Cevap yoksa yapılmaz.
2. **Yeni ekran en son çare.** Önce: mevcut bir ekrana satır/alan olarak sığar mı? Mevcut bir ayarla çözülür mü?
3. **Varsayılan sade.** Yeni şey varsayılan olarak kapalı, gizli ya da tek satırdır; isteyen açar (Ekranımı düzenle, modül kutusu, "Detaylandır / düzenle").
4. **Bir iş, bir yol.** Aynı işi yapan iki düğme, aynı bilgiyi gösteren iki kart olmaz. Yenisi gelince eskisi kaldırılır.
5. **Bir kavram, bir ad.** Aşağıdaki sözlükteki adlar her ekranda, Excel'de ve notlarda aynıdır. Yeni kavram önce sözlüğe yazılır.
6. **Ortak olan ortak yerde.** İki modülün kullandığı şey `core/`'a (ya da ortak iskelete) konur; kopyalanmaz. Modüle özel olan modül klasöründe kalır.
7. **Kural koddan önce yazılır.** Para hesabı, yetki, süre, eşik: önce Mustafa'nın onayladığı cümle, sonra kod. Onaysız varsayılan değer koyulmaz.
8. **Geri dönülebilir.** Silme yerine gizleme; her işlemde "Geri al"; veritabanı değişikliği eski kayıtları bozmaz.
9. **Dürüst rapor.** Ne denendi, ne denenmedi, ne tahmin edildi açıkça yazılır. "Çalışıyor" denmeden önce çalıştırılır.
10. **Küçük ve bitmiş.** İş, tek seferde bitirilip test edilebilecek parçalara bölünür; yarım iş dala gönderilmez.

## 3. Bir şey eklemeden ya da çıkarmadan önce (kontrol listesi)
**Eklerken**
- [ ] Sorun ve isteyen belli mi? Kapsam bir cümleyle yazıldı mı?
- [ ] Nereye konacak: mevcut ekran mı, Menü mü, Ayarlar mı? (Alt çubuk ve Özet'e doğrudan ekleme yapılmaz; kullanıcı kendisi koyar.)
- [ ] Varsayılanı ne: açık mı, kapalı mı? Hangi yetkiyle, hangi modülde görünür?
- [ ] Şunlarla uyumlu mu: yetkiler (çalışan para görmez), internetsiz kayıt, tutarları gizle (`formatTL`), döviz karşılığı, Excel ve "Bütün verimi indir", yedek, Geçmiş/geri alma, büyük yazı, telefon (320 px) ve bilgisayar.
- [ ] Adı sözlükte var mı? Teknik kelime içermiyor mu?
- [ ] Veritabanı gerekiyorsa: geriye uyumlu mu, yetki kuralı var mı, internetsiz depodan (`mutate`/`query`) geçiyor mu?
- [ ] Başka modülü etkiliyor mu? Etkiliyorsa o modülün notuna yazıldı mı?

**Çıkarırken ya da değiştirirken**
- [ ] Eski kayıtlar hâlâ açılıyor ve doğru hesaplanıyor mu? (Veri silinmez; alan boş kalabilir.)
- [ ] Bu şeye giden bütün yollar kaldırıldı mı (Menü, Özet, hızlı düğme, alt çubuk seçenekleri, bağlantılar, Excel sütunu, test listesi)?
- [ ] Ad değiştiyse her yerde değişti mi (ekran, Excel, notlar, tanıtım sitesi)?
- [ ] Kullanıcının kayıtlı tercihleri (alt çubuk, kartlar) bozulmadan çalışıyor mu?

**Bitirirken**
- [ ] Tür denetimi ve derleme geçti; ilgili ekran telefonda ve bilgisayarda denendi.
- [ ] Modül notu güncellendi (aşağıdaki şablon); karar verildiyse "Kararlar"a, bekleyen soru varsa "Mustafa'dan beklenenler"e yazıldı.
- [ ] Mustafa'ya kısa rapor: ne yapıldı, ne denendi, ne bekliyor.

## 4. Sözlük (ekranda görünen adlar)
| Ad | Anlamı | Kullanılmayan eş anlamlılar |
|---|---|---|
| Özet | Açılış ekranı; kartlar kişiye göre düzenlenir | ana sayfa, pano |
| Menü | Alt çubuğun sağındaki tuş; bütün bölümler | diğer, daha fazla |
| Ayarlar | Kişi, defter, görünüm, veri, çıkış | profil |
| Defter | Bir işletmenin bütün kayıtları | hesap, işletme |
| Tarla | Üretim yapılan yer (bağ, bahçe, fidanlık dahil) | parsel (sadece tapu sorgusunda) |
| Dekar | Alan birimi (veride anahtar `donum`) | dönüm |
| Masraf / Gelir | Para çıkışı / girişi | gider, harcama / satış (gelirin bir türü) |
| İşletme gideri | Belli bir tarlaya ait olmayan masraf; dekar başı masrafa girmez, net kârdan düşülür | genel, ortak masraf |
| Tarlalara böl | Bir masrafı tarlalara dekarına göre paylaştırmak | dağıt |
| İş | Üretim kolu (Fidan, Buğday…); rapor "iş iş" ayrılır | branş, kalem |
| Sezon | Kayıtların sayıldığı tarih aralığı | dönem (sadece kümeste "dönem" = sürü) |
| Borç ve vadeler | Ödenecek ve alınacaklar | cari |
| Veresiye | Parası sonra ödenecek masraf | açık hesap |
| Hatırlatma | Takvime konan not | görev, alarm |
| Geri al | Son işlemi geri çevirir | iptal |
| Tutarları gizle | Para yazan her yer `*** TL` olur | gizli mod |
| Döviz karşılığı | Kaydın günündeki TCMB kuruyla dolar/euro | kur farkı |
| Barınak | Kümes, ağıl, ahır | bina |
| Sürü | Toplu sayılan hayvan grubu (kümeste bir dönem) | parti |
| Parti | Aynı dikimden fidan grubu | lot |
| Fiş | Masrafın fotoğrafı | belge (Belgeler ayrı: ÇKS, sigorta…) |

## 5. Modül notu şablonu
Bütün modül dosyaları **aynı başlıkları, aynı sırayla** kullanır. Boş başlık silinmez, altına "(yok)" yazılır. Dosya kısa tutulur: biten işin ayrıntısı koddadır, nota sadece sonradan lazım olacak bilgi yazılır.

```
# <Modül> oturumu
**Kapsam:** ne yapar · **Dal:** modul/<ad> · **Kod:** klasör/dosyalar · **Sınır:** neye dokunmaz

## Canlıda ne var
(kullanıcının gördüğü özellikler, kısa liste)

## Yapılacaklar (sırayla)
1. … (en üstteki sıradaki iştir)

## Mustafa'dan beklenenler
- karar / bilgi / onay (soru cümlesiyle)

## Kararlar ve kalıcı bilgiler
- verilmiş kararlar (tarihiyle), iş kuralları, veri yapısı, kaynaklar, gerçek kullanıcılar

## Saklanan fikirler
- şimdi yapılmayacak ama unutulmaması gerekenler (ayrıntısı docs/fikirler ya da docs/istekler'de)

## Günlük
- GG Ay: ne yapıldı, nerede (dal / canlı), ne denendi. En yeni üstte; 10 satırı geçince en eskiler silinir.
```
Core'un dosyasında ek olarak "Diğer oturumlardan istekler" başlığı vardır.

## 6. Oturumlar
| Dosya | Kapsam |
|---|---|
| core.md | giriş, yetkiler, ortak ekranlar, internetsiz kayıt, tasarım, panel, veritabanı, yayın |
| ciftci.md | tarla, masraf, gelir, rapor, takvim, makineler |
| fidan.md | fidancılık modülü |
| hayvancilik.md | büyükbaş, küçükbaş, süt, hayvan ortak iskeleti |
| kanatli.md | kanatlı (kümes, sürü) |
| tanitim.md | tanıtım sitesi, paket/fiyat metinleri, pazarlama, mağaza |
| dayibasi.md | dayıbaşı ürünü (ara verildi) |
