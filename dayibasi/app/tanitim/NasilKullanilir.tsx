"use client";
import { useState } from "react";

/** Adım adım, tıklanarak ilerlenen "Nasıl kullanılır" rehberi. Ekranlar örnek bilgilerle çizilmiştir. */
type Adim = { b: string; k: string; m: string[]; ekran: React.ReactNode };

const Tel = ({ children, baslik }: { children: React.ReactNode; baslik: string }) => (
  <div className="tn-tel nk-tel" aria-hidden>
    <div className="ekran"><div className="nk-ust">{baslik}</div>{children}</div>
  </div>
);
const Alan = ({ l, v }: { l: string; v: string }) => (<div className="nk-alan"><small>{l}</small><div>{v}</div></div>);
const Dug = ({ t, ikincil, parla }: { t: string; ikincil?: boolean; parla?: boolean }) => (
  <div className={"nk-dug" + (ikincil ? " ikincil" : "") + (parla ? " parla" : "")}>{t}</div>
);

const adimlar: Adim[] = [
  {
    b: "Hesabını aç", k: "Bir kere yapılır, bir dakika sürer.",
    m: ["“Hemen başla” düğmesine dokun.", "E-postanı yaz, kendine en az 8 harf ya da rakamdan bir şifre seç.", "“Hesap aç”a dokun. E-postana bağlantı gelirse ona dokun, sonra giriş yap."],
    ekran: <Tel baslik="Yeni hesap aç"><Alan l="E-posta" v="ali@ornek.com" /><Alan l="Şifre" v="••••••••" /><Dug t="Hesap aç" parla /></Tel>,
  },
  {
    b: "Defterini oluştur", k: "Defterine bir ad ver.",
    m: ["Defterin adını yaz. Örnek: “Yılmaz ailesi”.", "“Oluştur”a dokun. Bundan sonra hep bu deftere girersin.", "Eşin ya da çocuğun da yazacaksa sonra davet kodu gönderebilirsin."],
    ekran: <Tel baslik="Defterini oluştur"><Alan l="Defterin adı" v="Yılmaz ailesi" /><Dug t="Oluştur" parla /><Dug t="Davet kodum var" ikincil /></Tel>,
  },
  {
    b: "Tarlanı ekle", k: "Masrafı hangi tarlaya yazdığını bilmek için.",
    m: ["Menüden “Tarlalar”a, sonra “Yeni tarla”ya dokun.", "Tarlaya bir ad ver. Örnek: “Dere kenarı”.", "İstersen ada ve parsel numarasını yaz; tapudan dekarını kendisi getirir."],
    ekran: <Tel baslik="Yeni tarla"><Alan l="Tarlanın adı" v="Dere kenarı" /><Alan l="Ada / parsel" v="112 / 7" /><Alan l="Dekar" v="14,5" /><Dug t="Kaydet" parla /></Tel>,
  },
  {
    b: "Masrafını yaz", k: "Gübre, ilaç, mazot, işçi… Ne verdiysen.",
    m: ["Ana ekranda “+ Masraf”a dokun.", "Neye verdiğini seç, tutarı yaz, hangi tarlaya ait olduğunu seç.", "İstersen fişin fotoğrafını çek. “Kaydet”e dokun."],
    ekran: <Tel baslik="Yeni masraf"><div className="nk-secim"><span className="on">Gübre</span><span>İlaç</span><span>Mazot</span><span>İşçilik</span></div><Alan l="Tutar" v="18.400 TL" /><Alan l="Tarla" v="Dere kenarı" /><Dug t="Kaydet" parla /></Tel>,
  },
  {
    b: "Gelirini yaz", k: "Ne sattıysan, ne aldıysan.",
    m: ["Ana ekranda “+ Gelir”e dokun.", "Ürünü, miktarı ve birim fiyatını yaz; toplamı kendisi hesaplar.", "“Kaydet”e dokun. Kâr kartı hemen güncellenir."],
    ekran: <Tel baslik="Yeni gelir"><Alan l="Ürün" v="Pamuk" /><Alan l="Miktar" v="4.000 kg" /><Alan l="Birim fiyat (TL)" v="24" /><Dug t="Kaydet" parla /></Tel>,
  },
  {
    b: "Kârını gör", k: "Kâr mı ettin zarar mı, tek bakışta.",
    m: ["Ana ekrandaki koyu yeşil kart bu sezon ne kazandığını gösterir.", "Kartın üstünden “bu ay”, “bu yıl” gibi seçebilirsin.", "Sezon bitince “Sezon raporu”nu PDF ya da Excel olarak indir."],
    ekran: <Tel baslik="Özet"><div className="m-kar"><small>Sezon kârı</small><div className="t">184.250 TL</div><div className="s"><span>Gelir 412.000</span><span>Masraf 227.750</span></div></div><div className="m-hizli"><span>+ Masraf</span><span className="i">+ Gelir</span></div></Tel>,
  },
];

