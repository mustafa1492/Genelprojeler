// CEP: siteden şimdilik kaldırılan parçalar (Mustafa, 10 Kasım 2026: ücret alınmayacak, ileride yine eklenebilir).
// Bu dosya hiçbir yerde kullanılmıyor; geri eklemek için ilgili parçayı page.tsx'e taşı.
// - Üst menüde: <a href="#paketler">Paketler</a>
// - Giriş düğmesi metni: "Ücretsiz başla", alt not: "Basit paket hep ücretsiz. Kredi kartı istemez."
// - SSS: "Ücretsiz paket ne kadar süre ücretsiz?" → "Basit paket hep ücretsiz ve sınırsız. Orta ve Tam paketlerde ilk sezon ücret alınmaz."
// - Bölümler kartlarındaki paket etiketleri: Basit, Orta, Tam, Tam, Tam, Hepsinde
//   (Tarla ve para: Basit · Defter işleri: Orta · Fidan, Kümes, Büyükbaş/küçükbaş: Tam · Ekranımı düzenle: Hepsinde)

export function Paketler() {
  return (
      <section className="tn-bolum tn-gorunum" id="paketler">
        <div className="tn-ic">
          <h2>Paketler <span className="tn-taslak">[taslak]</span></h2>
          <p className="tn-alt-baslik">Fiyatlar henüz kesin değil.</p>
          <div className="tn-ilksezon">İlk sezon ücret alınmaz. Basit paket ise hep ücretsiz.</div>
          <div className="tn-paket">
            <div className="tn-kart">
              <h3>Basit</h3><p className="fiyat">Ücretsiz</p><p className="yil">Süre ve kayıt sınırı yok</p>
              <ul><li>Tarlalar</li><li>Masraf ve gelir</li><li>Özet ve kâr kartı</li></ul>
              <a className="tn-btn ana" href="/ciftci">Ücretsiz başla</a>
            </div>
            <div className="tn-kart one">
              <h3>Orta <span className="tn-taslak">[taslak]</span></h3><p className="fiyat">99 TL <small>/ ay</small></p><p className="yil">ya da yıllık 790 TL</p>
              <ul><li>Basit paketteki her şey</li><li>Depo, makineler, takvim</li><li>Sezon raporu, Excel</li><li>Dolar karşılığı</li><li>Aile ve çalışan</li></ul>
              <a className="tn-btn ana" href="/ciftci">Başla</a>
            </div>
            <div className="tn-kart">
              <h3>Tam <span className="tn-taslak">[taslak]</span></h3><p className="fiyat">199 TL <small>/ ay</small></p><p className="yil">ya da yıllık 1.590 TL</p>
              <ul><li>Orta paketteki her şey</li><li>Fidan</li><li>Kümes</li><li>Büyükbaş ve küçükbaş</li></ul>
              <a className="tn-btn ana" href="/ciftci">Başla</a>
            </div>
          </div>
        </div>
      </section>
  );
}
