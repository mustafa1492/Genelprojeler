# Çiftçi defteri — İLK HEDEF (Mustafa, 2 Kasım 2026)
"Babamın ilk sürümü sade olmasın; ilk plan olarak hedefe bunu koyuyorum, ilk bu bitecek."
Ayrı ürün: `businesses.product = 'ciftci'`, ekranlar `products/ciftci/`, adres `/ciftci`. Dayıbaşı ekranları görünmez.

## İstenenler
- [x] **Tarlalar:** ayrı ayrı tarla ekle (ad, dönüm, ürün, not). Her şey tarla seçilerek girilir.
- [x] **Tarla günlüğü:** tarlaya hangi işlem yapıldı (ilaçlama, gübreleme, sulama, budama, sürüm, ekim/dikim, hasat, diğer), tarih, not.
- [x] **İlaçlama kaydı:** hangi ilaç, doz, **bekleme süresi (gün, kullanıcı girer — ilacın etiketinde yazar; uydurulmaz)** → "hasat en erken X". Depodan düşme isteğe bağlı.
- [x] **Verim (ayrı bölüm):** tarla + yıl + ürün + miktar (kg/ton/kasa) → dönüm başı verim, yıllara göre.
- [x] **Masraf (en önemlisi):** core/expenses; çiftçi türleri; tarla seçimi; veresiye; fiş fotoğrafı; Excel.
- [x] **Gelir:** hasat satışı (tarla, ürün, miktar, fiyat/toplam, alıcı, tahsil: alındı / vadeli + vade günü); devlet desteği de gelir türü.
- [x] **Borç ve vadeler:** kredi, kooperatif, bayi, tüccar alacakları, çek/senet: kime/kimden, tutar, vade günü, ödenen. Yaklaşan vadeler ana sayfada.
- [x] **Devlet destekleri:** gelir türü + başvuru/son tarih hatırlatma (belgelerle).
- [x] **Belge bitiş tarihleri:** ÇKS, TARSİM, kira sözleşmesi, ruhsat… (core documents tablosu).
- [x] **Gübre/ilaç stoğu + Envanter (Depo):** malzemeleri tek tek ekle (adı, birimi, türü), sayısını uygulamadan − / + ile değiştir; ilaçlamada kullanılan stoktan düşebilir.
- [x] **Aile kullanımı:** Mustafa'nın ve babasının ayrı hesabı, **ortak defter**; her kaydın yanında **kim girdi** görünür. Davet koduyla katılım.
- [x] **Estetik:** arka plana güzel bir şey (hafif, tarla/doğa temalı), daha güzel düğmeler. **Uygulama hiç kasmasın** (hafif CSS, ağır gölge/bulanıklık yok, kütüphaneler gerektiğinde yüklenir).

## Sıra
1. Altyapı: migration (kim girdi `created_by`, borç/vade, depo, davet/aile, üye adı), ürüne göre yönlendirme (`/` ↔ `/ciftci`), babanın işletmesi.
2. Tarlalar + günlük + ilaçlama + verim
3. Masraf (ortak bileşene çevir) + Gelir
4. Borç/vadeler + destekler + belgeler
5. Depo/envanter (+ ilaçlamada stoktan düş)
6. Aile: davet kodu, kim girdi
7. Ana sayfa özeti + Excel + estetik + hız kontrolü

## Durum (2 Kasım 2026)
İlk sürüm bitti ve yayında: `/ciftci` (Özet · Tarlalar · Masraf · Gelir · Depo; Özet'ten Borç ve vadeler, Belgeler, Aile; Geçmiş).
Babanın hesabı (`abdullahsedat`) "Aile defteri" (product=ciftci) işletmesine bağlı; girişte `/ciftci`'ye yönlenir, dayıbaşı adreslerine girerse geri döner.
Mustafa'nın kendi hesabı: Aile ekranından davet kodu → Mustafa yeni hesap açar → "Davet kodum var".
Sahte sunucuyla uçtan uca denendi (depo düşme, vadeler, hasat bekleme uyarısı, kâr). Gerçek cihazda denenmedi.
Sonra: takvim (istekler.md), bildirimler, sezon karşılaştırma, ortaklık/yarıcılık (sorulacak).

## 2 Kasım 2026 (gelistirme dalı, onay bekliyor)
- [x] Sekmeli kabuk: alt menü her ekranda, sekmeler kaldığı yerde kalır (yazılanlar kaybolmaz), aynı sekmeye dokununca başa döner.
- [x] Sezonlar: kullanıcı açar (ad, başlangıç, bitiş; "Sonraki sezonu aç"). Gelir/özet/tarla sezona göre; masraf **Ay ay / Sezon** (sezon içinde ay ay döküm). Ayda gelir gösterilmez (Mustafa: gelir aylık hesaplanmaz).
- [x] Güzel Excel (exceljs) ve PDF sezon raporu (Özet → Sezon raporu; yazdır → PDF; tüm sezon tek Excel, 6 sayfa).
- Fikirler: `docs/fikirler/08-ciftci-sorunlari-ve-simsir.md` (seçilmedi).
