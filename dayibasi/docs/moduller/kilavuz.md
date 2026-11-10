# Kılavuz: kontrol listesi, sözlük, not şablonu, rapor düzeni

Bu dosya **gerektiğinde** okunur: özellik eklerken/çıkarırken (1), ekrana ad verirken (2), modül notu yazarken (3), Mustafa rapor isteyince (4). Her oturumda baştan okunmaz.

## 1. Bir şey eklemeden ya da çıkarmadan önce (kontrol listesi)
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

## 2. Sözlük (ekranda görünen adlar)
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

## 3. Modül notu şablonu
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

## 4. Rapor düzeni
Mustafa iki şey isteyebilir. İkisi de **önce `bash dayibasi/scripts/rapor.sh` çalıştırılarak** hazırlanır (bütün notları ve dalların durumunu tek seferde verir; dosyalar tek tek okunmaz).

**"Durum" / "nerede kaldık" (kısa, en fazla ~10 satır)** → `rapor.sh kisa`
1. Canlıda son yayın ve tarihi.
2. Canlıya gitmeyi bekleyen ne var (yoksa "yok").
3. Sıradaki iş (tek cümle).
4. Mustafa'dan beklenen cevaplar.

**"Rapor" (tam; hiçbir şey atlanmaz)** → `rapor.sh`
1. **Özet:** üç satır: canlıda ne var, bekleyen yayın, en önemli sonraki adım.
2. **Canlıda ne var:** modül modül, kullanıcının gördüğü özellikler.
3. **Canlıya gitmeyi bekleyenler:** `gelistirme`'de olup yayınlanmamış işler; birleştirilmeyi bekleyen dallar.
4. **Son yapılanlar:** günlüklerden, tarih sırasıyla; her satırda ne denendi / ne denenmedi.
5. **Yapılacaklar:** modül modül, sırasıyla; hangisi neyi bekliyor.
6. **Senden beklenenler:** bütün açık sorular ve kararlar tek listede, numaralı (cevaplaması kolay olsun).
7. **Not edilenler:** saklanan fikirler ve nerede yazdıkları (dosya yolu).
8. **Riskler ve bilinen sorunlar:** denenmemiş şeyler, gerçek cihazda bakılmamışlar, dış servislere bağlı olanlar, güvenlik/yedek eksikleri.
9. **Hesaplar:** deneme ve gerçek kullanıcı hesapları (şifre yazılmaz), silinmesi gerekenler.
10. **Takvim:** yaklaşan tarihler (Nisan hedefi, başvurular, süresi dolacaklar).
11. **Öneri:** bundan sonra hangi işle başlanmalı ve neden (tek paragraf).

Kurallar: rapor notlardan ve depodan yazılır, hafızadan değil. Notta olmayan bir şey söyleniyorsa "notta yok" diye belirtilir. Rakam ve tarih uydurulmaz. Rapor uzun olacağı için başlıklı ve maddeli yazılır; Mustafa "kısa" derse durum biçimi kullanılır.
