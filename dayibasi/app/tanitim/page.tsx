import type { Metadata } from "next";
import "./tanitim.css";

// TASLAK tanıtım sayfası. Canlı ana sayfa değişmedi. Fiyatlar ve iletişim onay bekliyor (docs/moduller/tanitim.md).
const baslik = "Çiftçi Defteri: tarlanın hesabı cebinde";
const aciklama = "Masrafını, gelirini, tarlanı, deponu ve hayvanını telefondan yaz; sezon sonunda ne kazandığını tek bakışta gör. Basit paket ücretsiz.";

export const metadata: Metadata = {
  title: baslik,
  description: aciklama,
  robots: { index: false, follow: false }, // taslak: arama motorlarında görünmesin
  openGraph: { title: baslik, description: aciklama, siteName: "Çiftçi Defteri", locale: "tr_TR", type: "website" },
};

const dertler = [
  { d: "Gübreye, ilaca, mazota ne verdim, hatırlamıyorum.", c: "Her masrafı iki dokunuşla yaz, fişin fotoğrafını ekle." },
  { d: "Sezon bitti, kâr mı ettim zarar mı?", c: "Özet ekranındaki kâr kartı bunu her an söyler." },
  { d: "Defter kayboluyor, kâğıtlar dağılıyor.", c: "Kayıtlar telefonda ve bilgisayarda, ikisinde de aynı." },
  { d: "Tarlada çekmiyor, internet yok.", c: "İnternet yokken de yaz; çekince kendisi gönderir." },
];

const ozellikler = [
  { i: "📊", h: "Özet ve kâr kartı", p: "Sezonda, bu ay, bu yıl ya da son 30 günde ne kazandığını tek kartta gör." },
  { i: "🧾", h: "Masraf ve gelir", p: "Ne aldın, ne sattın; hangi tarlaya ait olduğunu seç, fişin fotoğrafını ekle." },
  { i: "🗺️", h: "Tarlalar", p: "Tarlanı ada ve parsel numarasıyla tapudan getir; dekarı kendisi gelir." },
  { i: "📦", h: "Depo", p: "Gübre, ilaç, tohum ne kadar kaldı; giren çıkan belli." },
  { i: "🚜", h: "Makineler", p: "Traktör ve aletlerinin bakımı, masrafı bir yerde." },
  { i: "📅", h: "Takvim", p: "İlaçlama, sulama, ödeme günü; yaklaşanlar özette çıkar." },
  { i: "📄", h: "Sezon raporu", p: "Sezonun hesabı tek sayfada. PDF olarak kaydet ya da Excel'e indir." },
  { i: "💵", h: "Dolar karşılığı", p: "Her kaydın o günkü Merkez Bankası kuruyla dolar ya da euro karşılığı." },
  { i: "🙈", h: "Tutarları gizle", p: "Yanında biri varken tek dokunuşla paralar *** olur." },
  { i: "📶", h: "İnternetsiz çalışır", p: "Tarlada çekmese de kaydını yaz, internet gelince gider." },
  { i: "👨‍👩‍👧", h: "Aile ve çalışan", p: "Eşin, oğlun, çalışanın da yazsın; kim neyi görür, sen seçersin." },
  { i: "✋", h: "Ekranımı düzenle", p: "Sana lazım olan kartlar önde, gerisi gizli. Hazır görünümler var." },
];

const sss = [
  { s: "İnternet yokken çalışır mı?", c: "Evet. Tarlada çekmese de kaydını yazarsın; telefon internete bağlanınca kayıtlar kendiliğinden gönderilir." },
  { s: "Bilgilerim güvende mi? Kim görür?", c: "Defterini yalnızca sen ve senin eklediğin aile üyeleri ya da çalışanlar görür. Çalışanın parayı görüp görmeyeceğine sen karar verirsin. Bilgilerin kimseyle paylaşılmaz, satılmaz." },
  { s: "Excel'e aktarabilir miyim?", c: "Evet. Sezon raporu ve masraf-gelir listeleri Excel dosyası olarak iner. Ayarlar'dan bütün kayıtlarını tek dosyada indirebilirsin." },
  { s: "Bilgisayarda da açılır mı?", c: "Evet. Aynı defter telefonda da bilgisayarda da açılır. Bilgisayarda yan menü ve geniş tablolar görünür." },
  { s: "Ücretsiz paket ne kadar süre ücretsiz?", c: "Basit paket hep ücretsiz ve sınırsız. Orta ve Tam paketlerde ilk sezon ücret alınmaz." },
  { s: "Telefonuma ayrıca bir şey yüklemem gerekir mi?", c: "Gerekmez. Adresi açıp giriş yapman yeterli. İstersen ana ekrana ekleyip uygulama gibi kullanırsın." },
];

