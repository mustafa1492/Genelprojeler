# Çiftçi defteri — İLK HEDEF (Mustafa, 2 Kasım 2026)
"Babamın ilk sürümü sade olmasın; ilk plan olarak hedefe bunu koyuyorum, ilk bu bitecek."
Ayrı ürün: `businesses.product = 'ciftci'`, ekranlar `products/ciftci/`, adres `/ciftci`. Dayıbaşı ekranları görünmez.

## İstenenler
- [ ] **Tarlalar:** ayrı ayrı tarla ekle (ad, dönüm, ürün, not). Her şey tarla seçilerek girilir.
- [ ] **Tarla günlüğü:** tarlaya hangi işlem yapıldı (ilaçlama, gübreleme, sulama, budama, sürüm, ekim/dikim, hasat, diğer), tarih, not.
- [ ] **İlaçlama kaydı:** hangi ilaç, doz, **bekleme süresi (gün, kullanıcı girer — ilacın etiketinde yazar; uydurulmaz)** → "hasat en erken X". Depodan düşme isteğe bağlı.
- [ ] **Verim (ayrı bölüm):** tarla + yıl + ürün + miktar (kg/ton/kasa) → dönüm başı verim, yıllara göre.
- [ ] **Masraf (en önemlisi):** core/expenses; çiftçi türleri; tarla seçimi; veresiye; fiş fotoğrafı; Excel.
- [ ] **Gelir:** hasat satışı (tarla, ürün, miktar, fiyat/toplam, alıcı, tahsil: alındı / vadeli + vade günü); devlet desteği de gelir türü.
- [ ] **Borç ve vadeler:** kredi, kooperatif, bayi, tüccar alacakları, çek/senet: kime/kimden, tutar, vade günü, ödenen. Yaklaşan vadeler ana sayfada.
- [ ] **Devlet destekleri:** gelir türü + başvuru/son tarih hatırlatma (belgelerle).
- [ ] **Belge bitiş tarihleri:** ÇKS, TARSİM, kira sözleşmesi, ruhsat… (core documents tablosu).
- [ ] **Gübre/ilaç stoğu + Envanter (Depo):** malzemeleri tek tek ekle (adı, birimi, türü), sayısını uygulamadan − / + ile değiştir; ilaçlamada kullanılan stoktan düşebilir.
- [ ] **Aile kullanımı:** Mustafa'nın ve babasının ayrı hesabı, **ortak defter**; her kaydın yanında **kim girdi** görünür. Davet koduyla katılım.
- [ ] **Estetik:** arka plana güzel bir şey (hafif, tarla/doğa temalı), daha güzel düğmeler. **Uygulama hiç kasmasın** (hafif CSS, ağır gölge/bulanıklık yok, kütüphaneler gerektiğinde yüklenir).

## Sıra
1. Altyapı: migration (kim girdi `created_by`, borç/vade, depo, davet/aile, üye adı), ürüne göre yönlendirme (`/` ↔ `/ciftci`), babanın işletmesi.
2. Tarlalar + günlük + ilaçlama + verim
3. Masraf (ortak bileşene çevir) + Gelir
4. Borç/vadeler + destekler + belgeler
5. Depo/envanter (+ ilaçlamada stoktan düş)
6. Aile: davet kodu, kim girdi
7. Ana sayfa özeti + Excel + estetik + hız kontrolü
