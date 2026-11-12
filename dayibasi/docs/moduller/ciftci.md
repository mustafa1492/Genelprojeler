# Çiftçi oturumu
**Kapsam:** `products/ciftci/` (App.tsx, screens/*, lists, kayit, sezon, rol, yetki, hava, disaAktar). Ortak masraf ekranı core'da (`core/expenses/ExpenseScreen.tsx`). · **Dal:** `modul/ciftci` · **Sınır:** ortak masraf ekranı, Özet, Menü, Ayarlar Core'da.

## Canlıda ne var
Tarlalar (köy/ilçe → hava, isteğe bağlı "Parsel sorgula" ile TKGM'den dekar/konum), tarla günlüğü (ilaçlama bekleme, sulama saat/kWh/su ücreti), verim, masraf (tarlalara böl, iş seçimi, fiş kutusu), gelir, borç-vade, belgeler, depo, makineler (bakım, motor saati, sonraki bakım), sezonlar + rapor, takvim + hatırlatmalar, kayıtlar, aile + yetkiler, bütün verimi indir, bölüm seçimi (Tarla/Fidan/Hayvancılık, bölüm renkleri). Ekranlarda "dekar" yazar. Fidan ayrı oturumda (fidan.md).

## Yapılacaklar (sırayla)
1. Bölümler 2. adım: masraf/gelir/rapor bölüme göre + "Hepsi" düğmesi (kayıtların hangi bölüme ait olduğu bugün işaretli değil; önce bu çözülecek).
2. Alt çubuk sabit 5 (Özet · bölüm ekranı · ＋ Ekle · Para · Menü) — TabShell, Core'un işi (core.md'de).
3. Taslaktaki ayrıntılar: renkli üst şerit, "Sadece bu bölüm / Hepsi" düğmeleri. Taslak: https://claude.ai/artifact/Qd73FHSfaVsLBGPA3Ua7SJ (yalnız Mustafa'ya açık).
4. Sadeleştirme (Kararlar'daki liste): Fiş+Fotoğraflar → Masraf, Kayıtlar+Geçmiş, tarihler Takvim'de, Sezonlar → Rapor, belge/fotoğrafa "neye ait" alanı.

## Mustafa'dan beklenenler
- Sadece fidancı ya da hayvancı defterde de girişte "Tarla" kartı çıksın mı? (Şu an Tarla her defterde açık sayılıyor; Hüseyin'e Tarla + Fidan iki kart çıkar.)
- Makine bakım uyarısı 7 gün kala çıkıyor (`config.remindDays.makine`); süre onaylanmadı.
- Makine sayfasında doğrudan "Bu makineyi çıkar" düğmesi istenir mi? (Şu an liste ekranındaki "Sil" ile.)
- Belgeler'den Geri başka ekrandan girince de Özet'e atıyor mu? Hangi ekrandan girildiği sorulmuştu (yalnız Makineler → Belgeler düzeltildi).

## Kararlar ve kalıcı bilgiler
- **Modül seçimi ve renkler (Mustafa, 10 Kasım 2026, çiftçi oturumundan):** Girişte büyük kartlarla seçim: 🌾 Tarla / 🌱 Fidan / 🐄 Hayvancılık (hayvancılık tek kart; içinde kümes, büyükbaş, küçükbaş). Sadece defterde açık modüller çıkar; tek modül varsa sorulmaz. Son seçilen hatırlanır, üstte "🌱 Fidan ▾" ile değiştirilir. Her modülün kendi rengi (üst şerit, düğmeler, alt çubuk). Para: modülde sadece o modülün masraf/geliri görünür, bir düğmeyle "Hepsi" (bütün masraflar/gelirler, toplam kâr). Ortak kalanlar: borç-vade, belgeler, aile, ayarlar. Ayrıca konuşulan sadeleştirme: Fiş+Fotoğraflar → Masraf, Kayıtlar+Geçmiş birleşir, tarihler Takvim'de toplanır, Sezonlar → Rapor, alt çubuk sabit 5 (Özet · Üretim · ＋ Ekle · Para · Menü), belge/fotoğrafa "neye ait" (tarla/makine/sürü) alanı. Önce telefon taslağı (resim) gösterilecek, Mustafa onaylayınca kod.
  - Ek (Mustafa, 10 Kasım): Seçim ekranında sadece hesaba açılmış modüller çıkar (ör. tarla + fidan açıksa yalnız o ikisi). Ortak kullanılabilen bölümler (masraf, gelir, depo, makineler, takvim, borç-vade, belgeler, rapor) **her modülün içinde** yer alır, kullanıcı modülden çıkmadan ulaşır; ayrı bir "ortak" alana gitmez. İlke: ulaşım kolaylığı en üstte, her şey en fazla 2 dokunuşta.
  - Telefon taslağı onaylandı, kodlamaya başlandı (Mustafa, 10 Kasım: "tasarımı üzerine de düşün, kodlamaya başlayabilirsin").
  - Ek (Mustafa, 10 Kasım): **Tarlalar, Depo ve Makineler ortak**: her modülde aynı tam liste (fidan da tarlada yetişir, traktör her işte kullanılır). Modüle göre ayrılan: modülün kendi işleri (fidan dikim/sayım, hayvan kayıtları, tarla işleri) ve masraf/gelir/rapor görünümü ("Hepsi" düğmesiyle tamamı).
- Alan birimi **dekar** (1 dekar = 1000 m²), ekranda "dönüm" yazılmaz; veri anahtarı `donum` aynı kaldı (Mustafa, 4 Kasım).
- Parsel sorgusu **isteğe bağlı**, kimse zorlanmaz; düğme adı "📄 Parsel sorgula (isteğe bağlı)" (Mustafa seçti, "Tapudan getir" yerine).
- Makine bakımı tarih + motor saatiyle tutulur; **motor saatine göre uyarı yok**, tavsiye saati yalnız makine sayfasında bilgi (Mustafa, 4 Kasım). Uygulamaya hazır bakım aralığı yazılmaz (marka/modele göre değişir).
- Kâr analizi, devlet destekleri, vergi kesintisi şimdilik yapılmayacak (Mustafa, 4 Kasım).
- Hayvan "Bugünün kaydı"nda ölü ile yem ayrı kartlarda olacak (Mustafa, 10 Kasım).
- Baban: `abdullahsedat`, "Aile defteri" (2 tarla: Mehmet Ağa'nın yeri 25 dönüm, Çayın kenarı 12 dönüm; 2026 mısır verisi girildi). Tarlalara köy girilmedi (hava görünmez).

## Saklanan fikirler
- Kâr analizi, devlet destekleri takibi, satışta vergi kesintisi: `docs/istekler.md` (şimdilik yapılmayacak; oranlar doğrulanmadan yazılmaz).
- Önerildi, seçilmedi: hasar kaydı (TARSİM), ortaklık/yarıcılık hesabı, her yıl tekrar eden hatırlatma, parsel sınırını haritada gösterme (uygulamayı ağırlaştırır).

## Günlük
- 2026-11-04: Parsel sorgula (TKGM, `tapu.ts`) ve "dönüm" → "dekar" yazıldı; PR #1 ile gelistirme'ye, sonra canlıya.
- 2026-11-04: TKGM servisi konteynerden denendi (alan "9.766,00", koordinat [boylam, enlem], olmayan parsel 404); ekrandan denenmedi.
- 2026-11-04: Makine bakımı yazıldı (`screens/Makineler.tsx`, `events.kind='makine'`, quantity = motor saati, tutar → "Traktör / makine" masrafı); canlıda, ekrandan denenmedi.
- 2026-11-04: Tarla düzenlerken kayıtlı ada/parsel görünüyor; canlıda.
- 2026-11-10: Makineler yalnız listedeki makineleri gösterir, Makineler → Belgeler → Geri Makineler'e döner, hayvan günlük kaydında Kayıp/Yem ayrı; canlıda.
- 2026-11-10: Bölüm seçimi 1. adım (`modul.tsx`, seçim `ko:modul:<defter>`, renk `--ana*`, başka bölüme özel sekmeler gizli); Core sonra düzeltmeler yaptı, canlıda; ekrandan denenmedi.
- Tuzak: `npx eslint` bu depoda yapılandırma bulamıyor (yalnız `npx tsc --noEmit` çalışıyor); notlarda çakışma olunca rebase yerine `git merge origin/gelistirme` daha kolay.
