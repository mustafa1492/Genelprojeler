# Mustafa'nın istekleri (sıradaki işler)

Yeni oturumda önce bunu oku. Yapılan işi `- [x]` yap, `docs/urun.md`'ye de işle.

> **3 Kasım 2026: Mustafa dayıbaşı işine ara verdi.** Odak çiftçi defteri. Aşağıdaki dayıbaşı maddeleri o geri dönene kadar bekler.

## 1 Kasım 2026 (not alındı, henüz yapılmadı)

- [x] **Ekibim'i ayır** (2 Kasım 2026: Bütün ekip + sınırsız liste, liste içinde yoklama, “Geliyor musun?” sor: listeden/çoklu liste/kişi seç + sadece cevap vermeyenler; Bugün'de liste düğmeleri. Tablo: `lists`, migration 0006)
  - Bütün ekip listesi ayrı dursun.
  - Dayıbaşı **kendi listelerini** oluşturabilsin (ör. "Yarın Hasan Ağa'ya gidecekler", "Kınık minibüsü"). Bir kişi birden çok listede olabilir.
  - **Netleşti (Mustafa):** Dayıbaşının 50-60 kişilik **işçi havuzu** var ama her gün hepsi gelmiyor; herkese durmadan mesaj atmak saçma, kesin gelmeyecek biri listenin üstünde durmamalı.
    → Dayıbaşı havuzdan istediği kişileri (ör. 25) **aktif listeye** koyar. **Yoklama (Geliyor/Gelmiyor, Bekleyenlere sor, Gelenleri paylaş) yalnız bu liste üzerinden** yapılır.
    → Havuzdaki herhangi biri istendiği an aktif listeye eklenir / çıkarılır (tek dokunuş). Amaç karışıklığı en aza indirmek.
    → Ekibim'de iki görünüm: **Aktif liste** (açılışta bu) ve **Bütün ekip (havuz)**.
  - **Netleşti:** dayıbaşı **istediği kadar liste** oluşturabilir (ör. iki farklı şehre işçi göndereceği zaman her şehir ayrı liste, ayrı ayrı görür). Her listenin kendi yoklaması (Geliyor/Gelmiyor, Bekleyenlere sor, Gelenleri paylaş) olur. Bir kişi birden çok listede olabilir; havuzdan tek dokunuşla listeye eklenir/çıkarılır.
  - **"Geliyor musun?" mesajı gönderirken seçim ekranı** (Mustafa: "bütün opsiyonları istiyorum"):
    - Bir liste seç → o listeye gönder
    - Birden çok liste seç (ör. 2 liste birlikte) → hepsine (aynı kişi iki listedeyse bir kez)
    - Bütün işçiler (havuz) arasından tek tek seç → seçilenlere gönder
    - Seçimden sonra mevcut "Bekleyenlere sor" akışı (WhatsApp sırayla açılır)
  - Varsayılan seçildi (Mustafa'ya söylendi): Bugün'de “Kimler gitti?”te liste düğmeleri var (listedeki gelenleri, yoksa hepsini seçer). Yoklama kişi başına tek (iki listede aynı cevap), uyarı gerekmiyor.
  - Eski not: kayıt eklerken "Kimler gitti?" ekranında önce seçili listenin kişileri mi gösterilsin? Aynı kişi iki listede "Geliyor" olursa uyarı verilsin mi?
- [ ] **Estetik:** genel görünüm daha güzel olsun. Somut yön alınmadı; önce 2-3 seçenek (ekran görüntüsüyle) göster, Mustafa seçsin.
- [ ] **Hesap gönderme: seçerek gönder.** Toplu gönderimde (çiftçi ve işçi) kişilerin yanına seçim kutusu; "Seçilenlere gönder". Hepsini seç / hiçbirini seçme.
- [ ] **Takvim, uygun her yerde** (Mustafa: "ekleyebileceğin diğer yerlere de ekle"). Adaylar:
  - İşçi kartı: çalıştığı günler (aşağıda ayrıntı)
  - Çiftçi kartı: iş yapılan günler ve ödeme günleri (farklı işaret)
  - Kayıtlar ekranı: liste yerine/yanında ay takvimi, güne dokununca o günün kayıtları
  - Bugün ekranı: "Önceki gün" düğmesi yerine takvimden gün seçme
  - Puantaj sekmesi: ay takvimi (her günde o gün kaç kişi)
- [ ] **Kişi kartında takvim:** işçinin çalıştığı günler alt alta liste yerine **ay takvimi** olarak görünsün (çalıştığı günler işaretli; ay ileri/geri; güne dokununca o günün tarlası ve yevmiyesi). Ay toplamı (gün, kazanç) takvimin üstünde.

## [x] Masraflar — YAPILDI (2 Kasım 2026; `core/expenses`, ekran `products/dayibasi/screens/Masraf.tsx`, migration 0007, fiş kovası `receipts`)
Ortak parça `core/expenses` (dayıbaşı + çiftçi defteri aynısını kullanır), ürün farkları config'te.
- **Yer:** alt menüde **ayrı sekme** (Bugün · Ekibim · Kayıtlar · Masraf · Alacaklar); Bugün'de küçük "+ Masraf".
- **Türler:** hazır liste (dayıbaşı: Yakıt, Şoför, Lastik, Tamir, Yemek, Diğer; çiftçi: Tohum, Gübre, İlaç, Mazot, İşçilik, Kira…) **+ kullanıcı kendi türünü ekler**.
- **Giriş:** tür → tutar → Kaydet (3 dokunuş); son tutar hazır düğme; tarih (bugün), not isteğe bağlı; Geri al; internetsiz.
- **Fiş/fatura fotoğrafı:** isteğe bağlı, **ilk sürümde var** (Supabase Storage, gizli kova, yalnız işletme üyeleri).
- **Veresiye:** masraf "Ödendi" ya da "Veresiye: kime" (ör. Petrol Ofisi, gübre bayisi). "Borçlu olduğum yerler" listesi, ödeyince kapanır (kısmi ödeme).
- **Dayıbaşına özel:** "Çiftçiye yansıt" (masraf çiftçinin borcuna eklenir, net kazançtan düşmez). Net kazanç = payın − masraflar (yansıtılanlar hariç).
- **Çiftçiye özel (sonra):** tarla/sezon bağlantısı, gelirle karşılaştırma.
- **Rapor:** ay / tarih aralığı, tür tür toplam + çubuk, liste; **gerçek .xlsx** (Masraflar + Özet sayfaları).
- 9. madde (abonelik) ertelendi.

## Para kuralları (Mustafa, 1 Kasım 2026) — hesap motorunu değiştirir, dikkat
- [ ] **Kasa / kilo başı ücret:** bazı hasatlarda yevmiye yerine kasa ya da kilo başına ücret. Kayıtta ücret türü seçilecek (günlük / kasa / kilo); kasa-kilo ise kişi başı ya da toplam miktar girilecek. Sorulacak: miktar kişi kişi mi tutulur, ekip toplamı mı? Dayıbaşı payı bu işlerde nasıl (kasa başı mı, sabit mi)?
- [ ] **Yarım gün / tam gün:** kayıtta kişi bazında yarım gün işaretlenebilsin. Sorulacak: yarım gün = yevmiyenin yarısı mı, ayrı bir tutar mı? Çiftçiye yansıyan da yarım mı, dayıbaşı payı da yarım mı?
- [ ] **Kişiye özel ücret:** ekipte 1-2 kişi diğerlerinden 100-200 TL fazla alabiliyor. Kayıtta o gün çalışanlar arasından kişi seçip ayrı ücret verilebilsin. **Netleşti:** farkı kimin ödediği seçilebilsin: **çiftçi öder (varsayılan)** ya da **dayıbaşı öder** (payından düşer).
- **İşçiden kesinti yok** (yol, yemek vb. dayıbaşının aldığı ücretin içinde). Kesinti özelliği yapılmayacak.
- [ ] **Dayıbaşının masrafları:** gün içinde çok kolay giriş (ör. "+ Masraf": Yakıt / Şoför / Lastik / Tamir / Yemek / Diğer → tutar → kaydet; tek ekran). Ayın istediği zamanında **liste ve toplam** (türe göre), net kazanç = payın − masraflar. **Masraf listesi tek dokunuşla Excel'e** (Mustafa istedi): istenen tarih aralığı, tür bazında ara toplamlar; mümkünse gerçek .xlsx (SheetJS), değilse mevcut CSV (`core/export/csv.ts`). **Netleşti:** bazı masraflar çiftçiye yansıtılabilir → masraf girerken isteğe bağlı "Çiftçiye yansıt: [çiftçi seç]"; yansıtılan masraf çiftçinin borcuna eklenir, dayıbaşının net kazancından düşmez.

## İşçi ve çiftçi tarafı
- [ ] **İşçi kendi hesabını görsün, hesap açmadan:** dayıbaşı WhatsApp'tan **kişiye özel gizli bağlantı** gönderir; işçi açınca yalnız kendi çalıştığı günleri (takvim), kazancını, avans ve kalanını görür. Giriş/şifre yok. Bağlantı dayıbaşı tarafından yenilenebilir/iptal edilebilir. (Güvenlik: tahmin edilemez uzun kod, salt okuma, KVKK metni.)
- [ ] **Çiftçi onayı:** Mustafa "farklı şekilde düşünmemiz gerekiyor" dedi; önerilen "akşam mesajla onay" yeterli değil. Yeni öneriler hazırlanıp sorulacak (ör. çiftçiye de gizli bağlantı: günleri görüp itiraz/onay; ya da haftalık özet).

## Planlama ve hatırlatıcılar
- [ ] **İş planı / hatırlatıcı bölümü (ayrı bölüm):** dayıbaşı istediği notu/veriyi serbestçe girer; tarihli olabilir (ör. "Hasan Ağa 5-10 Kasım 20 kişi istiyor", "Lastik değişecek", "Fatma Hanım'dan para alınacak"). Takvimde görünür (takvim isteğiyle birleşir); günü gelince hatırlatır. Çiftçi talebiyse isteğe bağlı kişi sayısı → o gün kaç kişi lazım / aktif listede kaç kişi var karşılaştırması.
- [ ] **Hatırlatma bildirimleri, özelleştirilebilir:** dayıbaşı hangi hatırlatmayı isteyeceğini ve saatini kendisi seçer (aç/kapat + saat). Adaylar: yoklama yapılmadı (ör. 19:00), bugünün kaydı girilmedi (ör. 21:00), geciken çiftçi borcu, iş planındaki notun günü geldi. Web Push (iOS'ta ana ekrana eklenmiş uygulamada çalışır; okey projesinde server/push.js örneği var). Sunucu tarafı zamanlayıcı gerekir (Supabase cron / Edge Function).

## Yapılmayacaklar (Mustafa: "bizi ilgilendirmez")
- Toplanma yeri/saati, tarla konumu.

## Abonelik
- [ ] **Abonelik biterse:** dayıbaşı eski verilerini **görmeye devam eder**, yalnız **yeni veri girişi kapanır** (ekleme/düzenleme düğmeleri kapalı + veritabanında yazma engeli). Abonelik altyapısı henüz yok.

## Dayıbaşıyla konuşulacaklar
Mustafa bilmiyor; gerçek bir dayıbaşına sorulacak. Cevap gelmeden bu kısımlar yapılmaz.
- **Kasa / kilo başı ücret nasıl işliyor?**
  - Hangi hasatlarda (zeytin, üzüm, domates…)?
  - Miktar kişi kişi mi sayılıyor, ekibin toplamı mı?
  - İşçi kasa başı mı alıyor, yoksa yine günlük mü alıyor da çiftçi dayıbaşına kasa başı mı ödüyor?
  - Dayıbaşı payı bu işlerde nasıl (kasa başı mı, sabit mi, yüzde mi)?
  - Kasayı/kiloyu kim sayıyor, nereye yazılıyor? (Tartışma çıkıyor mu?)
- Yarım gün: tam yevmiyenin yarısı mı? Çiftçinin ödediği ve dayıbaşı payı da yarım mı?
- Çiftçiyle hesap: anlaşmazlık en çok nerede çıkıyor? Çiftçi kayıtları nasıl görmek/onaylamak ister?
- Uygulamaya ayda ne öder, ödemeyi nasıl yapar?

## Gelecek ürün
- Müteahhit işçi ve masraf takibi: `docs/fikirler/06-muteahhit-isci-masraf-takibi.md`. Şimdilik başlanmaz; ama yeni özellikler `core/` altında genel yazılır.

- Çiftçinin sezon defteri (gelir-gider, hasat, Excel): `docs/fikirler/07-ciftci-sezon-defteri.md`.

## Amaç
"Bu insanların bütün işlerini kolaylaştırıp hepsini bir araya getirmek."

## Önceden konuşulan, bekleyen
- [ ] Yardımcı hesabı: davet koduyla girer; kayıt ve yoklama yapar, para ekranlarını göremez (RLS ile ledger kapalı). Not: events.data içinde yevmiye var, API'den görülebilir; ya ayrı tabloya taşı ya da kabul et.
- [ ] Sadeleştirme planı (Bugün ekranını toplamak, Raporlar sekmesi): Mustafa "karışık" demişti; Ekibim kısmen yapıldı.
- [ ] Gerçek kullanıma geçmeden: test hesaplarını sil (admin@ / ornek@dayibasi.test), şifre e-postası için SMTP (Resend), Supabase uyuma sorunu (ücretli plan ya da uyandırma), KVKK metni avukata.
- Erken (Mustafa: "daha çok erken"): kendi alan adı, dayıbaşılarla deneme.

## Yedek (ertelendi, 3 Kasım 2026)
- Mustafa: "acelemiz yok", proje daha profesyonel hale gelince yapılacak.
- İç yedek hazır ama uygulanmadı: `supabase/migrations/0013_yedek.sql` (her gece `yedek.gunluk`, 90 gün, pg_cron). Supabase MCP onayı Mustafa'ya düşmüyor; SQL Editor'den çalıştırılacak.
- Dış yedek (haftalık, şifreli, GitHub Actions → `yedek` dalı) Mustafa'nın açık izni gerekiyor ("dış yedeği kur, izin veriyorum"). Supabase Pro (25$/ay) pahalı bulundu.
- Plan: "Bütün verimi indir" düğmesi (çiftçi defteri, Özet bağlantıları). Tek Excel (tarlalar, masraflar, gelirler, tarla işleri, verim, depo, borçlar, belgeler, fidan) + geri yüklenebilir JSON. Kullanıcı iCloud/bilgisayarda saklar. Ücretsiz, yedeğin en kolay yolu.
- Plan (uzak): Supabase'ten kendi sunucuya taşıma. Büyük iş, aylık 5-10$; şimdilik değmez.

## Çiftçi defteri, 3 Kasım 2026 paketi (gelistirme dalında, yüklenmedi)
- [x] Bütün verimi indir (Excel + JSON yedek), masrafı tarlalara dönüme göre böl, geçen sezonla karşılaştırma (rapor), takvim + hatırlatmalar (Özet uyarılarında "Yapıldı"), sulama kaydı (yöntem, saat, sayaç kWh, su ücreti → masraf), hava durumu (köy/ilçe, Open-Meteo, don/yağmur/rüzgâr uyarısı), kim ne girdi kartı.
- [x] Çalışan modu: rol `calisan` (davet türü, Aile'de rol değiştir/çıkar). Para (masraf, gelir, borç, fidan maliyeti, geçmiş) veritabanında kısıtlayıcı politikalarla kapalı (0015). Tarla işi, verim, hatırlatma, depo, fiş yükleme açık.
- [x] Fiş kutusu: fotoğraf yükle → sahip Masraf'ta "Aç" ile masrafa çevirir. Yapay zeka okuma **sonra** (Claude API anahtarı gerekecek, Mustafa "şimdilik yapay zekasız" dedi).
- [ ] Devlet destekleri bölümü: araştırma `docs/fikirler/09-devlet-destekleri.md`, Mustafa'nın cevabı bekleniyor.
- [ ] Telefona bildirim (push) ile hatırlatma: sonra (sunucu zamanlayıcı gerekir).

## Tapudan tarla getirme (Mustafa, 4 Kasım 2026: listeye eklendi, sonra yapılacak)
- Tarla eklerken "Tapudan getir": il / ilçe / mahalle seç, ada + parsel yaz → TKGM parsel servisi (cbsapi.tkgm.gov.tr/megsiswebapi.v3, tarayıcıdan çağrılabiliyor, CORS açık) alan (m² → dönüm), nitelik, mevki, koordinat getirir; hava durumu konumu otomatik.
- Mevcut tarlalara ada/parsel girip güncelleme; istenirse parsel sınırı küçük haritada.
- Not: resmi açık servis değil, değişebilir; sadece kullanıcı tıklayınca sorgu. Hisseli tarlada alan parselin tamamı.

## Hayvancılık bölümü (Mustafa, 4 Kasım 2026: not alındı, henüz başlanmayacak)
- Tek "Hayvancılık" bölümü: kanatlı (sürü olarak), küçükbaş ve büyükbaş (küpe numarasıyla tek tek). Barınak listesi (kümes, ağıl, ahır); masraf, gelir, depo, takvim, çalışan modu ortak.
- Kanatlı: günlük ölüm/yem/yumurta, dönem kâr, yumurta ve gübre satışı, köy tavuğu sade modu, kuluçka, sözleşmeli yetiştirici karşılaştırması (rapor: docs/arastirma/reports/Kanatlı çiftlik modülü.md).
- Küçükbaş: hayvan kartı, koç katımı/kuzulama, kırkım, süt, otlatma/çoban, aşı şablonu, satış (kurban, kasap).
- Büyükbaş: hayvan kartı, kızgınlık/tohumlama/gebelik/tahmini doğum, kuruya ayırma, süt defteri (mandıra, süt parası), besi tartımı, sağlık ve süt/et arınma uyarısı, buzağı, rasyon maliyeti.
- Devlet: TÜRKVET bildirim hatırlatmaları (doğrudan bağlantı yok), destek takibi (tutar sabit yazılmaz), veteriner belgeleri.
- Tarla bağı: yem bitkisi hasadı depoya yem, gübre tarlaya; hayvan ve tarla gerçek maliyeti.
- Önerilen sıra: ortak iskelet + küçükbaş/büyükbaş kartı → süt defteri → kümes → yem bağlantısı ve hayvan başı kâr. Eşik ve takvimler Mustafa/veterinerden alınacak, uydurulmaz.
- Araştırma raporu: docs/arastirma/reports/Hayvancılık modülü ihtiyaçları.md (4 Kasım 2026). Fark yaratacaklar: ilaç arınma etiketi ("sütü tanka katılmaz, şu tarihe kadar satılmaz"), mandıra kontrolü (litre, yağ/protein, kesinti, yem borcu), çobanla ortak defter (çalışan modu). Sıra: hayvan kartı + olay kaydı + hatırlatma + arınma → süt defteri, satış bağlantısı → besi, yem stoğu, çoban hesabı, verimsiz hayvan → sesli kayıt, küpe okuma.
- Mustafa'ya sorulacak: ilk sürüm inek mi koyun-keçi mi; mandıralar süt parasını nasıl hesaplıyor; çobana ödeme şekli; ortaklı sürü yaygın mı; varsayılan süreler (gebelik, kuruya, aşı yaşı) onayı. Mevzuat/destek araştırması yarım kaldı (TÜRKVET bildirim süreleri, 2026 destekleri).

## Nisan öncesi (gerçek kullanıma açmadan) — hatırlatılacak
- Yedek (gece yedeği + dış kopya), deneme hesaplarını silme, şifre sıfırlama e-postası (SMTP), KVKK metni, Supabase uyku çözümü (ping görevi ya da Pro), kısa güvenlik kontrolü, yayından önce test (Mustafa'ya sorulacak).
- Mağaza: önce Android (Google Play, bir kerelik ~25$, TWA/PWABuilder ile paket; yeni kişisel hesapta 12 kişi × 14 gün kapalı test gerekir; kimlik + gizlilik politikası). iPhone (yıllık ~99$, Mac/bulut derleme, ret riski) sonra.

## Mustafa kararları (4 Kasım 2026)
- Tanıtım (pazarlama) web sitesi kurulacak: özellikleri anlatan sayfa. Alan adı ertelendi.
- Paketler: basit / orta / tam gibi; ücret pakete göre. (Paket içerikleri sonra konuşulacak.)
- Destek: uygulama içinde kısa videolar; iş büyürse Mustafa ilgilenir, daha büyürse ekip.
- Dayıbaşı ve diğer modüller: ayrıca hak harcanmayacak; başka bir iş yaparken az ek eforla oraya da uygulanabiliyorsa yapılır (Claude bunu fırsat görünce söyler).
- Tanıtım sitesi tasarımı: Mustafa'nın attığı sitelerden (Dribbble/Contra örnekleri) bakılacak.
- Claude: bir işi başka bağlayıcı/skill ile daha iyi yapabileceğini düşünürse önce Mustafa'ya sorar.
- İleride "agent paketi" hazırlanacak (Claude yönetir/kontrol eder): öneri listesi aşağıda, onay bekliyor.
