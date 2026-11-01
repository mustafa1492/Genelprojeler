# Claude Code'a geçiş — ilk adım

## 1. Klasörü hazırla
1. Bu zip'i bilgisayarında bir klasöre aç (ör. `Belgeler/dayibasi`).
2. İstersen GitHub'da boş bir depo aç ve klasörü oraya yükle (Claude Code'u web'den kullanacaksan gerekli).

## 2. Hesapları aç
- **Supabase:** supabase.com'da ücretsiz hesap ve yeni bir proje. Proje adresi ve anahtarları Claude Code isteyince vereceksin.
- **Node.js:** bilgisayarında yoksa nodejs.org'dan LTS sürümü.

## 3. Claude Code'da ilk mesaj
Claude Code'u bu klasörde aç ve aşağıdakini olduğu gibi yapıştır:

```
CLAUDE.md dosyasını ve docs/ klasörünü baştan sona oku; docs/tasarim/demo-ekranlar.dc.html
dosyasına da bak, ekranların görünümü ve davranışı bu demoyla aynı olacak.

Sonra şunları sırayla yap, her adımın sonunda bana kısaca ne yaptığını söyle:
1. Bu klasörde Next.js (App Router, TypeScript) projesini kur; CLAUDE.md'deki klasör
   düzenine uy (core/ ve products/dayibasi/).
2. Supabase bağlantısını kur; supabase/migrations/0001_core.sql dosyasını uygula.
   Supabase bilgilerini benden iste.
3. core/ui altında ortak bileşenleri yap: büyük ana düğme, seçim düğmesi, − / + sayaç,
   durum etiketi, uyarı kartı, onay cümlesi kartı, alt menü. Renkler ve ölçüler
   docs/tasarim/kurallar.md'de.
4. Giriş ve "işletmeni oluştur" ekranı (create_business fonksiyonu).
5. Ekibim ekranı: core/people ile kişi kartı listesi, ekleme ve düzenleme;
   etiketler ve özel alanlar products/dayibasi/config.ts'ten gelsin.

Kurallar: kullanıcılar teknolojiye alışık değil (CLAUDE.md Kural 2); ortak kodu
core/ altında tut ama dayıbaşı işini geciktirme (Kural 1). Şimdilik bu kadar,
sonraki ekranlara (Arabalar, Bugün, Alacaklarım) ben söyleyince geçeceğiz.
```

## 4. Sonraki oturumlar için sıra
1. Arabalar + kâğıt takibi (core/assets + core/documents)
2. Bugün: kayıt ekleme 3 adım + uyarılar (core/events)
3. Alacaklarım + hesabı WhatsApp'tan gönder (core/ledger + core/messaging)
4. Akşam yoklaması (rsvps + wa.me mesajları)
5. Telefona yükleme (PWA) ve yayına alma

Her oturuma "CLAUDE.md'yi oku, kaldığımız yerden devam: <sıradaki iş>" diye başla.
