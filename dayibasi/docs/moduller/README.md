# Modül oturumları (her oturum önce bunu, sonra kendi dosyasını okur)

Proje: Çiftçi Defteri (Next.js + Supabase, depo `mustafa1492/genelprojeler`, klasör `dayibasi/`). Canlı: https://genelprojeler.vercel.app, panel: /panel. Ayrıntılı kurallar: `dayibasi/CLAUDE.md`, istekler: `docs/istekler.md`, plan: `docs/plan/is-plani-ve-maliyet.md`.

## Ortak kurallar (Mustafa)
- Cevaplar kısa ve Türkçe. Kural/para/süre uydurma: sor. Gerçek veriyi silmeden/değiştirmeden önce sor.
- **Kullanım hakkı korunur:** test sadece gerektiğinde ve Mustafa'ya sorarak (yayın öncesi, para hesabı, yetki/veritabanı, giriş/internetsiz kayıt değişince). Derin araştırma yok (istenmedikçe). İşleri tek seferde yap, gereksiz dosya okuma.
- **Aynı anda tek oturum kod yazar.** Ortak parçalara (`core/`, `app/layout`, `next.config`, veritabanı kuralları) sadece Core oturumu dokunur; diğerleri küçükse yapıp söyler, büyükse `core.md` "Bekleyen istekler"e not bırakır.
- Her oturum kendi dalında: `modul/<ad>` (Core: `gelistirme`). **Canlıya (main) sadece Core gönderir**, Mustafa "yükle" deyince.
- Commit sonuna şunu ekle:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Dokümanda/testte değişiklikte commit mesajına `[skip ci]`.
- Daha iyi bir bağlayıcı/skill uygunsa önce Mustafa'ya sor.
- Oturum bitince kendi modül dosyasını güncelle (Nerede kaldık / Sıradaki).
- Veritabanı: `execute_sql` ile create/alter/create or replace çalışır; `drop`/`revoke` onay ister ve onay Mustafa'ya ulaşmıyor → kısıtlayıcı politika ya da SQL Editor'e yapıştırma.
- Supabase proje ref: `ypblltxjbhgnnvtyteat`. Gizli anahtar/şifre depoya yazılmaz.

## Oturumlar
| Dosya | Kapsam |
|---|---|
| core.md | giriş, yetkiler, ortak ekranlar, internetsiz kayıt, tasarım, panel, veritabanı, yayın |
| ciftci.md | tarla, masraf, gelir, rapor, takvim, fidan |
| hayvancilik.md | büyükbaş, küçükbaş, süt, kümes |
| tanitim.md | tanıtım sitesi, paketler/fiyat metinleri, pazarlama, mağaza |
| dayibasi.md | dayıbaşı ürünü (ara verildi) |
