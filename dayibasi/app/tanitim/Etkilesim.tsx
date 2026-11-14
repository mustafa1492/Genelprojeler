"use client";
import { useState } from "react";

// Tanıtım sitesindeki etkileşimli parçalar. Hiçbiri bir yere kayıt göndermez; her şey sadece bu sayfada hesaplanır.

const tl = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString("tr-TR") : "0") + " TL";
const sayi = (v: string) => { const n = Number(v.replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) && n > 0 ? n : 0; };

/* ---------- 1. Kâr hesaplayıcı ---------- */
export function KarHesap() {
  const [dekar, setDekar] = useState("20");
  const [masraf, setMasraf] = useState("180.000");
  const [verim, setVerim] = useState("450");
  const [fiyat, setFiyat] = useState("24");
  const d = sayi(dekar), m = sayi(masraf), v = sayi(verim), f = sayi(fiyat);
  const urun = d * v, gelir = urun * f, kar = gelir - m;
  const basabas = urun > 0 ? m / urun : 0;
  const tamam = d > 0 && v > 0 && f > 0;
  const Alan = ({ id, l, v: val, set, birim }: { id: string; l: string; v: string; set: (s: string) => void; birim: string }) => (
    <label className="kh-alan" htmlFor={id}>
      <span>{l}</span>
      <span className="kh-giris"><input id={id} inputMode="decimal" maxLength={12} value={val} onChange={(e) => set(e.target.value)} /><em>{birim}</em></span>
    </label>
  );
  return (
    <div className="kh">
      <div className="kh-form">
        {Alan({ id: "kh_d", l: "Tarlan kaç dekar?", v: dekar, set: setDekar, birim: "dekar" })}
        {Alan({ id: "kh_m", l: "Bu sezon toplam masrafın", v: masraf, set: setMasraf, birim: "TL" })}
        {Alan({ id: "kh_v", l: "Dekardan kaç kilo alırsın?", v: verim, set: setVerim, birim: "kg" })}
        {Alan({ id: "kh_f", l: "Kilosunu kaça satarsın?", v: fiyat, set: setFiyat, birim: "TL" })}
      </div>
      <div className="kh-sonuc" aria-live="polite">
        <div className={"kh-kar " + (kar >= 0 ? "arti" : "eksi")}>
          <small>{kar >= 0 ? "Sezon kârın" : "Sezon zararın"}</small>
          <b>{tamam ? tl(Math.abs(kar)) : "—"}</b>
          <span>{tamam ? (kar >= 0 ? "Kâr ediyorsun." : "Bu fiyattan satarsan zarar edersin.") : "Rakamları yaz."}</span>
        </div>
        <div className="kh-satir"><span>Toplam ürün</span><b>{tamam ? urun.toLocaleString("tr-TR") + " kg" : "—"}</b></div>
        <div className="kh-satir"><span>Gelir</span><b>{tamam ? tl(gelir) : "—"}</b></div>
        <div className="kh-satir"><span>Dekar başı masraf</span><b>{d > 0 ? tl(m / d) : "—"}</b></div>
        <div className="kh-satir vurgu"><span>Başabaş fiyatın</span><b>{basabas > 0 ? basabas.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + " TL/kg" : "—"}</b></div>
        <p className="kh-not">Başabaş fiyatı: ürününü bundan ucuza satarsan zarar edersin. Çiftçi Defteri bunu her tarla için, yazdığın gerçek masraflardan kendisi hesaplar.</p>
      </div>
    </div>
  );
}

/* ---------- 2. Deneme ekranı ---------- */
type Kayit = { id: number; tur: "masraf" | "gelir"; ad: string; tutar: number };
const MASRAF_TUR = ["Gübre", "İlaç", "Mazot", "İşçilik", "Tohum / fide"];
const GELIR_TUR = ["Hasat satışı", "Destek"];
const HAZIR_TUTAR = [1000, 5000, 10000, 25000];
const ILK: Kayit[] = [
  { id: 1, tur: "gelir", ad: "Hasat satışı", tutar: 96000 },
  { id: 2, tur: "masraf", ad: "Gübre", tutar: 18400 },
];

