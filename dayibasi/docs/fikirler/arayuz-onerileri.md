# Çiftçi Defteri: arayüz inceleme önerileri (4 Kasım 2026)

Görüntüler: `/tmp/claude-0/-home-user-Genelprojeler/077d145b-e7db-515a-85b2-231c5263a3a9/scratchpad/arayuz/img/` (94 dosya; adlar `t390-*`, `t320-*` (büyük yazı açık), `d1366-*`, `d1920-*`, `*-giris-*`, `*-ekle*`).
Otomatik ölçüm (16px'ten küçük yazı, 44px'ten küçük dokunma hedefi, yatay taşma): `.../arayuz/olcum.json`. Betik: `.../arayuz/gez.js` (sahte Supabase, port 3124).
Not: Uygulama kökte yaklaşık 16,8px yazı kullanıyor. "0.9em" = 15,1px, "0.85em" ≈ 14,2px, "0.8em" ≈ 13,3px, kart başlıkları ise 12,5px.

## 1. Genel değerlendirme
**Telefon (390):** Sade ve tutarlı. Ana düğmeler büyük ve yeşil, masraf ekleme akışı ("Ne için harcadın?", ardından "Kaç TL?") Kural 2'ye çok uygun. Hiçbir ekranda yatay taşma yok. Asıl sorun ikincil yazılarda: alt başlıklar, kart etiketleri (Gelir/Masraf/Borç), notlar ve çipler sistemli olarak 12,5-15px arasında kalıyor. Birkaç küçük dokunma hedefi var (Sezon ▾, Takvim ›, onay kutuları). Ekran başlıklarının düzeni de ekrandan ekrana değişiyor.
**Küçük telefon (320 + büyük yazı):** Özet'teki hızlı düğmelerin yazıları kesiliyor ("+ Gelir", "Tarla işi", "Fiş"). En ciddi taşma sorunu bu.
**Bilgisayar:** Yan menü iyi çalışıyor. Ama içerik telefon düzeninin genişletilmiş hâli: Özet'te ekranın yarısı boş, 1920'de içerik ortada dar bir şerit. 1366x900'de yan menünün altı (Listeler, Ayarlar) ekrandan taşıyor.

## 2. Ekran ekran bulgular
Kısaltmalar: Ö = öncelik (Y/O/D), İ = iş büyüklüğü (k/o/b). [K2] = Kural 2 aykırılığı.

