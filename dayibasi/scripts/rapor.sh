#!/usr/bin/env bash
# Durum raporu için ham veri: bütün modül notlarının ilgili başlıkları + dalların durumu, tek komutla.
# Kullanım: bash dayibasi/scripts/rapor.sh        (tam)
#           bash dayibasi/scripts/rapor.sh kisa   (sadece yayın durumu, yapılacakların ilk maddesi, beklenenler)
# Amaç: rapor istenince yedi dosyayı tek tek okumamak (token tasarrufu). Hiçbir şeyi değiştirmez.
set -u
cd "$(dirname "$0")/.." || exit 1
MOD=docs/moduller
KISA="${1:-}"
bolum() { # $1 dosya, $2 başlık
  awk -v h="## $2" '$0==h{p=1;next} /^## /{p=0} p&&NF' "$1"
}

echo "# DURUM ($(date +%d.%m.%Y))"
git fetch -q origin 2>/dev/null
echo "## Yayın"
echo "- Canlı (main) son yayın: $(git log -1 --format='%cd · %s' --date=format:'%d.%m.%Y' origin/main 2>/dev/null)"
n=$(git log --oneline origin/main..origin/gelistirme 2>/dev/null | grep -vc '\[skip ci\]')
echo "- gelistirme'de canlıya gitmemiş kod değişikliği: $n commit"
git log --format='  · %s' origin/main..origin/gelistirme 2>/dev/null | grep -v '\[skip ci\]' | head -8
for b in $(git branch -r 2>/dev/null | grep 'origin/modul/'); do
  k=$(git log --oneline origin/gelistirme.."$b" 2>/dev/null | wc -l)
  [ "$k" -gt 0 ] && echo "- Birleştirilmeyi bekleyen dal: ${b#origin/} ($k commit: $(git log -1 --format=%s "$b"))"
done

for f in core ciftci fidan hayvancilik kanatli tanitim dayibasi; do
  [ -f "$MOD/$f.md" ] || continue
  echo; echo "## [$f]"
  if [ "$KISA" = "kisa" ]; then
    echo "Sıradaki:"; bolum "$MOD/$f.md" "Yapılacaklar (sırayla)" | head -1
    echo "Beklenen:"; bolum "$MOD/$f.md" "Mustafa'dan beklenenler"
    continue
  fi
  for h in "Canlıda ne var" "Yapılacaklar (sırayla)" "Mustafa'dan beklenenler" "Diğer oturumlardan istekler" "Saklanan fikirler" "Günlük"; do
    t=$(bolum "$MOD/$f.md" "$h")
    [ -n "$t" ] && [ "$t" != "(yok)" ] && { echo "### $h"; echo "$t" | cut -c1-600; }
  done
done
[ "$KISA" = "kisa" ] || { echo; echo "## Fikir ve belge dosyaları"; ls docs/fikirler docs/tubitak 2>/dev/null | grep -v '^$' | tr '\n' ' '; echo; }
