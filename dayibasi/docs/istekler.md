# Mustafa'nın istekleri (sıradaki işler)

Yeni oturumda önce bunu oku. Yapılan işi `- [x]` yap, `docs/urun.md`'ye de işle.

## 1 Kasım 2026 (not alındı, henüz yapılmadı)

- [ ] **Ekibim'i ayır**
  - Bütün ekip listesi ayrı dursun.
  - Dayıbaşı **kendi listelerini** oluşturabilsin (ör. "Yarın Hasan Ağa'ya gidecekler", "Kınık minibüsü"). Bir kişi birden çok listede olabilir.
  - **Netleşti (Mustafa):** Dayıbaşının 50-60 kişilik **işçi havuzu** var ama her gün hepsi gelmiyor; herkese durmadan mesaj atmak saçma, kesin gelmeyecek biri listenin üstünde durmamalı.
    → Dayıbaşı havuzdan istediği kişileri (ör. 25) **aktif listeye** koyar. **Yoklama (Geliyor/Gelmiyor, Bekleyenlere sor, Gelenleri paylaş) yalnız bu liste üzerinden** yapılır.
    → Havuzdaki herhangi biri istendiği an aktif listeye eklenir / çıkarılır (tek dokunuş). Amaç karışıklığı en aza indirmek.
    → Ekibim'de iki görünüm: **Aktif liste** (açılışta bu) ve **Bütün ekip (havuz)**.
  - Sorulacak (tahminle kural koyma): birden çok kayıtlı liste mi (ör. "Kınık minibüsü", "Bergama"), yoksa tek bir aktif liste mi yeterli? Kayıt eklerken "Kimler gitti?" ekranında da önce aktif liste mi gösterilsin?
- [ ] **Estetik:** genel görünüm daha güzel olsun. Somut yön alınmadı; önce 2-3 seçenek (ekran görüntüsüyle) göster, Mustafa seçsin.
- [ ] **Hesap gönderme: seçerek gönder.** Toplu gönderimde (çiftçi ve işçi) kişilerin yanına seçim kutusu; "Seçilenlere gönder". Hepsini seç / hiçbirini seçme.
- [ ] **Takvim, uygun her yerde** (Mustafa: "ekleyebileceğin diğer yerlere de ekle"). Adaylar:
  - İşçi kartı: çalıştığı günler (aşağıda ayrıntı)
  - Çiftçi kartı: iş yapılan günler ve ödeme günleri (farklı işaret)
  - Kayıtlar ekranı: liste yerine/yanında ay takvimi, güne dokununca o günün kayıtları
  - Bugün ekranı: "Önceki gün" düğmesi yerine takvimden gün seçme
  - Puantaj sekmesi: ay takvimi (her günde o gün kaç kişi)
- [ ] **Kişi kartında takvim:** işçinin çalıştığı günler alt alta liste yerine **ay takvimi** olarak görünsün (çalıştığı günler işaretli; ay ileri/geri; güne dokununca o günün tarlası ve yevmiyesi). Ay toplamı (gün, kazanç) takvimin üstünde.

## Önceden konuşulan, bekleyen
- [ ] Yardımcı hesabı: davet koduyla girer; kayıt ve yoklama yapar, para ekranlarını göremez (RLS ile ledger kapalı). Not: events.data içinde yevmiye var, API'den görülebilir; ya ayrı tabloya taşı ya da kabul et.
- [ ] Sadeleştirme planı (Bugün ekranını toplamak, Raporlar sekmesi): Mustafa "karışık" demişti; Ekibim kısmen yapıldı.
- [ ] Gerçek kullanıma geçmeden: test hesaplarını sil (admin@ / ornek@dayibasi.test), şifre e-postası için SMTP (Resend), Supabase uyuma sorunu (ücretli plan ya da uyandırma), KVKK metni avukata.
- Erken (Mustafa: "daha çok erken"): kendi alan adı, dayıbaşılarla deneme.