### Ortak (bütün ekranlar): `core/ui/ui.css`, `core/shell/TabShell.tsx`
1. **[K2] Yazı 16px'in altında.** Etkilenenler: `.ui-note` (14,2px), `.ui-chip` (14,2px), `.ui-history` "Geçmiş" (13,3px), `.ui-back` (15,1px), ekran üst alt başlıkları ("4 tarla", "Kasım 2026", "Kredi, kooperatif…", 13,3px) ve `.ui-pill` (13,3px, ör. "Vadesi geçti", "Bugün girilmedi"). Yaşlı göz için asıl bilgiyi taşıyan satırlar bunlar: tarla ayrıntısı, vade tarihi. **Öneri:** bu sınıflarda tabanı 1em (16,8px) yapın, alt başlıkları ise en az 1em. Ö:Y İ:k.
2. **Başlık düzeni tutarsız.** Bazı ekranlarda (Tarlalar, Masraf, Kümes) sağ üstte "Geçmiş" düğmesi var ama geri yok. Bazılarında (Takvim, Vadeler, Rapor, Makineler) "‹ Özet" geri bağlantısı ve alt başlık var. Geçmiş ekranında ise "Geri" yazıyor. Kullanıcı "nasıl geri dönerim" diye arar. **Öneri:** tek başlık bileşeni: solda geri (Menü'den açılan ekranlarda), ortada büyük başlık, sağda Geçmiş. Geri yazısı her yerde aynı olsun. Ö:O İ:o.
3. **Sezon çipleri ("2026", "+ Sezon aç").** Tarlalar, Gelir, Özet ve Rapor'da en üstte duruyor. Ekranın ana işinden önce gelen ve az kullanılan bir seçim bu. "+ Sezon aç" yanlışlıkla basılmaya açık. **Öneri:** tek sezon varken çipi gizleyin, "+ Sezon aç"ı Ayarlar → Sezonlar'a taşıyın. Ö:O İ:k. (`products/ciftci/screens/Sezonlar.tsx` ve sezon seçici bileşeni)
4. **Tam sayfa görüntülerde alt çubuk sayfanın ortasına biniyor.** Uzun ekranlarda (Ayarlar, Vadeler, Düzenle, Rapor) en alttaki içeriğin altında çubuk payı olduğunu doğrulayın. Gerçek kaydırmada sorun görmedim, ama son öğenin çubuk altında kalmadığını telefonda bir kez elle kontrol edin. Ö:D İ:k.

### Özet: `products/ciftci/screens/Ana.tsx` (`t390-ozet.png`, `t320-ozet.png`, `d1366-ozet.png`)
5. **[K2] Kâr kartında küçük yazılar ve küçük düğme.** "Gelir/Masraf/Borç" etiketleri 12,5px, "2026 kârı" 13,6px. "Sezon ▾" düğmesi 72x30, göz düğmesi 46x39 (ikisi de 44'ün altında). Sezon düğmesi ayrıca basınca dönemi döngüyle değiştiriyor ama açılır menü gibi görünüyor (▾). **Öneri:** etiketleri 1em yapın. Dönemi dört seçenekli bölünmüş düğmeyle (Sezon / Bu ay / Bu yıl / 30 gün) seçtirin ya da en az 44px yükseklik verin. Göz düğmesine "Gizle" yazısı ekleyin. Ö:Y İ:k.
6. **[K2] 320px ve büyük yazıda hızlı düğmeler taşıyor** ("+ Gelir", "Tarla işi" kesik, `t320-ozet.png`). **Öneri:** dar ekranda 4 sütun yerine 2x2 ızgara kullanın (`.ozet-hizli` için `@media (max-width:360px)` ya da `.buyuk-yazi` kuralı). Ö:Y İ:k.
7. **"Takvim ›" bağlantısı 57x19.** Dokunma hedefi çok küçük. Ö:O İ:k.
8. **"Bir karta uzun basarak…" ipucu.** Uzun basma, bu kullanıcı kitlesinin keşfedemeyeceği bir hareket. Ayrıca ipucu her açılışta görünüyor. **Öneri:** ipucunu birkaç kez gösterdikten sonra gizleyin, ana yol "Ekranımı düzenle" olarak kalsın. Ö:D İ:k.
9. **Borç kâr kartında beyaz rakamla, kârla aynı ağırlıkta duruyor.** Borç bir dönem değeri değil, toplam borç. "Kâr - borç" gibi okunabilir. **Öneri:** "Toplam borcun" diye ayrı satıra alın. Ö:D İ:k.

### Menü (alt "Menü" tuşu): `core/shell/TabShell.tsx` (`t390-menu.png`, `t320-menu.png`)
10. Kutucuklar ve liste düzgün, taşma yok. Bölüm başlıkları ("TARLA VE ÜRETİM", "PARA") küçük ve büyük harfle yazılmış. Bunları 1em ve normal harfle yazın. Ö:D İ:k.
11. "Fiş yükle" Para bölümünde, "Geçmiş" Defter bölümünde. Öte yandan Özet'te de Geçmiş düğmesi var ve "Fiş" hızlı düğmesi de mevcut. Tekrarlar kafa karıştırmıyor, sorun yok.

### Ayarlar: `products/ciftci/screens/Ayarlar.tsx` (`t390-ayarlar.png`)
12. **Profil kartı "Ben" ve "B" harfi gösteriyor.** Kullanıcının adı (Mustafa) görünmüyor. **Öneri:** üyelikteki `display_name`'i gösterin. Ö:O İ:k.
13. **[K2] Satır açıklamaları küçük** (12,5-13px: "Davet, kim ne görebilir" vb.), bölüm başlıkları 12,5px. Ö:O İ:k.
14. **[K2] "Tutarları gizle" onay kutusu 24x24.** **Öneri:** iki seçenekli büyük düğme ya da 56px'lik açma-kapama anahtarı kullanın ve satırın tamamını basılabilir yapın. Ö:Y İ:k.
15. **"Döviz karşılığı" seçenekleri dikey ve çok yer kaplıyor** (3x56px). Yatay bölünmüş düğme yeter. "Döviz karşılığı" adı da biraz teknik. **Öneri:** "Dolar/Euro olarak da göster". Ö:D İ:k.
16. **"Büyük yazı" ayarı Ayarlar'ın ilk ekranında görünmüyor.** Bu kitle için en önemli görünüm ayarı. **Öneri:** Görünüm bölümünün en üstüne alın. Ö:O İ:k.

### Ekranımı düzenle: `products/ciftci/screens/Duzenle.tsx` (`t390-duzenle.png`)
17. **[K2] Alt çubuk seçicilerinde yazılar kesik** ("Tarlal", "Masra") ve dar `select` kutuları kullanılıyor. Telefonda yerel açılır liste, bu kitle için zor. **Öneri:** her yeri tam genişlikte bir satır olarak gösterin ("1. yer: Özet ›"), dokununca seçenekler büyük düğmeler olarak açılsın. Ö:Y İ:o.
18. **[K2] Kart açıklamaları 12,5px, onay kutuları 24px.** Yukarı/aşağı ok düğmeleri de 44px civarında. Ö:O İ:k.

### Tarlalar ve ekleme: `products/ciftci/screens/Tarlalar.tsx` (`t390-tarlalar.png`, `t390-tarlalar-ekle.png`, `d1920-tarlalar.png`)
19. **[K2] Zarar yalnızca kırmızı renk ve eksi işaretiyle anlatılıyor** ("-29.000 TL"). **Öneri:** yanına "zarar" ya da "kâr" yazın ("29.000 TL zarar"). Ö:Y İ:k.
20. **Kart ayrıntısı 14,2px ve iki satıra kırılıyor** ("…gelir 96.000 / TL"). **Öneri:** TL ile sayıyı bölünmeyen boşlukla birleştirin, masraf ve gelir için ayrı satır kullanın. Ö:O İ:k.
21. "Dekar" kelimesi doğru. Menüde ve tarlalarda "dönüm" ile karışma olup olmadığına bakılmalı (veri `donum` alanında). Ö:D.

### Masraf ve ekleme: `products/ciftci/screens/Masraf.tsx` (`t390-masraf.png`, `t390-masraf-ekle.png`, `t390-masraf-ekle2.png`, `d1366-masraf.png`)
22. Tür seçimi çok iyi ("son: 4.200 TL" ipucu faydalı). Ancak **[K2] "son: …" yazısı 12,8px.** Ö:O İ:k.
23. **"Türleri düzenle" tür kartlarıyla aynı görünümde.** Yanlışlıkla bir tür sanılarak basılabilir. **Öneri:** ızgaranın altında ayrı, küçük ve ikincil bir bağlantı yapın. Ö:O İ:k.
24. **Tutar ekranında yer kaplayan bölümler.** "Tarlalara böl" diğer tarla çipleriyle aynı görünümde ama bir eylem. "Hangi iş için? Genel (hepsi) / Fidan / + Yeni iş" ifadesi belirsiz ve teknik. "Depoya da ekle" onay kutusu 24px. **Öneri:** "Tarlalara böl"ü kesik çizgili ayrı bir düğme yapın. Tek iş varken "Hangi iş için?" satırını gizleyin. Onay kutusunu 56px'lik bir satıra dönüştürün. Ö:O İ:k.
25. **"Tarih, not, veresiye, çiftçiye yansıt, fiş fotoğrafı…" bağlantısı.** Uzun, iki satıra kırılıyor ve "çiftçiye yansıt" anlaşılmıyor. **Öneri:** "Daha fazla (tarih, not, veresiye)" diye kısaltın. Ö:O İ:k.
26. **"Ay ay / Sezon" seçicisi ve ay çipleri.** Bilgisayarda düzgün. Telefonda ay çipleri yatay kaydırılıyor ama kaydırılabildiği belli değil. Ö:D İ:k.

### Gelir: `products/ciftci/screens/Gelir.tsx` (`t390-gelir.png`, `t390-gelir-ekle.png`)
27. **[K2] Özet kutusundaki "Alınan / Alınacak" etiketleri 12,4px.** Ö:O İ:k.
28. **Ekleme ekranında "Hasat satışı" deniyor, listede "Ürün satışı" yazıyor.** Aynı şeye iki farklı ad verilmiş. Ö:O İ:k.

### Depo: `products/ciftci/screens/Depo.tsx` (`t390-depo.png`)
29. **[K2] Birim ("litre", "çuval") 12px.** Birim miktarın parçası, sayıyla aynı büyüklükte olmalı. Ö:O İ:k.

### Makineler: `products/ciftci/screens/Makineler.tsx` (`t390-makineler.png`)
30. **Bakım satırında "1.200 saat" yazıyor ama veri bir tutar.** Örnek veride `quantity` = 1200 TL olarak girildi, ekranda "saat" olarak gösteriliyor. Gerçek veride saat mi tutar mı olduğu doğrulanmalı. Etiket yoksa "motor saati: 1.200" gibi açık yazılmalı. Ö:O İ:k.

### Fidan, Büyükbaş, Küçükbaş, Kümes: `products/ciftci/screens/Fidan.tsx`, hayvan modül ekranları (`t390-fidan.png`, `t390-buyukbas.png`, `t390-kucukbas.png`, `t390-kumes.png`)
31. **[K2] "Kümes bilgileri ›" 326x22, "Satılan ve ölenleri göster" ve "Süreler (gebelik…)" 358x22.** Yazı bağlantıları çok ince dokunma hedefleri. **Öneri:** en az 48px yükseklik verin. Ö:Y İ:k.
32. **Fidan özet kutusunda etiketler 12,4px.** "0 aktif parti" yazıyor: "parti" teknik bir kelime, "dikim" denmeli. Ö:O İ:k.
33. **Kümes'te "Bugün girilmedi" rozeti 13,3px.** İyi bir uyarı ama gri renkte ve dikkat çekmiyor. Ö:D İ:k.
34. **Büyükbaş/Küçükbaş sekme çipleri ("Hayvanlar / Ahırlar ve sürü") 14,2px.** Kümes'teki "Sürü kartı" ile adlandırma tutarlılığı gözden geçirilmeli. Ö:D.

### Takvim: `products/ciftci/screens/Takvim.tsx` (`t390-takvim.png`)
35. **[K2] Günlerdeki işaretler yalnızca renkli nokta** (kırmızı = vade, turuncu = hatırlatma). **Öneri:** noktanın yerine ya da yanına küçük simge veya sayı koyun, takvimin altına "● vade ● iş" açıklaması ekleyin. Ö:Y İ:k.
36. **Gün adları ("Pzt") 12px.** Ayrıca seçili gün işi ("Bu gün kayıt yok") takvimin altında kalıyor ve telefonda görünmüyor. **Öneri:** "Bugün" ve yaklaşanlar listesini takvimin üstüne alın ya da listeyi varsayılan görünüm yapın. Ö:O İ:o.

### Rapor: `products/ciftci/screens/Rapor.tsx` (`t390-rapor.png`)
37. **[K2] Telefonda tablolar sağdan kesiliyor.** Gelir tablosunda tutar sütunu "18.5…" diye görünüyor. Tarla tablosunda "16.800 / TL" alt satıra kırılıyor. **Öneri:** telefonda tablo yerine kart listesi kullanın (bir kayıt = bir kart), tablo yalnızca bilgisayarda ve yazıcıda kalsın. Ö:Y İ:o.
38. **İçerik sırası.** "PDF olarak kaydet / Excel" düğmeleri ve uzun PDF açıklaması (14px) en üstte. Kâr ise aşağıda kalıyor. **Öneri:** önce kâr kutuları gelsin, paylaşım düğmeleri en alta insin. Ö:O İ:k.
39. **"Kâr / zarar" kutusu yalnızca yeşil zeminle ayrılıyor.** Zarar olduğunda yazıyla belirtilmeli ("zarar"). Ö:O İ:k.

### Vadeler: `products/ciftci/screens/Vadeler.tsx` (`t390-vadeler.png`)
40. Kartlar iyi düzenlenmiş, "Vadesi geçti" yazısı var, düğmeler büyük.
41. **Aynı alacak iki kez görünüyor olabilir.** Örnek veride TMO 36.000 TL hem `dues` tablosunda hem gelirdeki kalan alacakta (`due_on`) vardı ve ekranda iki ayrı kart çıktı. Gerçek kullanımda çift sayım riski olup olmadığı kontrol edilmeli. Ö:O İ:o.
42. **"Tahsil ettim" biraz resmî.** "Parayı aldım" daha açık. Ö:D İ:k.
43. **[K2] "Borcun / Alacağın" etiketleri 12,4px.** Ö:O İ:k.

### Kayıtlar, Belgeler, Aile, Listeler, Geçmiş: ilgili `products/ciftci/screens/*.tsx`
44. Kayıtlar: "Ara (isteğe bağlı)" ifadesi gereksiz, "Ara" yeterli. Not yazısı 14px. Ö:D İ:k.
45. Aile: "görüp" ve "değiştirebileceğini" kelimeleri ayrı vurgulu öğeler ama 14px. Rol çipleri ("Aileden biri (her şeyi görür)") 14,2px. Ö:O İ:k.
46. Listeler: "10 seçenek" sayaçları 13,6px. Ö:D İ:k.
47. Geçmiş: geri bağlantısı "Geri" yazıyor, diğer ekranlarda "Özet". Tutarlı hâle getirin (bkz. madde 2). Ö:D İ:k.
48. Belgeler (boş): alt başlık 13,3px. Boş durumda büyük bir "+ Belge ekle" düğmesi ve tek cümlelik açıklama olmalı. Ö:O İ:k.

## 3. Bilgisayar görünümü önerileri: `core/ui/ui.css`, `core/shell/TabShell.tsx`, `core/ui/DeskTable.tsx`
- **Özet (`d1366-ozet.png`):** ekranın sağ yarısı boş. Bilgisayarda iki sütunlu ızgara kullanın. Sol: kâr kartı ve yaklaşanlar. Sağ: son kayıtlar, tarlalara göre kâr (Tarlalar verisi zaten var) ve borç özeti. Kart içerikleri mevcut verilerden gelir, yeni özellik gerekmez. Ö:Y İ:o.
- **1920 genişlik (`d1920-*.png`):** içerik ortada dar bir şerit. `max-width`'i yaklaşık 1400px'e çıkarın. Tarlalar'ı kart ızgarası (2-3 sütun) ya da masraf/gelir/kâr/dekar başı sütunlu bir tablo yapın (`DeskTable` hazır). Ö:O İ:o.
- **Yan menü 1366x900'de taşıyor** ("Listeler" yarım görünüyor, "Ayarlar" ekran dışında). Satır aralığını sıkıştırın ya da Ayarlar'ı menünün altına sabitleyin. Ayrıca menü öğeleri 37px yüksek (fare için yeterli, ama dokunmatik dizüstüler için 44px önerilir). Ö:O İ:k.
- **Masraf:** bilgisayarda ana düğme sol üstte 300px genişliğinde. Tablo düzgün. Tablonun üstüne tür ve tarla süzgeci eklemek yerine mevcut "Ay ay / Sezon" seçimini başlık satırına alın ki dikey yer kazanılsın. Ö:D.
- **Rapor:** bilgisayarda tablolar tam genişlikte ve okunaklı. Burada "Tarla tarla" tablosunu en üste almak faydalı olur.
- Bilgisayarda "Geçmiş" düğmesi yan menüde de var: başlıktakini kaldırmak mümkün.

## 4. Giriş ekranı (`core/auth/AuthGate.tsx`; görüntüler `t390-giris-ciftci.png`, `d1366-giris-ciftci.png`, `*-giris-kok.png`)
**Sorunlar:**
- Kimlik yok: uygulama logosu (bilgisayardaki yan menüde var) ve sıcak bir karşılama görseli eksik. Ekran sıradan bir form gibi duruyor.
- **[K2]** Alan etiketleri, "Şifremi unuttum" ve "Yeni hesap aç" 15,1px, "Kişisel verilerin korunması" 13,3px. "Şifremi unuttum" bir bağlantı ve yüksekliği 44px civarında.
- "E-posta ya da kullanıcı adı" ifadesi bu kullanıcı için soyut. Çoğu kişi Mustafa'nın verdiği kullanıcı adıyla girecek.
- Şifreyi göster/gizle düğmesi yok. Yanlış yazılan şifre, destek aramasının en sık nedeni.
- Bilgisayarda form üst kenara yapışık, ekranın dörtte üçü boş. `/` ve `/ciftci` aynı görünüyor.
- "Hesabın yok mu? Yeni hesap aç" bağlantısı, çiftçinin kendi başına hesap açmasına davet ediyor. Asıl yol ise davet. Bu metin yanlış beklenti yaratabilir.

**Seçenekler:**
A. **Sade ve sıcak (küçük iş):** üstte logo ve "Çiftçi Defteri", altında "Tarlanın defteri cebinde" gibi tek cümle. Etiketler 1em, "Kullanıcı adın" + küçük not "(ya da e-postan)". Şifre alanında "Göster" düğmesi. Bağlantılar 48px'lik ikincil düğme. Bilgisayarda form dikey ortada, kart içinde.
B. **İki sütun (bilgisayar için, orta iş):** solda yeşil panel, logo ve üç kısa madde ("Masrafını yaz", "Kârını gör", "Ailenle paylaş"), sağda form. Telefonda A seçeneğine döner.
C. **Adım adım (orta-büyük iş):** önce yalnızca kullanıcı adı ve "Devam", sonra şifre. Her adımda tek iş ve büyük yazı olur. "Şifremi unuttum" ikinci adımda görünür. Kural 2'ye en uygun seçenek bu ama giriş süresi bir dokunma uzar.
Öneri: A'yı hemen yapın, bilgisayar için B'yi ekleyin.

## 5. Hızlı kazanımlar (en çok fayda, en az iş)
1. `.ui-note`, `.ui-chip`, `.ui-pill`, `.ui-history`, alt başlık ve kart etiketlerinde tabanı 1em yapın: `core/ui/ui.css`.
2. Tarlalar ve Rapor'da zarara "zarar" yazısı ekleyin: `Tarlalar.tsx`, `Rapor.tsx`.
3. 320px ve büyük yazıda hızlı düğmeleri 2x2 dizin: `ui.css` / `Ana.tsx`.
4. Takvim noktalarının yanına açıklama ve simge koyun: `Takvim.tsx`.
5. Yazı bağlantılarına ("Kümes bilgileri ›", "Takvim ›", "Süreler…") en az 48px yükseklik verin: `ui.css` `.ui-link`.
6. Onay kutularını 56px'lik satırlara çevirin (Tutarları gizle, Depoya da ekle, Düzenle listesi): `ui.css`.
7. Kâr kartındaki "Sezon ▾" ve göz düğmesini büyütün, göze yazı ekleyin: `Ana.tsx`.
8. Ayarlar'da gerçek adı gösterin ve "Büyük yazı"yı en üste alın: `Ayarlar.tsx`.
9. "Hasat satışı" ve "Ürün satışı" adlarını birleştirin, "Türleri düzenle"yi ikincil bağlantı yapın: `Gelir.tsx`, `Masraf.tsx`.
10. Giriş ekranı A seçeneğini uygulayın (logo, büyük etiketler, şifre göster, ortalama): `core/auth/AuthGate.tsx`.
