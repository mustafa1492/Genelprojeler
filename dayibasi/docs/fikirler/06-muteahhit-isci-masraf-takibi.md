# Fikir: Müteahhit işçi ve masraf takibi

Mustafa, 1 Kasım 2026: "Bu sistemi bir müteahhitin işçilerini ve masraflarını kontrol edebileceği bir sisteme dönüştürebilir miyiz?" → **Evet, mantıklı.**

## Ne zaman?
CLAUDE.md Kural 1: önce odak proje (dayıbaşı). Dayıbaşı gerçek kullanıcıyla oturunca başlanır.
**Şimdiden yapılacak:** dayıbaşı için yazılan her yeni özellik (aktif listeler, takvim, masraflar, iş planı, yarım gün, kişiye özel ücret) `core/` altında genel yazılır; ürüne özel kelimeler `products/<ürün>/config.ts`'te durur. Böylece müteahhit sürümü ayar dosyası + birkaç ekranla çıkar (tahmin: 1-2 hafta).

## Eşleşme
| Dayıbaşı | Müteahhit |
|---|---|
| Tarla (places) | Şantiye / proje |
| Çiftçi (ödeyen kişi) | İşveren / proje sahibi; ödeme = hakediş |
| İşçi, yevmiye | Usta / kalfa / düz işçi; **role göre** günlük ücret |
| Dayıbaşı payı | Kâr = hakediş − işçilik − masraf |
| Masraf (yakıt, şoför, lastik) | Malzeme, kira, nakliye, makine, yemek, konaklama |
| Puantaj | Şantiye bazında puantaj |

## Aynen kullanılacaklar (core)
Ekip + aktif listeler, "kimler geldi" kaydı, yarım gün / kişiye özel ücret, avans ve ödemeler, puantaj + Excel, masraf girişi, takvim, iş planı / hatırlatıcı, geçmiş + geri alma, internetsiz çalışma, WhatsApp mesajları, gizli bağlantıyla işçinin kendi hesabını görmesi.

## Müteahhide özel (products/muteahhit)
- Rol bazlı ücret (usta / kalfa / düz işçi), kişiye özel ücret
- Şantiye maliyet raporu: işçilik + masraf, şantiye şantiye ve toplam
- Hakediş takibi: işverenden alınacak / alınan
- Taşeronlar: kendi işçisi olan alt firma (kişi kartı türü + toplu puantaj)
- SGK giriş/çıkış ve sigortalı gün takibi (inşaatta daha önemli)
- Belki: malzeme stok (önce sor, şimdi gerekmeyen özellik eklenmez)

## Sorulacaklar (bir müteahhide)
- Ücretler günlük mü, haftalık mı ödeniyor? Rol farkı ne kadar?
- Taşeronla nasıl hesaplaşılıyor?
- Hakediş nasıl ve ne sıklıkla?
- Puantajı şu an kim, nasıl tutuyor? En çok nerede hata/tartışma çıkıyor?
