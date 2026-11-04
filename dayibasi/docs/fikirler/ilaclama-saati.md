# İlaçlama saati: hava durumuna göre "şimdi ilaç atılır mı?" (fikir, kod yok)

Durum: 4 Kasım 2026, Mustafa istedi, **kodlanmadı**. Önce bu not onaylanacak.

## Ne gösterir
- Tarlanın konumuna göre önümüzdeki 3 gün, **saat saat**: Uygun / Dikkat / Uygun değil. Renk tek başına anlam taşımaz; her kutuda yazı da var.
- En üstte tek cümle: "Bugün 06:00–10:00 ilaçlamaya uygun. Öğleden sonra rüzgâr artıyor."
- Bir saate dokununca nedeni: "Rüzgâr 22 km/sa: ilaç savrulur", "2 saat içinde yağmur: ilaç yıkanır".
- Altta küçük not: "Genel hava kuralı. İlacın etiketindeki koşul önce gelir."

## Neye bakar (Open-Meteo saatlik verisi, ücretsiz, zaten kullanılıyor)
Rüzgâr, ani rüzgâr (hamle), yağmur olasılığı ve miktarı (o saat ve sonraki 2–4 saat), sıcaklık, nem, gündüz/gece.

**Eşikler uydurulmayacak.** Aşağıdakiler yaygın kaynaklardaki genel değerler; Mustafa ya da bir ziraat mühendisi onaylayınca yazılacak. Kullanıcı ayarlardan değiştirebilecek.

| Ölçü | Uygun | Dikkat | Uygun değil | Neden |
|---|---|---|---|---|
| Rüzgâr | ~3–12 km/sa | <3 (durgun hava) ya da 12–18 | >18 ya da hamle >25 | savrulma; durgun havada ilaç havada asılı kalır |
| Yağmur | önümüzdeki 4 saatte yok | olasılık %30–50 | o saatte ya da 2 saat içinde yağmur | ilaç yıkanır |
| Sıcaklık | ~10–25 °C | 25–30 ya da 5–10 | >30 ya da <5 | buharlaşma / etkisizlik |
| Nem | >%50 | %40–50 | <%40 (sıcakla birlikte) | damla kurur |

Karar: en kötü ölçü kazanır (biri "uygun değil" ise saat uygun değil). Ardışık uygun saatler tek pencere olarak yazılır.

## Nereye konur (ilk sürüm)
1. **Özet'te yeni kart: "İlaçlama saati"** (Ekranımı düzenle'de aç/kapa, sıralanabilir; "Tarlacı" hazır görünümünde açık). Konumlu tarla yoksa kart "Tarlana konum ekle" der.
2. **Hava kartının altında tek satır**: "İlaçlama: bugün 06–10 uygun ›" → dokununca saat saat görünüm.

## Diğer sekmelere / modüllere bağlama (sonraki adımlar)
- **Tarlalar → İlaçlama işi girerken**: tarih/saat seçilince "Bu saat uygun / rüzgârlı" uyarısı; "En yakın uygun saat: yarın 07:00" önerisi. Kayıt sonrası "yağmur 3 saat sonra geldi" gibi geçmişe dönük not (ilaç tekrar gerekir mi uyarısı).
- **Takvim / hatırlatma**: "Pamuk ilaçlaması" hatırlatması kurulursa, o gün uygun pencere yoksa bir gün önce uyarı; uygun pencere başında bildirim (bildirim altyapısı gelince).
- **Hasat bekleme süresi** (zaten var): ilaçlama kaydından hasat tarihi hesaplanıyor; ilaçlama saati önerisi buna da yazılabilir.
- **Gübre (yaprak gübresi)**: aynı kurallar (yağmur ve rüzgâr) — Tarla işi "Gübreleme (yapraktan)" seçilince aynı uyarı.
- **Sulama**: yağmur bekleniyorsa "yarın yağmur var, sulamayı ertele" (aynı hava verisinden, farklı kural).
- **Hasat**: yağmur penceresi uyarısı (biçerdöver/kurutma).
- **Fidan modülü**: fidanlıkta ilaçlama aynı kart; sera/örtü altı için "dış hava geçerli değil" seçeneği.
- **Kümes / ahır**: ilaç değil ama **sıcak stresi** (yüksek sıcaklık + nem → havalandırma/su uyarısı) ve **don** (su hatları) aynı hava verisinden.
- **Makineler**: ilaçlama makinesi bakım kaydıyla ilişki (isteğe bağlı, düşük öncelik).
- **Çalışan modu**: çalışan da kartı görür ("bugün sabah 6–10 ilaç atılacak"); yönetici bir pencereyi "iş" olarak çalışana atayabilir (sonra).
- **Tanıtım sitesi**: "ilacın ne zaman atılacağını uygulama söyler" öne çıkan özellik olarak.

## Açık sorular (Mustafa'ya)
1. Eşikleri kim onaylayacak (ziraat mühendisi / kendi tecrübe)? Ürüne göre farklı olsun mu (ör. zeytin, bağ, pamuk)?
2. Gece ilaçlaması (arıları korumak için akşam) uygun sayılsın mı?
3. Kaç gün ileri? (öneri: 3 gün saat saat, sonrası günlük)
4. Bildirim istenir mi (telefona "şimdi uygun")? Bu ayrı bir altyapı ister.
