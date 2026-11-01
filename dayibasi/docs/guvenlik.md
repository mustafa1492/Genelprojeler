# Güvenlik

## Yapılanlar
- Row Level Security: her işletme yalnız kendi verisini görür (gerçek veritabanında iki kullanıcıyla denendi).
- Giriş yapmamış kişi (anon) hiçbir fonksiyonu çağıramaz (0002).
- Uzunluk / tutar sınırları, kişi başı en çok 3 işletme, bilinmeyen ürün adı reddi (0004).
- KVKK: "Bilgilerini tamamen sil" → kişi, avansları, yoklamaları ve işlem geçmişindeki izleri kalıcı silinir (`forget_person`, 0004).
- Şifre en az 8 (uygulamada), "Şifremi unuttum" akışı (`/sifre`).
- İşlem geçmişi + geri alma (0003): yanlış işlemin telafisi.
- Gizli anahtar (service_role, DB şifresi) depoda yok; `.env` yalnız herkese açık anahtarı içerir.

## Yapılacaklar
- [ ] Supabase panelinde şifre en az 8 + sızmış şifre koruması (sunucu tarafı)
- [ ] Kâğıt fotoğrafları: gizli Storage kovası, `business_id/` klasörü, RLS, kısa süreli imzalı bağlantı
- [ ] Ücretsiz proje 1 hafta kullanılmazsa uyur → kullanıcılar başlamadan ücretli plan ya da haftalık yedek
- [ ] Yardımcı hesabı gelince: rol bazlı izin (çalışan alacakları görmez, geri alma yetkisi sınırlı)
- [ ] Paylaşılan telefon için isteğe bağlı 4 haneli kilit
- [ ] KVKK aydınlatma metni avukata gösterilecek; VERBİS gerekip gerekmediği sorulacak
- [ ] Yayından önce baştan sona güvenlik incelemesi

## Her şema değişikliğinden sonra
Supabase güvenlik kontrolü (advisors) çalıştırılır, uyarılar kapatılır.

## Sızıntı olursa (özet)
1. Supabase panelinden anahtarları yenile, şüpheli oturumları kapat.
2. Ne sızdı, kimin verisi, ne zaman: kayıtları (Supabase logları + activity_log) incele.
3. KVKK: 72 saat içinde Kişisel Verileri Koruma Kurulu'na bildirim; etkilenen kişilere bilgi.
4. Açığı kapat, bu dosyaya ne olduğunu ve ne yapıldığını yaz.
