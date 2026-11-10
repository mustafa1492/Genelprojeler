"use client";
import { useRef, useState } from "react";
import { BOLUMLER, TELEFONA_EKLE, type Ekran } from "./rehber";

/** Bölüm bölüm, tıklanarak gezilen "Nasıl kullanılır" rehberi. Ekranlar örnek bilgilerle çizilmiştir. */

function Telefon({ e }: { e: Ekran }) {
  return (
    <div className="tn-tel nk-tel" aria-hidden>
      <div className="ekran">
        <div className="nk-ust">{e.baslik}</div>
        {e.kar && <div className="m-kar"><small>{e.kar[0]}</small><div className="t">{e.kar[1]}</div></div>}
        {e.secim && <div className="nk-secim">{e.secim.map((x) => <span key={x.ad} className={x.on ? "on" : ""}>{x.ad}</span>)}</div>}
        {e.alanlar?.map(([l, v]) => <div className="nk-alan" key={l}><small>{l}</small><div>{v}</div></div>)}
        {e.kartlar?.map(([a, b]) => <div className="m-kart" key={a}><span>{a}</span><span>{b}</span></div>)}
        {e.dugme && <div className="nk-dug parla">{e.dugme}</div>}
        {e.ikinci && <div className="nk-dug ikincil">{e.ikinci}</div>}
      </div>
    </div>
  );
}

const TELEFON_ID = "telefon";

export function NasilKullanilir() {
  const [b, setB] = useState(0);         // bölüm
  const [k, setK] = useState(0);         // konu
  const [tel, setTel] = useState<"android" | "iphone">("android");
  const icerik = useRef<HTMLDivElement>(null);
  const telefonda = b === BOLUMLER.length;
  const bolum = BOLUMLER[b];
  const konu = bolum?.konular[k];

  const git = (nb: number, nk = 0) => {
    setB(nb); setK(nk);
    // telefonda içerik aşağıda kalır: bölüm değişince oraya kaydır
    if (nb !== b && typeof window !== "undefined" && window.innerWidth < 900) {
      requestAnimationFrame(() => icerik.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };
  const ileri = () => {
    if (telefonda) return;
    if (k < bolum.konular.length - 1) setK(k + 1); else git(b + 1);
  };
  const geri = () => {
    if (k > 0) return setK(k - 1);
    if (b > 0) { const pb = b - 1; git(pb, pb < BOLUMLER.length ? BOLUMLER[pb].konular.length - 1 : 0); }
  };
  const sonrakiAd = telefonda ? "" : k < bolum.konular.length - 1 ? bolum.konular[k + 1].b : (BOLUMLER[b + 1]?.ad ?? "Telefona ekle");

  return (
    <div className="nk">
      <div className="nk-bolumler" role="tablist" aria-label="Bölümler">
        {BOLUMLER.map((x, n) => (
          <button key={x.id} role="tab" aria-selected={b === n} className={b === n ? "on" : ""} onClick={() => git(n)}>
            <span className="ik" aria-hidden>{x.ik}</span>
            <span><b>{x.ad}</b><small>{x.ozet}</small></span>
          </button>
        ))}
        <button role="tab" aria-selected={telefonda} className={telefonda ? "on" : ""} onClick={() => git(BOLUMLER.length)} id={TELEFON_ID}>
          <span className="ik" aria-hidden>📱</span>
          <span><b>Telefona ekle</b><small>Uygulama gibi ana ekrandan aç.</small></span>
        </button>
      </div>

      <div className="nk-sag" ref={icerik}>
        {!telefonda && (
          <div className="nk-sekme" role="tablist" aria-label={`${bolum.ad} konuları`}>
            {bolum.konular.map((x, n) => (
              <button key={x.b} role="tab" aria-selected={k === n} className={k === n ? "on" : n < k ? "gecti" : ""} onClick={() => setK(n)}>
                <span className="no">{n + 1}</span><span className="ad">{x.b}</span>
              </button>
            ))}
          </div>
        )}

        <div className="nk-icerik" role="tabpanel">
          {!telefonda ? (
            <>
              <div className={"nk-yazi" + (konu.ekran ? "" : " nk-genis")}>
                <p className="nk-adim">{bolum.ik} {bolum.ad} · {k + 1} / {bolum.konular.length}</p>
                <h3>{konu.b}</h3>
                <p className="nk-kisa">{konu.k}</p>
                <ol>{konu.m.map((x) => <li key={x}>{x}</li>)}</ol>
                {konu.ipucu && <p className="nk-ipucu"><b>İpucu:</b> {konu.ipucu}</p>}
              </div>
              {konu.ekran && <Telefon e={konu.ekran} />}
            </>
          ) : (
            <div className="nk-yazi nk-genis">
              <p className="nk-adim">📱 Son adım</p>
              <h3>Telefonunun ana ekranına ekle</h3>
              <p className="nk-kisa">Bir uygulama gibi tek dokunuşla açılır. Mağazadan bir şey yüklemen gerekmez.</p>
              <div className="nk-tel-sec" role="group" aria-label="Telefon türü">
                <button aria-pressed={tel === "android"} onClick={() => setTel("android")}>Android</button>
                <button aria-pressed={tel === "iphone"} onClick={() => setTel("iphone")}>iPhone</button>
              </div>
              <ol>{TELEFONA_EKLE[tel].map((x) => <li key={x}>{x}</li>)}</ol>
            </div>
          )}
        </div>

        <div className="nk-gezin">
          <button className="tn-btn cizgi2" disabled={b === 0 && k === 0} onClick={geri}>← Geri</button>
          {!telefonda
            ? <button className="tn-btn ana" onClick={ileri}>İleri →<small className="nk-sonraki">{sonrakiAd}</small></button>
            : <a className="tn-btn ana" href="/ciftci?kayit=1">Hemen başla</a>}
        </div>
      </div>
    </div>
  );
}