const ekle = {
  android: ["Chrome ile siteyi aç ve giriş yap.", "Sağ üstteki üç noktaya (⋮) dokun.", "“Ana ekrana ekle” ya da “Uygulamayı yükle”ye dokun.", "“Ekle”ye dokun. Artık telefonunda simgesi var."],
  iphone: ["Safari ile siteyi aç ve giriş yap.", "Alttaki paylaş düğmesine (kare ve yukarı ok) dokun.", "Aşağı kaydır, “Ana Ekrana Ekle”ye dokun.", "Sağ üstte “Ekle”ye dokun. Artık telefonunda simgesi var."],
};

export function NasilKullanilir() {
  const [i, setI] = useState(0);
  const [tel, setTel] = useState<"android" | "iphone">("android");
  const son = adimlar.length; // son sekme: ana ekrana ekle
  const a = adimlar[i];
  return (
    <div className="nk">
      <div className="nk-sekme" role="tablist" aria-label="Adımlar">
        {adimlar.map((x, n) => (
          <button key={x.b} role="tab" aria-selected={i === n} className={i === n ? "on" : n < i ? "gecti" : ""} onClick={() => setI(n)}>
            <span className="no">{n + 1}</span><span className="ad">{x.b}</span>
          </button>
        ))}
        <button role="tab" aria-selected={i === son} className={i === son ? "on" : ""} onClick={() => setI(son)}>
          <span className="no">📱</span><span className="ad">Telefona ekle</span>
        </button>
      </div>

      <div className="nk-icerik" role="tabpanel">
        {i < son ? (
          <>
            <div className="nk-yazi">
              <p className="nk-adim">Adım {i + 1} / {son}</p>
              <h3>{a.b}</h3>
              <p className="nk-kisa">{a.k}</p>
              <ol>{a.m.map((x) => <li key={x}>{x}</li>)}</ol>
            </div>
            {a.ekran}
          </>
        ) : (
          <div className="nk-yazi nk-genis">
            <p className="nk-adim">Son adım</p>
            <h3>Telefonunun ana ekranına ekle</h3>
            <p className="nk-kisa">Bir uygulama gibi tek dokunuşla açılır. Mağazadan bir şey yüklemen gerekmez.</p>
            <div className="nk-tel-sec" role="group" aria-label="Telefon türü">
              <button aria-pressed={tel === "android"} onClick={() => setTel("android")}>Android</button>
              <button aria-pressed={tel === "iphone"} onClick={() => setTel("iphone")}>iPhone</button>
            </div>
            <ol>{ekle[tel].map((x) => <li key={x}>{x}</li>)}</ol>
          </div>
        )}
      </div>

      <div className="nk-gezin">
        <button className="tn-btn cizgi2" disabled={i === 0} onClick={() => setI(i - 1)}>← Geri</button>
        {i < son
          ? <button className="tn-btn ana" onClick={() => setI(i + 1)}>İleri →</button>
          : <a className="tn-btn ana" href="/ciftci?kayit=1">Hemen başla</a>}
      </div>
    </div>
  );
}