export default function Tanitim() {
  return (
    <main className="tn">
      <header className="tn-ust">
        <div className="tn-ic">
          <a className="tn-logo" href="/tanitim"><span className="i" aria-hidden>🌱</span>Çiftçi Defteri</a>
          <nav aria-label="Bölümler">
            <a href="#ozellikler">Özellikler</a>
            <a href="#paketler">Paketler</a>
            <a href="#sorular">Sorular</a>
            <a className="giris" href="/ciftci">Giriş yap</a>
          </nav>
        </div>
      </header>

      <section className="tn-kahraman">
        <div className="tn-ic">
          <div>
            <h1>Tarlanın hesabı cebinde.</h1>
            <p className="buyuk">Masrafını, gelirini, tarlanı ve deponu telefondan yaz; sezon sonunda ne kazandığını tek bakışta gör.</p>
            <div className="tn-dugmeler">
              <a className="tn-btn ana" href="/ciftci">Ücretsiz başla</a>
              <a className="tn-btn cizgi" href="/ciftci">Giriş yap</a>
            </div>
            <p className="not">Basit paket hep ücretsiz. Kredi kartı istemez.</p>
          </div>
          <Telefon />
        </div>
      </section>

      <section className="tn-bolum">
        <div className="tn-ic">
          <h2>Çiftçinin derdi, defterin çözümü</h2>
          <p className="tn-alt-baslik">Kâğıt defter kaybolur, akılda tutulan hesap şaşar. Çiftçi Defteri bunun için var.</p>
          <div className="tn-dert">
            {dertler.map((x) => (<div key={x.d}><p className="d">“{x.d}”</p><p className="c">{x.c}</p></div>))}
          </div>
        </div>
      </section>

      <section className="tn-bolum" id="ozellikler" style={{ paddingTop: 0 }}>
        <div className="tn-ic">
          <h2>Neler yapabilirsin?</h2>
          <p className="tn-alt-baslik">Büyük yazı, büyük düğme, düz Türkçe. Telefonla arayıp sormana gerek kalmasın diye.</p>
          <div className="tn-izgara">
            {ozellikler.map((x) => (
              <div className="tn-kart" key={x.h}><div className="ik" aria-hidden>{x.i}</div><h3>{x.h}</h3><p>{x.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="tn-bolum tn-gorunum">
        <div className="tn-ic">
          <h2>Telefonda da, bilgisayarda da</h2>
          <p className="tn-alt-baslik">Tarlada telefondan yaz, akşam evde bilgisayardan geniş tabloyla bak. Aşağıdaki ekranlar örnek bilgilerle çizilmiştir.</p>
          <div className="tn-ekranlar">
            <div><Telefon /><p className="tn-etiket">Telefonda: Özet</p></div>
            <div><Bilgisayar /><p className="tn-etiket">Bilgisayarda: Masraflar</p></div>
          </div>
        </div>
      </section>

      <section className="tn-bolum">
        <div className="tn-ic">
          <h2>Bölümler</h2>
          <p className="tn-alt-baslik">İşine göre aç. Kullanmadığın bölüm menüde görünmez.</p>
          <div className="tn-modul">
            <div className="tn-kart"><h3>Tarla ve para <span className="tn-pk">Basit</span></h3><ul><li>Tarlalar (tapudan parsel)</li><li>Masraf ve gelir</li><li>Özet ve kâr kartı</li></ul></div>
            <div className="tn-kart"><h3>Defter işleri <span className="tn-pk">Orta</span></h3><ul><li>Depo, makineler, takvim</li><li>Sezon raporu (PDF, Excel)</li><li>Dolar karşılığı, aile ve çalışan</li></ul></div>
            <div className="tn-kart"><h3>Fidan <span className="tn-pk">Tam</span></h3><ul><li>Fidan stoğu</li><li>Müşteriler</li><li>Fiyat listesi</li></ul></div>
            <div className="tn-kart"><h3>Kümes <span className="tn-pk">Tam</span></h3><ul><li>Kümes ve sürü kaydı</li><li>Günlük kayıt</li></ul></div>
            <div className="tn-kart"><h3>Büyükbaş ve küçükbaş <span className="tn-pk">Tam</span></h3><ul><li>Küpe numarasıyla hayvan kartı</li><li>Aşı, ilaç, tohumlama gibi olaylar</li><li>İlaçtan sonra “sütü tanka katılmaz” uyarısı</li></ul></div>
            <div className="tn-kart"><h3>Ekranımı düzenle <span className="tn-pk">Hepsinde</span></h3><ul><li>Hazır görünümler: Tarlacı, Kümesçi, Sadece para, En sade</li><li>Büyük yazı</li><li>Tutarları gizle</li></ul></div>
          </div>
          <div className="tn-yakinda">
            <h3>Yakında</h3>
            <p style={{ color: "#445248", margin: 0 }}>Bunlar üzerinde çalışıyoruz, henüz uygulamada yok:</p>
            <ul>
              <li>Dekar başı ve kilo başı kâr, girdi fiyatlarının yıllara göre karşılaştırması</li>
              <li>Hangi yıl hangi tarlaya ne ekildi tablosu</li>
              <li>Hava durumuna göre ilaçlama saati önerisi</li>
              <li>Süt defteri (mandıra, süt parası)</li>
              <li>Kümeste yumurta kaydı ve dönem kapanışı</li>
              <li>Google Play'den indirilebilen Android uygulaması</li>
            </ul>
          </div>
        </div>
      </section>

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

      <section className="tn-bolum" id="sorular">
        <div className="tn-ic">
          <h2>Sık sorulan sorular</h2>
          <div className="tn-sss" style={{ marginTop: 24 }}>
            {sss.map((x) => (<details key={x.s}><summary>{x.s}</summary><p>{x.c}</p></details>))}
          </div>
        </div>
      </section>

      <section className="tn-bolum" id="iletisim" style={{ paddingTop: 0 }}>
        <div className="tn-ic">
          <div className="tn-iletisim">
            <div><h2>Bize ulaş</h2><p style={{ color: "#445248" }}>Sorunu yaz ya da ara, yardım edelim.</p></div>
            <div className="tn-yer">[YER TUTUCU] Telefon, WhatsApp ve e-posta bilgisi buraya gelecek.</div>
          </div>
        </div>
      </section>

      <footer className="tn-alt">
        <div className="tn-ic">
          <span>© 2026 Çiftçi Defteri</span>
          <span><a href="/kvkk">Kişisel veriler (KVKK)</a> · <a href="/ciftci">Giriş yap</a></span>
        </div>
      </footer>
    </main>
  );
}

/** Telefondaki Özet ekranının temsili çizimi (örnek rakamlar). */
function Telefon() {
  return (
    <div className="tn-tel" role="img" aria-label="Telefonda Özet ekranı örneği">
      <div className="ekran">
        <div className="m-bas"><div><small>2026 sezonu</small><b>Özet</b></div><span className="m-goz">👁</span></div>
        <div className="m-kar"><small>Sezon kârı</small><div className="t">184.250 TL</div>
          <div className="s"><span>Gelir 412.000</span><span>Masraf 227.750</span></div></div>
        <div className="m-hizli"><span>+ Masraf</span><span>+ Gelir</span><span className="i">Tarlalar</span><span className="i">Depo</span></div>
        <div className="m-kart"><span>Ova tarlası ilaçlama</span><span className="m-pill">Yarın</span></div>
        <div className="m-kart"><span>Gübre (20 çuval)</span><span>18.400 TL</span></div>
        <div className="m-kart"><span>Pamuk satışı</span><span>96.000 TL</span></div>
        <div className="m-alt"><b>Özet</b><span>Tarlalar</span><span>Masraf</span><span>Depo</span><span>Menü</span></div>
      </div>
    </div>
  );
}

/** Bilgisayardaki Masraflar ekranının temsili çizimi (örnek rakamlar). */
function Bilgisayar() {
  const satir = [
    ["12.10.2026", "Gübre", "Ova tarlası", "18.400", "$ 437"],
    ["08.10.2026", "Mazot", "Hepsi", "6.250", "$ 149"],
    ["02.10.2026", "İlaç", "Dere tarlası", "9.800", "$ 233"],
    ["27.09.2026", "İşçilik", "Ova tarlası", "32.000", "$ 762"],
    ["19.09.2026", "Tohum", "Dere tarlası", "14.300", "$ 341"],
  ];
  return (
    <div className="tn-pc" role="img" aria-label="Bilgisayarda Masraflar ekranı örneği">
      <div className="ekran">
        <div className="yan"><b>🌱 Çiftçi Defteri</b><span>Özet</span><span>Tarlalar</span><span className="s">Masraf</span><span>Gelir</span><span>Depo</span><span>Takvim</span><span>Rapor</span></div>
        <div className="ic">
          <div className="ust2"><div>Bu sezon masraf<b>227.750 TL</b></div><div>Bu ay<b>34.450 TL</b></div><div>Dolar karşılığı<b>$ 5.420</b></div></div>
          <div className="tablo">
            <table>
              <thead><tr><th>Tarih</th><th>Ne</th><th>Tarla</th><th className="r">TL</th><th className="r">Dolar</th></tr></thead>
              <tbody>{satir.map((r) => (<tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="r">{r[3]}</td><td className="r">{r[4]}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
