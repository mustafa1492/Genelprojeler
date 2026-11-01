# Tasarım kuralları

Referans ekranlar: `demo-ekranlar.dc.html` (Claude Design canvas dosyası; HTML + küçük bir şablon dili. Görünümü ve davranışı referans al, dosya biçimini değil).

## Kullanıcıya göre kurallar
- Ekran başına tek ana iş; ana düğme tam genişlik, yeşil, en az 64-72 px
- Yazı: gövde 16-18 px, kart başlığı 18-20 px, sayfa başlığı 28 px, büyük sayılar 30-44 px
- Dokunma alanı en az 48 px, ana düğmeler 56 px+
- Klavye yerine seçim düğmesi ve − / + sayaç
- Teknik kelime yok; dayıbaşının kendi kelimeleri
- Renk + yazı birlikte; renk tek başına anlam taşımaz
- İşlem sonrası düz onay cümlesi; geri alma

## Renkler
| Ad | Değer | Kullanım |
|---|---|---|
| zemin | #F4F3EE | sayfa arka planı |
| kart | #FFFFFF | kartlar |
| yazı | #1C211B | ana yazı |
| sessiz | #4A5046 / #5B6157 | ikincil yazı |
| çizgi | #D8D6CD / #E2E0D8 | kenarlıklar |
| ana | #3B6B2C | ana düğme, seçili öğe |
| ana-açık | #E7EFE2, yazı #22451A | "tamam / geliyor" |
| uyarı-açık | #FDF0E1, yazı #7A3A05 | "X gün kaldı" |
| tehlike | #A3261B; açık #FBE7E5, yazı #7A1D14 | "süresi geçti / borç" |
| koyu kart | #1C211B, yazı #FFFFFF | toplam alacak |

## Yazı tipi
Manrope (Google Fonts), 500-800 ağırlık.

## Köşeler ve boşluk
Kartlar 18 px köşe, düğmeler 14-18 px; kartlar arası 14 px; sayfa kenar boşluğu 16 px.