export function DenemeEkrani() {
  const [kayitlar, setKayitlar] = useState<Kayit[]>(ILK);
  const [form, setForm] = useState<null | "masraf" | "gelir">(null);
  const [ad, setAd] = useState("");
  const [tutar, setTutar] = useState("");
  const [son, setSon] = useState<Kayit | null>(null);
  const [gizli, setGizli] = useState(false);
  const gelir = kayitlar.filter((k) => k.tur === "gelir").reduce((a, k) => a + k.tutar, 0);
  const masraf = kayitlar.filter((k) => k.tur === "masraf").reduce((a, k) => a + k.tutar, 0);
  const para = (n: number) => (gizli ? "*** TL" : tl(n));

  const ac = (t: "masraf" | "gelir") => { setForm(t); setAd(t === "masraf" ? MASRAF_TUR[0] : GELIR_TUR[0]); setTutar(""); setSon(null); };
  const kaydet = () => {
    const n = sayi(tutar); if (!n) return;
    const k: Kayit = { id: Date.now(), tur: form!, ad, tutar: n };
    setKayitlar([k, ...kayitlar]); setSon(k); setForm(null);
  };

  return (
    <div className="dn">
      <div className="dn-yazi">
        <h3>Kendin dene</h3>
        <p>Hesap açmadan, burada bir masraf ya da gelir yaz; kâr kartının nasıl değiştiğini gör. Yazdıkların hiçbir yere gitmez.</p>
        <ol>
          <li>Telefondaki <b>+ Masraf</b> ya da <b>+ Gelir</b>’e dokun.</li>
          <li>Türünü seç, tutarı yaz ya da hazır tutara dokun.</li>
          <li><b>Kaydet</b>’e dokun; kâr kartına bak.</li>
          <li>Göz düğmesine dokun: paralar gizlenir.</li>
        </ol>
        <button type="button" className="tn-btn cizgi2" onClick={() => { setKayitlar(ILK); setForm(null); setSon(null); setGizli(false); }}>Baştan başla</button>
      </div>

      <div className="tn-tel dn-tel">
        <div className="ekran">
          {!form ? (
            <>
              <div className="m-bas"><div><small>Örnek defter</small><b>Özet</b></div>
                <button type="button" className="m-goz" aria-pressed={gizli} aria-label="Tutarları gizle" onClick={() => setGizli(!gizli)}>{gizli ? "🙈" : "👁"}</button></div>
              <div className="m-kar"><small>Sezon kârı</small><div className="t">{para(gelir - masraf)}</div>
                <div className="s"><span>Gelir {gizli ? "***" : gelir.toLocaleString("tr-TR")}</span><span>Masraf {gizli ? "***" : masraf.toLocaleString("tr-TR")}</span></div></div>
              {son && (
                <div className="dn-tamam" role="status">
                  <span>Kaydettim: {son.ad} {para(son.tutar)}.</span>
                  <button type="button" onClick={() => { setKayitlar(kayitlar.filter((k) => k.id !== son.id)); setSon(null); }}>Geri al</button>
                </div>
              )}
              <div className="m-hizli">
                <button type="button" onClick={() => ac("masraf")}>+ Masraf</button>
                <button type="button" className="i" onClick={() => ac("gelir")}>+ Gelir</button>
              </div>
              <div className="dn-liste">
                {kayitlar.slice(0, 4).map((k) => (
                  <div className="m-kart" key={k.id}><span>{k.ad}</span><span className={k.tur}>{k.tur === "masraf" ? "−" : "+"}{para(k.tutar)}</span></div>
                ))}
              </div>
            </>
          ) : (
            <div className="dn-form">
              <b className="dn-baslik">{form === "masraf" ? "Ne için harcadın?" : "Ne geliri?"}</b>
              <div className="nk-secim">
                {(form === "masraf" ? MASRAF_TUR : GELIR_TUR).map((x) => (
                  <button type="button" key={x} className={ad === x ? "on" : ""} aria-pressed={ad === x} onClick={() => setAd(x)}>{x}</button>
                ))}
              </div>
              <label className="dn-alan">Kaç TL?<input inputMode="decimal" maxLength={10} value={tutar} placeholder="Örnek: 2000" onChange={(e) => setTutar(e.target.value)} /></label>
              <div className="nk-secim">
                {HAZIR_TUTAR.map((n) => <button type="button" key={n} onClick={() => setTutar(n.toLocaleString("tr-TR"))}>{n.toLocaleString("tr-TR")}</button>)}
              </div>
              <button type="button" className="dn-kaydet" disabled={!sayi(tutar)} onClick={kaydet}>Kaydet</button>
              <button type="button" className="dn-vazgec" onClick={() => setForm(null)}>Vazgeç</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Hangi modül bana göre? ---------- */
const SORULAR = [
  { id: "tarla", s: "Tarlan, bağın ya da bahçen var mı?", ik: "🌾" },
  { id: "fidan", s: "Fidan yetiştirip satıyor musun?", ik: "🌱" },
] as const;
type Cevap = Record<string, boolean | undefined>;
const MODUL_AD: Record<string, string> = { tarla: "Tarla ve para", fidan: "Fidancılık" };

export function ModulSecici() {
  const [c, setC] = useState<Cevap>({});
  const [zor, setZor] = useState<boolean | undefined>(undefined);
  const bitti = SORULAR.every((q) => c[q.id] !== undefined) && zor !== undefined;
  const secilen = SORULAR.filter((q) => c[q.id]).map((q) => q.id);
  const gorunum = zor ? "En sade" : secilen.length === 1 && secilen[0] === "fidan" ? "Fidancı" : c.tarla ? "Tarlacı" : "Sadece para";
  const EvetHayir = ({ v, set }: { v: boolean | undefined; set: (b: boolean) => void }) => (
    <div className="ms-eh">
      <button type="button" aria-pressed={v === true} onClick={() => set(true)}>Evet</button>
      <button type="button" aria-pressed={v === false} onClick={() => set(false)}>Hayır</button>
    </div>
  );
  return (
    <div className="ms">
      <div className="ms-sorular">
        <h3>Hangi modül bana göre?</h3>
        <p className="ms-alt">Beş soruya cevap ver, sana uygun modülleri ve ekran düzenini söyleyelim.</p>
        {SORULAR.map((q) => (
          <div className="ms-soru" key={q.id}>
            <span><span aria-hidden>{q.ik} </span>{q.s}</span>
            {EvetHayir({ v: c[q.id], set: (b) => setC({ ...c, [q.id]: b }) })}
          </div>
        ))}
        <div className="ms-soru">
          <span><span aria-hidden>📱 </span>Telefonda uygulama kullanmakta zorlanır mısın?</span>
          {EvetHayir({ v: zor, set: setZor })}
        </div>
      </div>
      <div className={"ms-sonuc" + (bitti ? " hazir" : "")} aria-live="polite">
        {!bitti ? (
          <p className="ms-bekle">Soruları cevaplayınca önerimiz burada çıkacak.</p>
        ) : (
          <>
            <small>Sana önerimiz</small>
            {secilen.length ? (
              <ul>{secilen.map((id) => <li key={id}><b>{MODUL_AD[id]}</b> <a href={`#rehber-${id === "tarla" ? "tarlalar" : id}`}>nasıl kullanılır →</a></li>)}</ul>
            ) : (
              <p>Sadece <b>masraf ve gelir</b> defteri bile işini görür: ne harcadığını, ne kazandığını yaz.</p>
            )}
            <p>Ekran düzeni: <b>{gorunum}</b>{zor ? " ve Büyük yazı" : ""}. Bunu uygulamada Ayarlar → Ekranımı düzenle’den seçersin.</p>
            <p className="ms-not">Hepsi ücretsiz ve aynı defterde. Kullanmadığın modül menüde görünmez.</p>
            <a className="tn-btn ana" href="/ciftci?kayit=1">Hemen başla</a>
          </>
        )}
      </div>
    </div>
  );
}
